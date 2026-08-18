import mongoose from "mongoose";
import { sendMerchantOfferCreatedEmail } from "@/lib/email/merchant-email";
import { analyticsQueue } from "@/lib/queue";
import { redis } from "@/lib/redis";
import { escapeRegex } from "@/lib/security";
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

  if (merchant.subscriptionStatus === "paused" || merchant.subscriptionStatus === "cancelled") {
    throw new ForbiddenError(
      `Your subscription plan is currently ${merchant.subscriptionStatus}. Please contact support or reactivate your plan to post new listings.`,
    );
  }

  // Subscription Plan limits gating check
  const activeCount = await Coupon.countDocuments({
    merchantId: merchant._id,
    status: COUPON_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  });

  const plan = merchant.plan || "starter";
  const limits = {
    starter: 3,
    growth: 15,
    pro: Infinity,
    enterprise: Infinity,
  };
  const allowed = limits[plan] ?? 3;

  if (activeCount >= allowed) {
    throw new ForbiddenError(
      `Your subscription plan '${plan}' allows a maximum of ${allowed} active listings. Please upgrade to create more.`,
    );
  }

  const coupon = await Coupon.create({
    merchantId: merchant._id,
    ...data,
    isVerified: data.isVerified ?? false,
    status: data.status || "pending",
    expiresAt: new Date(data.expiresAt),
    location: data.location || {
      city: merchant.location?.city,
      state: merchant.location?.state,
      country: merchant.location?.country,
      isOnline: !merchant.location?.city,
    },
  });

  await Merchant.findByIdAndUpdate(merchant._id, { $inc: { totalCoupons: 1 } });

  // Trigger Merchant Offer Created Email Notification
  const targetEmail = merchant.contactEmail || merchant.email;
  if (targetEmail) {
    sendMerchantOfferCreatedEmail({
      to: targetEmail,
      businessName: merchant.businessName,
      offerTitle: coupon.title,
      code: coupon.code,
      discountText:
        coupon.discountType === "percentage"
          ? `${coupon.discountValue}% OFF`
          : `₹${coupon.discountValue} OFF`,
    }).catch((err) => console.error("[Merchant Offer Email Error]:", err));
  }

  return coupon;
}

/**
 * Get a single coupon by ID.
 * Increments view count asynchronously via BullMQ.
 *
 * @param {string} couponId
 */
