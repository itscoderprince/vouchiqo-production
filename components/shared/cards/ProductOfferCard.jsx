"use client";

import { ArrowUpRight, Flame, ShieldCheck } from "lucide-react";
import SafeImage from "@/components/shared/SafeImage";

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

  const numOrig =
    typeof originalPrice === "number"
      ? originalPrice
      : Number(originalPrice) || 0;
  const numDisc =
    typeof discountPrice === "number"
      ? discountPrice
      : Number(discountPrice) || 0;
  const savings =
    numOrig > 0 && numDisc > 0 ? Math.max(0, numOrig - numDisc) : 0;
  const computedPercent =
    numOrig > 0 && numDisc > 0
      ? Math.round((savings / numOrig) * 100)
      : discountPercentage || 0;

  // Floating discount badge on image
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
      className="group relative flex flex-col rounded-2xl no-underline cursor-pointer border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_rgba(247,40,83,0.12)] hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 select-none text-left overflow-hidden h-full"
    >
      {/* ===== Banner Header with Floating Discount Badge ===== */}
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
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-[#F72853] to-[#FF4D6D] text-white text-[10px] sm:text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-tight">
            <Flame className="w-2.5 h-2.5 fill-white text-white" />
            <span>{badgeLabel}</span>
          </div>
        )}
      </div>

      {/* ===== Card Content Box ===== */}
      <div className="relative flex-1 flex flex-col justify-between bg-white p-3 sm:p-3.5 font-sans">
        <div>
          {/* Brand Row with the ONLY Verified badge on the card */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full border border-slate-200/90 bg-white shadow-2xs overflow-hidden shrink-0 p-0.5 flex items-center justify-center">
                <SafeImage
                  src={merchantLogo}
                  alt={merchantName || "Merchant"}
                  width={20}
                  height={20}
                  className="w-full h-full object-contain rounded-full select-none pointer-events-none"
                />
              </div>
              <span className="text-[11.5px] sm:text-xs font-semibold text-slate-800 truncate">
                {merchantName}
              </span>
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                title="Verified Store Offer"
              />
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

          {/* Price & Value Display (Clean, never duplicating "Verified") */}
          <div className="flex items-baseline flex-wrap gap-1.5 mb-2.5 min-h-[22px]">
            {numDisc > 0 ? (
              <>
                <span className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-tight">
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
              <span className="text-[11.5px] sm:text-xs font-semibold text-[#F72853] bg-rose-50/70 border border-rose-200/60 px-2 py-0.5 rounded-md">
                {discountText?.trim() ? discountText : "Exclusive Deal"}
              </span>
            )}
          </div>
        </div>

        {/* ===== Ergonomic Full-Width CTA Button (No redundant filler text) ===== */}
        <div className="pt-2 border-t border-slate-100/90 mt-auto">
          <span className="flex items-center justify-center gap-1.5 w-full h-8.5 sm:h-9 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#F72853] via-[#fa3b63] to-[#E11D48] group-hover:from-[#E11D48] group-hover:to-[#be123c] shadow-xs group-hover:shadow-md group-hover:shadow-rose-500/20 active:scale-[0.98] transition-all duration-200">
            <span>Grab Offer</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
