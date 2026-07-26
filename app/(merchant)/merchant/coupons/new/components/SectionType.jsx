"use client";

import { ArrowRight, Gift, Link2, Ticket } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OFFER_TYPES = [
  {
    id: "code",
    name: "Offer with Code",
    icon: Ticket,
    desc: "Customer copies code for online checkout or presents a Smart Code at counter in-store.",
    bestFor:
      "Best for: Restaurants, salons, retail stores, or online checkouts.",
    color: "border-blue-500 bg-blue-50/50 text-blue-950 font-bold",
  },
  {
    id: "deal",
    name: "Deal / Direct Link",
    icon: Link2,
    desc: "No code required. Clicking the deal opens your pre-discounted page directly.",
    bestFor:
      "Best for: E-commerce sites, product sales pages, online bookings.",
    color: "border-blue-600 bg-blue-50/50 text-blue-950 font-bold",
  },
  {
    id: "special",
    name: "Special Offer / Gift",
    icon: Gift,
    desc: "Non-standard format: BOGO, free gift with purchase, free service upgrade, bundle deals.",
    bestFor:
      "Best for: BOGO meals, free treatments, gym trials, package deals.",
    color: "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold",
  },
];

export default function SectionType({ control, setValue, watch, onNext }) {
  const selectedOfferType = useWatch({ control, name: "offerType" }) ?? "code";

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Section 1: Select Offer Type &amp; Model
        </h3>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
          Choose how customers redeem this offer with clear guide instructions.
        </p>
      </div>

      <div className="space-y-3">
        {OFFER_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedOfferType === type.id;
          return (
            <div
              key={type.id}
              onClick={() =>
                setValue("offerType", type.id, { shouldValidate: true })
              }
              className={cn(
                "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5",
                isSelected
                  ? `${type.color} border-blue-600 shadow-xs ring-2 ring-blue-500/20`
                  : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isSelected ? "text-blue-600" : "text-slate-600",
                  )}
                />
                <span className="text-xs font-extrabold text-slate-900">
                  {type.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-6">
                {type.desc}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold block pl-6">
                {type.bestFor}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 py-2 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Continue to Basic Details</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
