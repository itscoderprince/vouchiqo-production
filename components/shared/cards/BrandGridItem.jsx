"use client";

import SafeImage from "@/components/shared/SafeImage";
import Link from "next/link";
import { useState } from "react";

function TwitterGreenTick({ className = "w-3 h-3" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Verified account"
      className={`${className} flex-shrink-0 text-emerald-500 fill-current`}
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.26.16-.42.24-.88.24-1.35 0-2.13-1.73-3.86-3.86-3.86-.47 0-.93.08-1.35.24C14.5 2.45 13.26 1.57 11.83 1.57s-2.67.88-3.26 2.19c-.42-.16-.88-.24-1.35-.24-2.13 0-3.86 1.73-3.86 3.86 0 .47.08.93.24 1.35C2.32 9.33 1.44 10.57 1.44 12s.88 2.67 2.19 3.26c-.16.42-.24.88-.24 1.35 0 2.13 1.73 3.86 3.86 3.86.47 0 .93-.08 1.35-.24.59 1.31 1.83 2.19 3.26 2.19s2.67-.88 3.26-2.19c.42.16.88.24 1.35.24 2.13 0 3.86-1.73 3.86-3.86 0-.47-.08-.93-.24-1.35 1.31-.59 2.19-1.83 2.19-3.26zm-11.4 4.54l-4.14-4.14 1.41-1.41 2.73 2.73 6.09-6.09 1.41 1.41-7.5 7.5z" />
    </svg>
  );
}

export default function BrandGridItem({
  name,
  logo,
  banner,
  category,
  discount,
  href,
  coupons = 12,
  isVerified = true,
}) {
  const [imgError, setImgError] = useState(false);

  const bgBanner =
    banner && typeof banner === "string" && banner.trim() !== ""
      ? banner
      : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop";

  const validLogo =
    logo && typeof logo === "string" && logo.trim() !== "" ? logo : null;

  return (
    <Link
      href={href || "#"}
      className="group relative flex flex-col justify-between rounded-[18px] border border-slate-200/90 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.10)] hover:border-slate-300 transition-all duration-200 overflow-hidden select-none text-left w-full h-[162px] sm:h-[170px]"
      style={{ textDecoration: "none" }}
    >
      {/* ── 1. Top Half: Visual Imagery & Category Tag ── */}
      <div className="relative w-full h-1/2 overflow-hidden bg-slate-100">
        <SafeImage
          src={bgBanner}
          alt={name || "Store Banner"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Soft Dark Vignette for Pristine Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/35 pointer-events-none" />

        {/* Category Label (Top Left) */}
        <div className="absolute top-2.5 left-3 sm:top-3 sm:left-3.5 z-10">
          <span className="text-white font-bold text-xs sm:text-[13px] tracking-tight drop-shadow-md capitalize">
            {category || "Deals"}
          </span>
        </div>
      </div>

      {/* ── 2. Floating Circular Brand Logo (Anchor) ── */}
      <div className="absolute top-1/2 left-3 sm:left-3.5 -translate-y-1/2 z-20">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shadow-md ring-3 ring-white group-hover:ring-slate-100 transition-all">
          {!imgError && validLogo ? (
            <SafeImage
              src={validLogo}
              alt={name || "Store Logo"}
              width={44}
              height={44}
              className="max-h-full max-w-full object-contain rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight">
              {name ? name.slice(0, 2) : "VT"}
            </span>
          )}
        </div>
      </div>

      {/* ── 3. Bottom Half: Store Details, Offer Pill & Verified Status ── */}
      <div className="pt-6 sm:pt-6.5 pb-2.5 px-3 flex flex-col justify-between h-1/2 bg-white text-left font-sans">
        {/* Brand Name */}
        <h4 className="text-[12.5px] sm:text-[13.5px] font-black text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h4>

        {/* Bottom Highlight Row */}
        <div className="flex items-center justify-between gap-1.5 mt-auto pt-1">
          {/* Offer / Discount Pill */}
          <span className="inline-flex items-center text-[9px] sm:text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[4px] truncate max-w-[105px] sm:max-w-[125px]">
            {discount ||
              (coupons > 0
                ? `${coupons} LIVE ${coupons === 1 ? "OFFER" : "OFFERS"}`
                : "UP TO 50% OFF")}
          </span>

          {/* Verified Indicator (Emerald Dot) */}
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-semibold text-slate-700 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-2xs"></span>
              Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
