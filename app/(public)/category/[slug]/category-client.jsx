"use client";

import {
  ArrowUp,
  ArrowUpDown,
  Baby,
  Car,
  Check,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  Dumbbell,
  ExternalLink,
  Flame,
  Gamepad2,
  Gem,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  Layers,
  Plane,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  Sparkles,
  Tag,
  Utensils,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";

// Map slugs to category icons
const CATEGORY_ICONS = {
  electronics: Laptop,
  fashion: Shirt,
  food: Utensils,
  beauty: Heart,
  travel: Plane,
  home: Home,
  "home-improvement": Wrench,
  fitness: Dumbbell,
  education: GraduationCap,
  "kids-baby": Baby,
  jewellery: Gem,
  automotive: Car,
  entertainment: Gamepad2,
  grocery: ShoppingCart,
  finance: CreditCard,
};

// Category FAQs for SEO & trust
const CATEGORY_FAQS = {
  electronics: [
    {
      q: "How do I redeem electronics deals and promo codes?",
      a: "For product price drops and direct deals, click 'Grab Offer' to be redirected to the verified partner store with the discount auto-applied. For promo codes, click 'Copy Code' and paste it at store checkout.",
    },
    {
      q: "Are the laptop, audio, and gadget discounts 100% verified?",
      a: "Yes. Our team regularly tests and validates pricing and discount coupons directly with certified partner stores and brand websites before featuring them.",
    },
    {
      q: "Can I get extra cashback or bank card discounts on these offers?",
      a: "In most cases, store promo codes and deal prices can be combined with bank card EMI or payment gateway cashback offers during final checkout on the partner site.",
    },
    {
      q: "How frequently are new electronics offers added?",
      a: "We refresh deals and price drops multiple times daily as top brands launch flash sales and new coupon campaigns.",
    },
  ],
  default: [
    {
      q: "How do I use coupons and promo codes on Vouchiqo?",
      a: "Click 'Copy Code' on any coupon card to copy the code to your clipboard, then visit the partner store and paste the code into the voucher/promo field at checkout.",
    },
    {
      q: "Are all discount deals and coupons free to use?",
      a: "Yes! All promo codes, cashback links, and discount deals listed on Vouchiqo are 100% free with no registration fee required.",
    },
    {
      q: "What should I do if a promo code does not work?",
      a: "Some codes have minimum order requirements or are limited to first-time users. Check the terms or try another active offer from the brand list above.",
    },
  ],
};

export default function CategoryClient({
  categoryInfo,
  coupons = [],
  affiliateProducts = [],
}) {
  const [selectedSub, setSelectedSub] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [offerType, setOfferType] = useState("all"); // 'all' | 'deals' | 'coupons'
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured"); // 'featured' | 'discount-desc' | 'price-asc' | 'price-desc' | 'latest'
  const [copiedId, setCopiedId] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rawSlug = categoryInfo?.slug || "electronics";
  const CategoryIcon = CATEGORY_ICONS[rawSlug] || Sparkles;

  // Extract unique brands dynamically with counts
  const availableBrands = useMemo(() => {
    const map = new Map();

    const addBrand = (name, logo) => {
      if (!name || typeof name !== "string") return;
      const clean = name.trim();
      if (!clean || clean.toLowerCase() === "partner store") return;
      const key = clean.toLowerCase();
      if (map.has(key)) {
        map.get(key).count += 1;
      } else {
        map.set(key, {
          name: clean,
          logo:
            logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=08214d&color=ffffff&size=64&bold=true`,
          count: 1,
        });
      }
    };

    for (const c of coupons) {
      const name = c.merchantId?.businessName || c.merchantId?.name;
      const logo = c.merchantId?.logo;
      addBrand(name, logo);
    }

    for (const p of affiliateProducts) {
      const name =
        p.merchantName ||
        (typeof p.merchantId === "object" ? p.merchantId?.businessName : null);
      const logo =
        p.merchantLogo ||
        (typeof p.merchantId === "object" ? p.merchantId?.logo : null);
      addBrand(name, logo);
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [coupons, affiliateProducts]);

  // Subcategories with counts
  const subCategoriesWithCounts = useMemo(() => {
    const subs = categoryInfo?.subs || [];
    return subs.map((sub) => {
      const q = sub.toLowerCase();
      const count =
        coupons.filter(
          (c) =>
            c.title?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            (typeof c.category === "string" &&
              c.category.toLowerCase().includes(q)),
        ).length +
        affiliateProducts.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q),
        ).length;
      return { name: sub, count };
    });
  }, [categoryInfo, coupons, affiliateProducts]);

  // Calculate highest discount percentage in category
  const maxDiscount = useMemo(() => {
    let max = 0;
    for (const c of coupons) {
      if (
        c.discountValue &&
        c.discountType === "percentage" &&
        c.discountValue <= 100
      ) {
        max = Math.max(max, c.discountValue);
      }
    }
    for (const p of affiliateProducts) {
      if (p.discountPercentage && p.discountPercentage <= 100) {
        max = Math.max(max, p.discountPercentage);
      }
    }
    return max > 0 ? max : 75;
  }, [coupons, affiliateProducts]);

  // Filter & sort coupons
  const filteredCoupons = useMemo(() => {
    if (offerType === "deals") return [];
    let list = [...coupons];

    // Subcategory filter
    if (selectedSub !== "all") {
      const q = selectedSub.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          (typeof c.category === "string" &&
            c.category.toLowerCase().includes(q)),
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      const b = selectedBrand.toLowerCase();
      list = list.filter((c) => {
        const name = (
          c.merchantId?.businessName ||
          c.merchantId?.name ||
          ""
        ).toLowerCase();
        return name === b || name.includes(b);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q) ||
          (typeof c.merchantId === "object" &&
            c.merchantId?.businessName?.toLowerCase().includes(q)),
      );
    }

    // Sort
    if (sortBy === "discount-desc") {
      list.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
    } else if (sortBy === "latest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else {
      list.sort((a, b) => (b.totalClaims || 0) - (a.totalClaims || 0));
    }

    return list;
  }, [coupons, selectedSub, selectedBrand, offerType, searchQuery, sortBy]);

  // Filter & sort affiliate products
  const filteredAffiliate = useMemo(() => {
    if (offerType === "coupons") return [];
    let list = [...affiliateProducts];

    // Subcategory filter
    if (selectedSub !== "all") {
      const q = selectedSub.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      const b = selectedBrand.toLowerCase();
      list = list.filter((p) => {
        const name = (
          p.merchantName ||
          (typeof p.merchantId === "object"
            ? p.merchantId?.businessName
            : "") ||
          ""
        ).toLowerCase();
        return name === b || name.includes(b);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.merchantName?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortBy === "discount-desc") {
      list.sort((a, b) => {
        const pA = a.discountPercentage <= 100 ? a.discountPercentage : 0;
        const pB = b.discountPercentage <= 100 ? b.discountPercentage : 0;
        return pB - pA;
      });
    } else if (sortBy === "price-asc") {
      list.sort(
        (a, b) => (a.discountPrice || 999999) - (b.discountPrice || 999999),
      );
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.discountPrice || 0) - (a.discountPrice || 0));
    } else if (sortBy === "latest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else {
      // featured: by clickCount / newest
      list.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    }

    return list;
  }, [
    affiliateProducts,
    selectedSub,
    selectedBrand,
    offerType,
    searchQuery,
    sortBy,
  ]);

  const totalFilteredCount = filteredCoupons.length + filteredAffiliate.length;
  const isAnyFilterActive =
    selectedSub !== "all" ||
    selectedBrand !== "all" ||
    offerType !== "all" ||
    searchQuery.trim() !== "" ||
    sortBy !== "featured";

  const handleResetFilters = () => {
    setSelectedSub("all");
    setSelectedBrand("all");
    setOfferType("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  const handleCopyCode = (e, code, couponId) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedId(couponId);
      toast.success(`Offer code "${code}" copied!`);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const currentFaqs = CATEGORY_FAQS[rawSlug] || CATEGORY_FAQS.default;

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-16 select-none relative">
      {/* ── 1. PREMIUM CATEGORY HERO HEADER ── */}
      <div className="relative bg-gradient-to-b from-white via-rose-50/25 to-slate-50 border-b border-slate-200/80 px-3 sm:px-6 md:px-8 pt-4 pb-6 overflow-hidden">
        {/* Ambient background glow accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-1">
          {/* Breadcrumb Trail */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-3"
          >
            <Link
              href="/"
              className="hover:text-[#F72853] transition-colors flex items-center gap-1"
            >
              <Home className="w-3 h-3 text-slate-400" />
              <span>Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/categories"
              className="hover:text-[#F72853] transition-colors"
            >
              Categories
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">
              {categoryInfo?.title}
            </span>
          </nav>

          {/* Hero Main Block */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#F72853] to-[#FF4D6D] text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                  <CategoryIcon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{categoryInfo?.title} Deals &amp; Offers</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#F72853] border border-rose-200/80 shadow-2xs">
                      {coupons.length + affiliateProducts.length} Active
                    </span>
                  </h1>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
                    Verified coupons, direct price drops, and exclusive
                    cashbacks in {categoryInfo?.title} updated daily.
                  </p>
                </div>
              </div>
            </div>

            {/* Value & Trust Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:items-center gap-2">
              <div className="bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-left">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  Max Savings
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#F72853] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-[#F72853] text-[#F72853]" />
                  Up to {maxDiscount}% OFF
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-left">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  Verification
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Tested
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-left">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  Certified Stores
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  {availableBrands.length}+ Brands
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-left">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">
                  Updates
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-indigo-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Realtime Daily
                </span>
              </div>
            </div>
          </div>

          {/* Subcategories Horizontal Filter Bar with Counts */}
          {subCategoriesWithCounts.length > 0 && (
            <div className="mt-5 pt-3.5 border-t border-slate-200/70">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
                <button
                  type="button"
                  onClick={() => setSelectedSub("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 shrink-0 ${
                    selectedSub === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90"
                  }`}
                >
                  <span>All {categoryInfo?.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedSub === "all"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {coupons.length + affiliateProducts.length}
                  </span>
                </button>

                {subCategoriesWithCounts.map((sub, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setSelectedSub(
                        sub.name === selectedSub ? "all" : sub.name,
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 shrink-0 ${
                      selectedSub === sub.name
                        ? "bg-[#F72853] text-white shadow-xs shadow-rose-500/20"
                        : "bg-white text-slate-600 hover:bg-rose-50/50 hover:text-[#F72853] border border-slate-200/90"
                    }`}
                  >
                    <span>{sub.name}</span>
                    {sub.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          selectedSub === sub.name
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {sub.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. SMART SEARCH, BRAND SELECTOR & TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-4 space-y-3">
        {/* Brand Selector Pill Bar (Fast brand discovery) */}
        {availableBrands.length > 1 && (
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#F72853]" />
                <span>Shop by Brand</span>
              </span>
              {selectedBrand !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedBrand("all")}
                  className="text-[11px] text-[#F72853] hover:underline font-medium cursor-pointer"
                >
                  Clear Brand Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedBrand("all")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedBrand === "all"
                    ? "bg-rose-50 text-[#F72853] border border-rose-300 font-bold"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All Brands ({coupons.length + affiliateProducts.length})
              </button>
              {availableBrands.map((brand, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setSelectedBrand(
                      selectedBrand === brand.name ? "all" : brand.name,
                    )
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    selectedBrand === brand.name
                      ? "bg-[#F72853] text-white shadow-2xs border border-[#F72853]"
                      : "bg-slate-50 hover:bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={brand.logo}
                    alt=""
                    className="w-4 h-4 rounded-full object-contain bg-white shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span>{brand.name}</span>
                  <span
                    className={`text-[10px] px-1 rounded-full font-bold ${
                      selectedBrand === brand.name
                        ? "bg-white/20 text-white"
                        : "text-slate-400 bg-white"
                    }`}
                  >
                    {brand.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search, Offer Type Tabs & Sort Row */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${categoryInfo?.title || "deals"}...`}
              className="w-full h-9 pl-9 pr-8 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#F72853] focus:ring-2 focus:ring-rose-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Segmented Offer Type + Sort Dropdown */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            {/* Offer Type Switcher */}
            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setOfferType("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  offerType === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({coupons.length + affiliateProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setOfferType("deals")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  offerType === "deals"
                    ? "bg-white text-[#F72853] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Product Deals ({affiliateProducts.length})
              </button>
              {coupons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOfferType("coupons")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    offerType === "coupons"
                      ? "bg-white text-[#F72853] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Promo Codes ({coupons.length})
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer focus:border-[#F72853]"
              >
                <option value="featured">Featured Deals</option>
                <option value="discount-desc">Highest Discount</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="latest">Newest Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info & Active Filters Badge Bar */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
          <p>
            Showing{" "}
            <strong className="text-slate-900">{totalFilteredCount}</strong>{" "}
            verified deals
            {selectedSub !== "all" && (
              <span>
                {" "}
                in <strong className="text-[#F72853]">{selectedSub}</strong>
              </span>
            )}
            {selectedBrand !== "all" && (
              <span>
                {" "}
                from <strong className="text-[#F72853]">{selectedBrand}</strong>
              </span>
            )}
          </p>

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F72853] hover:text-[#c7153b] cursor-pointer bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. STORE PROMO CODES (IF ANY) ── */}
      {filteredCoupons.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Exclusive Promo Codes ({filteredCoupons.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredCoupons.map((coupon) => {
              const merchantName =
                coupon.merchantId?.businessName ||
                coupon.merchantId?.name ||
                "Partner Store";
              const merchantLogo =
                coupon.merchantId?.logo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=f72853&color=ffffff&size=64&bold=true`;
              const hasCode = coupon.code && coupon.code.trim() !== "";
              const isCopied = copiedId === coupon._id;

              const discountValue = coupon.discountValue || 20;
              const discountType = coupon.discountType || "percentage";
              const discountBadge =
                discountType === "percentage"
                  ? `${discountValue}% OFF`
                  : discountType === "fixed"
                    ? `₹${discountValue} OFF`
                    : "SPECIAL DEAL";

              return (
                <div
                  key={coupon._id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-2xs hover:shadow-[0_8px_20px_rgba(247,40,83,0.12)] hover:border-rose-300 transition-all duration-300 flex flex-col justify-between select-none group text-left cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0">
                        <img
                          src={merchantLogo}
                          alt={merchantName}
                          className="w-full h-full object-contain rounded-sm"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=f72853&color=ffffff&size=64&bold=true`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#F72853] transition-colors">
                          {merchantName}
                        </p>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-rose-50 text-[#F72853] border border-rose-200/70 shrink-0">
                      {discountBadge}
                    </span>
                  </div>

                  <div className="my-2.5 space-y-0.5">
                    <h3 className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2">
                      {coupon.title}
                    </h3>
                    {coupon.description && (
                      <p className="text-[10.5px] text-slate-500 line-clamp-1 font-normal">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span>
                        {coupon.totalClaims
                          ? `${coupon.totalClaims} Claimed`
                          : "Active"}
                      </span>
                    </div>

                    {hasCode ? (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleCopyCode(e, coupon.code, coupon._id)
                        }
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isCopied
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-rose-50 text-[#F72853] border-rose-200 hover:bg-[#F72853] hover:text-white active:scale-95"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono">{coupon.code}</span>
                            <Copy className="w-3 h-3 opacity-70" />
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href={coupon.affiliateUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#F72853] border border-slate-200 hover:border-rose-200 active:scale-95 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Get Deal</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. TRENDING PRODUCT DEALS & PRICE DROPS ── */}
      {filteredAffiliate.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Trending Product Deals &amp; Price Drops (
                {filteredAffiliate.length})
              </span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Direct Partner Links
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4.5">
            {filteredAffiliate.map((product, idx) => (
              <ProductOfferCard key={product._id || idx} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* ── 5. EMPTY STATE WHEN NO RESULTS MATCH ── */}
      {totalFilteredCount === 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-16">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#F72853] flex items-center justify-center mx-auto shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              No matching offers found
            </h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              We couldn't find any deals matching your selected filters. Try
              clearing your search or switching subcategories.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Reset Filters
              </button>
              <Link
                href="/categories"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Explore Other Categories
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. TRUST & SAVINGS GUIDE / FAQS SECTION ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-12">
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
          <div className="mb-5 text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F72853] bg-rose-50 px-2.5 py-0.5 rounded-full mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Smart Shopping Guide</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              How to Save More in {categoryInfo?.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Helpful answers and verified tips to maximize your discount
              savings on Vouchiqo.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {currentFaqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-3 text-left">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                  >
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#F72853] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 group-hover:text-[#F72853] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2 text-xs text-slate-600 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 7. FLOATING BACK TO TOP BUTTON ── */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-[#F72853] shadow-lg shadow-slate-900/20 backdrop-blur-xs transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
