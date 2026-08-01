"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AddOnsGrid({ addOns, onOpenAddOn }) {
  return (
    <div className="space-y-3 pt-2 text-left font-sans">
      <div>
        <h3 className="font-sans text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Add-Ons &amp; Promotional Boosts
        </h3>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Purchase individual feature add-on packs anytime without changing your plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {addOns.map((addon) => (
          <div
            key={addon.id}
            className="bg-white border border-slate-200/80 rounded-xl p-3.5 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {addon.name}
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200/70 font-medium text-[10px] py-0 px-2 rounded-md shrink-0 shadow-none"
                >
                  {addon.unit}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                {addon.desc}
              </p>
              <div className="text-sm font-semibold text-slate-900 pt-0.5">
                ₹{addon.price}
              </div>
            </div>

            <Button
              onClick={() => onOpenAddOn(addon)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 w-full text-xs h-8 rounded-lg font-medium cursor-pointer border border-slate-200/80 shadow-none transition-colors"
            >
              Buy Pack — ₹{addon.price}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
