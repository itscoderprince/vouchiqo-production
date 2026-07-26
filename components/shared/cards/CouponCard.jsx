"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function CouponCard({
  coupon,
  onRedeem,
  isLocal = false,
  isMarbellaLocal = false,
  source = "category",
}) {
  const {
    _id,
    title,
    discountValue,
    discountType,
    description,
    merchantId,
    expiresAt,
  } = coupon;

  const cardRef = useRef(null);
  const track = useTrackEvent();
  const trackedImpression = useRef(false);

  const mId = typeof merchantId === "object" ? merchantId?._id : merchantId;
  const merchantName = typeof merchantId === "object" ? merchantId?.businessName : undefined;

  useEffect(() => {
    if (!cardRef.current || trackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !trackedImpression.current) {
            trackedImpression.current = true;
            track("impression", { couponId: _id, merchantId: mId, source });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [_id, mId, source, track]);

  const handleCardClick = () => {
    track("click", { couponId: _id, merchantId: mId, source });
  };

  const discountFormatted =
    discountType === "percentage"
      ? `${discountValue}% OFF`
      : `₹${discountValue} OFF`;

  const isExpiringSoon = expiresAt
    ? new Date(expiresAt) - Date.now() < 86400000 * 2 // Less than 2 days
    : false;

  const isHotOrFeatured = coupon.isHot || coupon.isFeatured;

  return (
    <div
      ref={cardRef}
      className={`relative bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between h-full group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${isHotOrFeatured ? "ring-1 ring-blue-400" : ""}`}
    >
      {/* Top Section */}
      <Link
        href={`/deals/${_id}`}
        onClick={handleCardClick}
        className="p-3.5 flex-1 block hover:no-underline cursor-pointer"
      >
        {/* Merchant Brand Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[11px] text-blue-600">
            {merchantName ? merchantName[0].toUpperCase() : "M"}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {merchantName || "Premium Partner"}
          </span>
        </div>

        {/* Discount Value */}
        <h3 className="text-lg font-bold text-slate-800 mb-0.5 group-hover:text-blue-600 transition-colors">
          {discountFormatted}
        </h3>
        <p className="text-xs font-medium text-slate-700 mb-1.5 leading-snug line-clamp-1">
          {title}
        </p>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {description ||
            "No description provided. Terms and conditions apply."}
        </p>
      </Link>

      {/* Ticket Cutout Divider */}
      <div className="relative w-full my-0.5">
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border border-slate-100 z-10" />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border border-slate-100 z-10" />
        <div className="border-t border-dashed border-slate-200 w-full" />
      </div>

      {/* Bottom Section */}
      <div className="p-3.5 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Active Today</span>
          </span>
          {isExpiringSoon && (
            <span className="text-[10px] font-medium text-red-500 flex items-center gap-1 select-none">
              <ShieldAlert className="w-3 h-3" />
              <span>Expiring Soon</span>
            </span>
          )}
        </div>
        {onRedeem ? (
          <Button
            onClick={() => {
              handleCardClick();
              onRedeem(coupon);
            }}
            className="w-full text-xs py-2 rounded-lg shadow-none border-0 h-auto cursor-pointer font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Claim Offer
          </Button>
        ) : (
          <Button
            asChild
            onClick={handleCardClick}
            className="w-full text-xs py-2 rounded-lg shadow-none border-0 h-auto cursor-pointer text-center justify-center font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Link href={`/deals/${_id}`}>View Offer</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
