import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import CouponCard from "@/components/shared/CouponCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import { COUPON_CATEGORIES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * Generate SEO metadata for category page.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Verified ${categoryName} Coupons & Deals | Vouchiqo`,
    description: `Save money on ${categoryName} with verified coupon codes, discounts, and expiring offers. 100% working and community tested.`,
  };
}

const CATEGORY_META = {
  food: {
    title: "Food & Dining",
    emoji: "🍔",
    banner: "bg-gradient-to-r from-amber-500 to-orange-500",
    subs: ["Fast Food", "Fine Dining", "Bakeries", "Beverages"],
  },
  fashion: {
    title: "Fashion & Apparel",
    emoji: "🛍️",
    banner: "bg-gradient-to-r from-pink-500 to-rose-500",
    subs: ["Footwear", "Apparel", "Watches", "Accessories"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    emoji: "💻",
    banner: "bg-gradient-to-r from-blue-500 to-indigo-500",
    subs: ["Mobiles", "Laptops", "Accessories", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Skincare",
    emoji: "💄",
    banner: "bg-gradient-to-r from-rose-400 to-pink-500",
    subs: ["Makeup", "Skincare", "Fragrance", "Hair Care"],
  },
  travel: {
    title: "Travel & Hotels",
    emoji: "✈️",
    banner: "bg-gradient-to-r from-emerald-500 to-teal-500",
    subs: ["Hotels", "Flights", "Cabs", "Luggage"],
  },
  fitness: {
    title: "Health & Fitness",
    emoji: "💪",
    banner: "bg-gradient-to-r from-red-500 to-orange-500",
    subs: ["Gyms", "Supplements", "Equipment", "Wearables"],
  },
  home: {
    title: "Home & Décor",
    emoji: "🏠",
    banner: "bg-gradient-to-r from-teal-500 to-emerald-600",
    subs: ["Furniture", "Sanitary Ware", "Tiles", "Lighting"],
  },
  entertainment: {
    title: "SaaS & Productivity",
    emoji: "💼",
    banner: "bg-gradient-to-r from-indigo-500 to-purple-600",
    subs: ["SaaS Tools", "Streaming", "Gaming", "Subscriptions"],
  },
  services: {
    title: "Local Services",
    emoji: "🛠️",
    banner: "bg-gradient-to-r from-violet-500 to-fuchsia-600",
    subs: ["Repairs", "Catering", "Spa", "On-Demand"],
  },
  other: {
    title: "Special & Other Deals",
    emoji: "🏷️",
    banner: "bg-gradient-to-r from-slate-500 to-slate-700",
    subs: ["Daily Deals", "Bundles", "Freebies", "Cashbacks"],
  },
};

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();

  // Validate category slug
  if (!COUPON_CATEGORIES.includes(cleanSlug)) {
    notFound();
  }

  await connectDB();

  // Fetch active coupons in category
  const rawCoupons = await Coupon.find({
    category: cleanSlug,
    status: "active",
    expiresAt: { $gt: new Date() },
  })
    .populate("merchantId", "businessName slug logo")
    .lean();

  const coupons = JSON.parse(JSON.stringify(rawCoupons || []));
  const categoryInfo = CATEGORY_META[cleanSlug] || {
    title: cleanSlug,
    emoji: "🏷️",
    banner: "bg-gradient-to-r from-brand-navy to-brand-blue",
    subs: [],
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      {/* Hero Category Banner */}
      <section
        className={`${categoryInfo.banner} text-white py-16 px-4 relative overflow-hidden select-none border-b border-white/5`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="max-w-6xl mx-auto space-y-4 relative z-10 text-left">
          <Badge className="bg-white/10 text-white border border-white/10 px-3 py-1 rounded-full text-xs font-bold w-fit flex items-center gap-1.5 shadow-sm">
            <span>Category Hub</span>
          </Badge>

          <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight leading-tight flex items-center gap-3">
            <span className="text-4xl md:text-6xl">{categoryInfo.emoji}</span>
            <span>{categoryInfo.title} Coupons &amp; Offers</span>
          </h1>

          <p className="text-xs md:text-sm text-white/80 max-w-lg leading-relaxed font-medium">
            Discover verified discount coupons, promotional codes, and deals
            from leading brands in {categoryInfo.title}. Verified by the
            Vouchiqo community.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow space-y-8">
        {/* Sub-category chips */}
        {categoryInfo.subs.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap border-b border-brand-border pb-5">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Sub-Categories:
            </span>
            {categoryInfo.subs.map((sub, idx) => (
              <Badge
                key={idx}
                className="bg-brand-bg text-brand-text border border-brand-border px-3 py-1 text-xs font-bold hover:border-brand-blue cursor-pointer transition-all hover:bg-brand-surface shadow-none"
              >
                {sub}
              </Badge>
            ))}
          </div>
        )}

        {/* Coupons Grid */}
        <div className="space-y-6 text-left">
          <h2 className="text-lg md:text-xl font-black text-brand-navy uppercase tracking-wider flex items-center justify-between">
            <span>Active Discount Codes</span>
            <span className="text-xs text-brand-subtext font-semibold">
              ({coupons.length} vouchers verified today)
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} isLocal={false} />
            ))}
            {coupons.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-brand-border rounded-xl space-y-4">
                <p className="text-sm font-medium text-brand-subtext">
                  No active coupons available in this category currently.
                </p>
                <Button
                  asChild
                  className="btn-primary py-2 px-6 text-xs font-bold border-0 h-auto cursor-pointer shadow-none"
                >
                  <Link href="/deals">Browse Other Categories</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
