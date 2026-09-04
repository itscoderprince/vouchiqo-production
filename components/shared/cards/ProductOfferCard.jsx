"use client";

import SafeImage from "@/components/shared/SafeImage";
import { ExternalLink, Tag } from "lucide-react";
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
    (computedPercent > 0 ? `${computedPercent}% OFF` : (numDisc > 0 ? `₹${numDisc}` : "SPECIAL DEAL"));

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
      className="group relative flex flex-col rounded-xl no-underline cursor-pointer border border-slate-200/90 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_20px_rgba(247,40,83,0.14)] hover:border-[#F72853] transition-all duration-300 select-none text-left overflow-hidden h-full"
    >
      {/* ===== 16:9 Image Header ===== */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 shrink-0">
        <SafeImage
          src={
            coverImage ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"
          }
          alt={title || "Affiliate product"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Top-Right Compact Badge */}
        {badgeText && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 font-normal text-[8px] sm:text-[9px] uppercase tracking-wide text-white px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs bg-gradient-to-r from-rose-500 to-[#F72853]">
            {badgeText}
          </div>
        )}
      </div>

      {/* ===== Content Box with Responsive Depth ===== */}
      <div className="relative flex-1 flex flex-col justify-between bg-white px-2.5 sm:px-3.5 pt-3.5 sm:pt-4 pb-2 sm:pb-2.5">
        {/* Floating Merchant Circular Logo */}
        <div
          className="absolute flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-2xs p-0.5 group-hover:border-[#F72853]/40 transition-colors"
          style={{
            width: isMobile ? "28px" : "32px",
            height: isMobile ? "28px" : "32px",
            top: isMobile ? "-14px" : "-16px",
            left: isMobile ? "10px" : "12px",
            zIndex: 10,
          }}
        >
          <SafeImage
            src={
              merchantLogo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName || "Store")}&background=08214d&color=ffffff&size=64&bold=true`
            }
            alt={merchantName || "Merchant"}
            width={32}
            height={32}
            className="w-full h-full object-contain rounded-full select-none pointer-events-none"
          />
        </div>

        {/* Details */}
        <div>
          {/* Price Row */}
          <div className="mb-0.5">
            <p className="text-left text-xs sm:text-[13px] font-medium tracking-tight text-[#F72853] leading-tight">
              ₹{numDisc > 0 ? numDisc.toLocaleString("en-IN") : "Best Offer"}{" "}
              {numOrig > numDisc && numOrig > 0 && (
                <span className="text-[9px] sm:text-[10.5px] text-slate-400 font-normal line-through ml-1">
                  ₹{numOrig.toLocaleString("en-IN")}
                </span>
              )}
            </p>
          </div>

          {/* Product Title */}
          <div className="mb-1.5">
            <p className="text-left text-[10.5px] sm:text-xs text-slate-800 group-hover:text-[#F72853] transition-colors leading-snug font-normal line-clamp-2">
              {title}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-0.5">
          <span
            className="block w-full rounded-md py-1 text-center text-[10px] sm:text-[10.5px] font-medium uppercase tracking-wider text-white transition-all shadow-2xs group-hover:brightness-95 flex items-center justify-center gap-1 bg-[#F72853] hover:bg-[#e01e47]"
          >
            <span>Grab Offer</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2]" />
          </span>
        </div>
      </div>
    </a>
  );
}
