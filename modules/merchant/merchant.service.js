import mongoose from "mongoose";
import Merchant from "./merchant.model.js";
import UserProfile from "../user/user.model.js";
import {
  sendMerchantApprovedEmail,
  sendMerchantRejectedEmail,
} from "../../lib/email/merchant-email.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/app-error.js";
import { MERCHANT_STATUS } from "../../utils/constants.js";
import { buildMeta, parsePagination } from "../../utils/pagination.js";

/**
 * Create a merchant profile.
 * One merchant per user — enforced by unique index on authId.
 *
 * @param {string} authId
 * @param {object} data - Validated merchant data
 */
/**
 * Helper to check for duplicate unique fields (email, phone, gstin, pan)
 */
export async function checkMerchantDuplicates(data, excludeMerchantId = null) {
  const { contactEmail, contactPhone, liaisonPhone, gstin } = data || {};

  const baseFilter = excludeMerchantId ? { _id: { $ne: excludeMerchantId } } : {};

  const emailStr = typeof contactEmail === "string" ? contactEmail.trim().toLowerCase() : "";
  if (emailStr) {
    const dupEmail = await Merchant.findOne({ ...baseFilter, contactEmail: emailStr });
    if (dupEmail) throw new ConflictError("Email address is already registered to another merchant.");
  }

  const phoneStr = String(contactPhone || liaisonPhone || "").trim();
  if (phoneStr) {
    const dupPhone = await Merchant.findOne({
      ...baseFilter,
      $or: [{ contactPhone: phoneStr }, { liaisonPhone: phoneStr }],
    });
    if (dupPhone) throw new ConflictError("Mobile / Contact phone number is already registered to another merchant.");
  }

  const cleanGstin = String(gstin || "").trim().toUpperCase();
  if (cleanGstin) {
    const dupGstin = await Merchant.findOne({ ...baseFilter, gstin: cleanGstin });
    if (dupGstin) throw new ConflictError("GSTIN is already registered to another merchant.");
  }
}

/**
 * Helper to generate a 100% unique, meaningful, SEO-friendly brand slug.
 * Prioritizes:
 * 1. Clean brand slug (e.g. "aditya-shoes")
 * 2. Brand + City (e.g. "aditya-shoes-ranchi")
 * 3. Brand + State (e.g. "aditya-shoes-bihar" or "aditya-shoes-jharkhand")
 * 4. Brand + Location + Store Number (e.g. "aditya-shoes-ranchi-2", "aditya-shoes-ranchi-3")
 */
export async function generateUniqueSlug(
  baseText,
  city = "",
  state = "",
  excludeMerchantId = null,
) {
  let cleanBase = String(baseText || "merchant")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (!cleanBase) cleanBase = "merchant";

  const filterBase = excludeMerchantId ? { _id: { $ne: excludeMerchantId } } : {};

  // 1. Try cleanBase directly (e.g., "aditya-shoes")
  const existingExact = await Merchant.findOne({ ...filterBase, slug: cleanBase });
  if (!existingExact) return cleanBase;

  // 2. Try cleanBase + city suffix (e.g., "aditya-shoes-ranchi")
  const cleanCity = String(city || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleanCity) {
    const citySlug = `${cleanBase}-${cleanCity}`.slice(0, 80);
    const existingCity = await Merchant.findOne({ ...filterBase, slug: citySlug });
    if (!existingCity) return citySlug;
  }

  // 3. Try cleanBase + state suffix (e.g., "aditya-shoes-bihar" or "aditya-shoes-jharkhand")
  const cleanState = String(state || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleanState && cleanState !== cleanCity) {
    const stateSlug = `${cleanBase}-${cleanState}`.slice(0, 80);
    const existingState = await Merchant.findOne({ ...filterBase, slug: stateSlug });
    if (!existingState) return stateSlug;
  }

  // 4. Try cleanBase + location + store number (e.g., "aditya-shoes-ranchi-2", "aditya-shoes-ranchi-3")
  const prefix = cleanCity
    ? `${cleanBase}-${cleanCity}`
    : cleanState
      ? `${cleanBase}-${cleanState}`
      : cleanBase;

  for (let num = 2; num <= 50; num++) {
    const numberedSlug = `${prefix}-${num}`.slice(0, 80);
    const exists = await Merchant.findOne({ ...filterBase, slug: numberedSlug });
    if (!exists) return numberedSlug;
  }

  // 5. Ultimate fallback with clean short code if > 50 stores exist
  return `${prefix}-${Date.now().toString(36).slice(-4)}`;
}

/**
 * Create a merchant profile.
 * One merchant per user — enforced by unique index on authId.
 *
 * @param {string} authId
 * @param {object} data - Validated merchant data
 */
