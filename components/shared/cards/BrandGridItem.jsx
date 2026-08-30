"use client";

import { CheckCircle2, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BrandGridItem({
  name,
  logo,
  banner,
  href,
  coupons = 12,
  isVerified = true,
}) {
  const [imgError, setImgError] = useState(false);

  // Background banner fallback if store banner is missing
  const bgBanner =
    banner ||
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop";

  return (
    <Link
      href={href || "#"}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white shadow-[0_2px_6px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_16px_rgba(247,40,83,0.14)] hover:border-[#F72853] transition-all duration-200 overflow-hidden select-none text-center w-full h-[108px] sm:h-[132px]"
      style={{ textDecoration: "none" }}
    >
      {/* Top Background Banner (Mobile: 46% height for sleek wide rectangle, Desktop: 52% height) */}
      <div className="relative w-full h-[46%] sm:h-[52%] overflow-hidden bg-slate-100">
        <img
          src={bgBanner}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop";
          }}
        />
        {/* Crisp Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />

        {/* Coupons Count Badge (Top Right) */}
        {coupons > 0 && (
          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-slate-900/90 text-white text-[8px] sm:text-[8.5px] font-normal px-1.5 py-0.5 rounded border border-slate-700/80 shadow-2xs flex items-center gap-0.5 z-10 backdrop-blur-xs">
            <Ticket className="w-2.5 h-2.5 text-blue-400" />
            <span>{coupons}</span>
          </div>
        )}

        {/* Verified Badge (Flush in Bottom Right Corner of Banner Image) */}
        {isVerified && (
          <div className="absolute bottom-0 right-0 bg-emerald-600 text-white text-[7px] sm:text-[7.5px] font-normal px-1.5 py-0.5 rounded-tl-[3px] flex items-center gap-0.5 z-10 shadow-2xs">
            <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white stroke-[2] shrink-0" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Center Floating Brand Logo Badge */}
      <div className="absolute top-[46%] sm:top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 p-0.5 sm:p-1 flex items-center justify-center shadow-2xs group-hover:border-[#F72853] transition-all duration-200">
          {!imgError && logo ? (
            <img
              src={logo}
              alt={name}
              className="max-h-full max-w-full object-contain rounded-md"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[9px] sm:text-[10px] font-medium text-[#F72853] uppercase tracking-tight">
              {name ? name.slice(0, 2) : "VT"}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Brand Name Details */}
      <div className="pt-3.5 sm:pt-4 pb-1.5 px-1 flex flex-col items-center justify-center flex-1 bg-white text-center">
        <span className="text-[10.5px] sm:text-[11.5px] font-normal text-slate-800 group-hover:text-[#F72853] line-clamp-1 max-w-full tracking-tight px-1 transition-colors">
          {name}
        </span>
      </div>
    </Link>
  );
}

