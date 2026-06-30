import { HomeClient } from "@/components/landing/HomeClient";
import { connectDB } from "@/lib/mongodb";
import {
  getFeaturedCoupons,
  listCoupons,
} from "@/modules/coupon/coupon.service";
import Navbar from "@/components/layout/navbar";

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

  // 4. Render the client-side component shell with hydrated database props
  return (
    <>
      <HomeClient
        initialCoupons={featuredCoupons}
        latestCoupons={latestCoupons}
      />
    </>
  );
}
