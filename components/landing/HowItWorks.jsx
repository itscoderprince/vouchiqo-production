import React from "react";
import { HOW_IT_WORKS_STEPS } from "@/utils/home-data";

export const HowItWorks = React.memo(function HowItWorks() {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto w-full text-center animate-fade-in-up">
      <h2 className="text-2xl font-bold font-heading text-brand-navy tracking-tight mb-3">
        Verification is the Vouchiqo Promise
      </h2>
      <p className="text-xs text-brand-subtext max-w-sm mx-auto mb-12">
        Say goodbye to fake coupon codes and broken links. Here is how Vouchiqo
        guarantees savings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {HOW_IT_WORKS_STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`bg-brand-bg border border-brand-border rounded-lg p-6 space-y-3 flex flex-col items-center hover:shadow-md transition-shadow duration-300 animate-fade-in-up stagger-${idx + 1}`}
            >
              <div className="p-3 bg-brand-navy/5 text-brand-navy rounded-full border border-brand-border transition-colors group-hover:bg-brand-navy/10">
                <Icon className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="font-heading text-base font-bold text-brand-text">
                {item.title}
              </h3>
              <p className="text-xs text-brand-subtext leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
});
