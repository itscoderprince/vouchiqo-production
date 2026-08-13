"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  MousePointerClick,
  ShoppingBag,
  Sparkles,
  Power,
  Tag,
} from "lucide-react";

export const CATEGORIES = [
  "Fashion & Clothing",
  "Electronics & Gadgets",
  "Food & Dining",
  "Beauty & Wellness",
  "Travel & Hospitality",
  "Home & Living",
  "Fitness & Healthcare",
  "Education & Courses",
  "Website & Tech",
  "Services",
  "General Offers",
];

export const CATEGORY_COLORS = {
  "Home & Living": "bg-slate-900 text-white border-slate-800",
  "Electronics & Gadgets": "bg-blue-600 text-white border-blue-500",
  "Fashion & Clothing": "bg-purple-600 text-white border-purple-500",
  "Food & Dining": "bg-amber-500 text-slate-950 border-amber-400 font-bold",
  "Beauty & Wellness": "bg-pink-600 text-white border-pink-500",
  "Travel & Hospitality": "bg-teal-600 text-white border-teal-500",
  "Fitness & Healthcare": "bg-emerald-600 text-white border-emerald-500",
  "Education & Courses": "bg-indigo-600 text-white border-indigo-500",
  "Website & Tech": "bg-sky-600 text-white border-sky-500",
  "Services": "bg-violet-600 text-white border-violet-500",
  "General Offers": "bg-slate-800 text-white border-slate-700",
};

export default function AffiliateProductPreviewCard({
  product = {},
  isPreview = false,
  onCopy = null,
  onEdit = null,
  onDelete = null,
  onToggleStatus = null,
  isDeleting = false,
  isToggling = false,
}) {
  const [copied, setCopied] = useState(false);

  const title = product.title || "Sample Product Title";
  const category = product.category || "General Offers";
  const originalPrice = Number(product.originalPrice) || 0;
  const discountPrice = Number(product.discountPrice) || 0;
  const affiliateUrl = product.affiliateUrl || "https://webitya.com";
  const imageUrl = product.imageUrl || "";
  const status = product.status || "active";
  const clickCount = product.clickCount || 0;

  const savings = Math.max(0, originalPrice - discountPrice);
  const savingsPercent =
    originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const badgeStyle =
    CATEGORY_COLORS[category] || "bg-slate-900 text-white border-slate-800";

  const handleCopy = (e) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(affiliateUrl, product._id);
    } else {
      navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-xs hover:shadow-md hover:border-blue-500/80 transition-all flex flex-col justify-between relative overflow-hidden font-sans text-left w-full ${
        status === "paused" ? "opacity-75 bg-slate-50/50" : ""
      }`}
    >
      {/* Top Banner & Status Indicator */}
      <div className="space-y-2.5">
        <div className="relative w-full h-44 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-100 group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <ShoppingBag className="w-8 h-8 mb-1 opacity-60 text-blue-400" />
              <span className="text-xs font-semibold text-slate-300">
                Product Image
              </span>
            </div>
          )}

          {/* Category Badge (Top Left) */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md border shadow-xs ${badgeStyle}`}
            >
              <Tag className="w-3 h-3 shrink-0" />
              {category}
            </span>
          </div>

          {/* Discount Tag (Top Right) */}
          {savingsPercent > 0 && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-md shadow-xs border border-emerald-500">
                <Sparkles className="w-3 h-3" />
                {savingsPercent}% OFF
              </span>
            </div>
          )}

          {/* Status Badge overlay for Paused state */}
          {status === "paused" && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5" />
                Listing Paused
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
            {title}
          </h3>
          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing Info Box */}
        <div className="flex items-center justify-between bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-blue-600">
              ₹{discountPrice ? discountPrice.toLocaleString() : "0"}
            </span>
            {originalPrice > discountPrice && (
              <span className="text-xs font-normal text-slate-400 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              Save ₹{savings.toLocaleString()}
            </span>
          )}
        </div>

        {/* Affiliate Link Input / Display Box */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">
            Affiliate Link URL
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-2 rounded-lg border border-slate-200/80 text-xs">
            <span className="truncate text-slate-700 text-xs flex-1 font-normal">
              {affiliateUrl}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer shrink-0"
              title="Copy Affiliate Link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors shrink-0"
              title="Open Destination Link"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Card Footer Actions (Hidden in Preview mode) */}
      {!isPreview && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
            <span>{clickCount} clicks</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(product)}
                disabled={isToggling}
                className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                }`}
                title={status === "active" ? "Pause Product" : "Activate Product"}
              >
                <Power className="w-3 h-3" />
                <span>{status === "active" ? "Active" : "Paused"}</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Edit Product"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product._id)}
                disabled={isDeleting}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
