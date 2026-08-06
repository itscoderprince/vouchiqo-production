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
}) {
  const [imgError, setImgError] = useState(false);

  // Background banner fallback if store banner is missing
  const bgBanner =
    banner ||
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop";

  return (
    <Link
      href={href || "#"}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-[0_2px_6px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_16px_rgba(15,23,42,0.12)] hover:border-blue-600 transition-all duration-200 overflow-hidden select-none text-center w-full h-[115px] sm:h-[125px]"
      style={{ textDecoration: "none" }}
    >
      {/* Top Background Banner (Upper 45%) */}
      <div className="relative w-full h-[45%] overflow-hidden bg-slate-100">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-transparent" />

        {/* Coupons Count Badge (Top Right) */}
        {coupons > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 shadow-xs flex items-center gap-0.5">
            <Ticket className="w-2.5 h-2.5 text-blue-400" />
            <span>{coupons}</span>
          </div>
        )}
      </div>

      {/* Center Floating Brand Logo Badge */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-[0_2px_6px_rgba(15,23,42,0.12)] group-hover:border-blue-600 group-hover:shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition-all duration-200">
          {!imgError && logo ? (
            <img
              src={logo}
              alt={name}
              className="max-h-full max-w-full object-contain rounded-md"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">
              {name ? name.slice(0, 2) : "VT"}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Brand Name & Status Details (Lower 55%) */}
      <div className="pt-5 pb-2 px-1.5 flex flex-col items-center justify-center flex-1 bg-white text-center">
        <span className="text-[11.5px] sm:text-[12.5px] font-bold text-slate-800 group-hover:text-blue-700 line-clamp-1 max-w-full tracking-tight px-1 drop-shadow-none [text-shadow:none]">
          {name}
        </span>
        <span className="text-[9.5px] font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5 mt-0.5 drop-shadow-none [text-shadow:none]">
          <CheckCircle2 className="w-2.5 h-2.5 text-blue-500 shrink-0" />
          <span>Verified Store</span>
        </span>
      </div>
    </Link>
  );
}
