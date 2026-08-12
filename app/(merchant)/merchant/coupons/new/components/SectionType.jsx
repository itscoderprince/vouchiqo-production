"use client";

import { ArrowRight, Gift, Link2, Tag, Ticket } from "lucide-react";
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
    bestFor: "Best for: Restaurants, salons, retail stores, or online checkouts.",
    badgeBg: "bg-blue-50 text-blue-600",
    color: "border-blue-600 bg-blue-50/40 text-blue-950",
  },
  {
    id: "deal",
    name: "Deal / Direct Link",
    icon: Link2,
    desc: "No code required. Clicking the deal opens your pre-discounted page directly.",
    bestFor: "Best for: E-commerce sites, product sales pages, online bookings.",
    badgeBg: "bg-teal-50 text-teal-600",
    color: "border-teal-600 bg-teal-50/40 text-teal-950",
  },
  {
    id: "special",
    name: "Special Offer / Gift",
    icon: Gift,
    desc: "Non-standard format: BOGO, free gift with purchase, free service upgrade, bundle deals.",
    bestFor: "Best for: BOGO meals, free treatments, gym trials, package deals.",
    badgeBg: "bg-purple-50 text-purple-600",
    color: "border-purple-600 bg-purple-50/40 text-purple-950",
  },
];

export default function SectionType({ control, setValue, watch, onNext }) {
  const selectedOfferType = useWatch({ control, name: "offerType" }) ?? "code";

  return (
    <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

      <div className="border-b border-slate-100 pb-2.5 pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Tag className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Section 1: Select Offer Type &amp; Model
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Choose how customers redeem this offer with clear guide instructions
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
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
                "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1.5",
                isSelected
                  ? `${type.color} shadow-2xs ring-2 ring-blue-500/20`
                  : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "p-1 rounded-md shrink-0 transition-colors",
                    type.badgeBg,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {type.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-7">
                {type.desc}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold block pl-7">
                {type.bestFor}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-100">
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Continue to Basic Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
