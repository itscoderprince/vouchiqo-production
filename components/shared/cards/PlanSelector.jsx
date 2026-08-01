"use client";

import { CheckCircle2, Loader2, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PlanSelector — subscription plan card.
 *
 * @param {object} plan - plan data
 * @param {string} plan.id - unique plan identifier
 * @param {string} plan.name - plan name (e.g. "Growth Partner")
 * @param {string} plan.price - price string (e.g. "₹999/mo")
 * @param {string} [plan.billingNote] - e.g. "Billed annually"
 * @param {string[]} [plan.features] - list of feature strings
 * @param {string[]} [plan.unavailable] - features NOT included (shown as strikethrough)
 * @param {string} [plan.badge] - text for the top badge (e.g. "Most Popular")
 * @param {string} [plan.color="brand-navy"] - accent colour class prefix
 * @param {boolean} [isCurrent=false] - is this the user's current plan
 * @param {boolean} [isRecommended=false] - highlight this card
 * @param {function} [onSelect] - (plan) => void
 * @param {boolean} [loading=false] - show spinner on CTA
 * @param {string} [className]
 */
export default function PlanSelector({
  plan = {},
  isCurrent = false,
  isPaymentCompleted = false,
  isRecommended = false,
  onSelect,
  loading = false,
  className,
}) {
  const {
    name = "Plan",
    price = "—",
    billingNote,
    features = [],
    unavailable = [],
    badge,
  } = plan;

  const isPendingPayment = isCurrent && !isPaymentCompleted;
  const highlight = isRecommended || isCurrent;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 p-5 transition-all duration-200 bg-brand-bg",
        isPendingPayment
          ? "border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]"
          : highlight
            ? "border-brand-navy shadow-lg shadow-brand-navy/10 scale-[1.02]"
            : "border-brand-border hover:border-brand-navy/40 hover:shadow-md",
        className,
      )}
    >
      {/* Top badge */}
      {(badge || isCurrent) && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge
            className={cn(
              "text-[10px] font-bold px-3.5 py-1 rounded-full border-0 shadow-md ring-2 ring-white flex items-center gap-1 shrink-0",
              isCurrent
                ? isPaymentCompleted
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-400 text-amber-950 font-black"
                : "bg-blue-600 text-white",
            )}
          >
            {isCurrent ? (
              isPaymentCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-0.5" />
                  Active Plan
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-0.5 fill-current" />
                  Payment Pending
                </>
              )
            ) : (
              <>
                <Star className="w-3 h-3 mr-0.5 fill-current" />
                {badge}
              </>
            )}
          </Badge>
        </div>
      )}

      {/* Plan name */}
      <h3 className="font-sans text-base font-semibold text-slate-800 mt-2 mb-1">
        {name}
      </h3>

      {/* Price */}
      <div className="mb-4">
        <span className="text-2xl font-semibold text-slate-900">{price}</span>
        {billingNote && (
          <p className="text-xs text-slate-500 mt-0.5">{billingNote}</p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-5 flex-1">
        {features.map((feat, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs text-brand-text"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            {feat}
          </li>
        ))}
        {unavailable.map((feat, i) => (
          <li
            key={`n-${i}`}
            className="flex items-start gap-2 text-xs text-brand-subtext/60 line-through"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-border shrink-0 mt-0.5" />
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {(() => {
        const cleanName = name
          ? name
              .toLowerCase()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "Plan";

        return (
          <Button
            type="button"
            disabled={loading}
            onClick={() => onSelect?.(plan)}
            className={cn(
              "w-full h-10 text-xs sm:text-sm font-sans font-semibold cursor-pointer transition-all",
              isCurrent
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 font-bold"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-none font-semibold",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Processing…
              </>
            ) : isCurrent ? (
              isPaymentCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Current Plan (Renew)
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Pay for {cleanName}
                </>
              )
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Select Plan
              </>
            )}
          </Button>
        );
      })()}
    </div>
  );
}
