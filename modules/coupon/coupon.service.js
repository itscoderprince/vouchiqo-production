import { analyticsQueue } from "@/lib/queue";
import { redis } from "@/lib/redis";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ForbiddenError, NotFoundError } from "@/utils/app-error";
import {
  COUPON_STATUS,
  JOB_NAMES,
  MERCHANT_STATUS,
  REDIS_KEYS,
  REDIS_TTL,
} from "@/utils/constants";
import { buildMeta, parsePagination, parseSort } from "@/utils/pagination";
import { escapeRegex } from "@/lib/security";

const SORTABLE_FIELDS = [
  "createdAt",
  "expiresAt",
  "totalClaims",
  "discountValue",
];

/**
 * Create a new coupon for a merchant.
 * Merchant must be approved to create coupons.
 *
 * @param {string} authId
 * @param {object} data - Validated coupon data
 */
export async function createCoupon(authId, data) {
  const merchant = await Merchant.findOne({
    authId,
    status: MERCHANT_STATUS.APPROVED,
  });

  if (!merchant) {
    throw new ForbiddenError("Only approved merchants can create coupons");
  }

  // Subscription Plan limits gating check
  const activeCount = await Coupon.countDocuments({
    merchantId: merchant._id,
    status: COUPON_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  });

  const plan = merchant.plan || "starter";
  const limits = { starter: 3, growth: 15, pro: Infinity, enterprise: Infinity };
  const allowed = limits[plan] ?? 3;

  if (activeCount >= allowed) {
    throw new ForbiddenError(
      `Your subscription plan '${plan}' allows a maximum of ${allowed} active listings. Please upgrade to create more.`
    );
  }

  const coupon = await Coupon.create({
    merchantId: merchant._id,
    ...data,
    expiresAt: new Date(data.expiresAt),
    location: data.location || {
      city: merchant.location?.city,
      state: merchant.location?.state,
      country: merchant.location?.country,
      isOnline: !merchant.location?.city,
    },
  });

  await Merchant.findByIdAndUpdate(merchant._id, { $inc: { totalCoupons: 1 } });

  return coupon;
}

/**
 * Get a single coupon by ID.
 * Increments view count asynchronously via BullMQ.
 *
 * @param {string} couponId
 */
export async function getCouponById(couponId) {
  const coupon = await Coupon.findOne({
    _id: couponId,
    status: COUPON_STATUS.ACTIVE,
  })
    .populate("merchantId", "businessName slug logo")
    .lean();

  if (!coupon) throw new NotFoundError("Coupon");

  // Fire-and-forget view tracking — doesn't block the response
  analyticsQueue.add(JOB_NAMES.RECORD_VIEW, { couponId }).catch(() => {});

  return coupon;
}

/**
 * Browse/search/filter coupons with pagination.
 *
 * @param {URLSearchParams} searchParams
 */
