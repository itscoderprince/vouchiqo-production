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
  const { contactEmail, contactPhone, liaisonPhone, gstin, pan, isGstExempt } = data;

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

  if (pan) {
    const panUpper = pan.toUpperCase().trim();
    const dupPan = await Merchant.findOne({ ...baseFilter, pan: panUpper });
    if (dupPan) throw new ConflictError(`PAN "${panUpper}" is already registered to another merchant.`);
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
  const existing = await Merchant.findOne({ authId });
  if (existing) throw new ConflictError("You already have a merchant profile");

  await checkMerchantDuplicates(data);

  const merchant = await Merchant.create({ authId, ...data });

  // Update user's role to "merchant" in UserProfile and Better Auth user collection
  await UserProfile.updateOne({ authId }, { role: "merchant" }).catch(() => {});
  if (mongoose.connection && mongoose.connection.db) {
    const userCol = mongoose.connection.db.collection("user");
    await userCol.updateOne({ _id: authId }, { $set: { role: "merchant" } }).catch(() => {});
    if (mongoose.Types.ObjectId.isValid(authId)) {
      await userCol.updateOne({ _id: new mongoose.Types.ObjectId(authId) }, { $set: { role: "merchant" } }).catch(() => {});
    }
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
 */
export async function getMerchantByAuthId(authId) {
  const merchant = await Merchant.findOne({ authId }).lean();
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
  const merchant = await Merchant.findOne({ _id: merchantId, authId });
  if (!merchant) throw new ForbiddenError("You cannot edit this merchant");

  await checkMerchantDuplicates(data, merchant._id);

  Object.assign(merchant, data);
  merchant.status = MERCHANT_STATUS.PENDING;
  merchant.isVerified = false;
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
