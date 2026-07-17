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

  if (isExport) {
    // Return all customers who have emailNotifications: true (or not false)
    const pipeline = [
      { $match: { role: "customer", emailNotifications: { $ne: false } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "user",
          localField: "authId",
          foreignField: "_id",
          as: "authUser",
        },
      },
      {
        $unwind: {
          path: "$authUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ["$authUser.name", "User"] },
          email: { $ifNull: ["$authUser.email", ""] },
          createdAt: 1,
        },
      },
    ];
    const subscribers = await UserProfile.aggregate(pipeline);
    return { subscribers };
  }

  const { page, limit, skip } = parsePagination(searchParams);
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");

  const filter = {};
  if (role) filter.role = role.toLowerCase();
  if (isActive !== null && isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  // We perform an aggregation pipeline to join user_profiles with the Better Auth 'user' collection
  const pipeline = [
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "user",
        localField: "authId",
        foreignField: "_id",
        as: "authUser",
      },
    },
    {
      $unwind: {
        path: "$authUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "claims",
        localField: "authId",
        foreignField: "userId",
        as: "userClaims",
      },
    },
    {
      $project: {
        _id: 1,
        authId: 1,
        role: 1,
        isActive: 1,
        totalSavings: 1,
        createdAt: 1,
        name: { $ifNull: ["$authUser.name", "User"] },
        email: { $ifNull: ["$authUser.email", ""] },
        emailNotifications: 1,
        smsNotifications: 1,
        expiryAlerts: 1,
        couponsSaved: { $size: "$userClaims" },
      },
    },
  ];

  const [users, total] = await Promise.all([
    UserProfile.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
    UserProfile.countDocuments(filter),
  ]);

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

  const filter = {};
  if (status) filter.status = status;
  if (isVerified !== null && isVerified !== undefined) {
    filter.isVerified = isVerified === "true";
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate("merchantId", "businessName slug plan")
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
