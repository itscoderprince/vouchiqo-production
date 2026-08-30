import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Merchant from "@/modules/merchant/merchant.model";
import BrandsClient from "./brands-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Partner Brands & Stores Offers | Vouchiqo",
  description:
    "Find real verified promo codes, discount vouchers, and affiliate product deals from authentic partner merchants on Vouchiqo.",
};

export default async function BrandsPage() {
  await connectDB();

  // Find all approved/active merchants
  const dbMerchants = await Merchant.find({
    status: "approved",
  })
    .select("businessName slug logo banner shopImage category isVerified status")
    .sort({ businessName: 1 })
    .lean();

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

  // Get active affiliate product counts grouped by merchantId
  const affiliateCounts = await AffiliateProduct.aggregate([
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
  ]);

  // Combine DB merchants with real coupon & affiliate counts
  const brandsList = dbMerchants.map((m) => {
    const couponData = couponCounts.find(
      (c) => c._id && c._id.toString() === m._id.toString()
    );
    const affiliateData = affiliateCounts.find(
      (c) => c._id && c._id.toString() === m._id.toString()
    );

    return {
      _id: m._id.toString(),
      businessName: m.businessName,
      slug: m.slug,
      logo: m.logo || "",
      banner: m.banner || m.shopImage || "",
      category: m.category || "General Store",
      totalCoupons: couponData ? couponData.total : 0,
      totalAffiliateProducts: affiliateData ? affiliateData.total : 0,
      isVerified: m.isVerified ?? true,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <BrandsClient brands={brandsList} />
      <Footer />
    </div>
  );
}