export async function listCoupons(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const sort = parseSort(searchParams, SORTABLE_FIELDS);

  const filter = {};

  const status = searchParams.get("status");
  if (status) {
    filter.status = status;
  } else {
    filter.status = COUPON_STATUS.ACTIVE;
  }

  // Public active deals must be verified and unexpired
  if (filter.status === COUPON_STATUS.ACTIVE) {
    filter.isVerified = true;
    if (!searchParams.get("allDates")) {
      filter.expiresAt = { $gt: new Date() };
    }
  }

  const merchantId = searchParams.get("merchantId");
  if (merchantId) filter.merchantId = merchantId;

  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const pincode = searchParams.get("pincode");
  const discountType = searchParams.get("discountType");
  const search = searchParams.get("search");

  if (category) filter.category = category;
  if (city) filter["location.city"] = new RegExp(escapeRegex(city), "i");
  if (discountType) filter.discountType = discountType;
  if (search) filter.$text = { $search: search };

  if (pincode) {
    const merchants = await Merchant.find({ "location.pincode": pincode })
      .select("_id")
      .lean();
    const merchantIds = merchants.map((m) => m._id);
    if (filter.merchantId) {
      const singleId = filter.merchantId.toString();
      filter.merchantId = merchantIds
        .map((m) => m.toString())
        .includes(singleId)
        ? singleId
        : null;
    } else {
      filter.merchantId = { $in: merchantIds };
    }
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate("merchantId", "businessName slug logo location")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  return { coupons, meta: buildMeta(total, page, limit) };
}

/**
 * Get featured coupons — cached in Redis for 5 minutes.
 */
export async function getFeaturedCoupons() {
  const cached = await redis.get(REDIS_KEYS.FEATURED_DEALS);
  if (cached) return JSON.parse(cached);

  let coupons = await Coupon.find({
    isFeatured: true,
    isVerified: true,
    status: COUPON_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  })
    .populate("merchantId", "businessName slug logo banner")
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  if (!coupons || coupons.length === 0) {
    coupons = await Coupon.find({
      isVerified: true,
      status: COUPON_STATUS.ACTIVE,
      expiresAt: { $gt: new Date() },
    })
      .populate("merchantId", "businessName slug logo banner")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
  }

  await redis.setex(
    REDIS_KEYS.FEATURED_DEALS,
    REDIS_TTL.FEATURED,
    JSON.stringify(coupons),
  );
  return coupons;
}

/**
 * Get hot/trending coupons — cached in Redis for 2 minutes.
 */
export async function getTrendingCoupons() {
  const cached = await redis.get(REDIS_KEYS.TRENDING_DEALS);
  if (cached) return JSON.parse(cached);

  const coupons = await Coupon.find({
    isHot: true,
    isVerified: true,
    status: COUPON_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  })
    .populate("merchantId", "businessName slug logo")
    .sort({ totalClaims: -1 })
    .limit(20)
    .lean();

  await redis.setex(
    REDIS_KEYS.TRENDING_DEALS,
    REDIS_TTL.TRENDING,
    JSON.stringify(coupons),
  );
  return coupons;
}

/**
 * Update a coupon. Only the owning merchant can update.
 *
 * @param {string} couponId
 * @param {string} authId
 * @param {object} data - Validated update data
 */
export async function updateCoupon(couponId, authId, data) {
  const merchant = await Merchant.findOne({ authId });
  if (!merchant) throw new ForbiddenError("Merchant profile not found");

  const coupon = await Coupon.findOne({
    _id: couponId,
    merchantId: merchant._id,
  });
  if (!coupon) throw new NotFoundError("Coupon");

  Object.assign(coupon, data);
  if (data.expiresAt) coupon.expiresAt = new Date(data.expiresAt);
  await coupon.save();

  // Always bust both caches on update — a coupon may be transitioning
  // to/from featured or hot, and the pre-update state is unreliable here.
  await Promise.all([
    redis.del(REDIS_KEYS.FEATURED_DEALS),
    redis.del(REDIS_KEYS.TRENDING_DEALS),
  ]);

  return coupon;
}

/**
 * Soft-delete a coupon (set status to "deleted").
 *
 * @param {string} couponId
 * @param {string} authId
 */
export async function deleteCoupon(couponId, authId) {
  const merchant = await Merchant.findOne({ authId });
  if (!merchant) throw new ForbiddenError("Merchant profile not found");

  const coupon = await Coupon.findOneAndUpdate(
    { _id: couponId, merchantId: merchant._id },
    { $set: { status: COUPON_STATUS.DELETED } },
    { new: true },
  );

  if (!coupon) throw new NotFoundError("Coupon");

  await redis.del(REDIS_KEYS.FEATURED_DEALS);
  await redis.del(REDIS_KEYS.TRENDING_DEALS);
}

/**
 * Pause or resume a coupon.
 *
 * @param {string} couponId
 * @param {string} authId
 * @param {"paused" | "active"} newStatus
 */
export async function setCouponStatus(couponId, authId, newStatus) {
  const merchant = await Merchant.findOne({ authId });
  if (!merchant) throw new ForbiddenError("Merchant profile not found");

  const coupon = await Coupon.findOneAndUpdate(
    { _id: couponId, merchantId: merchant._id },
    { $set: { status: newStatus } },
    { new: true },
  );

  if (!coupon) throw new NotFoundError("Coupon");
  return coupon;
}
