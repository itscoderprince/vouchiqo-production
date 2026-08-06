import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import CouponCard from "@/components/shared/cards/CouponCard";
import AffiliateProductCard from "@/app/(public)/brand/[slug]/components/AffiliateProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import { COUPON_CATEGORIES } from "@/utils/constants";
import { ArrowLeft, Sparkles, Tag, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

// Category metadata with rich colors, icons & sub-categories
const CATEGORY_META = {
  fashion: {
    title: "Fashion & Clothing",
    emoji: "🛍️",
    banner: "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700",
    subs: ["Men's Fashion", "Women's Wear", "Footwear", "Watches & Accessories"],
  },
  food: {
    title: "Food & Dining",
    emoji: "🍔",
    banner: "bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700",
    subs: ["Fast Food", "Fine Dining", "Bakeries & Desserts", "Cloud Kitchens"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    emoji: "💻",
    banner: "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700",
    subs: ["Smartphones", "Laptops & PCs", "Headphones & Audio", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Wellness",
    emoji: "💄",
    banner: "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700",
    subs: ["Makeup", "Skincare", "Salons & Spas", "Fragrance"],
  },
  travel: {
    title: "Travel & Hospitality",
    emoji: "✈️",
    banner: "bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700",
    subs: ["Hotels & Resorts", "Flight Tickets", "Tour Packages", "Car Rentals"],
  },
  home: {
    title: "Home & Living",
    emoji: "🏠",
    banner: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700",
    subs: ["Furniture", "Home Décor", "Kitchenware", "Furnishings"],
  },
  "home-improvement": {
    title: "Home Improvement",
    emoji: "🛠️",
    banner: "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700",
    subs: ["Tiles & Granite", "Hardware & Tools", "Paints", "Electricals"],
  },
  fitness: {
    title: "Fitness & Healthcare",
    emoji: "💪",
    banner: "bg-gradient-to-r from-red-600 via-rose-600 to-red-700",
    subs: ["Gym Memberships", "Protein & Supplements", "Pharmacies", "Labs"],
  },
  education: {
    title: "Education & Courses",
    emoji: "🎓",
    banner: "bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700",
    subs: ["Coaching Classes", "Online Courses", "Certifications", "Skill Bootcamps"],
  },
  "kids-baby": {
    title: "Kids & Baby Products",
    emoji: "👶",
    banner: "bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700",
    subs: ["Toys & Games", "Baby Care", "Kidswear", "Nursery"],
  },
  jewellery: {
    title: "Jewellery & Accessories",
    emoji: "💎",
    banner: "bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700",
    subs: ["Gold & Diamond", "Silver Jewellery", "Fashion Jewellery", "Eyewear"],
  },
  automotive: {
    title: "Automobile & Services",
    emoji: "🚗",
    banner: "bg-gradient-to-r from-slate-700 via-zinc-700 to-slate-800",
    subs: ["Car Services", "Auto Spare Parts", "Tyres & Care", "Car Accessories"],
  },
  entertainment: {
    title: "Gaming & Entertainment",
    emoji: "🎮",
    banner: "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-fuchsia-700",
    subs: ["Gaming Consoles", "Peripherals", "Movie Tickets", "Events"],
  },
  grocery: {
    title: "Grocery & Essentials",
    emoji: "🛒",
    banner: "bg-gradient-to-r from-lime-600 via-emerald-600 to-lime-700",
    subs: ["Daily Grocery", "Organic Produce", "Dairy & Bakery", "Dry Fruits"],
  },
  finance: {
    title: "Finance & Insurance",
    emoji: "💳",
    banner: "bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700",
    subs: ["Credit Cards", "Insurance Plans", "Mutual Funds", "Personal Loans"],
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const categoryInfo = CATEGORY_META[cleanSlug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
  };

  return {
    title: `Verified ${categoryInfo.title} Coupons, Promo Codes & Deals | Vouchiqo`,
    description: `Save money on ${categoryInfo.title} with verified discount coupons, promotional offers, and affiliate product deals on Vouchiqo.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();

  // Validate category slug
  const validSlugs = COUPON_CATEGORIES.filter((s) => s !== "others");
  if (!validSlugs.includes(cleanSlug)) {
    notFound();
  }

  await connectDB();

  const categoryInfo = CATEGORY_META[cleanSlug] || {
    title: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1),
    emoji: "🏷️",
    banner: "bg-gradient-to-r from-blue-600 to-slate-800",
    subs: [],
  };

  const categoryTitle = categoryInfo.title;
  const categoryRegex = new RegExp(cleanSlug.replace(/-/g, "|"), "i");

  // Fetch active coupons in category
  const rawCoupons = await Coupon.find({
    status: "active",
    expiresAt: { $gt: new Date() },
    $or: [
      { category: cleanSlug },
      { category: categoryTitle },
      { category: categoryRegex },
    ],
  })
    .populate("merchantId", "businessName slug logo")
    .lean();

  const coupons = JSON.parse(JSON.stringify(rawCoupons || []));

  // Fetch active affiliate products in category
  const rawAffiliateProducts = await AffiliateProduct.find({
    status: "active",
    $or: [
      { category: cleanSlug },
      { category: categoryTitle },
      { category: categoryRegex },
    ],
  })
    .populate("merchantId", "businessName slug logo")
    .sort({ createdAt: -1 })
    .lean();

  const affiliateProducts = JSON.parse(
    JSON.stringify(rawAffiliateProducts || [])
  );

  const totalOffersCount = coupons.length + affiliateProducts.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans">
      <Navbar />

      {/* Hero Category Banner */}
      <section
        className={`${categoryInfo.banner} text-white py-12 md:py-16 px-4 sm:px-6 relative overflow-hidden select-none border-b border-white/10`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-left">
          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Categories</span>
            </Link>

            <Badge className="bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Verified Category Hub</span>
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight flex items-center gap-3">
            <span className="text-4xl md:text-6xl">{categoryInfo.emoji}</span>
            <span>{categoryInfo.title} Offers</span>
          </h1>

          <p className="text-xs md:text-sm text-white/90 max-w-xl leading-relaxed font-medium">
            Explore {totalOffersCount} active verified promo codes, store discounts, and exclusive affiliate deals in {categoryInfo.title}.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow space-y-10 text-left">
        {/* Sub-category chips */}
        {categoryInfo.subs.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap border-b border-slate-200 pb-5">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Popular Sub-Categories:
            </span>
            {categoryInfo.subs.map((sub, idx) => (
              <Badge
                key={idx}
                className="bg-white text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-all shadow-2xs"
              >
                {sub}
              </Badge>
            ))}
          </div>
        )}

        {/* Section 1: Active Coupons & Promo Codes */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              <span>Active Coupons & Vouchers</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {coupons.length} Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} isLocal={false} />
            ))}
            {coupons.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  No active coupon vouchers in {categoryInfo.title} right now.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Active Affiliate Products */}
        <div className="space-y-5 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>Affiliate Product Deals</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {affiliateProducts.length} Products
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {affiliateProducts.map((product) => (
              <AffiliateProductCard
                key={product._id}
                product={product}
                merchant={product.merchantId}
              />
            ))}
            {affiliateProducts.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  No active affiliate deals in {categoryInfo.title} right now.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Global Empty State */}
        {totalOffersCount === 0 && (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-8 space-y-4 max-w-md mx-auto shadow-2xs">
            <p className="text-sm font-semibold text-slate-600">
              No active offers or products currently listed in {categoryInfo.title}.
            </p>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer"
            >
              <Link href="/categories">Browse All Categories</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
