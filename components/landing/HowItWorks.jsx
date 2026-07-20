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

export const HowItWorks = React.memo(function HowItWorks() {
  const handleCopyCode = () => {
    navigator.clipboard.writeText("SAVE20");
    toast.success("Code copied to clipboard! ✂️");
  };

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto w-full select-none border-t border-b border-slate-100 dark:border-zinc-900/60 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Trust Messaging & Explanations (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
              THE VOUCHIQO TRUST STANDARD
            </span>
            <h2 className="text-3xl md:text-[38px] font-black text-[#0A2E6E] dark:text-white tracking-tight leading-[1.2]">
              Deals you can trust. <br />
              <span className="text-[#2563eb]">Savings you can verify.</span>
            </h2>
          </div>
          
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium max-w-md">
            Every deal on Vouchiqo is backed by verification signals designed to help you avoid expired codes, misleading offers, and wasted checkout attempts.
          </p>
          
          {/* Connected Trust Signals List */}
          <div className="space-y-4 pt-5 border-t border-slate-150/60 dark:border-zinc-900">
            
            {/* Trust Signal 1 */}
            <div className="flex gap-3">
              <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 text-[#2563eb] rounded-xl border border-blue-100/30 h-9 w-9 shrink-0 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Merchant Verified
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  Deals are checked against trusted merchant and partner sources.
                </p>
              </div>
            </div>

            {/* Trust Signal 2 */}
            <div className="flex gap-3">
              <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 text-[#2563eb] rounded-xl border border-blue-100/30 h-9 w-9 shrink-0 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Community Success
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  See recent success signals from shoppers before trying a deal.
                </p>
              </div>
            </div>

            {/* Trust Signal 3 */}
            <div className="flex gap-3">
              <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 text-[#2563eb] rounded-xl border border-blue-100/30 h-9 w-9 shrink-0 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Expired Deal Revival
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  Missed a deal? Request a revival and give popular offers another chance.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-2">
            <Link
              href="/expired-coupon-revival"
              className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors flex items-center gap-1 hover:underline w-fit"
            >
              <span>Learn how verification works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Verified Deal Preview & Trust Strip (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative w-full">
          
          {/* Main Verified Deal Card Showcase */}
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/85 rounded-3xl p-6 shadow-md relative overflow-hidden transition-all duration-200 hover:shadow-lg">
            
            {/* Verified Badge Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {/* Amazon placeholder or Logo */}
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                  AMZN
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-none">Amazon</h4>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold leading-none">Store Partner</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 rounded-full px-2.5 py-0.5 font-bold text-[9px] tracking-wide flex items-center gap-1 shadow-none select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                VERIFIED DEAL
              </Badge>
            </div>

            {/* Title */}
            <div className="text-left mb-5">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                Up to 20% Off Electronics
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                Save on laptops, smart home devices, and audio accessories.
              </p>
            </div>

            {/* Code Showcase with copy CTA */}
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-2xl p-4 mb-5 text-left relative">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Discount Code
              </span>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-mono text-sm font-black text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
                  SAVE20
                </span>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="h-8 text-xs font-semibold px-3 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-[#2563eb] rounded-lg shadow-none shrink-0"
                >
                  Copy Code
                </Button>
              </div>
            </div>

            {/* Verification Signals (Interactive Preview Stats) */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-left border-t border-slate-100 dark:border-zinc-850 pt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none uppercase tracking-wide">Last Checked</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">12 mins ago</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none uppercase tracking-wide">Success Rate</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">92%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none uppercase tracking-wide">Shoppers Used</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">1,248 today</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-500 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none uppercase tracking-wide">Validity</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Expires in 2 days</span>
                </div>
              </div>
            </div>

          </div>

          {/* Thin Horizontal Trust Strip below the preview card */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-8 border-t border-slate-150/60 dark:border-zinc-900 pt-5 w-full max-w-md select-none">
            <span>Merchant Verified</span>
            <span className="text-slate-200 dark:text-zinc-800 font-normal select-none">•</span>
            <span>Recently Checked</span>
            <span className="text-slate-200 dark:text-zinc-800 font-normal select-none">•</span>
            <span>Community Tested</span>
            <span className="text-slate-200 dark:text-zinc-800 font-normal select-none">•</span>
            <span>Revival Eligible</span>
          </div>

        </div>

      </div>
    </section>
  );
});

export default HowItWorks;
