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
import { ArrowLeft, Tag, ShoppingBag, ShieldCheck, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

// Category metadata with clean icon definitions & sub-categories
const CATEGORY_META = {
  fashion: {
    title: "Fashion & Clothing",
    emoji: "🛍️",
    subs: ["Men's Fashion", "Women's Wear", "Footwear", "Watches & Accessories"],
  },
  food: {
    title: "Food & Dining",
    emoji: "🍔",
    subs: ["Fast Food", "Fine Dining", "Bakeries & Desserts", "Cloud Kitchens"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    emoji: "💻",
    subs: ["Smartphones", "Laptops & PCs", "Headphones & Audio", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Wellness",
    emoji: "💄",
    subs: ["Makeup", "Skincare", "Salons & Spas", "Fragrance"],
  },
  travel: {
    title: "Travel & Hospitality",
    emoji: "✈️",
    subs: ["Hotels & Resorts", "Flight Tickets", "Tour Packages", "Car Rentals"],
  },
  home: {
    title: "Home & Living",
    emoji: "🏠",
    subs: ["Furniture", "Home Décor", "Kitchenware", "Furnishings"],
  },
  "home-improvement": {
    title: "Home Improvement",
    emoji: "🛠️",
    subs: ["Tiles & Granite", "Hardware & Tools", "Paints", "Electricals"],
  },
  fitness: {
    title: "Fitness & Healthcare",
    emoji: "💪",
    subs: ["Gym Memberships", "Protein & Supplements", "Pharmacies", "Labs"],
  },
  education: {
    title: "Education & Courses",
    emoji: "🎓",
    subs: ["Coaching Classes", "Online Courses", "Certifications", "Skill Bootcamps"],
  },
  "kids-baby": {
    title: "Kids & Baby Products",
    emoji: "👶",
    subs: ["Toys & Games", "Baby Care", "Kidswear", "Nursery"],
  },
  jewellery: {
    title: "Jewellery & Accessories",
    emoji: "💎",
    subs: ["Gold & Diamond", "Silver Jewellery", "Fashion Jewellery", "Eyewear"],
  },
  automotive: {
    title: "Automobile & Services",
    emoji: "🚗",
    subs: ["Car Services", "Auto Spare Parts", "Tyres & Care", "Car Accessories"],
  },
  entertainment: {
    title: "Gaming & Entertainment",
    emoji: "🎮",
    subs: ["Gaming Consoles", "Peripherals", "Movie Tickets", "Events"],
  },
  grocery: {
    title: "Grocery & Essentials",
    emoji: "🛒",
    subs: ["Daily Grocery", "Organic Produce", "Dairy & Bakery", "Dry Fruits"],
  },
  finance: {
    title: "Finance & Insurance",
    emoji: "💳",
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
    title: `Verified ${categoryInfo.title} Offers, Promo Codes & Deals | Vouchiqo`,
    description: `Save money on ${categoryInfo.title} with verified discount offers, promotional deals, and affiliate product offers on Vouchiqo.`,
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
    <div className="min-h-screen flex flex-col bg-[#F7F9FB] text-slate-900 font-sans">
      <Navbar />

      {/* Clean Compact Category Header */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white py-8 md:py-10 px-4 sm:px-6 relative overflow-hidden select-none border-b border-slate-800">
        <div className="w-full max-w-[1440px] mx-auto space-y-3 relative z-10 text-left">
          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Categories</span>
            </Link>

            <Badge className="bg-blue-600/30 text-blue-300 border border-blue-400/30 px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verified Category Directory</span>
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span className="text-3xl md:text-4xl">{categoryInfo.emoji}</span>
                <span>{categoryInfo.title} Offers & Vouchers</span>
              </h1>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                Explore {totalOffersCount} active verified promo codes, store discounts, and exclusive affiliate deals in {categoryInfo.title}.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 shrink-0 flex items-center gap-3 self-start md:self-auto">
              <Layers className="w-4 h-4 text-brand-blue" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Listings</div>
                <div className="text-sm font-black text-white">{totalOffersCount} Active Offers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Main Container */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8 text-left">
        {/* Sub-category chips */}
        {categoryInfo.subs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider pr-2">
              Popular Sub-Categories:
            </span>
            {categoryInfo.subs.map((sub, idx) => (
              <Badge
                key={idx}
                className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 cursor-pointer transition-all shadow-2xs"
              >
                {sub}
              </Badge>
            ))}
          </div>
        )}

        {/* Section 1: Active Offers & Promo Codes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-blue" />
              <span>Active Vouchers & Promo Codes</span>
            </h2>
            <span className="text-xs text-slate-600 font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              {coupons.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} isLocal={false} />
            ))}
            {coupons.length === 0 && (
              <div className="col-span-full py-10 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-2 shadow-2xs">
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  No active coupon vouchers currently listed in {categoryInfo.title}.
                </p>
                <p className="text-[11px] text-slate-400">
                  Check out the affiliate product deals below or browse other categories.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Active Affiliate Products */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-blue" />
              <span>Affiliate Product Deals</span>
            </h2>
            <span className="text-xs text-slate-600 font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
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
              <div className="col-span-full py-10 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-2 shadow-2xs">
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  No active affiliate deals in {categoryInfo.title} right now.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Global Empty State */}
        {totalOffersCount === 0 && (
          <div className="py-14 text-center bg-white border border-slate-200 rounded-2xl p-8 space-y-4 max-w-md mx-auto shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              No active offers or products currently listed in {categoryInfo.title}.
            </p>
            <Button
              asChild
              className="bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs py-2 px-6 rounded-xl cursor-pointer shadow-xs"
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
