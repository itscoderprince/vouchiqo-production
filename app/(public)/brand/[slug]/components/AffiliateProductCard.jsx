"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

export default function AffiliateProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);

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
    typeof title === "string" ? title : String(title?.title || "Baby Product");
  const numOrig =
    typeof originalPrice === "number"
      ? originalPrice
      : Number(originalPrice) || 0;
  const numDisc =
    typeof discountPrice === "number"
      ? discountPrice
      : Number(discountPrice) || 0;

  const hasExactPricing = numOrig > 0 && numDisc > 0;
  const hasFixedPrice = numDisc > 0 && numOrig === 0;
  const savings = hasExactPricing ? Math.max(0, numOrig - numDisc) : 0;
  const percentOff = hasExactPricing
    ? Math.round((savings / numOrig) * 100)
    : discountPercentage || 0;

  let topBadge = discountText || null;
  if (!topBadge) {
    if (hasExactPricing || percentOff > 0) {
      topBadge = `${percentOff}% OFF`;
    } else if (hasFixedPrice) {
      topBadge = `₹${numDisc}`;
    }
  }

  const handleClick = (e) => {
    // If heart button was clicked, don't navigate
    if (e.target.closest(".wishlist-btn")) return;

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

    window.open(affiliateUrl || "#", "_blank", "noopener,noreferrer");
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      onClick={handleClick}
      className="w-[155px] sm:w-[170px] md:w-[185px] shrink-0 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer select-none text-left font-sans"
    >
      {/* Product Image Container with Floating Wishlist Heart */}
      <div className="relative w-full aspect-square bg-[#FAF9F6] overflow-hidden flex items-center justify-center p-2">
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 640px) 155px, (max-width: 768px) 170px, 185px"
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop"
          />
        ) : (
          <ShoppingBag className="w-8 h-8 text-slate-300" />
        )}

        {/* Floating Heart Wishlist Button on Top Right */}
        <button
          type="button"
          onClick={toggleWishlist}
          title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className="wishlist-btn absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 hover:bg-white shadow-xs border border-slate-200/80 flex items-center justify-center cursor-pointer active:scale-90 transition-all z-10"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite
                ? "fill-rose-500 text-rose-500"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
        </button>
      </div>

      {/* Product Details Below Image */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 space-y-1">
        <h4 className="text-xs sm:text-[13px] font-medium text-slate-800 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors">
          {displayTitle}
        </h4>

        {/* Price Row with Clean Discount Pill */}
        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          {numDisc > 0 ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                ₹{numDisc.toLocaleString()}
              </span>
              {numOrig > numDisc && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  ₹{numOrig.toLocaleString()}
                </span>
              )}
              {topBadge && (
                <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-1.5 py-0.2 rounded-full">
                  {topBadge}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-emerald-600">
              Special Offer
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
