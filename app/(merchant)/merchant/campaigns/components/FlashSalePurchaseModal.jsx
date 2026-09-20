"use client";

import {
  ArrowRight,
  BellRing,
  Clock,
  Flame,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FlashSalePurchaseModal({
  isOpen,
  onClose,
  onPurchasedSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleActivatePass = async () => {
    setLoading(true);
    const toastId = toast.loading("Activating your ₹799 Flash Sale Pass...");
    try {
      const res = await fetch("/api/merchants/me/flash-sale-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to activate Flash Sale pass");
      }

      toast.success(
        "🎉 Flash Sale Campaign Pass unlocked! You can now create your Flash Sale campaign.",
        { id: toastId, duration: 5000 },
      );
      onClose();
      if (onPurchasedSuccess) {
        onPurchasedSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Payment activation failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-2xl md:max-w-3xl max-h-[92vh] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-left font-sans shadow-2xl overflow-y-auto text-slate-900">
        {/* Modal Header */}
        <DialogHeader className="pr-8 space-y-2 border-b border-slate-100 pb-4 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs border-0 flex items-center gap-1.5">
              <Flame className="w-3 h-3 animate-pulse" />
              <span>EXCLUSIVE PARTNER SPECIAL</span>
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold text-rose-600 bg-rose-50 border-rose-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            >
              One-Time Promotional Pass
            </Badge>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200/80 px-2.5 py-0.5 rounded-full"
            >
              Save ₹1,700 Today
            </Badge>
          </div>

          <DialogTitle className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            ⚡ Supercharge Your Store Visits With A 24–48hr Flash Sale Campaign!
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed">
            Create urgent buyer FOMO with a live ticking countdown timer, get 5x
            more clicks, and reach active shoppers in your area for a single
            one-time fee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* 3 High-Impact Benefit Cards in Responsive 3-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Benefit 1: Countdown */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-rose-50/70 to-rose-50/20 border border-rose-200/70 hover:border-rose-300 transition-all shadow-2xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    Urgency
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Live Countdown Clock
                </h4>
                <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                  Displays an active ticking clock on shopper deal cards to
                  drive instant buyer conversions.
                </p>
              </div>
            </div>

            {/* Benefit 2: Spotlight */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/70 to-indigo-50/20 border border-indigo-200/70 hover:border-indigo-300 transition-all shadow-2xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    Priority Reach
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  5x Search Spotlight
                </h4>
                <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                  Offers get featured at the top of category feeds and local
                  deal results for top impressions.
                </p>
              </div>
            </div>

            {/* Benefit 3: Local Alert */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-emerald-50/20 border border-emerald-200/70 hover:border-emerald-300 transition-all shadow-2xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Footfall Boost
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Targeted Local Alert
                </h4>
                <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                  Instant notification broadcast to shoppers in your city
                  hunting for dining and retail deals.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Box - Professional Dark Theme with Crisp Icon */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-1">
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                  One-Time Promotional Campaign Pass
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    ₹799
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-normal">
                    ₹2,499
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    68% Off
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-normal">
                  All-inclusive one-time payment. No monthly recurring
                  subscription required.
                </p>
              </div>

              {/* Clean Professional Instant Activation Badge (No AI icons) */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-tight">
                    Instant Activation
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Ready to launch in 60s
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-3 pt-2.5 flex items-center justify-between text-[10px] sm:text-[10.5px] text-slate-400 flex-wrap gap-1">
              <span>* Free merchants can avail 1 Flash Sale campaign pass</span>
              <span className="font-medium text-slate-300">
                ⚡ 24h – 48h Promotional Window
              </span>
            </div>
          </div>

          {/* Primary Action Button using shadcn Button */}
          <div className="space-y-2.5 pt-1">
            <Button
              onClick={handleActivatePass}
              disabled={loading}
              className="w-full bg-[#F72853] hover:bg-[#e01e47] text-white font-bold text-xs sm:text-sm rounded-xl h-11 sm:h-12 shadow-md shadow-[#F72853]/25 cursor-pointer flex items-center justify-center gap-2 transition-all border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Campaign Pass...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹799 &amp; Unlock Flash Sale Campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] pt-0.5 px-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure SSL Payment • Instant Access</span>
              </div>

              <Link
                href="/merchant/billing"
                onClick={onClose}
                className="text-[11px] sm:text-xs font-semibold text-[#F72853] hover:underline flex items-center gap-1"
              >
                <span>Want Unlimited Campaigns? Upgrade Plan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
