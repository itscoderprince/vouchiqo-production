import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import { COUPON_CATEGORIES } from "@/utils/constants";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Categories Coupons, Offers & Promo Codes | Vouchiqo",
  description:
    "Discover 1000+ verified coupons across all categories on Vouchiqo. Find the best deals on fashion, electronics, food, travel, beauty and more.",
};

// Category metadata with icons and SVG paths
const CATEGORY_META = {
  food: {
    title: "Food & Dining",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648578/food.svg",
    coupons: 0,
    offers: 0,
    slug: "food",
  },
  fashion: {
    title: "Fashion",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648143/fashion.svg",
    coupons: 0,
    offers: 0,
    slug: "fashion",
  },
  electronics: {
    title: "Electronics",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647250/electronics.svg",
    coupons: 0,
    offers: 0,
    slug: "electronics",
  },
  beauty: {
    title: "Beauty",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409643778/beauty.svg",
    coupons: 0,
    offers: 0,
    slug: "beauty",
  },
  travel: {
    title: "Travel",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656824/travel.svg",
    coupons: 0,
    offers: 0,
    slug: "travel",
  },
  fitness: {
    title: "Health & Fitness",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773792964436/fitness.svg",
    coupons: 0,
    offers: 0,
    slug: "fitness",
  },
  home: {
    title: "Home & Kitchen",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409649785/home-and-kitchen.svg",
    coupons: 0,
    offers: 0,
    slug: "home",
  },
  entertainment: {
    title: "Entertainment",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647335/entertainment.svg",
    coupons: 0,
    offers: 0,
    slug: "entertainment",
  },
  services: {
    title: "Services",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409655353/services.svg",
    coupons: 0,
    offers: 0,
    slug: "services",
  },
  "home-improvement": {
    title: "Home Improvement",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409655353/services.svg",
    coupons: 0,
    offers: 0,
    slug: "home-improvement",
  },
  education: {
    title: "Education",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    coupons: 0,
    offers: 0,
    slug: "education",
  },
  finance: {
    title: "Finance",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    coupons: 0,
    offers: 0,
    slug: "finance",
  },
  gaming: {
    title: "Gaming",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647335/entertainment.svg",
    coupons: 0,
    offers: 0,
    slug: "gaming",
  },
  automotive: {
    title: "Automotive",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409655353/services.svg",
    coupons: 0,
    offers: 0,
    slug: "automotive",
  },
  "kids-baby": {
    title: "Kids & Baby",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648143/fashion.svg",
    coupons: 0,
    offers: 0,
    slug: "kids-baby",
  },
  pets: {
    title: "Pets",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    coupons: 0,
    offers: 0,
    slug: "pets",
  },
  organic: {
    title: "Organic",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409643778/beauty.svg",
    coupons: 0,
    offers: 0,
    slug: "organic",
  },
  grocery: {
    title: "Grocery",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648578/food.svg",
    coupons: 0,
    offers: 0,
    slug: "grocery",
  },
  other: {
    title: "Other Deals",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    coupons: 0,
    offers: 0,
    slug: "other",
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

  // Build categories with actual counts
  const categories = COUPON_CATEGORIES.map((slug) => {
    const meta = CATEGORY_META[slug] || {
      title: slug,
      icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
      slug,
    };
    const countData = categoryCounts.find((c) => c._id === slug);
    return {
      ...meta,
      slug,
      total: countData ? countData.total : 0,
    };
  });

  const totalCoupons = categoryCounts.reduce((a, c) => a + c.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fa]">
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
