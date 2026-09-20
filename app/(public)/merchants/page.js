import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import MerchantsClient from "./merchants-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Stores Offers & Promo Codes | Vouchiqo",
  description:
    "Find verified coupon codes, discounts and deals from all your favorite online stores on Vouchiqo.",
};

export default async function MerchantsPage() {
  await connectDB();

  // Find all approved merchants
  const dbMerchants = await Merchant.find({ status: "approved" }).lean();

  // Get active coupon counts grouped by merchantId
  const [couponCounts, affiliateCounts] = await Promise.all([
    Coupon.aggregate([
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
    ]),
    AffiliateProduct.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: "$merchantId",
          total: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Combine DB merchants with their coupon & affiliate counts
  const merchantsList = dbMerchants.map((m) => {
    const countData = couponCounts.find(
      (c) => c._id.toString() === m._id.toString(),
    );
    const affiliateData = affiliateCounts.find(
      (a) => a._id.toString() === m._id.toString(),
    );

    const totalOffers =
      (countData ? countData.total : 0) +
      (affiliateData ? affiliateData.total : 0);

    return {
      _id: m._id.toString(),
      businessName: m.businessName,
      slug: m.slug,
      logo: m.logo || "",
      category: m.category,
      totalCoupons: totalOffers,
      isVerified: m.isVerified,
    };
  });

  // Calculate stats
  const totalMerchantsCount = dbMerchants.length;
  const totalCouponsCount =
    couponCounts.reduce((a, c) => a + c.total, 0) +
    affiliateCounts.reduce((a, c) => a + c.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
