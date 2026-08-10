import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import { COUPON_CATEGORIES } from "@/utils/constants";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Categories Offers & Promo Codes | Vouchiqo",
  description:
    "Discover 1000+ verified coupons across all categories on Vouchiqo. Find the best deals on fashion, electronics, food, travel, beauty and more.",
};

// Category metadata with icons and SVG paths
const CATEGORY_META = {
  fashion: {
    title: "Fashion & Clothing",
    slug: "fashion",
  },
  food: {
    title: "Food & Dining",
    slug: "food",
  },
  electronics: {
    title: "Electronics & Gadgets",
    slug: "electronics",
  },
  beauty: {
    title: "Beauty & Wellness",
    slug: "beauty",
  },
  travel: {
    title: "Travel & Hospitality",
    slug: "travel",
  },
  home: {
    title: "Home & Living",
    slug: "home",
  },
  "home-improvement": {
    title: "Home Improvement",
    slug: "home-improvement",
  },
  fitness: {
    title: "Fitness & Healthcare",
    slug: "fitness",
  },
  education: {
    title: "Education & Courses",
    slug: "education",
  },
  "kids-baby": {
    title: "Kids & Baby Products",
    slug: "kids-baby",
  },
  jewellery: {
    title: "Jewellery & Accessories",
    slug: "jewellery",
  },
  automotive: {
    title: "Automobile & Auto Services",
    slug: "automotive",
  },
  entertainment: {
    title: "Gaming & Entertainment",
    slug: "entertainment",
  },
  grocery: {
    title: "Grocery & Essentials",
    slug: "grocery",
  },
  finance: {
    title: "Finance & Insurance",
    slug: "finance",
  },
};

export default async function CategoriesPage() {
  await connectDB();

  // Get coupon counts per category
  const categoryCounts = await Coupon.aggregate([
    {
      $match: {
        status: "active",
        expiresAt: { $gt: new Date() },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: 1 },
      },
    },
  ]);

  // Build 15 categories with actual counts (excluding 'others')
  const categories = COUPON_CATEGORIES.filter((s) => s !== "others").map(
    (slug) => {
      const meta = CATEGORY_META[slug] || {
        title: slug,
        slug,
      };
      const countData = categoryCounts.find((c) => c._id === slug);
      return {
        ...meta,
        slug,
        total: countData ? countData.total : 0,
      };
    }
  );

  const totalCoupons = categoryCounts.reduce((a, c) => a + c.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CategoriesClient
        categories={categories}
        totalCategories={COUPON_CATEGORIES.length}
        totalCoupons={totalCoupons}
      />
      <Footer />
    </div>
  );
}
