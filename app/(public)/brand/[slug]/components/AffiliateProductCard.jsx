"use client";

import { ExternalLink, ShoppingBag, Tag } from "lucide-react";

export default function AffiliateProductCard({ product }) {
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

  const displayTitle = typeof title === "string" ? title : String(title?.title || "Special Deal");
  const displayDesc = typeof description === "string" ? description : String(description?.text || "");
  const numOrig = typeof originalPrice === "number" ? originalPrice : (Number(originalPrice) || 0);
  const numDisc = typeof discountPrice === "number" ? discountPrice : (Number(discountPrice) || 0);

  const hasExactPricing = numOrig > 0 && numDisc > 0;
  const hasFixedPrice = numDisc > 0 && numOrig === 0;
  const savings = hasExactPricing ? Math.max(0, numOrig - numDisc) : 0;
  const percentOff = hasExactPricing
    ? Math.round((savings / numOrig) * 100)
    : (discountPercentage || 0);

  let topBadge = discountText || null;
  if (!topBadge) {
    if (hasExactPricing) {
      topBadge = `${percentOff}% OFF`;
    } else if (hasFixedPrice) {
      topBadge = `JUST @ ₹${numDisc}`;
    } else if (percentOff > 0) {
      topBadge = `${percentOff}% OFF`;
    }
  }

  const categoryName = typeof category === "object" ? String(category?.title || category?.name || "Special") : String(category || "Special");

  const handleClick = () => {
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

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-row items-center gap-2.5 sm:gap-3.5 justify-between shadow-2xs hover:shadow-md hover:border-blue-500/80 transition-all duration-200 text-left font-sans group">
      {/* Product Image & Badge */}
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-slate-50 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={typeof title === "string" ? title : "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg sm:rounded-xl"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop";
            }}
          />
        ) : (
          <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
        )}
        {topBadge && (
          <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.5 rounded shadow-2xs max-w-[80px] sm:max-w-[100px] truncate flex items-center gap-0.5">
            <Tag className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
            <span>{topBadge}</span>
          </div>
        )}
      </div>

      {/* Middle Details */}
      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
        <div className="inline-flex items-center bg-blue-50 border border-blue-100/80 text-blue-700 text-[8.5px] sm:text-[9.5px] font-medium uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md">
          <span>Brand Deal · {String(categoryName)}</span>
        </div>

        <h3 className="text-xs sm:text-[13.5px] font-medium text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 tracking-normal">
          {displayTitle}
        </h3>

        {displayDesc ? (
          <p className="text-[10px] sm:text-xs text-slate-500 font-normal line-clamp-1 leading-normal hidden sm:block">
            {displayDesc}
          </p>
        ) : null}

        {/* Price & Offer Tag Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
          {hasExactPricing ? (
            <>
              <span className="text-sm sm:text-[17px] font-semibold text-slate-800">
                ₹{numDisc.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-normal text-slate-400 line-through">
                ₹{numOrig.toLocaleString()}
              </span>
              {savings > 0 && (
                <span className="text-[9px] sm:text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1 sm:px-1.5 py-0.5 rounded-md border border-emerald-200/80">
                  Save ₹{savings.toLocaleString()}
                </span>
              )}
            </>
          ) : hasFixedPrice ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Offer Price:</span>
              <span className="text-sm sm:text-[17px] font-semibold text-emerald-600">
                ₹{numDisc.toLocaleString()}
              </span>
              {discountText && (
                <span className="text-[9px] sm:text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200/80 truncate max-w-[120px] sm:max-w-[180px]">
                  {discountText}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] sm:text-sm font-medium text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-200/80">
              {topBadge || "SPECIAL BRAND OFFER"}
            </span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="shrink-0">
        <button
          onClick={handleClick}
          type="button"
          className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-medium rounded-lg sm:rounded-xl shadow-2xs transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <span>Claim</span>
          <span className="hidden sm:inline">Offer</span>
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}