export async function createMerchant(authId, data) {
  const authIdStr = String(authId);
  const existing = await Merchant.findOne({
    $or: [
      { authId: authIdStr },
      ...(data.contactEmail ? [{ contactEmail: data.contactEmail.toLowerCase().trim() }] : []),
    ],
  });
  if (existing) throw new ConflictError("You already have a merchant profile");

  await checkMerchantDuplicates(data);

  // Auto-resolve slug collision by generating a guaranteed unique slug
  const city = data.location?.city || data.city || "";
  const state = data.location?.state || data.state || "";
  data.slug = await generateUniqueSlug(
    data.slug || data.businessName,
    city,
    state,
    null,
  );

  // Normalize document & image aliases from wizard / onboarding forms
  if (!data.docImage && (data.docFileUrl || data.docUrl || data.identityDocumentUrl)) {
    data.docImage = data.docFileUrl || data.docUrl || data.identityDocumentUrl;
  }
  if (!data.shopImage && (data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl)) {
    data.shopImage = data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl;
  }
  if (!data.logo && (data.logoUrl || data.shopLogo)) {
    data.logo = data.logoUrl || data.shopLogo;
  }
  if (!data.banner && (data.bannerUrl || data.shopBanner)) {
    data.banner = data.bannerUrl || data.shopBanner;
  }

  const merchant = await Merchant.create({ authId: authIdStr, ...data });

  // Update user's role to "merchant" in UserProfile and Better Auth user & session collections
  await UserProfile.updateOne({ authId: authIdStr }, { role: "merchant" }).catch(() => {});
  if (mongoose.connection && mongoose.connection.db) {
    const userCol = mongoose.connection.db.collection("user");
    await userCol.updateOne({ _id: authIdStr }, { $set: { role: "merchant" } }).catch(() => {});
    await userCol.updateOne({ id: authIdStr }, { $set: { role: "merchant" } }).catch(() => {});
    if (data.contactEmail) {
      await userCol.updateOne({ email: data.contactEmail.toLowerCase().trim() }, { $set: { role: "merchant" } }).catch(() => {});
    }
    if (mongoose.Types.ObjectId.isValid(authId)) {
      await userCol.updateOne({ _id: new mongoose.Types.ObjectId(authId) }, { $set: { role: "merchant" } }).catch(() => {});
    }
    const sessionCol = mongoose.connection.db.collection("session");
    await sessionCol.updateMany({ userId: authIdStr }, { $set: { role: "merchant" } }).catch(() => {});
  }

  return merchant;
}

/**
 * Get a merchant by their MongoDB _id. Throws if not found or not approved.
 *
 * @param {string} merchantId
 * @param {boolean} publicOnly - If true, only return approved merchants
 */
export async function getMerchantById(merchantId, publicOnly = true) {
  const query = { _id: merchantId };
  if (publicOnly) query.status = MERCHANT_STATUS.APPROVED;

  const merchant = await Merchant.findOne(query).lean();
  if (!merchant) throw new NotFoundError("Merchant");
  return merchant;
}

/**
 * Get the merchant profile owned by a specific user.
 *
 * @param {string} authId
 * @param {string} [email]
 */
export async function getMerchantByAuthId(authId, email = null) {
  const authIdStr = authId ? String(authId) : null;
  let merchant = null;

  if (authIdStr) {
    merchant = await Merchant.findOne({ authId: authIdStr }).lean();
  }
  if (!merchant && email) {
    merchant = await Merchant.findOne({ contactEmail: email.toLowerCase().trim() }).lean();
  }
  if (!merchant) throw new NotFoundError("Merchant profile");
  return merchant;
}

/**
 * Update merchant profile. Only the owner can update.
 *
 * @param {string} merchantId
 * @param {string} authId - Requesting user's auth ID
 * @param {object} data - Validated update data
 * @param {string} [userRole="merchant"] - Role of requesting user
 */
