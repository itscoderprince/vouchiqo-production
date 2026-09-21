"use client";

import React from "react";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPARISON_CATEGORIES = [
  {
    category: "Listings & Store Redemption",
    features: [
      {
        name: "Active Offer Listings",
        desc: "Simultaneously published active verified deals",
        starter: { included: true, text: "Up to 3 listings" },
        growth: { included: true, text: "Up to 15 listings" },
        pro: { included: true, text: "Unlimited listings" },
        enterprise: { included: true, text: "Unlimited (multi-location)" },
      },
      {
        name: "Counter Smart Code & QR Validation",
        desc: "Instant customer redemption check at checkout",
        starter: { included: true, text: "Included" },
        growth: { included: true, text: "Included" },
        pro: { included: true, text: "Included" },
        enterprise: { included: true, text: "Included" },
      },
      {
        name: "Vouchiqo Verified Merchant Badge",
        desc: "Official verified merchant trust seal",
        starter: { included: true, text: "Standard badge" },
        growth: { included: true, text: "Founding badge" },
        pro: { included: true, text: "Founding badge" },
        enterprise: { included: true, text: "Enterprise badge" },
      },
      {
        name: "Category Page Ranking",
        desc: "Listing priority when customers browse categories",
        starter: { included: true, text: "Standard listing" },
        growth: { included: true, text: "Priority ranking" },
        pro: { included: true, text: "Top category spotlight" },
        enterprise: { included: true, text: "Platform-wide premium" },
      },
    ],
  },
  {
    category: "Marketing & Promotions",
    features: [
      {
        name: "Platform Promotional Campaigns",
        desc: "Featured festival and high-intent marketing pushes",
        starter: { included: false, text: "Not included" },
        growth: { included: true, text: "4 campaigns / yr" },
        pro: { included: true, text: "Unlimited (no cap)" },
        enterprise: { included: true, text: "Unlimited custom" },
      },
      {
        name: "Expired Offer Customer Revivals",
        desc: "Re-engage shoppers who saved past expired coupons",
        starter: { included: false, text: "Not included" },
        growth: { included: true, text: "5 revivals / mo" },
        pro: { included: true, text: "50 revivals / mo" },
        enterprise: { included: true, text: "Unlimited revivals" },
      },
      {
        name: "Targeted Customer Push Notifications",
        desc: "Direct push messages to local customer segments",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: true, text: "Custom push notifications" },
        enterprise: { included: true, text: "Priority broadcasts" },
      },
    ],
  },
  {
    category: "Analytics & Merchant Dashboard",
    features: [
      {
        name: "Merchant Analytics Dashboard",
        desc: "Real-time views, codes, conversions, and rank",
        starter: { included: true, text: "Basic views & codes" },
        growth: { included: true, text: "Redemptions & category rank" },
        pro: { included: true, text: "Deep revenue & heatmaps" },
        enterprise: { included: true, text: "Multi-store BI & custom reports" },
      },
      {
        name: "Commission Rate Guarantee",
        desc: "Locked performance commission protection",
        starter: { included: true, text: "Standard CPA rate" },
        growth: { included: true, text: "12-month rate lock" },
        pro: { included: true, text: "12-month rate lock" },
        enterprise: { included: true, text: "10% Founding discount" },
      },
    ],
  },
  {
    category: "Enterprise Integrations & Support",
    features: [
      {
        name: "Direct POS & CRM API Access",
        desc: "Direct webhook and REST integration with retail POS",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: false, text: "Not included" },
        enterprise: { included: true, text: "Direct POS & API" },
      },
      {
        name: "Multi-Location Central Dashboard",
        desc: "Manage multiple retail branches under one account",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: false, text: "Not included" },
        enterprise: { included: true, text: "Unlimited locations" },
      },
      {
        name: "Dedicated Named Account Manager",
        desc: "Dedicated personal strategic campaign advisor",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: false, text: "Not included" },
        enterprise: { included: true, text: "Named Account Manager" },
      },
      {
        name: "Customer Support & SLA",
        desc: "Response time and resolution commitment",
        starter: { included: false, text: "Community FAQ" },
        growth: { included: true, text: "Standard 48h email" },
        pro: { included: true, text: "Priority 24h support" },
        enterprise: { included: true, text: "Custom SLA & hotline" },
      },
    ],
  },
];

