import mongoose from "mongoose";
import { redis } from "@/lib/redis";
import Coupon from "@/modules/coupon/coupon.model";
import UserProfile from "@/modules/user/user.model";
import { NotFoundError } from "@/utils/app-error";
import { REDIS_KEYS } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

/**
 * List all users with pagination. Joining auth 'user' collection for names and emails.
 *
 * @param {URLSearchParams} searchParams
 */
export async function listUsers(searchParams) {
  const isExport = searchParams.get("export") === "true";
  const db = mongoose.connection.db;

  if (isExport) {
    const subscribers = await db
      .collection("user")
      .find({ role: { $ne: "admin" } })
      .project({ name: 1, email: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();
    return { subscribers };
  }

  const { page, limit, skip } = parsePagination(searchParams);
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");
  const merchantStatus = searchParams.get("merchantStatus");
  const search = searchParams.get("search");

  const filter = {};
  if (role) filter.role = role.toLowerCase();
  if (isActive !== null && isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const pipeline = [
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $addFields: {
        authIdStr: { $toString: "$_id" },
      },
    },
    {
      $lookup: {
        from: "userprofiles",
        let: { uId: "$authIdStr" },
        pipeline: [
          { $match: { $expr: { $eq: ["$authId", "$$uId"] } } },
        ],
        as: "profile",
      },
    },
    {
      $lookup: {
        from: "merchants",
        let: { uId: "$authIdStr" },
        pipeline: [
          { $match: { $expr: { $eq: ["$authId", "$$uId"] } } },
        ],
        as: "merchantProfile",
      },
    },
    {
      $lookup: {
        from: "claims",
        let: { uId: "$authIdStr" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uId"] } } },
        ],
        as: "userClaims",
      },
    },
    {
      $project: {
        _id: 1,
        authId: "$authIdStr",
        name: { $ifNull: ["$name", "User"] },
        email: { $ifNull: ["$email", ""] },
        role: { $ifNull: ["$role", "customer"] },
        isActive: { $ifNull: ["$isActive", true] },
        createdAt: 1,
        totalSavings: { $ifNull: [{ $arrayElemAt: ["$profile.totalSavings", 0] }, 0] },
        emailNotifications: { $ifNull: [{ $arrayElemAt: ["$profile.emailNotifications", 0] }, true] },
        couponsSaved: { $size: "$userClaims" },
        businessName: { $arrayElemAt: ["$merchantProfile.businessName", 0] },
        merchantStatus: { $arrayElemAt: ["$merchantProfile.status", 0] },
        merchantPlan: { $arrayElemAt: ["$merchantProfile.plan", 0] },
      },
    },
  ];

  const postFilters = {};
  if (merchantStatus) postFilters.merchantStatus = merchantStatus;
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    postFilters.$or = [
      { name: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
      { businessName: { $regex: safe, $options: "i" } },
    ];
  }
  if (Object.keys(postFilters).length > 0) {
    pipeline.push({ $match: postFilters });
  }

  const [users, countResult] = await Promise.all([
    db.collection("user").aggregate([...pipeline, { $skip: skip }, { $limit: limit }]).toArray(),
    db.collection("user").aggregate([...pipeline, { $count: "total" }]).toArray(),
  ]);

  const total = countResult[0]?.total ?? 0;
  return { users, meta: buildMeta(total, page, limit) };
}

/**
 * Activate or deactivate a user in both user_profiles and the auth 'user' collections.
 *
 * @param {string} authId
 * @param {boolean} isActive
 */
export async function setUserActiveStatus(authId, isActive) {
  const [profile, _authUser] = await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId },
      { $set: { isActive } },
      { new: true },
    ),
    mongoose.connection.db
      .collection("user")
      .updateOne({ _id: authId }, { $set: { isActive } }),
  ]);

  if (!profile) throw new NotFoundError("User");
  return profile;
}

// ─────────────────────────────────────────────
// Coupons
// ─────────────────────────────────────────────

/**
 * List ALL coupons regardless of status (admin view).
 *
 * @param {URLSearchParams} searchParams
 */
export async function listAllCoupons(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const isVerified = searchParams.get("isVerified");
  const search = searchParams.get("search");

  const filter = {};
  if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: "deleted" };
  }
  if (isVerified !== null && isVerified !== undefined) {
    filter.isVerified = isVerified === "true";
  }
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { code: { $regex: safe, $options: "i" } },
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate(
        "merchantId",
        "businessName slug plan contactEmail contactPhone whatsappNumber website location category customCategoryNotes status businessType isVerified logo banner liaisonName liaisonDesignation liaisonPhone gstin docType docImage shopImage regionalHubCity constitution",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  return { coupons, meta: buildMeta(total, page, limit) };
}

/**
 * Toggle featured or hot flag on a coupon (admin action).
 *
 * @param {string} couponId
 * @param {{ isFeatured?: boolean, isHot?: boolean }} flags
 */
export async function setCouponFlags(couponId, flags) {
  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: flags },
    { new: true },
  );

  if (!coupon) throw new NotFoundError("Coupon");

  // Bust homepage caches
  await Promise.all([
    redis.del(REDIS_KEYS.FEATURED_DEALS),
    redis.del(REDIS_KEYS.TRENDING_DEALS),
  ]);

  return coupon;
}

/**
 * Update coupon moderation state, flags, status, or rejection reasons.
 *
 * @param {string} couponId
 * @param {object} update
 */
export async function updateCouponModerationState(couponId, update) {
  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: update },
    { new: true },
  );

  if (!coupon) throw new NotFoundError("Coupon");

  // Bust homepage caches
  await Promise.all([
    redis.del(REDIS_KEYS.FEATURED_DEALS),
    redis.del(REDIS_KEYS.TRENDING_DEALS),
  ]);

  return coupon;
}

/**
 * Permanently delete a coupon (admin action).
 *
 * @param {string} couponId
 */
export async function deleteAdminCoupon(couponId) {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) throw new NotFoundError("Coupon");

  // Bust homepage caches
  await Promise.all([
    redis.del(REDIS_KEYS.FEATURED_DEALS),
    redis.del(REDIS_KEYS.TRENDING_DEALS),
  ]);

  return coupon;
}