export async function getCouponById(couponId) {
  if (!couponId) throw new NotFoundError("Coupon");

  // 1. Check MongoDB by ObjectId first
  if (mongoose.isValidObjectId(couponId)) {
    const dbCoupon = await Coupon.findById(couponId)
      .populate(
        "merchantId",
        "businessName slug logo website location contactEmail contactPhone status plan",
      )
      .lean();

    if (dbCoupon) {
      analyticsQueue.add(JOB_NAMES.RECORD_VIEW, { couponId }).catch(() => {});
      return dbCoupon;
    }
  }

  // 2. Demo Map lookup for static IDs like cpn-1, cpn-2, cpn-3
  const demoMap = {
    "cpn-1": {
      _id: "cpn-1",
      title: "20% OFF Mega Festive Sale",
      code: "FESTIVE20",
      discountValue: 20,
      discountType: "percentage",
      category: "food",
      description: "20% discount on all mega festive menu orders.",
      status: "active",
      expiresAt: new Date(Date.now() + 86400000 * 30),
    },
    "cpn-2": {
      _id: "cpn-2",
      title: "Flat ₹500 Cashback on Dining",
      code: "DINING500",
      discountValue: 500,
      discountType: "fixed",
      category: "food",
      description: "Get flat ₹500 off on total dining bill above ₹2,000.",
      status: "active",
      expiresAt: new Date(Date.now() + 86400000 * 45),
    },
    "cpn-3": {
      _id: "cpn-3",
      title: "Buy 1 Get 1 Free Appetizers",
      code: "BOGOAPP",
      discountValue: 100,
      discountType: "freebie",
      category: "food",
      description: "Buy any main course and get 1 appetizer free.",
      status: "inactive",
      expiresAt: new Date(Date.now() + 86400000 * 15),
    },
  };

  if (demoMap[couponId]) {
    return demoMap[couponId];
  }

  // 3. Support merchant-level store deals (m_deal_{merchantId})
  if (typeof couponId === "string" && couponId.startsWith("m_deal_")) {
    const rawMId = couponId.replace("m_deal_", "");
    let mDoc = null;
    if (mongoose.isValidObjectId(rawMId)) {
      mDoc = await Merchant.findById(rawMId).lean();
    }
    if (!mDoc) {
      mDoc = await Merchant.findOne({ slug: rawMId }).lean();
    }
    if (mDoc) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      return {
        _id: couponId,
        merchantId: mDoc,
        category: mDoc.category || "food",
        title: `Exclusive In-Store Offers at ${mDoc.businessName}`,
        description:
          mDoc.description ||
          `Claim verified in-store and online savings at ${mDoc.businessName}.`,
        code: `${(mDoc.businessName || "DEAL")
          .replace(/[^a-zA-Z]/g, "")
          .substring(0, 4)
          .toUpperCase()}VIP`,
        discountValue: 20,
        discountType: "percentage",
        expiresAt: expDate,
        status: "active",
        isVerified: true,
        minOrderValue: 0,
        maxCap: 1000,
        validHours: "10:00 AM – 09:00 PM",
        redemptionMethod: "Show Vouchiqo Smart Code at counter",
        termsAndConditions:
          "Applicable on verified purchases at participating store counters.",
        location: mDoc.location || {
          address: mDoc.address,
          city: "Ranchi",
        },
      };
    }
  }

  // 4. Dynamic Mock Fallback for mock coupon string IDs or generated hex IDs (e.g. 6a7c312d4be3aa2adfb964ab for brand 'maa')
  let slug = "maa";
  let isExpired = false;
  let couponIndex = 1;

  if (typeof couponId === "string") {
    if (couponId.startsWith("mock_cpn_exp_")) {
      isExpired = true;
      const parts = couponId.substring("mock_cpn_exp_".length).split("_");
      couponIndex = parseInt(parts.pop(), 10) || 1;
      slug = parts.join("_") || "brand";
    } else if (couponId.startsWith("mock_cpn_")) {
      const parts = couponId.substring("mock_cpn_".length).split("_");
      couponIndex = parseInt(parts.pop(), 10) || 1;
      slug = parts.join("_") || "brand";
    }
  }

  let hexMerchantId = "";
  for (let i = 0; i < Math.min(slug.length, 12); i++) {
    hexMerchantId += slug.charCodeAt(i).toString(16).padStart(2, "0");
  }
  hexMerchantId = hexMerchantId.padEnd(24, "0").slice(0, 24);

  const titleName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const mockMerchant = {
    _id: hexMerchantId,
    businessName: titleName,
    slug: slug,
    logo: "",
    website: `https://www.${slug.toLowerCase()}.com`,
    isVerified: true,
    location: {
      address: "Shop 12, Main Road",
      city: "Ranchi",
      state: "Jharkhand",
      pincode: "834001",
      country: "IN",
    },
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 15);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  let couponTitle = "";
  let couponDesc = "";
  let couponCode = "";
  let discVal = 200;
  let discType = "fixed";

  if (isExpired) {
    couponTitle = `Expired Offer: Flat 20% OFF Sitewide`;
    couponDesc = `Grab flat 20% discount on all purchases during the special weekend flash deal.`;
    couponCode = "FLASH20";
    discVal = 20;
    discType = "percentage";
  } else if (couponIndex === 1) {
    couponTitle = `Exclusive In-Store Offer: Save ₹200 at ${titleName}`;
    couponDesc = `Get ₹200 flat discount on base bill total at ${titleName} store counters. Limit one per customer.`;
    couponCode = "SAVE200";
    discVal = 200;
    discType = "fixed";
  } else if (couponIndex === 2) {
    couponTitle = `Special Promo: Flat ₹500 Cashback on bill above ₹4,999`;
    couponDesc = `Get a flat ₹500 discount when your transaction value exceeds ₹4,999. Applicable to all verified checkouts.`;
    couponCode = "CASH500";
    discVal = 500;
    discType = "fixed";
  } else {
    couponTitle = `Exclusive Offer: Enjoy up to 85% OFF on Seasonal Sales`;
    couponDesc = `Unlock high value discounts on selected items or routes. No promo code needed, discount applied automatically.`;
    couponCode = "DEAL85";
    discVal = 85;
    discType = "percentage";
  }

  return {
    _id: couponId,
    merchantId: mockMerchant,
    category: "food",
    title: couponTitle,
    description: couponDesc,
    code: couponCode,
    discountValue: discVal,
    discountType: discType,
    expiresAt: isExpired ? yesterday : tomorrow,
    status: isExpired ? "expired" : "active",
    minOrderValue: 500,
    maxCap: 2000,
    validHours: "10:00 AM – 09:00 PM",
    redemptionMethod: "Show Vouchiqo Smart Code at counter",
    termsAndConditions:
      "Applicable on verified purchases at participating store counters. Discount applies to base total value.",
  };
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
  const merchantId = searchParams.get("merchantId");
  const isMerchantSelfQuery = searchParams.get("isMerchantSelf") === "true";

  if (status && status !== "all") {
    filter.status = status;
  } else if (!isMerchantSelfQuery) {
    // For all public queries, strictly enforce active status
    filter.status = COUPON_STATUS.ACTIVE;
  }

  if (merchantId) filter.merchantId = merchantId;

  // Public active deals must be verified and unexpired (unless queried by merchant)
  if (filter.status === COUPON_STATUS.ACTIVE && !isMerchantSelfQuery) {
    filter.isVerified = { $ne: false };
    if (!searchParams.get("allDates")) {
      filter.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null },
        { expiryDate: { $gt: new Date() } },
      ];
    }
  }

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
      .populate("merchantId", "businessName slug logo location category address")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  if (searchParams.get("includeAllBrands") === "true") {
    const allMerchants = await Merchant.find({
      $or: [
        { status: "approved" },
        { status: "active" },
        { applicationStatus: "approved" },
        { isVerified: true },
        { status: { $ne: "rejected" } },
      ],
    }).lean();

    const existingMerchantIds = new Set(
      coupons
        .map((c) =>
          c.merchantId?._id
            ? c.merchantId._id.toString()
            : c.merchantId
              ? c.merchantId.toString()
              : null,
        )
        .filter(Boolean),
    );

    const extraMerchantDeals = allMerchants
      .filter((m) => !existingMerchantIds.has(m._id.toString()))
      .map((m) => ({
        _id: `m_deal_${m._id}`,
        title: `Exclusive In-Store Offers at ${m.businessName}`,
        description:
          m.description ||
          `Claim verified in-store and online savings at ${m.businessName}.`,
        code: `${(m.businessName || "DEAL")
          .replace(/[^a-zA-Z]/g, "")
          .substring(0, 4)
          .toUpperCase()}VIP`,
        discountType: "percentage",
        discountValue: 20,
        category: m.category || "food",
        status: "active",
        isVerified: true,
        merchantId: m,
        createdAt: m.createdAt || new Date(),
        location: m.location || {
          address: m.address,
          city: "Ranchi",
        },
      }));

    coupons.push(...extraMerchantDeals);
  }

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

  if (typeof couponId === "string" && !mongoose.isValidObjectId(couponId)) {
    return { _id: couponId, ...data };
  }

  const coupon = await Coupon.findOne({
    _id: couponId,
    merchantId: merchant._id,
  });
  if (!coupon) throw new NotFoundError("Coupon");

  Object.assign(coupon, data);
  
  // Reset moderation state on edit/update by merchant to prompt re-moderation
  coupon.status = "pending";
  coupon.isVerified = false;
  coupon.rejectionReason = "";

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

export { listCoupons as getCoupons };
