"use client";

import { CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CurrentPlanCard({
  merchant,
  currentPlanId,
  plans,
  billingCycle,
  planExpiry,
  revivalCredits,
  activeListingsCount,
  planListingsLimit,
  campaignsUsedCount,
  planCampaignsLimit,
  onOpenUpgrade,
}) {
  const isPaymentCompleted =
    merchant?.paymentStatus === "completed" ||
    merchant?.subscriptionStatus === "active" ||
    (merchant?.planExpiry && new Date(merchant.planExpiry).getTime() > Date.now());
  const currentPlanObj =
    plans.find((p) => p.id === currentPlanId) ||
    plans.find((p) => p.id === "growth") ||
    plans[0];

  const expiryDate = planExpiry ? new Date(planExpiry) : null;

  const [countdownStr, setCountdownStr] = useState("");

  useEffect(() => {
    if (!expiryDate) return;
    const updateCountdown = () => {
      const diff = expiryDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr("Plan Expired");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(`${days}d ${hours}h ${mins}m ${secs}s remaining`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [planExpiry]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-2xs space-y-4 text-left font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading text-base font-extrabold text-slate-900 capitalize">
                Current Plan: {currentPlanObj?.name}
              </h3>
              <Badge
                className={
                  isPaymentCompleted
                    ? "bg-emerald-600 text-white rounded-full border-0 font-bold text-[9px] py-0.5 px-2.5 uppercase shadow-xs flex items-center gap-1"
                    : "bg-amber-100 text-amber-900 rounded-full border-0 font-black text-[9px] py-0.5 px-2 uppercase"
                }
              >
                {isPaymentCompleted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-white" /> Active Subscription
                  </>
                ) : (
                  "Payment Pending"
                )}
              </Badge>
              {isPaymentCompleted && countdownStr && (
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" /> {countdownStr}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Billing Cycle: <strong>{billingCycle.toUpperCase()}</strong> •
              Next Renewal:{" "}
              <strong>
                {planExpiry
                  ? new Date(planExpiry).toLocaleDateString("en-IN")
                  : "Aug 21, 2026"}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {!isPaymentCompleted ? (
            <Button
              onClick={() => onOpenUpgrade(currentPlanObj)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 font-extrabold rounded-xl cursor-pointer shadow-md shadow-emerald-500/20 border-0 flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Subscription Now →
            </Button>
          ) : (
            <Button
              onClick={() =>
                onOpenUpgrade(plans.find((p) => p.id === "pro") || plans[2])
              }
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 font-bold rounded-xl cursor-pointer shadow-md shadow-blue-500/20 border-0"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Usage Bars: Listings, Campaigns & Revivals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-0.5">
        {/* 1. Active Listings Usage */}
        <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex justify-between text-[11px] font-bold text-slate-800">
            <span>Active Listings Used</span>
            <span>
              {activeListingsCount} /{" "}
              {planListingsLimit === 999 ? "∞" : planListingsLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all"
              style={{
                width: `${planListingsLimit === 999 ? 20 : Math.min(100, (activeListingsCount / planListingsLimit) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {planListingsLimit === 999
              ? "Unlimited listings available"
              : `${planListingsLimit - activeListingsCount} remaining on this plan`}
          </span>
        </div>

        {/* 2. Active Campaigns Usage */}
        <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex justify-between text-[11px] font-bold text-slate-800">
            <span>Simultaneous Campaigns</span>
            <span>
              {campaignsUsedCount} /{" "}
              {planCampaignsLimit === 0 ? "Add-on" : planCampaignsLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${planCampaignsLimit === 0 ? 0 : Math.min(100, (campaignsUsedCount / planCampaignsLimit) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {planCampaignsLimit === 0
              ? "Upgrade to Growth/Pro to launch campaigns"
              : `${planCampaignsLimit - campaignsUsedCount} active slot available`}
          </span>
        </div>

        {/* 3. Expired Revival Credits */}
        <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex justify-between text-[11px] font-bold text-slate-800">
            <span>Revival Credits Balance</span>
            <span>{revivalCredits} Credits</span>
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (revivalCredits / 50) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Buy Revival Pack add-on (+25 credits for ₹499)
          </span>
        </div>
      </div>
    </div>
  );
}