export async function updateMerchant(merchantId, authId, data, userRole = "merchant") {
  let merchant = await Merchant.findOne({ _id: merchantId });
  if (!merchant) throw new ForbiddenError("You cannot edit this merchant");

  // Lock slug for regular merchants: once created, regular merchants CANNOT modify slug.
  // Only super admin (userRole === "admin") can edit an existing slug.
  if (merchant.slug && userRole !== "admin") {
    delete data.slug;
  } else if (data.slug && data.slug !== merchant.slug) {
    const city = data.location?.city || data.city || merchant.location?.city || "";
    const state = data.location?.state || data.state || merchant.location?.state || "";
    data.slug = await generateUniqueSlug(data.slug, city, state, merchant._id);
  }

  await checkMerchantDuplicates(data, merchant._id);

  // Normalize document & image aliases from wizard / onboarding forms
  if (!data.docImage && (data.docFileUrl || data.docUrl || data.identityDocumentUrl)) {
    data.docImage = data.docFileUrl || data.docUrl || data.identityDocumentUrl;
  }
  if (!data.shopImage && (data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl)) {
    data.shopImage = data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl;
  }
  if (!data.logo && (data.logoUrl || data.shopLogo)) {
    data.logo = data.logoUrl || data.shopLogo;
  }
  if (!data.banner && (data.bannerUrl || data.shopBanner)) {
    data.banner = data.bannerUrl || data.shopBanner;
  }

  const keyKycFieldsChanged =
    data.docImage && data.docImage !== merchant.docImage;

  if (data.gstin !== undefined) {
    const cleanGstin = (data.gstin || "").trim().toUpperCase();
    if (!cleanGstin) {
      data.gstin = undefined;
      merchant.gstin = undefined;
    } else {
      data.gstin = cleanGstin;
    }
  }

  Object.assign(merchant, data);

  if (keyKycFieldsChanged && merchant.status === MERCHANT_STATUS.APPROVED) {
    merchant.status = MERCHANT_STATUS.PENDING;
    merchant.isVerified = false;
  }
  if (data.operatingHours) {
    merchant.markModified("operatingHours");
  }

  await merchant.save();

  // Keep user role as merchant when updating merchant profile
  const userRoleToSync = "merchant";
  const userCol = mongoose.connection.db?.collection("user");

  await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId: merchant.authId },
      { $set: { role: userRoleToSync } },
      { upsert: true },
    ),
    userCol?.updateOne({ _id: merchant.authId }, { $set: { role: userRoleToSync } }).catch(() => {}),
    ...(mongoose.Types.ObjectId.isValid(merchant.authId)
      ? [userCol?.updateOne({ _id: new mongoose.Types.ObjectId(merchant.authId) }, { $set: { role: userRoleToSync } }).catch(() => {})]
      : []),
  ]);

  return merchant;
}

/**
 * Admin: list all merchants with pagination and filters.
 */
export async function listMerchants(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");

  const filter = {};
  if (status) filter.status = status;

  const [merchantsRaw, total] = await Promise.all([
    Merchant.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Merchant.countDocuments(filter),
  ]);

  const userCol = mongoose.connection.db?.collection("user");
  const merchants = await Promise.all(
    merchantsRaw.map(async (m) => {
      let uDoc = null;
      if (userCol && m.authId) {
        uDoc = await userCol.findOne({ _id: m.authId }).catch(() => null);
        if (!uDoc && mongoose.Types.ObjectId.isValid(m.authId)) {
          uDoc = await userCol
            .findOne({ _id: new mongoose.Types.ObjectId(m.authId) })
            .catch(() => null);
        }
      }
      return {
        ...m,
        userId: uDoc ? { name: uDoc.name, email: uDoc.email } : null,
      };
    }),
  );

  return { merchants, meta: buildMeta(total, page, limit) };
}

/**
 * Admin: approve or reject a merchant.
 *
 * @param {string} merchantId
 * @param {"approved" | "rejected"} status
 * @param {string} [rejectionReason]
 */
export async function reviewMerchant(merchantId, status, rejectionReason) {
  const update = { status };
  if (status === MERCHANT_STATUS.APPROVED) {
    update.isVerified = true;
  } else if (status === MERCHANT_STATUS.REJECTED) {
    update.isVerified = false;
    if (rejectionReason) {
      update.rejectionReason = rejectionReason;
    }
  }

  const merchant = await Merchant.findByIdAndUpdate(
    merchantId,
    { $set: update },
    { new: true },
  );

  if (!merchant) throw new NotFoundError("Merchant");

  // Keep user role as "merchant" so the owner remains a merchant account
  const userRole = "merchant";
  const userCol = mongoose.connection.db?.collection("user");

  await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId: merchant.authId },
      { $set: { role: userRole } },
      { upsert: true },
    ),
    userCol?.updateOne({ _id: merchant.authId }, { $set: { role: userRole } }).catch(() => {}),
    ...(mongoose.Types.ObjectId.isValid(merchant.authId)
      ? [userCol?.updateOne({ _id: new mongoose.Types.ObjectId(merchant.authId) }, { $set: { role: userRole } }).catch(() => {})]
      : []),
  ]);

  // Dispatch Email Notification to Merchant on Approval / Rejection
  try {
    let targetEmail = merchant.contactEmail;
    if (!targetEmail && merchant.authId && userCol) {
      const uDoc = await userCol.findOne({ _id: merchant.authId }).catch(() => null);
      targetEmail = uDoc?.email;
    }

    if (targetEmail) {
      if (status === MERCHANT_STATUS.APPROVED) {
        sendMerchantApprovedEmail({
          to: targetEmail,
          businessName: merchant.businessName,
          liaisonName: merchant.liaisonName,
        }).catch((err) => console.error("[Merchant Approved Email Error]:", err));
      } else if (status === MERCHANT_STATUS.REJECTED) {
        sendMerchantRejectedEmail({
          to: targetEmail,
          businessName: merchant.businessName,
          liaisonName: merchant.liaisonName,
          rejectionReason: merchant.rejectionReason || rejectionReason,
        }).catch((err) => console.error("[Merchant Rejected Email Error]:", err));
      }
    }
  } catch (err) {
    console.error("[Review Merchant Email Dispatch Error]:", err);
  }

  return merchant;
}
