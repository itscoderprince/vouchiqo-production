"use client";

import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Gift,
  Heart,
  LayoutGrid,
  Percent,
  Search,
  ShieldCheck,
  Store,
  Tag,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/shared/modals/ConfirmationModal";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";

const CATEGORIES = [
  { id: "all", label: "All Offers", icon: LayoutGrid },
  { id: "fashion", label: "Fashion & Clothing", icon: Tag },
  { id: "food", label: "Food & Dining", icon: Gift },
  { id: "electronics", label: "Electronics & Tech", icon: Zap },
  { id: "beauty", label: "Beauty & Wellness", icon: Heart },
  { id: "travel", label: "Travel & Hotels", icon: TrendingUp },
  { id: "home", label: "Home & Living", icon: Store },
  { id: "fitness", label: "Fitness & Health", icon: ShieldCheck },
];

export default function CampaignsClient({
  initialTrendingCoupons = [],
  initialFeaturedCoupons = [],
  allCoupons = [],
  affiliateProducts = [],
  trendingMerchants = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'coupons' | 'products'
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Combine and deduplicate active coupons
  const combinedCoupons = useMemo(() => {
    const list = [];
    const seen = new Set();

    for (const c of [...initialTrendingCoupons, ...initialFeaturedCoupons, ...allCoupons]) {
      if (c._id && !seen.has(c._id)) {
        seen.add(c._id);
        list.push(c);
      }
    }
    return list;
  }, [initialTrendingCoupons, initialFeaturedCoupons, allCoupons]);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    if (selectedType === "products") return [];
    let result = [...combinedCoupons];

    // Filter category
    if (selectedCategory !== "all") {
      result = result.filter((c) => {
        const cat = (c.category || "").toLowerCase();
        const title = (c.title || "").toLowerCase();
        const catId = selectedCategory.toLowerCase();
        return cat.includes(catId) || title.includes(catId);
      });
    }

    // Filter search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const title = (c.title || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const code = (c.code || "").toLowerCase();
        const store = (
          c.merchantId?.businessName ||
          c.merchantId?.name ||
          ""
        ).toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          code.includes(q) ||
          store.includes(q)
        );
      });
    }

    return result;
  }, [combinedCoupons, selectedType, selectedCategory, searchQuery]);

  // Split coupons into 2 rows for marquee
  const { row1Coupons, row2Coupons } = useMemo(() => {
    if (filteredCoupons.length === 0) {
      return { row1Coupons: [], row2Coupons: [] };
    }

    const r1 = [];
    const r2 = [];
    filteredCoupons.forEach((coupon, index) => {
      if (index % 2 === 0) {
        r1.push(coupon);
      } else {
        r2.push(coupon);
      }
    });

    const buildLooped = (arr) => {
      if (arr.length === 0) return [];
      let looped = [...arr];
      while (looped.length < 10) {
        looped = [...looped, ...arr];
      }
      return [...looped, ...looped];
    };

    return {
      row1Coupons: buildLooped(r1.length > 0 ? r1 : filteredCoupons),
      row2Coupons: buildLooped(r2.length > 0 ? r2 : filteredCoupons),
    };
  }, [filteredCoupons]);

  // Filter affiliate products
  const filteredAffiliate = useMemo(() => {
    if (selectedType === "coupons") return [];
    let result = [...affiliateProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const store = (p.merchantName || "").toLowerCase();
        return title.includes(q) || store.includes(q);
      });
    }

    return result;
  }, [affiliateProducts, selectedType, searchQuery]);

  const handleCopyCode = (e, code, couponId) => {
    e.preventDefault();
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedId(couponId);
      toast.success(`Offer code "${code}" copied!`);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const totalCount = filteredCoupons.length + filteredAffiliate.length;

  const renderSquareCouponCard = (coupon, idx) => {
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
        key={`${coupon._id}-${idx}`}
        onClick={() => {
          if (!hasCode) setSelectedCoupon(coupon);
        }}
        className="w-[230px] sm:w-[250px] h-[135px] sm:h-[142px] shrink-0 bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs hover:shadow-[0_6px_16px_rgba(247,40,83,0.12)] hover:border-[#F72853] transition-all duration-200 flex flex-col justify-between select-none group text-left cursor-pointer active:scale-[0.99]"
      >
        {/* Top: Logo + Store + Discount Pill */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200/70 p-0.5 flex items-center justify-center shrink-0">
              <img
                src={merchantLogo}
                alt={merchantName}
                className="w-full h-full object-contain rounded-xs"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=f72853&color=ffffff&size=64&bold=true`;
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-800 truncate group-hover:text-[#F72853] transition-colors">
                {merchantName}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-normal text-emerald-600">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
          </div>

          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-rose-50 text-[#F72853] border border-rose-200/70 shrink-0 shadow-2xs">
            {discountBadge}
          </span>
        </div>

        {/* Center: Title */}
        <div className="my-0.5">
          <h3 className="text-[11.5px] sm:text-[12px] font-normal text-slate-800 leading-snug line-clamp-2">
            {coupon.title}
          </h3>
        </div>

        {/* Bottom Action */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="text-[9.5px] text-slate-400 font-normal flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 text-orange-500" />
            <span>{coupon.totalClaims ? `${coupon.totalClaims} Claimed` : "Active"}</span>
          </div>

          {hasCode ? (
            <button
              type="button"
              onClick={(e) => handleCopyCode(e, coupon.code, coupon._id)}
              className={`px-2.5 py-0.5 text-[10.5px] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer border ${
                isCopied
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-rose-50 text-[#F72853] border-rose-200 hover:bg-[#F72853] hover:text-white active:scale-95"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <span className="font-mono font-medium tracking-tight">{coupon.code}</span>
                  <Copy className="w-2.5 h-2.5 opacity-70" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCoupon(coupon);
              }}
              className="px-2.5 py-0.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#F72853] border border-slate-200 hover:border-rose-200 active:scale-95 text-[10.5px] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Get Deal</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-12 select-none">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-3 sm:px-4 md:px-5 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mb-0.5">
          <Link href="/" className="hover:text-[#F72853] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Trending Offers</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-[15px] font-medium text-[#F72853] tracking-normal">
              Trending Deals &amp; Popular Offers
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-[#F72853] border border-rose-200/60 shadow-2xs">
              {totalCount} Live
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-44 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trending offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F72853] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-normal text-slate-600">
              <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                100% Verified
              </span>
              <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#F72853]" />
                Updated Daily
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 ${
                  active
                    ? "bg-[#F72853] text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-rose-50/50 hover:text-[#F72853] border border-slate-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. 2-ROW INFINITE CONTINUOUS SCROLLING COUPON CARDS ── */}
      {filteredCoupons.length > 0 && (
        <div className="w-full px-3 sm:px-4 md:px-5 py-3.5 space-y-2.5">
          <div>
            <h2 className="text-xs sm:text-[13px] font-medium uppercase tracking-wider text-slate-700">
              Featured Offers &amp; Promo Codes ({filteredCoupons.length})
            </h2>
          </div>

          {/* Row 1 (Glides Left) */}
          <div className="w-full overflow-hidden py-0.5 rounded-xl">
            <div className="animate-marquee-left gap-2.5">
              {row1Coupons.map((coupon, idx) =>
                renderSquareCouponCard(coupon, `r1-${idx}`),
              )}
            </div>
          </div>

          {/* Row 2 (Glides Right) */}
          <div className="w-full overflow-hidden py-0.5 rounded-xl">
            <div className="animate-marquee-right gap-2.5">
              {row2Coupons.map((coupon, idx) =>
                renderSquareCouponCard(coupon, `r2-${idx}`),
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. TRENDING AFFILIATE PRODUCTS ── */}
      {filteredAffiliate.length > 0 && (
        <div className="w-full px-3 sm:px-4 md:px-5 py-3.5 space-y-3">
          <h2 className="text-xs sm:text-[13px] font-medium uppercase tracking-wider text-slate-700">
            Trending Product Deals &amp; Price Drops ({filteredAffiliate.length})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredAffiliate.map((product, idx) => (
              <ProductOfferCard key={product._id || idx} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCoupons.length === 0 && filteredAffiliate.length === 0 && (
        <div className="w-full px-4 md:px-8 py-10">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 max-w-lg mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#F72853] border border-rose-200/60 flex items-center justify-center mx-auto shadow-2xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-slate-900">
              No matching offers found
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              No deals match your search criteria &quot;{searchQuery}&quot;. Try resetting your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedType("all");
              }}
              className="px-4 py-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium rounded-lg transition-all shadow-2xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Claim Voucher Modal Overlay */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 600));
            return (
              selectedCoupon.code ||
              `VOUCH-${Math.floor(1000 + Math.random() * 9000)}`
            );
          }}
        />
      )}
    </div>
  );
}
