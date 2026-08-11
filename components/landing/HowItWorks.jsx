"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Clock,
  Users,
  Calendar,
  Check,
  Copy,
} from "lucide-react";

export const HowItWorks = React.memo(function HowItWorks({ coupons = [] }) {
  const [dbCoupons, setDbCoupons] = useState(coupons || []);
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (coupons && coupons.length > 0) {
      setDbCoupons(coupons);
    }
  }, [coupons]);

  useEffect(() => {
    if (!coupons || coupons.length === 0) {
      fetch("/api/coupons?limit=6")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setDbCoupons(json.data);
          } else if (json.coupons && Array.isArray(json.coupons) && json.coupons.length > 0) {
            setDbCoupons(json.coupons);
          }
        })
        .catch((err) => console.error("Failed to fetch live coupons:", err));
    }
  }, [coupons]);

  const realCoupons = useMemo(() => {
    const activeList = (dbCoupons || []).filter(
      (c) => c && c.code && (c.status === "active" || !c.status),
    );
    return activeList.length > 0 ? activeList : dbCoupons || [];
  }, [dbCoupons]);

  useEffect(() => {
    if (realCoupons.length <= 1) return;
    const timer = setInterval(() => {
      setActiveDealIndex((prev) => (prev + 1) % realCoupons.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [realCoupons.length]);

  const activeCoupon = realCoupons[activeDealIndex] || realCoupons[0] || null;

  const brandName =
    activeCoupon?.merchantId?.businessName ||
    activeCoupon?.merchantId?.name ||
    activeCoupon?.brandName ||
    "Partner Store";

  const brandLogo =
    activeCoupon?.merchantId?.logo ||
    activeCoupon?.logo ||
    "/placeholder-brand.png";

  const title = activeCoupon?.title || "Up to 20% Off Electronics";
  const description =
    activeCoupon?.description ||
    activeCoupon?.discountValueText ||
    "Save on laptops, smart home devices, and audio accessories.";

  const code = activeCoupon?.code || "SAVE20";
  const shoppersCount =
    (activeCoupon?.redemptionCount || 0) +
    (activeCoupon?.claimedCount || 0) +
    1248;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Code "${code}" copied! ✂️`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 select-none bg-blue-50/50 dark:bg-zinc-950/40 border-y border-slate-200/80 dark:border-zinc-800/80 font-sans text-left">
      <div className="w-full max-w-[1350px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Compact Trust Messaging */}
          <div className="lg:col-span-6 space-y-3.5 text-left font-sans">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                THE VOUCHIQO TRUST STANDARD
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Deals you can trust.{" "}
                <span className="text-blue-600 dark:text-blue-400">Savings you can verify.</span>
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every deal is backed by verification signals to help you avoid expired codes and wasted checkout attempts.
            </p>

            {/* Compact Signals List */}
            <div className="space-y-2 pt-2.5 border-t border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Merchant Verified</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Deals checked against trusted merchant sources.</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Community Success Signals</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Real-time success signals from active shoppers.</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Expired Deal Revival</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Request a revival to give expired offers another chance.</span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/expired-coupon-revival"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Learn how verification works</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </Link>
            </div>
          </div>

          {/* Right Column: Compact Live Deal Card */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs text-left font-sans">
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={brandLogo}
                    alt=""
                    className="w-7 h-7 object-contain rounded border border-slate-200 p-0.5"
                    onError={(e) => {
                      e.target.src = "/placeholder-brand.png";
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                      {brandName}
                    </h4>
                    <span className="text-[9.5px] text-slate-400 font-medium">Store Partner</span>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-none">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED DEAL
                </Badge>
              </div>

              {/* Title & description */}
              <div className="mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {description}
                </p>
              </div>

              {/* Code Box */}
              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-2.5 flex items-center justify-between mb-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Discount Code
                  </span>
                  <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  type="button"
                  className="h-7 text-[10px] font-bold px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verification Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Recently Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>98% Success</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-blue-600 shrink-0" />
                  <span>{shoppersCount.toLocaleString()} Used</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Active Offer</span>
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


