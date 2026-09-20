"use client";

import SafeImage from "@/components/shared/SafeImage";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductOfferCard({ product }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

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

  const badgeText =
    discountText ||
    (computedPercent > 0 ? `${computedPercent}% OFF` : (numDisc > 0 ? `₹${numDisc}` : null));

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

    if (affiliateUrl && affiliateUrl.startsWith("http")) {
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
      className="group relative flex flex-col rounded-xl sm:rounded-2xl no-underline cursor-pointer border border-slate-200/90 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_25px_rgba(247,40,83,0.16)] hover:border-[#F72853] transition-all duration-300 select-none text-left overflow-hidden h-full"
    >
      {/* ===== 3:2 Banner Header (Exact fit for 1536x1024 banners, 0% crop) ===== */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
        {/* Ambient subtle blur layer for banners with unusual aspect ratios */}
        <SafeImage
          src={coverImage}
          alt=""
          fill
          className="object-cover blur-md scale-110 opacity-25 pointer-events-none"
          aria-hidden="true"
        />
        {/* Main crisp banner image with full containment and zero cropping */}
        <SafeImage
          src={coverImage}
          alt={title || "Affiliate product"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="relative z-1 object-contain transition-transform duration-500 group-hover:scale-[1.03] select-none pointer-events-none"
        />
      </div>

      {/* ===== Content Box with Responsive Spacing & Clean Typography ===== */}
      <div className="relative flex-1 flex flex-col justify-between bg-white p-3 sm:p-4 font-sans">
        <div>
          {/* Store / Merchant Branding Row (Clean, readable, never overlaps the banner) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-200/90 bg-white shadow-2xs overflow-hidden shrink-0 p-0.5 flex items-center justify-center">
                <SafeImage
                  src={merchantLogo}
                  alt={merchantName || "Merchant"}
                  width={28}
                  height={28}
                  className="w-full h-full object-contain rounded-full select-none pointer-events-none"
                />
              </div>
              <span className="text-xs sm:text-[13px] font-semibold text-slate-700 truncate">
                {merchantName}
              </span>
            </div>

            {badgeText && (
              <span className="font-bold text-[10px] sm:text-[11px] text-[#F72853] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full shrink-0">
                {badgeText}
              </span>
            )}
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-sm sm:text-base font-bold text-[#F72853] tracking-tight">
              ₹{numDisc > 0 ? numDisc.toLocaleString("en-IN") : "Best Offer"}
            </span>
            {numOrig > numDisc && numOrig > 0 && (
              <span className="text-xs text-slate-400 font-normal line-through">
                ₹{numOrig.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Product Title */}
          <div className="mb-3">
            <p className="text-left text-xs sm:text-[13px] text-slate-800 group-hover:text-[#F72853] transition-colors leading-snug font-medium line-clamp-2">
              {title}
            </p>
          </div>
        </div>

        {/* Action Button (Solid, prominent height & tactile feel) */}
        <div className="mt-auto pt-1">
          <span
            className="flex items-center justify-center gap-2 w-full h-10 sm:h-11 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-white bg-[#F72853] hover:bg-[#e01e47] shadow-2xs hover:shadow-md transition-all duration-200 group-hover:brightness-95 active:scale-[0.98]"
          >
            <span>Grab Offer</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </span>
        </div>
      </div>
    </a>
  );
}
