"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Layers,
  Search,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";

export default function CategoryClient({
  categoryInfo,
  coupons = [],
  affiliateProducts = [],
}) {
  const [selectedSub, setSelectedSub] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const subCategories = categoryInfo?.subs || [];

  // Filter coupons based on search and subcategory
  const filteredCoupons = useMemo(() => {
    let list = [...coupons];
    if (selectedSub !== "all") {
      const q = selectedSub.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          (typeof c.category === "string" && c.category.toLowerCase().includes(q)),
      );
    }
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
    return list;
  }, [coupons, selectedSub, searchQuery]);

  // Filter affiliate products based on search and subcategory
  const filteredAffiliate = useMemo(() => {
    let list = [...affiliateProducts];
    if (selectedSub !== "all") {
      const q = selectedSub.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.merchantName?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [affiliateProducts, selectedSub, searchQuery]);

  const totalFilteredCount = filteredCoupons.length + filteredAffiliate.length;

  const handleCopyCode = (e, code, couponId) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedId(couponId);
      toast.success(`Offer code "${code}" copied!`);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-14 select-none">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-2.5 sm:px-4 md:px-5 py-2">
        <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-slate-500 font-normal mb-0.5">
          <Link href="/" className="hover:text-[#F72853] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-[#F72853] transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{categoryInfo?.title}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-[13.5px] sm:text-[15px] font-medium text-[#F72853] tracking-normal">
              {categoryInfo?.title} Deals &amp; Offers
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-medium bg-rose-50 text-[#F72853] border border-rose-200/60 shadow-2xs">
              {totalFilteredCount} Live
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-normal text-slate-600">
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

        {/* Subcategories Filter Bar */}
        {subCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none no-scrollbar -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setSelectedSub("all")}
              className={`px-2.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                selectedSub === "all"
                  ? "bg-[#F72853] text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-rose-50/50 hover:text-[#F72853] border border-slate-200"
              }`}
            >
              All {categoryInfo?.title}
            </button>
            {subCategories.map((sub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSub(sub === selectedSub ? "all" : sub)}
                className={`px-2.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                  selectedSub === sub
                    ? "bg-[#F72853] text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-rose-50/50 hover:text-[#F72853] border border-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. ACTIVE STORE OFFERS & PROMO CODES ── */}
      {filteredCoupons.length > 0 && (
        <div className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-4 space-y-2.5 sm:space-y-3">
          <h2 className="text-xs sm:text-[13px] font-medium uppercase tracking-wider text-slate-600">
            Featured Store Offers &amp; Promo Codes ({filteredCoupons.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-3.5">
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
                  className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs hover:shadow-[0_6px_16px_rgba(247,40,83,0.12)] hover:border-[#F72853] transition-all duration-200 flex flex-col justify-between select-none group text-left cursor-pointer active:scale-[0.99]"
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

                  {/* Title & Description */}
                  <div className="my-1.5 sm:my-2 space-y-0.5">
                    <h3 className="text-[11.5px] sm:text-[12px] font-normal text-slate-800 leading-snug line-clamp-2">
                      {coupon.title}
                    </h3>
                    {coupon.description && (
                      <p className="text-[9.5px] sm:text-[10px] text-slate-500 line-clamp-1 font-normal">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="text-[9px] sm:text-[9.5px] text-slate-400 font-normal flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-orange-500" />
                      <span>{coupon.totalClaims ? `${coupon.totalClaims} Claimed` : "Active"}</span>
                    </div>

                    {hasCode ? (
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(e, coupon.code, coupon._id)}
                        className={`px-2.5 py-1 text-[10px] sm:text-[10.5px] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer border ${
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
                      <a
                        href={coupon.affiliateUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#F72853] border border-slate-200 hover:border-rose-200 active:scale-95 text-[10px] sm:text-[10.5px] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Get Deal</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. TRENDING AFFILIATE PRODUCTS ── */}
      {filteredAffiliate.length > 0 && (
        <div className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-4 space-y-2.5 sm:space-y-3">
          <h2 className="text-xs sm:text-[13px] font-medium uppercase tracking-wider text-slate-600">
            Trending Product Deals &amp; Price Drops ({filteredAffiliate.length})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-3.5">
            {filteredAffiliate.map((product, idx) => (
              <ProductOfferCard key={product._id || idx} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* ── 4. EMPTY STATE ── */}
      {totalFilteredCount === 0 && (
        <div className="w-full px-2.5 sm:px-4 md:px-5 py-12">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 max-w-md mx-auto shadow-2xs">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-medium text-slate-800">
              No active offers in {categoryInfo?.title}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Check back soon for new discounts or explore offers across other categories.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium rounded-lg transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Browse All Categories</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
