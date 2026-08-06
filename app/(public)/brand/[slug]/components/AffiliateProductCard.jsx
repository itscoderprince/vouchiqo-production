"use client";

import { ExternalLink, ShoppingBag, Sparkles } from "lucide-react";

export default function AffiliateProductCard({ product, merchant }) {
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

  const savings = Math.max(0, originalPrice - discountPrice);
  const percentOff = discountPercentage || (originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0);

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

    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-2xs hover:shadow-md hover:border-blue-500 transition-all duration-200 text-left font-sans group">
      {/* Product Image & Badge */}
      <div className="relative w-full sm:w-36 h-36 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop";
            }}
          />
        ) : (
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        )}
        {percentOff > 0 && (
          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs">
            {percentOff}% OFF
          </div>
        )}
      </div>

      {/* Middle Details */}
      <div className="flex-1 space-y-2">
        <div className="inline-flex items-center bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
          <span>Affiliate Deal · {category || "Special"}</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-gray-500 font-normal line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Price Row */}
        <div className="flex items-baseline gap-2.5 pt-1">
          <span className="text-lg font-black text-slate-900">
            ₹{discountPrice?.toLocaleString()}
          </span>
          {originalPrice > discountPrice && (
            <span className="text-xs font-semibold text-gray-400 line-through">
              ₹{originalPrice?.toLocaleString()}
            </span>
          )}
          {savings > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Save ₹{savings.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="shrink-0 pt-2 sm:pt-0">
        <button
          onClick={handleClick}
          type="button"
          className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>Shop Now</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
