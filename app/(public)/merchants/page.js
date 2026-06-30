import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import MerchantsClient from "./merchants-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Stores Coupons, Offers & Promo Codes | Vouchiqo",
  description:
    "Find verified coupon codes, discounts and deals from all your favorite online stores on Vouchiqo.",
};

export default async function MerchantsPage() {
  await connectDB();

  // Find all approved merchants
  const dbMerchants = await Merchant.find({ status: "approved" }).lean();

  // Get active coupon counts grouped by merchantId
  const couponCounts = await Coupon.aggregate([
    {
      $match: {
        status: "active",
        expiresAt: { $gt: new Date() },
      },
    },
    {
      $group: {
        _id: "$merchantId",
        total: { $sum: 1 },
      },
    },
  ]);

  // Combine DB merchants with their coupon counts
  const merchantsList = dbMerchants.map((m) => {
    const countData = couponCounts.find(
      (c) => c._id.toString() === m._id.toString(),
    );
    return {
      _id: m._id.toString(),
      businessName: m.businessName,
      slug: m.slug,
      logo: m.logo || "",
      category: m.category,
      totalCoupons: countData ? countData.total : 0,
      isVerified: m.isVerified,
    };
  });

  // Calculate stats
  const totalMerchantsCount = dbMerchants.length;
  const totalCouponsCount = couponCounts.reduce((a, c) => a + c.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fa]">
      <Navbar />
      <MerchantsClient
        merchants={merchantsList}
        totalMerchants={totalMerchantsCount}
        totalCoupons={totalCouponsCount}
      />
      <Footer />
    </div>
  );
}
