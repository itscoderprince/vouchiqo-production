"use client";

import { ArrowUpRight, Sparkles, X } from "lucide-react";
import Link from "next/link";

export default function OnboardingCard({
  totalCoupons,
  onboardingDismissed,
  setOnboardingDismissed,
}) {
  if (totalCoupons === undefined || totalCoupons > 0 || onboardingDismissed)
    return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border border-blue-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

      <button
        onClick={() => {
          setOnboardingDismissed(true);
          localStorage.setItem("onboarding_dismissed", "true");
        }}
        className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1"
        title="Dismiss Guide"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-400/20">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Welcome to Vouchiqo Partner Network!
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Let's set up your store and get your first deals live to start
              saving Ranchi shoppers money.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:bg-white/10 transition-colors">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Step 1
              </div>
              <h4 className="text-xs font-bold">Complete Business Profile</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Add details, location coordinates (Marbella prioritized), logo,
                and set your business hours.
              </p>
            </div>
            <Link
              href="/merchant/profile"
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
            >
              <span>Go to Profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:bg-white/10 transition-colors">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Step 2
              </div>
              <h4 className="text-xs font-bold">Verify Plan & Billing</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Upgrade to Pro or Enterprise for unlocked revival limits and
                automatic coupon approvals.
              </p>
            </div>
            <Link
              href="/merchant/billing"
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
            >
              <span>Upgrade Settings</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:bg-white/10 transition-colors">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Step 3
              </div>
              <h4 className="text-xs font-bold">Post Your First Coupon</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Submit your promo code, discount rules, was/now prices, and
                custom target tags.
              </p>
            </div>
            <Link
              href="/merchant/coupons/new"
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
            >
              <span>Create Listing</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
