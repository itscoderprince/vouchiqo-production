"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
} from "lucide-react";

export default function CouponCard({
  coupon,
  isExpanded,
  toggleDetails,
  copiedCouponId,
  handleCopyCode,
  merchant,
}) {
  const hasCode = coupon.code && coupon.code.trim() !== "";
  const discountText =
    coupon.discountValue && coupon.discountType
      ? coupon.discountType === "percentage"
        ? `${coupon.discountValue}%`
        : `₹${coupon.discountValue}`
      : null;

  const expiryLabel = coupon.expiresAt
    ? (() => {
        const d = new Date(coupon.expiresAt);
        const diff = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff <= 0) return "Expires soon";
        if (diff === 1) return "Expires tomorrow";
        return `Expires in ${diff} days`;
      })()
    : null;

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-blue-100"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      {/* Main card row */}
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Discount badge column */}
        <div
          className="sm:w-[110px] flex-shrink-0 flex flex-col items-center justify-center py-5 px-3 text-center"
          style={{
            background: hasCode
              ? "linear-gradient(160deg, #1d4ed8, #2563eb)"
              : "linear-gradient(160deg, #0f172a, #1e3a5f)",
          }}
        >
          {discountText ? (
            <>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-blue-200 mb-0.5">
                Save
              </span>
              <span className="text-2xl font-bold text-white leading-none">
                {discountText}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white/60 mt-1">
                OFF
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-blue-200 mb-0.5">
                {hasCode ? "Code" : "Deal"}
              </span>
              <span className="text-base font-bold text-white leading-none">
                {hasCode ? "PROMO" : "OFFER"}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/15 px-1.5 py-0.5 rounded mt-1.5 text-white/80">
                Active
              </span>
            </>
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 p-4 flex flex-col justify-between gap-3 text-left">
          <div className="space-y-1.5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Verified
              </span>
              <span className="text-[11px] text-gray-400 font-normal flex items-center gap-1">
                <Users className="w-3 h-3" />3 used today
              </span>
              {expiryLabel && (
                <span className="text-[10px] text-orange-500 font-medium">
                  {expiryLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
              {coupon.title}
            </h3>

            {/* Description */}
            {coupon.description && (
              <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 font-normal">
                {coupon.description}
              </p>
            )}
          </div>

          {/* Actions row */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-50">
            <button
              onClick={toggleDetails}
              type="button"
              className="text-[12px] font-medium text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 border-0 bg-transparent cursor-pointer p-0"
            >
              {isExpanded ? "Hide details" : "Show details"}
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {hasCode ? (
              <div>
                {copiedCouponId === coupon._id ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 text-[11px] font-semibold px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Code Copied!
                  </span>
                ) : (
                  <button
                    onClick={() => handleCopyCode(coupon.code, coupon._id)}
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg border-0 cursor-pointer transition-colors"
                  >
                    Get Code
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleCopyCode("", coupon._id)}
                type="button"
                className="bg-gray-900 hover:bg-black active:bg-gray-800 text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg border-0 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                Get Deal
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="bg-gray-50 border-t border-gray-100 px-5 py-4 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Terms & Conditions
          </p>
          <ul className="space-y-1 text-[12px] text-gray-500 font-normal list-disc pl-4">
            <li>
              Applicable only on verified purchases via official partner
              channels.
            </li>
            <li>
              Discount applies to base order value; taxes and fees excluded.
            </li>
            <li>Cannot be combined with other ongoing merchant promotions.</li>
            <li>Offer valid for a limited time. Valid until stock lasts.</li>
          </ul>
          {hasCode && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[12px] font-medium text-gray-600">
                Promo code:
              </span>
              <span className="font-mono bg-white border border-gray-200 text-blue-600 px-2.5 py-1 rounded-lg text-[12px] font-semibold tracking-wider">
                {coupon.code}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
