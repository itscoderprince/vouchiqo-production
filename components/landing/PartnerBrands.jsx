import React from "react";
import { TRENDING_BRANDS } from "@/utils/home-data";

export const PartnerBrands = React.memo(function PartnerBrands() {
  return (
    <section className="bg-brand-bg border-y border-brand-border py-12 px-4 animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-xs font-bold text-brand-navy uppercase tracking-widest mb-8">
          Trending Partner Brands on Vouchiqo
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center text-center">
          {TRENDING_BRANDS.map((brand, idx) => (
            <div
              key={idx}
              className={`p-4 border border-brand-border bg-brand-surface rounded-lg hover:border-brand-blue hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in-scale stagger-${(idx % 6) + 1}`}
            >
              <span className="text-base font-extrabold text-brand-navy tracking-tight block">
                {brand.name}
              </span>
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider block mt-1">
                {brand.count} active coupons
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
