import { HomeClient } from "@/components/landing/HomeClient";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { getPromoBanners } from "@/modules/admin/banner.service";
import {
  getFeaturedCoupons,
  listCoupons,
} from "@/modules/coupon/coupon.service";
import Merchant from "@/modules/merchant/merchant.model";

// Force Next.js to render this page dynamically (SSR) so database queries are fresh
export const dynamic = "force-dynamic";

export default async function Home() {
  // 1. Connect to the database on the server
  await connectDB();

  // 2. Fetch active featured coupons from MongoDB
  const rawCoupons = await getFeaturedCoupons();
  const featuredCoupons = JSON.parse(JSON.stringify(rawCoupons || []));

  // 3. Fetch latest active coupons from MongoDB
  const latestParams = new URLSearchParams({
    limit: "6",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const latestResult = await listCoupons(latestParams);
  const latestCoupons = JSON.parse(JSON.stringify(latestResult.coupons || []));

  // 3.5. Fetch active approved merchants from MongoDB (cached in Redis for 5 minutes)
  let popularMerchants = [];
  try {
    const cachedMerchants = await redis.get("home:popular_merchants");
    if (cachedMerchants) {
      popularMerchants = JSON.parse(cachedMerchants);
    } else {
      const rawMerchants = await Merchant.find({ status: "approved" })
        .select(
          "businessName slug logo banner totalCoupons totalRedemptions followerCount",
        )
        .sort({ followerCount: -1, totalCoupons: -1 })
        .limit(24)
        .lean();
      popularMerchants = JSON.parse(JSON.stringify(rawMerchants || []));
      await redis.setex(
        "home:popular_merchants",
        300,
        JSON.stringify(popularMerchants),
      );
    }
  } catch (err) {
    console.error("Redis error fetching popular merchants:", err);
    const rawMerchants = await Merchant.find({ status: "approved" })
      .select(
        "businessName slug logo banner totalCoupons totalRedemptions followerCount",
      )
      .sort({ followerCount: -1, totalCoupons: -1 })
      .limit(24)
      .lean();
    popularMerchants = JSON.parse(JSON.stringify(rawMerchants || []));
  }

  // 3.7. Fetch active promotional banners
  let banners = [];
  try {
    const rawBanners = await getPromoBanners();
    banners = JSON.parse(JSON.stringify(rawBanners || []));
  } catch (err) {
    console.error("Error fetching promotional banners:", err);
  }

  // 4. Render the client-side component shell with hydrated database props
  return (
    <>
      <HomeClient
        initialCoupons={featuredCoupons}
        latestCoupons={latestCoupons}
        popularMerchants={popularMerchants}
        banners={banners}
      />
    </>
  );
}
