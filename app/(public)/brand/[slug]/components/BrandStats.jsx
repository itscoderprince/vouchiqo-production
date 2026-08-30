"use client";

import { Percent, Store, Tag, ShoppingBag } from "lucide-react";

export default function BrandStats({ coupons, merchant }) {
  const pctArr = coupons
    .filter(
      (c) =>
        c.discountType === "percentage" &&
        c.discountValue !== null &&
        c.discountValue !== undefined &&
        !isNaN(Number(c.discountValue)),
    )
    .map((c) => Number(c.discountValue));
  const fixedArr = coupons
    .filter(
      (c) =>
        c.discountType === "fixed" &&
        c.discountValue !== null &&
        c.discountValue !== undefined &&
        !isNaN(Number(c.discountValue)),
    )
    .map((c) => Number(c.discountValue));
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
      value: merchant.businessType || "Both",
      Icon: Store,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50/80",
    },
    {
      label: "Category",
      value: merchant.category || "General",
      Icon: ShoppingBag,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left font-sans">
      {stats.map((s) => {
        const IconComp = s.Icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-2xs hover:shadow-md transition-all hover:border-blue-300 flex items-center justify-between"
          >
            <div>
              <span className="text-[9.5px] sm:text-[10px] font-normal text-slate-400 uppercase tracking-wider block">
                {s.label}
              </span>
              <span className="text-xs sm:text-[13.5px] font-medium text-slate-800 mt-0.5 block capitalize truncate max-w-[100px] sm:max-w-[110px]">
                {s.value}
              </span>
            </div>
            <div className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl ${s.bgColor} flex items-center justify-center shrink-0`}>
              <IconComp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

