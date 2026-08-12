"use client";

import { ExternalLink, ShoppingBag } from "lucide-react";

export default function AffiliateProductCard({ product }) {
  if (!product) return null;

  const {
    _id,
    title,
    originalPrice,
    discountPrice,
    discountPercentage,
    affiliateUrl,
    imageUrl,
    category,
    description,
  } = product;

  const displayTitle = typeof title === "string" ? title : String(title?.title || "Special Deal");
  const displayDesc = typeof description === "string" ? description : String(description?.text || "");
  const numOrig = typeof originalPrice === "number" ? originalPrice : (Number(originalPrice) || 0);
  const numDisc = typeof discountPrice === "number" ? discountPrice : (Number(discountPrice) || 0);

  const savings = Math.max(0, numOrig - numDisc);
  const percentOff = discountPercentage || (numOrig > 0 ? Math.round((savings / numOrig) * 100) : 0);

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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between shadow-xs hover:shadow-md hover:border-blue-500/80 transition-all duration-200 text-left font-sans group">
      {/* Product Image & Badge */}
      <div className="relative w-full sm:w-28 h-28 sm:h-28 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={typeof title === "string" ? title : "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop";
            }}
          />
        ) : (
          <ShoppingBag className="w-8 h-8 text-slate-300" />
        )}
        {percentOff > 0 && (
          <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[8.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
            {percentOff}% OFF
          </div>
        )}
      </div>

      {/* Middle Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="inline-flex items-center bg-blue-50 border border-blue-100/80 text-blue-700 text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
          <span>Affiliate Deal · {String(categoryName)}</span>
        </div>

        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
          {displayTitle}
        </h3>

        {displayDesc ? (
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1 leading-normal">
            {displayDesc}
          </p>
        ) : null}

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base sm:text-lg font-black text-slate-900">
            ₹{numDisc.toLocaleString()}
          </span>
          {numOrig > numDisc && (
            <span className="text-xs font-semibold text-slate-400 line-through">
              ₹{numOrig.toLocaleString()}
            </span>
          )}
          {savings > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80">
              Save ₹{savings.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="shrink-0 pt-1 sm:pt-0">
        <button
          onClick={handleClick}
          type="button"
          className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>Shop Now</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

