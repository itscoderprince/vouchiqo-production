"use client";

import SafeImage from "@/components/shared/SafeImage";
import { ArrowUpRight, Flame, ShieldCheck, Sparkles } from "lucide-react";

export default function ProductOfferCard({ product }) {
  if (!product) return null;

  const {
    _id,
    title,
    originalPrice = 0,
    discountPrice = 0,
    discountPercentage = 0,
    discountText,
    merchantName: rawMerchantName,
    merchantLogo: rawMerchantLogo,
    merchantId,
    merchant,
    productImage,
    imageUrl,
    affiliateUrl,
    href,
  } = product;

  const merchantObj =
    typeof merchantId === "object" && merchantId !== null
      ? merchantId
      : typeof merchant === "object" && merchant !== null
        ? merchant
        : {};

  const merchantName =
    rawMerchantName ||
    product.merchantName ||
    merchantObj.businessName ||
    merchantObj.name ||
    "Partner Store";

  const merchantLogo =
    rawMerchantLogo ||
    product.merchantLogo ||
    merchantObj.logo ||
    (merchantName && merchantName !== "Partner Store"
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=08214d&color=ffffff&size=64&bold=true`
      : "/navbarlogovouchiqo.webp");

  const coverImage =
    imageUrl ||
    productImage ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";

  const numOrig = typeof originalPrice === "number" ? originalPrice : (Number(originalPrice) || 0);
  const numDisc = typeof discountPrice === "number" ? discountPrice : (Number(discountPrice) || 0);
  const savings = numOrig > 0 && numDisc > 0 ? Math.max(0, numOrig - numDisc) : 0;
  const computedPercent = numOrig > 0 && numDisc > 0 ? Math.round((savings / numOrig) * 100) : (discountPercentage || 0);

  // Clean discount badge label
  let badgeLabel = null;
  if (discountText?.trim()) {
    badgeLabel = discountText.trim();
  } else if (computedPercent > 0 && computedPercent <= 100) {
    badgeLabel = `${computedPercent}% OFF`;
  } else if (numDisc > 0 && numOrig > numDisc) {
    badgeLabel = `SAVE ₹${savings.toLocaleString("en-IN")}`;
  }

  const destinationUrl = affiliateUrl || href || `/deals`;

  const handleClick = (e) => {
    if (_id) {
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
    }

    if (affiliateUrl?.startsWith("http")) {
      e.preventDefault();
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a
      href={destinationUrl}
      onClick={handleClick}
      target={affiliateUrl?.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="group relative flex flex-col rounded-2xl no-underline cursor-pointer border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_28px_rgba(247,40,83,0.12)] hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 select-none text-left overflow-hidden h-full"
    >
      {/* ===== Banner Header with Floating Badges ===== */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
        {/* Ambient subtle blur layer */}
        <SafeImage
          src={coverImage}
          alt=""
          fill
          className="object-cover blur-md scale-110 opacity-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Main crisp banner image with gentle zoom on hover */}
        <SafeImage
          src={coverImage}
          alt={title || "Affiliate product"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="relative z-1 object-contain transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none p-1"
        />

        {/* Floating Discount Badge on Image (Top-Left) */}
        {badgeLabel && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-[#F72853] to-[#FF4D6D] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-rose-500/30 tracking-tight">
            <Flame className="w-2.5 h-2.5 fill-white text-white" />
            <span>{badgeLabel}</span>
          </div>
        )}

        {/* Floating Verified Trust Pill on Image (Top-Right) */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-white/95 backdrop-blur-xs text-slate-700 text-[9.5px] font-medium px-2 py-0.5 rounded-full shadow-2xs border border-slate-200/70">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
          <span>Verified</span>
        </div>
      </div>

      {/* ===== Card Content Box ===== */}
      <div className="relative flex-1 flex flex-col justify-between bg-white p-3 sm:p-3.5 font-sans">
        <div>
          {/* Brand & Store Identity Row */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border border-slate-200/90 bg-white shadow-2xs overflow-hidden shrink-0 p-0.5 flex items-center justify-center">
                <SafeImage
                  src={merchantLogo}
                  alt={merchantName || "Merchant"}
                  width={22}
                  height={22}
                  className="w-full h-full object-contain rounded-full select-none pointer-events-none"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate">
                {merchantName}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 font-medium shrink-0">
              Online Deal
            </span>
          </div>

          {/* Product Title with fixed min-height for uniform row alignment */}
          <div className="mb-2">
            <h3 className="text-left text-xs sm:text-[13px] font-semibold text-slate-900 group-hover:text-[#F72853] transition-colors leading-snug line-clamp-2 min-h-[34px]">
              {title}
            </h3>
          </div>

          {/* Price & Savings Display */}
          <div className="flex items-baseline flex-wrap gap-1.5 mb-2.5">
            {numDisc > 0 ? (
              <>
                <span className="text-sm sm:text-[15px] font-bold text-[#F72853] tracking-tight">
                  ₹{numDisc.toLocaleString("en-IN")}
                </span>
                {numOrig > numDisc && (
                  <span className="text-[11px] text-slate-400 font-normal line-through">
                    ₹{numOrig.toLocaleString("en-IN")}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                    Save ₹{savings.toLocaleString("en-IN")}
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1 text-[11.5px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Verified Special Offer</span>
              </div>
            )}
          </div>
        </div>

        {/* ===== Ergonomic CTA Button (Balanced Fitts's Law, not oversized) ===== */}
        <div className="pt-2 border-t border-slate-100/90 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Verified Deal</span>
            </div>
            <span
              className="inline-flex items-center justify-center gap-1 h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-[#F72853] via-[#fa3b63] to-[#E11D48] group-hover:from-[#E11D48] group-hover:to-[#be123c] shadow-xs group-hover:shadow-md group-hover:shadow-rose-500/20 active:scale-[0.98] transition-all duration-200 shrink-0"
            >
              <span>Grab Offer</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
