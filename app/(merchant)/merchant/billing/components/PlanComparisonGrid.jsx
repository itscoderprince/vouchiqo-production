"use client";

import { PlanSelector } from "@/components/shared/cards";
import { Switch } from "@/components/ui/switch";

/**
 * PlanComparisonGrid — shows 4 subscription plan cards using PlanSelector.
 * @param {{ plans: object[], currentPlanId: string, billingCycle: string, setBillingCycle: function, onOpenUpgrade: function }} props
 */
export default function PlanComparisonGrid({
  plans,
  currentPlanId,
  billingCycle,
  setBillingCycle,
  onOpenUpgrade,
  isPaymentCompleted = false,
}) {
  return (
    <div className="space-y-4 pt-1 text-left font-sans">
      {/* Header + billing toggle */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-heading text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Plan Comparison (All 4 Launch Tiers)
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Select the best subscription tier for your business scale
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50/90 p-1.5 rounded-xl border border-slate-200/90 shrink-0 shadow-2xs">
          <span
            className={`text-xs font-bold ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-500"}`}
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
            className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-500"}`}
          >
            Annual
            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
              Save 15%
            </span>
          </span>
        </div>
      </div>

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const displayPriceNum =
            billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
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
                billingNote: plan.priceSuffix || `/ ${billingCycle === "yearly" ? "year" : "month"}`,
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
