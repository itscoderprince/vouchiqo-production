"use client";

import { CheckCircle2, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CouponCard({
  coupon,
  onRedeem,
  isLocal = false,
  isMarbellaLocal = false,
}) {
  const {
    _id,
    title,
    discountValue,
    discountType,
    description,
    merchantId,
    successRate = 98,
    isMerchantVerified = true,
    isVouchiqoVerified = true,
    workedToday = true,
    expiresAt,
  } = coupon;

  const discountFormatted =
    discountType === "percentage"
      ? `${discountValue}% OFF`
      : `₹${discountValue} OFF`;

  const isExpiringSoon = expiresAt
    ? new Date(expiresAt) - Date.now() < 86400000 * 2 // Less than 2 days
    : false;

  const merchantName = merchantId?.businessName || merchantId?.name;

  const isHotOrFeatured = coupon.isHot || coupon.isFeatured;

  return (
    <div
      className={`relative bg-brand-bg border border-brand-border rounded-lg shadow-sm overflow-hidden flex flex-col justify-between h-full group coupon-card-interactive ${isHotOrFeatured ? "coupon-card-hot" : ""}`}
    >
      {/* Top Section */}
      <Link
        href={`/deals/${_id}`}
        className="p-5 flex-1 block hover:no-underline cursor-pointer"
      >
        {/* Badges Container */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {isVouchiqoVerified && (
            <Badge className="bg-brand-success/10 text-brand-success hover:bg-brand-success/15 border-0 shadow-none px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Vouchiqo Verified</span>
            </Badge>
          )}
          {isMerchantVerified && (
            <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15 border-0 shadow-none px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Merchant Verified</span>
            </Badge>
          )}
          {isLocal && (
            <Badge className="bg-orange-500/10 text-[#FF7A18] hover:bg-orange-500/15 border border-[#FF7A18]/20 shadow-none px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <span>🔴 Local Deal</span>
            </Badge>
          )}
          {isMarbellaLocal && (
            <Badge className="bg-[#FFB020]/10 text-brand-text hover:bg-[#FFB020]/15 border border-[#FFB020]/20 shadow-none px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <span>💼 Local Business</span>
            </Badge>
          )}
        </div>

        {/* Merchant Brand Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-[10px] text-brand-navy">
            {merchantName ? merchantName[0] : "M"}
          </div>
          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
            {merchantName || "Premium Partner"}
          </span>
        </div>

        {/* Title / Discount */}
        <h3 className="font-heading text-lg font-bold text-brand-text mb-1 group-hover:text-brand-blue transition-colors">
          {discountFormatted}
        </h3>
        <p className="text-sm font-semibold text-brand-text mb-1 leading-tight line-clamp-1">
          {title}
        </p>
        <p className="text-xs text-brand-subtext line-clamp-2 leading-relaxed">
          {description ||
            "No description provided. Terms and conditions apply."}
        </p>
      </Link>

      {/* Ticket Cutout Divider Bar */}
      <div className="relative w-full my-2">
        {/* Left Cutout */}
        <div className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-brand-surface border border-brand-border z-10"></div>
        {/* Right Cutout */}
        <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-brand-surface border border-brand-border z-10"></div>
        {/* Dashed Line */}
        <div className="border-t-2 border-dashed border-brand-border w-full"></div>
      </div>

      {/* Bottom Section */}
      <div className="p-5 bg-brand-surface/50">
        <div className="flex items-center justify-between mb-3.5">
          {/* Success Rate */}
          <Badge className="bg-brand-success/5 text-brand-success hover:bg-brand-success/10 border-0 shadow-none px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{successRate}% Success</span>
          </Badge>

          {/* worked today / expiring */}
          {isExpiringSoon ? (
            <span className="text-[10px] font-bold text-brand-error flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Expiring Soon</span>
            </span>
          ) : workedToday ? (
            <Badge className="bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/15 border-0 shadow-none px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>Worked Today</span>
            </Badge>
          ) : null}
        </div>

        {/* CTA Button */}
        {onRedeem ? (
          <Button
            onClick={() => onRedeem(coupon)}
            className="btn-primary w-full text-xs py-2 shadow-none border-0 h-auto cursor-pointer"
          >
            Claim Voucher
          </Button>
        ) : (
          <Button
            asChild
            className="btn-primary w-full text-xs py-2 shadow-none border-0 h-auto cursor-pointer text-center justify-center"
          >
            <Link href={`/deals/${_id}`}>View Offer</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
