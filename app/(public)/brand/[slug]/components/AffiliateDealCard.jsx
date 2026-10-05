"use client";

import { ArrowRight, ExternalLink, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

export default function AffiliateDealCard({ product, merchant }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!product) return null;

  const {
    _id,
    title,
    originalPrice,
    discountPrice,
    discountPercentage,
    discountText,
    affiliateUrl,
    imageUrl,
    category,
    description,
  } = product;

  const displayTitle =
    typeof title === "string" ? title : String(title?.title || "Deal Product");

  const numOrig =
    typeof originalPrice === "number"
      ? originalPrice
      : Number(originalPrice) || 0;
  const numDisc =
    typeof discountPrice === "number"
      ? discountPrice
      : Number(discountPrice) || 0;

  const hasExactPricing = numOrig > 0 && numDisc > 0;
  const savings = hasExactPricing ? Math.max(0, numOrig - numDisc) : 0;
  const calculatedPercent = hasExactPricing
    ? Math.round((savings / numOrig) * 100)
    : discountPercentage || 0;

  // Clean discount pill text (no green badges on image, clean text badge in pricing row)
  let discountBadge = discountText || null;
  if (!discountBadge && calculatedPercent > 0) {
    discountBadge = `${calculatedPercent}% OFF`;
  }

  const categoryName =
    category ||
    merchant?.category ||
    (merchant?.businessName ? `${merchant.businessName} Deals` : "Featured");

  const targetUrl = affiliateUrl || merchant?.website || "#";

  const handleClaimClick = (e) => {
    e.stopPropagation();
    try {
      const payload = JSON.stringify({ action: "click", productId: _id });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/affiliate-products", blob);
      } else {
        fetch("/api/affiliate-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <article
      onClick={handleClaimClick}
      className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3 sm:gap-4 font-sans select-none cursor-pointer group"
    >
      {/* ── 1. Clean Product Image (No Badge Overlays) ── */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100/80 flex items-center justify-center">
        {imageUrl && !imageFailed ? (
          <SafeImage
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 144px"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ShoppingBag className="w-8 h-8 text-slate-300" />
        )}
      </div>

      {/* ── 2. Content Column ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        {/* Top: Category Pill + Wishlist Button (Clean, NO Brand Deal badge) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100/80 capitalize truncate max-w-[140px]">
            {categoryName}
          </span>

          {/* Minimalist Heart Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isWishlisted
                ? "bg-rose-50 border-rose-200 text-rose-500"
                : "bg-white border-slate-200/80 text-slate-400 hover:text-rose-500 hover:border-rose-200"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Middle: Title & Tagline */}
        <div className="py-1 min-w-0">
          <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
            {displayTitle}
          </h4>
          {description && (
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Bottom: Pricing & Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap sm:flex-nowrap">
          {/* Price & Discount */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-extrabold text-emerald-600 tracking-tight">
              ₹{numDisc > 0 ? numDisc : numOrig}
            </span>
            {numOrig > 0 && numOrig > numDisc && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                ₹{numOrig}
              </span>
            )}
            {discountBadge && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-100/80 whitespace-nowrap">
                {discountBadge}
              </span>
            )}
          </div>

          {/* Action Column */}
          <div className="flex flex-col items-end shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleClaimClick}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Claim Deal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-0.5 mt-1 transition-colors">
              <span>View Details</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
