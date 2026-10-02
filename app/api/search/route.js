import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { escapeRegex } from "@/lib/security";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { COUPON_CATEGORIES, REDIS_KEYS, REDIS_TTL } from "@/utils/constants";

export const dynamic = "force-dynamic";

const CATEGORY_NAMES = {
  fashion: "Fashion & Clothing",
  food: "Food & Dining",
  electronics: "Electronics & Gadgets",
  beauty: "Beauty & Wellness",
  travel: "Travel & Hospitality",
  home: "Home & Living",
  "home-improvement": "Home Improvement",
  fitness: "Fitness & Healthcare",
  education: "Education & Courses",
  "kids-baby": "Kids & Baby Care",
  jewellery: "Jewellery & Accessories",
  automotive: "Automobile & Services",
  entertainment: "Gaming & Entertainment",
  grocery: "Grocery & Essentials",
  finance: "Finance & Insurance",
};

/**
 * GET /api/search
 * Public unified multi-entity search endpoint.
 * Searches across approved brands, active coupons, verified categories, and affiliate products.
 * Redis-cached per query for 60 seconds.
 */
export const GET = asyncHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const limitParam = parseInt(searchParams.get("limit") || "8", 10);
  const limit = Math.min(Math.max(limitParam, 1), 30);

  if (!q) {
    return ok({
      query: "",
      brands: [],
      coupons: [],
      categories: [],
      products: [],
      total: 0,
    });
  }

  const cleanQ = q.toLowerCase();
  const cacheKey = REDIS_KEYS.searchGlobal(cleanQ);

  // Fast path: Redis cache (60 seconds)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return ok(JSON.parse(cached));
  } catch (_) {}

  await connectDB();

  const safeRegex = escapeRegex(cleanQ);
  const regex = new RegExp(safeRegex, "i");
  const flexibleRegex = new RegExp(safeRegex.replace(/[\s-]+/g, "[\\s-]*"), "i");

  const BRAND_SEARCH_ALIASES = {
    blissclub: "bliss club",
    zandu: "emami zandu",
    nilkamal: "nilkamal furniture",
    blackberrys: "blackberry",
  };
  const aliasQuery = BRAND_SEARCH_ALIASES[cleanQ.replace(/[^a-z0-9]/g, "")];
  const aliasRegex = aliasQuery ? new RegExp(escapeRegex(aliasQuery), "i") : null;

  // 1. Matched Categories
  const matchedCategories = COUPON_CATEGORIES.filter((slug) => {
    if (slug === "others") return false;
    const name = (CATEGORY_NAMES[slug] || slug).toLowerCase();
    return name.includes(cleanQ) || slug.toLowerCase().includes(cleanQ);
  }).map((slug) => ({
    id: `cat_${slug}`,
    title: CATEGORY_NAMES[slug] || slug,
    slug,
    type: "Category",
    href: `/category/${slug}`,
  }));

  // 2. Find matching merchants — search by company name, slug, category, description, and location
  const matchingMerchants = await Merchant.find({
    status: "approved",
    $or: [
      { businessName: regex },
      { businessName: flexibleRegex },
      ...(aliasRegex ? [{ businessName: aliasRegex }, { slug: aliasRegex }] : []),
      { slug: regex },
      { slug: flexibleRegex },
      { category: regex },
      { shortDescription: regex },
      { description: regex },
      { "location.city": regex },
      { "location.address": regex },
    ],
  })
    .select("businessName slug logo category isVerified totalCoupons shortDescription")
    .limit(limit)
    .lean();

  const matchedMerchantIds = matchingMerchants.map((m) => m._id);

  // 3. Query Active & Verified Coupons
  // Uses $and to safely combine the expiry filter with the search filter
  // without one $or overwriting the other
  const now = new Date();
  const couponQuery = {
    status: "active",
    isVerified: { $ne: false },
    $and: [
      // Clause 1: must not be expired
      {
        $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: null },
          { expiresAt: { $exists: false } },
        ],
      },
      // Clause 2: must match search term in title/desc/code/category/tags/merchant
      {
        $or: [
          { title: regex },
          { description: regex },
          { code: regex },
          { category: regex },
          { tags: regex },
          ...(matchedMerchantIds.length > 0
            ? [{ merchantId: { $in: matchedMerchantIds } }]
            : []),
        ],
      },
    ],
  };

  // 4. Query Active Affiliate Products
  // FIX: removed non-existent fields 'merchantName' and 'brand';
  //      added 'description' which IS in the schema
  const productQuery = {
    status: "active",
    $or: [
      { title: regex },
      { description: regex },
      { category: regex },
      ...(matchedMerchantIds.length > 0
        ? [{ merchantId: { $in: matchedMerchantIds } }]
        : []),
    ],
  };

  const [coupons, products] = await Promise.all([
    Coupon.find(couponQuery)
      .select("title code discountType discountValue category expiresAt totalClaims merchantId isFeatured")
      .populate("merchantId", "businessName slug logo")
      .sort({ isFeatured: -1, totalClaims: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
    AffiliateProduct.find(productQuery)
      // FIX: select 'affiliateUrl' — the actual schema field; 'affiliateLink' does not exist
      .select("title discountPrice originalPrice discountPercentage category imageUrl affiliateUrl merchantId description")
      .populate("merchantId", "businessName slug logo")
      .limit(limit)
      .lean(),
  ]);

  const brands = matchingMerchants;
  const total =
    brands.length + coupons.length + matchedCategories.length + products.length;

  const result = {
    query: q,
    brands: brands.map((b) => ({
      id: String(b._id),
      title: b.businessName,
      slug: b.slug,
      logo: b.logo || "",
      category: b.category || "Brand",
      type: "Brand",
      href: `/brand/${b.slug}`,
      isVerified: b.isVerified ?? true,
      totalCoupons: b.totalCoupons || 0,
    })),
    coupons: coupons.map((c) => ({
      id: String(c._id),
      title: c.title,
      code: c.code || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      category: c.category,
      type: "Offer",
      href: `/deals/${c._id}`,
      merchant: c.merchantId
        ? {
            id: String(c.merchantId._id || c.merchantId),
            name: c.merchantId.businessName || "Partner Store",
            slug: c.merchantId.slug || "",
            logo: c.merchantId.logo || "",
          }
        : null,
    })),
    categories: matchedCategories,
    products: products.map((p) => ({
      id: String(p._id),
      title: p.title,
      discountPrice: p.discountPrice,
      originalPrice: p.originalPrice,
      discountPercentage: p.discountPercentage,
      category: p.category,
      type: "Product",
      // FIX: use 'affiliateUrl' — the actual schema field name
      href: p.affiliateUrl || "#",
      imageUrl: p.imageUrl || "",
      merchant: p.merchantId
        ? {
            name: p.merchantId.businessName,
            slug: p.merchantId.slug,
            logo: p.merchantId.logo,
          }
        : null,
    })),
    total,
  };

  // Cache in Redis (fire-and-forget, 60 seconds)
  try {
    redis.setex(cacheKey, REDIS_TTL.SEARCH_GLOBAL, JSON.stringify(result)).catch(() => {});
  } catch (_) {}

  return ok(result);
});
