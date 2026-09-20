import { HomeClient } from "@/components/landing/HomeClient";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { getPromoBanners } from "@/modules/admin/banner.service";
import { getPublicAffiliateProducts } from "@/modules/affiliate-product/affiliate-product.service";
import {
  getFeaturedCoupons,
  listCoupons,
} from "@/modules/coupon/coupon.service";
import Merchant from "@/modules/merchant/merchant.model";

// Force dynamic SSR rendering
export const dynamic = "force-dynamic";
export const revalidate = 60;

const CACHE_KEY = "vouchiqo:homepage:data:v3";
const CACHE_TTL_SECONDS = 300;

async function fetchHomepageData() {
  // 1. Check Redis cache first with strict timeout (1.5s) for instant response
  try {
    if (redis && redis.status === "ready") {
      const cached = await Promise.race([
        redis.get(CACHE_KEY),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis cache get timeout")), 1500),
        ),
      ]);
      if (cached) {
        return JSON.parse(cached);
      }
    }
  } catch (err) {
    // Graceful fallback to database
  }

  // 2. Connect DB
  await connectDB();

  const latestParams = new URLSearchParams({
    limit: "6",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // 3. Parallel fetch all 5 data sources concurrently
  const [
    rawCoupons,
    latestResult,
    rawMerchants,
    rawBanners,
    rawProducts,
  ] = await Promise.all([
    getFeaturedCoupons().catch(() => []),
    listCoupons(latestParams).catch(() => ({ coupons: [] })),
    Merchant.find({ status: "approved" })
      .select(
        "businessName slug logo banner category maxDiscount shortDescription location totalCoupons totalRedemptions followerCount applicationStatus isVerified status",
      )
      .sort({ totalCoupons: -1, totalRedemptions: -1, createdAt: -1 })
      .limit(36)
      .lean()
      .catch(() => []),
    getPromoBanners().catch(() => []),
    getPublicAffiliateProducts().catch(() => []),
  ]);

  const payload = {
    featuredCoupons: JSON.parse(JSON.stringify(rawCoupons || [])),
    latestCoupons: JSON.parse(JSON.stringify(latestResult?.coupons || [])),
    popularMerchants: JSON.parse(JSON.stringify(rawMerchants || [])),
    banners: JSON.parse(JSON.stringify(rawBanners || [])),
    affiliateProducts: JSON.parse(JSON.stringify(rawProducts || [])),
  };

  // 4. Cache in Redis non-blocking in the background
  try {
    if (redis && redis.status === "ready") {
      Promise.race([
        redis.set(CACHE_KEY, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis cache set timeout")), 2000),
        ),
      ]).catch(() => {});
    }
  } catch (_) {}

  return payload;
}

export default async function Home() {
  const {
    featuredCoupons,
    latestCoupons,
    popularMerchants,
    banners,
    affiliateProducts,
  } = await fetchHomepageData();

  return (
    <HomeClient
      initialCoupons={featuredCoupons}
      latestCoupons={latestCoupons}
      popularMerchants={popularMerchants}
      banners={banners}
      affiliateProducts={affiliateProducts}
    />
  );
}