const PLAN_COLUMNS = [
  { id: "starter", name: "Starter Free", price: "₹0", sub: "/ month free forever" },
  { id: "growth", name: "Growth Partner", price: "₹999", sub: "/ month" },
  { id: "pro", name: "Pro Partner", price: "₹2,499", sub: "/ month" },
  { id: "enterprise", name: "Enterprise", price: "Custom pricing", sub: "/ month" },
];

export default function PlanComparisonTable({
  currentPlanId = "starter",
  onSelectPlan,
  plans = [],
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans min-w-[760px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="py-4 px-4 sm:px-5 w-1/3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Plan Features &amp; Capabilities
              </th>
              {PLAN_COLUMNS.map((col) => {
                const isCurrent = currentPlanId === col.id;
                const isPopular = col.id === "growth";
                const isBestValue = col.id === "pro";

                return (
                  <th
                    key={col.id}
                    className={cn(
                      "py-4 px-3 sm:px-4 text-center align-top min-w-[150px] transition-colors",
                      isCurrent && "bg-blue-50/40",
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                        {col.name}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 mt-0.5">
                        {col.price}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {col.sub}
                      </span>
                      {isCurrent && (
                        <span className="mt-1 bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                          Active Plan
                        </span>
                      )}
                      {!isCurrent && (isPopular || isBestValue) && (
                        <span
                          className={cn(
                            "mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full",
                            isPopular
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800",
                          )}
                        >
                          {isPopular ? "Popular" : "Best Value"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {COMPARISON_CATEGORIES.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Category Row */}
                <tr className="bg-slate-100/75 border-y border-slate-200/90">
                  <td
                    colSpan={5}
                    className="py-2.5 px-4 sm:px-5 text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
                  >
                    {cat.category}
                  </td>
                </tr>

                {/* Feature Rows */}
                {cat.features.map((feat, fIdx) => (
                  <tr
                    key={fIdx}
                    className={cn(
                      "border-b border-slate-100 hover:bg-slate-50/60 transition-colors",
                      fIdx % 2 === 1 ? "bg-slate-50/25" : "bg-white",
                    )}
                  >
                    {/* Feature Description */}
                    <td className="py-3 px-4 sm:px-5 align-middle">
                      <div className="font-semibold text-xs text-slate-800 leading-snug">
                        {feat.name}
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-normal leading-snug mt-0.5">
                        {feat.desc}
                      </div>
                    </td>

                    {/* Tier Cells */}
                    {["starter", "growth", "pro", "enterprise"].map((tierId) => {
                      const tierData = feat[tierId];
                      const isIncluded = tierData.included;
                      const isCurrent = currentPlanId === tierId;

                      return (
                        <td
                          key={tierId}
                          className={cn(
                            "py-3 px-2 sm:px-3 text-center align-middle transition-colors",
                            isCurrent && "bg-blue-50/20",
                          )}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            {isIncluded ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 flex items-center justify-center shrink-0 shadow-2xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                                <X className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[11px] leading-tight text-center max-w-[130px]",
                                isIncluded
                                  ? "text-slate-700 font-medium"
                                  : "text-slate-400 font-normal line-through decoration-slate-300",
                              )}
                            >
                              {tierData.text}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Bottom Actions Row */}
            <tr className="border-t-2 border-slate-200 bg-slate-50/60">
              <td className="py-4 px-4 sm:px-5 font-bold text-xs text-slate-700 uppercase tracking-wider">
                Select Subscription Tier
              </td>
              {PLAN_COLUMNS.map((col) => {
                const isCurrent = currentPlanId === col.id;
                const isStarter = col.id === "starter";
                const matchingPlan = plans.find((p) => p.id === col.id) || { id: col.id, name: col.name };

                return (
                  <td key={col.id} className="py-4 px-3 text-center align-middle">
                    <Button
                      size="sm"
                      disabled={isCurrent && isStarter}
                      onClick={() => onSelectPlan?.(matchingPlan)}
                      className={cn(
                        "w-full h-8 text-xs font-bold rounded-lg cursor-pointer transition-all",
                        isCurrent
                          ? isStarter
                            ? "bg-slate-700 text-white cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : col.id === "pro"
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                            : "bg-slate-900 hover:bg-slate-800 text-white",
                      )}
                    >
                      {isCurrent
                        ? isStarter
                          ? "Active Plan"
                          : "Renew Plan"
                        : "Select Plan"}
                    </Button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
