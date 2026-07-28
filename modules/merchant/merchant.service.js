import mongoose from "mongoose";
import Merchant from "./merchant.model.js";
import UserProfile from "../user/user.model.js";
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
  const { contactEmail, contactPhone, liaisonPhone, gstin, isGstExempt } = data;

  const baseFilter = excludeMerchantId ? { _id: { $ne: excludeMerchantId } } : {};

  if (contactEmail) {
    const emailLower = contactEmail.toLowerCase().trim();
    const dupEmail = await Merchant.findOne({ ...baseFilter, contactEmail: emailLower });
    if (dupEmail) throw new ConflictError("Email address is already registered to another merchant.");
  }

  const phoneToCheck = (contactPhone || liaisonPhone || "").trim();
  if (phoneToCheck) {
    const dupPhone = await Merchant.findOne({
      ...baseFilter,
      $or: [{ contactPhone: phoneToCheck }, { liaisonPhone: phoneToCheck }],
    });
    if (dupPhone) throw new ConflictError("Mobile / Contact phone number is already registered to another merchant.");
  }

  if (gstin && !isGstExempt) {
    const gstinUpper = gstin.toUpperCase().trim();
    const dupGst = await Merchant.findOne({ ...baseFilter, gstin: gstinUpper });
    if (dupGst) throw new ConflictError(`GSTIN "${gstinUpper}" is already registered to another merchant.`);
  }
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

  // Auto-resolve slug collision by appending a unique suffix if slug already exists
  let baseSlug = (data.slug || data.businessName || "merchant")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `merchant-${Date.now()}`;

  let uniqueSlug = baseSlug;
  let counter = 1;
  while (await Merchant.findOne({ slug: uniqueSlug })) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    uniqueSlug = `${baseSlug}-${randomSuffix}`;
    counter++;
    if (counter > 10) {
      uniqueSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  data.slug = uniqueSlug;

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
 */
export async function updateMerchant(merchantId, authId, data) {
  let merchant = await Merchant.findOne({ _id: merchantId });
  if (!merchant) throw new ForbiddenError("You cannot edit this merchant");

  await checkMerchantDuplicates(data, merchant._id);

  const keyKycFieldsChanged =
    (data.gstin && data.gstin !== merchant.gstin) ||
    (data.docImage && data.docImage !== merchant.docImage);

  Object.assign(merchant, data);

  if (keyKycFieldsChanged && merchant.status === MERCHANT_STATUS.APPROVED) {
    merchant.status = MERCHANT_STATUS.PENDING;
    merchant.isVerified = false;
  }
  await merchant.save();

  // Keep user role as merchant when updating merchant profile
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

  const [merchants, total] = await Promise.all([
    Merchant.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Merchant.countDocuments(filter),
  ]);

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

  return merchant;
}
