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

const CACHE_KEY = "vouchiqo:homepage:data:v2";
const CACHE_TTL_SECONDS = 60;

async function fetchHomepageData() {
  // 1. Check Redis cache first for sub-5ms TTFB
  try {
    if (redis && redis.status === "ready") {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    }
  } catch (err) {
    console.warn("[Homepage Cache Warning]:", err?.message);
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
        "businessName slug logo banner totalCoupons totalRedemptions followerCount applicationStatus isVerified status",
      )
      .sort({ createdAt: -1 })
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

  // 4. Cache in Redis for instant subsequent loads
  try {
    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
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
