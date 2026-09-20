"use client";

import Link from "next/link";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

function TwitterVerifiedTick({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Verified store"
      className={`${className} shrink-0 inline-block`}
    >
      <path
        fill="#1D9BF0"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.26.16-.42.24-.88.24-1.35 0-2.13-1.73-3.86-3.86-3.86-.47 0-.93.08-1.35.24C14.5 2.45 13.26 1.57 11.83 1.57s-2.67.88-3.26 2.19c-.42-.16-.88-.24-1.35-.24-2.13 0-3.86 1.73-3.86 3.86 0 .47.08.93.24 1.35C2.32 9.33 1.44 10.57 1.44 12s.88 2.67 2.19 3.26c-.16.42-.24.88-.24 1.35 0 2.13 1.73 3.86 3.86 3.86.47 0 .93-.08 1.35-.24.59 1.31 1.83 2.19 3.26 2.19s2.67-.88 3.26-2.19c.42.16.88.24 1.35.24 2.13 0 3.86-1.73 3.86-3.86 0-.47-.08-.93-.24-1.35 1.31-.59 2.19-1.83 2.19-3.26z"
      />
      <path
        fill="#ffffff"
        d="M10.85 16.54l-4.14-4.14 1.41-1.41 2.73 2.73 6.09-6.09 1.41 1.41-7.5 7.5z"
      />
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
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md hover:border-rose-300/80 transition-all duration-200 overflow-hidden select-none text-left w-full h-[168px] sm:h-[176px]"
      style={{ textDecoration: "none" }}
    >
      {/* ── 1. Top Half: Visual Imagery & Category Tag ── */}
      <div className="relative w-full h-1/2 overflow-hidden bg-slate-100">
        <SafeImage
          src={bgBanner}
          alt={name || "Store Banner"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Soft Dark Vignette for Pristine Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/35 pointer-events-none" />

        {/* Category Label (Flush in Top Left Corner) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
          <span className="bg-black/60 backdrop-blur-xs text-white font-semibold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md border border-white/20 shadow-2xs tracking-wide capitalize">
            {category || "Deals"}
          </span>
        </div>
      </div>

      {/* ── 2. Floating Circular Brand Logo (Anchor - Shifted more to left edge) ── */}
      <div className="absolute top-1/2 left-1.5 sm:left-2 -translate-y-1/2 z-20">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shadow-md ring-3 ring-white group-hover:ring-rose-50 transition-all">
          {!imgError && validLogo ? (
            <SafeImage
              src={validLogo}
              alt={name || "Store Logo"}
              width={48}
              height={48}
              className="max-h-full max-w-full object-contain rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
              {name ? name.slice(0, 2) : "VT"}
            </span>
          )}
        </div>
      </div>

      {/* ── 3. Bottom Half: Store Details with Verified Twitter Tick & Clean Offer Pill ── */}
      <div className="pt-6 sm:pt-6.5 pb-2.5 px-2 sm:px-2.5 flex flex-col justify-between h-1/2 bg-white text-left font-sans">
        {/* Brand Name + Twitter Verified Tick Badge on the Right */}
        <div className="flex items-center gap-1 min-w-0 pr-1">
          <h4 className="text-[13px] sm:text-[13.5px] font-extrabold text-slate-900 uppercase tracking-tight truncate group-hover:text-[#F72853] transition-colors leading-tight">
            {name}
          </h4>
          {isVerified && (
            <TwitterVerifiedTick className="w-3.5 h-3.5 shrink-0" />
          )}
        </div>

        {/* Bottom Highlight Row (Clean Offer Pill without redundant text) */}
        <div className="flex items-center gap-1 mt-auto pt-1 w-full min-w-0">
          <span className="inline-flex items-center text-[9px] sm:text-[9.5px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md truncate max-w-full">
            {discount ||
              (coupons > 0
                ? `${coupons} LIVE ${coupons === 1 ? "OFFER" : "OFFERS"}`
                : "UP TO 50% OFF")}
          </span>
        </div>
      </div>
    </Link>
  );
}
