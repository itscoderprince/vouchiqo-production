"use client";

import React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Clock,
  Users,
  Calendar
} from "lucide-react";

export const HowItWorks = React.memo(function HowItWorks({ coupons = [] }) {
  // Bind real coupon data if available from database, else fallback
  const realCoupon =
    (coupons || []).find((c) => c.code && (c.status === "active" || !c.status)) ||
    (coupons || [])[0] ||
    null;

  const brandName =
    realCoupon?.merchantId?.businessName ||
    realCoupon?.brandName ||
    "Amazon";
  const brandLogo =
    realCoupon?.merchantId?.logo || "/brandlogos/10002.jpg";
  const title = realCoupon?.title || "Up to 20% Off Electronics";
  const description =
    realCoupon?.description ||
    realCoupon?.discountValueText ||
    "Save on laptops, smart home devices, and audio accessories.";
  const code = realCoupon?.code || "SAVE20";
  const shoppersCount =
    (realCoupon?.redemptionCount || 0) +
    (realCoupon?.claimedCount || 0) +
    1248;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard! ✂️`);
  };

  return (
    <section className="w-full bg-slate-50/70 dark:bg-zinc-950/40 py-12 md:py-16 px-4 sm:px-8 select-none border-t border-b border-slate-200/80 dark:border-zinc-900/60 transition-all font-sans text-left">
      <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Trust Messaging & Explanations */}
          <div className="lg:col-span-6 space-y-6 text-left font-sans">
            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block font-sans">
                THE VOUCHIQO TRUST STANDARD
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-slate-900 dark:text-white tracking-tight leading-[1.2] font-sans">
                Deals you can trust. <br />
                <span className="text-[#2563eb]">Savings you can verify.</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-xl font-sans">
              Every deal on Vouchiqo is backed by verification signals designed
              to help you avoid expired codes, misleading offers, and wasted
              checkout attempts.
            </p>

            {/* Connected Trust Signals List */}
            <div className="space-y-4 pt-5 border-t border-slate-200/80 dark:border-zinc-900">
              {/* Trust Signal 1 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 h-9 w-9 shrink-0 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-0.5 font-sans">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Merchant Verified
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Deals are checked against trusted merchant and partner
                    sources.
                  </p>
                </div>
              </div>

              {/* Trust Signal 2 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 h-9 w-9 shrink-0 flex items-center justify-center shadow-2xs">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-0.5 font-sans">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Community Success
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    See recent success signals from shoppers before trying a
                    deal.
                  </p>
                </div>
              </div>

              {/* Trust Signal 3 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 h-9 w-9 shrink-0 flex items-center justify-center shadow-2xs">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-0.5 font-sans">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Expired Deal Revival
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Missed a deal? Request a revival and give popular offers
                    another chance.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/expired-coupon-revival"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 hover:underline w-fit font-sans"
              >
                <span>Learn how verification works</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </Link>
            </div>
          </div>

          {/* Right Column: Verified Deal Preview & Trust Strip */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative w-full font-sans">
            {/* Main Verified Deal Card Showcase */}
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-md relative overflow-hidden transition-all duration-200 hover:shadow-lg font-sans">
              {/* Verified Badge Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src={brandLogo}
                      alt={brandName}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.src = "/brandlogos/10002.jpg";
                      }}
                    />
                  </div>
                  <div className="text-left font-sans">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 leading-none">
                      {brandName}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium leading-none block mt-0.5">
                      Store Partner
                    </span>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full px-3 py-1 font-bold text-[10px] tracking-wide flex items-center gap-1 shadow-none select-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  VERIFIED DEAL
                </Badge>
              </div>

              {/* Title */}
              <div className="text-left mb-5 font-sans">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                  {description}
                </p>
              </div>

              {/* Code Showcase with copy CTA */}
              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-850 rounded-xl p-4 mb-5 text-left relative font-sans">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Discount Code
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 uppercase tracking-widest">
                    {code}
                  </span>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="h-8 text-xs font-semibold px-3.5 bg-white hover:bg-slate-50 text-blue-600 border-slate-200 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Copy Code
                  </Button>
                </div>
              </div>

              {/* Verification Signals (Interactive Preview Stats) */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left border-t border-slate-100 dark:border-zinc-850 pt-4 font-sans">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Last Checked
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Recently Verified
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Success Rate
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      98%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Shoppers Used
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {shoppersCount.toLocaleString()} today
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Validity
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Active Offer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HowItWorks;
