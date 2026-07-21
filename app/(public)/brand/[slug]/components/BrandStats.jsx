"use client";

import { Percent, Store, Tag, Utensils } from "lucide-react";

export default function BrandStats({ coupons, merchant }) {
  const pctArr = coupons
    .filter((c) => c.discountType === "percentage" && c.discountValue)
    .map((c) => c.discountValue);
  const fixedArr = coupons
    .filter((c) => c.discountType === "fixed" && c.discountValue)
    .map((c) => c.discountValue);
  const hasFreebie = coupons.some((c) => c.discountType === "freebie");

  let discountLabel = "See Deals";
  if (pctArr.length > 0) {
    discountLabel = `Up to ${Math.max(...pctArr)}%`;
  } else if (fixedArr.length > 0) {
    discountLabel = `Up to ₹${Math.max(...fixedArr)}`;
  } else if (hasFreebie) {
    discountLabel = "Freebies";
  }

  const stats = [
    {
      label: "Active Deals",
      value: `${coupons.length}`,
      Icon: Tag,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50/80",
    },
    {
      label: "Best Discount",
      value: discountLabel,
      Icon: Percent,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50/80",
    },
    {
      label: "Channel",
      value: merchant.businessType || "Physical",
      Icon: Store,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50/80",
    },
    {
      label: "Category",
      value: merchant.category || "Food",
      Icon: Utensils,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50/80",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      {stats.map((s) => {
        const IconComp = s.Icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 text-left shadow-2xs hover:shadow-xs transition-all hover:border-slate-300 flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {s.label}
              </span>
              <span className="text-sm font-extrabold text-slate-900 mt-0.5 block capitalize">
                {s.value}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-lg ${s.bgColor} flex items-center justify-center flex-shrink-0`}>
              <IconComp className={`w-4 h-4 ${s.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
