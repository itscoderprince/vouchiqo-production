import mongoose from "mongoose";
import Merchant from "@/modules/merchant/merchant.model";
import UserProfile from "@/modules/user/user.model";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/app-error";
import { MERCHANT_STATUS } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

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

  const merchant = await Merchant.create({ authId, ...data });
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

  Object.assign(merchant, data);
  merchant.status = MERCHANT_STATUS.PENDING;
  merchant.isVerified = false;
  await merchant.save();

  // Sync user role back to customer upon editing details to await admin re-verification
  const userRole = "customer";
  await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId: merchant.authId },
      { $set: { role: userRole } },
      { upsert: true }
    ),
    mongoose.connection.db
      .collection("user")
      .updateOne({ _id: new mongoose.Types.ObjectId(merchant.authId) }, { $set: { role: userRole } })
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

  // Sync user role in both UserProfile and Better Auth collections
  const userRole = status === MERCHANT_STATUS.APPROVED ? "merchant" : "customer";
  await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId: merchant.authId },
      { $set: { role: userRole } },
      { upsert: true }
    ),
    mongoose.connection.db
      .collection("user")
      .updateOne({ _id: new mongoose.Types.ObjectId(merchant.authId) }, { $set: { role: userRole } })
  ]);

  return merchant;
}
