"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HotDealsTicker() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickerCoupons() {
      try {
        const res = await fetch("/api/coupons/ticker?limit=15");
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.data?.coupons || []);
        }
      } catch (err) {
        console.error("Failed to fetch ticker coupons:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickerCoupons();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1A3C5E] text-white flex items-center justify-center h-10 md:h-11 z-40 relative border-b border-white/10">
        <Loader2 className="w-4 h-4 animate-spin text-brand-warning mr-2" />
        <span className="text-xs font-medium text-slate-300">
          Loading hot deals...
        </span>
      </div>
    );
  }

  if (coupons.length === 0) {
    return null; // Gracefully hide if no active coupons are found
  }

  // Duplicate items to ensure a seamless infinite loop animation
  const tickerItems = [...coupons, ...coupons, ...coupons];

  return (
    <div className="bg-[#1A3C5E] text-white overflow-hidden h-10 md:h-11 z-40 sticky top-[64px] border-b border-white/10 flex items-center select-none w-full">
      {/* Fixed Left Badge */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center bg-[#1A3C5E] pl-3 pr-2 md:pl-4 md:pr-4 z-50 shadow-[10px_0_15px_-3px_rgba(26,60,94,0.9)]">
        <span className="bg-gradient-to-r from-[#FF7A18] to-[#FF3D77] text-white text-[10px] md:text-xs font-black px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          HOT DEALS
        </span>
      </div>

      {/* Scrolling Content Marquee Wrapper */}
      <div className="flex-1 overflow-hidden h-full flex items-center ml-[110px] mr-4 md:ml-[140px] md:mr-[115px]">
        <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused] items-center gap-8">
          {tickerItems.map((coupon, idx) => {
            const discountText =
              coupon.discountType === "percentage"
                ? `${coupon.discountValue}% Off`
                : coupon.discountType === "fixed"
                  ? `₹${coupon.discountValue} Off`
                  : "Freebie";

            const logoUrl = coupon.merchantId?.logo || "/placeholder-brand.png";
            const brandName = coupon.merchantId?.businessName || "Partner";

            return (
              <div
                key={`${coupon._id}-${idx}`}
                className="flex items-center gap-8"
              >
                <Link
                  href={`/deals/${coupon._id}`}
                  className="flex items-center gap-3 hover:text-brand-warning transition-colors group cursor-pointer"
                >
                  {/* Brand Logo */}
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-white/10 flex-shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt={brandName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Brand Name */}
                  <span className="font-bold text-xs md:text-sm text-white group-hover:text-brand-warning transition-colors">
                    {brandName}
                  </span>

                  {/* Offer Snippet */}
                  <span className="text-slate-300 text-xs">{coupon.title}</span>

                  {/* Orange Discount Pill */}
                  <span className="bg-[#FF7A18]/20 border border-[#FF7A18]/50 text-[#FF7A18] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {discountText}
                  </span>

                  {/* Arrow */}
                  <span className="text-slate-400 group-hover:text-brand-warning transition-colors font-bold text-xs">
                    →
                  </span>
                </Link>

                {/* Orange Divider */}
                <span className="h-4 w-[1px] bg-[#FF7A18]/40 self-center" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Right Link */}
      <div className="absolute right-0 top-0 bottom-0 hidden md:flex items-center bg-[#1A3C5E] pr-4 pl-4 z-50 shadow-[-10px_0_15px_-3px_rgba(26,60,94,0.9)]">
        <Link
          href="/deals?filter=featured"
          className="text-[10px] md:text-xs font-black text-brand-blue hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap bg-white/5 border border-white/10 px-3 py-1 rounded-md hover:bg-white/10"
        >
          View All
          <span className="text-sm">→</span>
        </Link>
      </div>
    </div>
  );
}
