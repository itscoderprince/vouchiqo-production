"use client";

import { PlanSelector } from "@/components/shared/cards";
import { Switch } from "@/components/ui/switch";

/**
 * PlanComparisonGrid — shows 4 subscription plan cards using PlanSelector.
 * @param {{ plans: object[], currentPlanId: string, billingCycle: string, setBillingCycle: function, onOpenUpgrade: function }} props
 */
export default function PlanComparisonGrid({
  plans = [],
  currentPlanId,
  billingCycle,
  setBillingCycle,
  onOpenUpgrade,
  isPaymentCompleted = false,
  isLoading = false,
}) {
  return (
    <div className="space-y-4 pt-1 text-left font-sans">
      {/* Header + billing toggle */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-sans text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Plan Comparison (All 4 Launch Tiers)
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Select the best subscription tier for your business scale
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50/80 p-1.5 rounded-lg border border-slate-200/80 shrink-0">
          <span
            className={`text-xs font-medium ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-500"}`}
          >
            Monthly
          </span>
          <Switch
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) =>
              setBillingCycle(checked ? "yearly" : "monthly")
            }
          />
          <span
            className={`text-xs font-medium flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-500"}`}
          >
            Annual
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
              Save 15%
            </span>
          </span>
        </div>
      </div>

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading || !plans || plans.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Badge skeleton */}
                  <div className="h-5 bg-slate-100 rounded-full w-24 mx-auto"></div>
                  {/* Title skeleton */}
                  <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                  {/* Price skeleton */}
                  <div className="h-8 bg-slate-300 rounded-md w-1/2"></div>
                  {/* Billing note skeleton */}
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>

                  {/* Feature list skeleton */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button skeleton */}
                <div className="h-10 bg-slate-200 rounded-xl w-full mt-4"></div>
              </div>
            ))
          : plans.map((plan) => {
              const displayPriceNum =
                billingCycle === "yearly"
                  ? plan.priceYearly
                  : plan.priceMonthly;
              const displayPriceStr =
                typeof displayPriceNum === "number" && displayPriceNum > 0
                  ? `₹${displayPriceNum.toLocaleString("en-IN")}`
                  : plan.priceText || (displayPriceNum === 0 ? "₹0" : "—");

              return (
                <PlanSelector
                  key={plan.id}
                  plan={{
                    ...plan,
                    price: displayPriceStr,
                    billingNote:
                      plan.priceSuffix ||
                      `/ ${billingCycle === "yearly" ? "year" : "month"}`,
                    badge:
                      plan.badge ||
                      (plan.popular
                        ? "Most Popular"
                        : plan.bestValue
                          ? "Best Value"
                          : undefined),
                  }}
                  isCurrent={currentPlanId === plan.id}
                  isPaymentCompleted={isPaymentCompleted}
                  isRecommended={plan.popular}
                  onSelect={onOpenUpgrade}
                />
              );
            })}
      </div>
    </div>
  );
}
