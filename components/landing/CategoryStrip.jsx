"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const LEADING_BRANDS = [
  { name: "Hostinger", slug: "hostinger" },
  { name: "Redbus", slug: "redbus" },
  { name: "Coursera", slug: "coursera" },
  { name: "Dell", slug: "dell" },
  { name: "Ulta Host", slug: "ultahost" },
  { name: "Google Workspace", slug: "google" },
  { name: "AJIO", slug: "ajio" },
  { name: "Amazon", slug: "amazon" },
  { name: "Klook", slug: "klook" },
  { name: "Adidas", slug: "adidas" },
  { name: "UBER", slug: "uber" },
  { name: "Udemy", slug: "udemy" },
];

export const CategoryStrip = React.memo(function CategoryStrip() {
  return (
    <section className="border-b border-brand-border pb-6 pt-2 relative select-none text-center">
      {/* Centered label block */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-surface px-4 text-[10px] text-brand-subtext uppercase tracking-widest font-black flex items-center gap-1.5">
        <ChevronLeft className="w-3.5 h-3.5 text-brand-border" />
        <span>India's Leading Coupons &amp; Deals Marketplace</span>
        <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
      </div>

      {/* Brands List */}
      <div className="flex justify-between items-center overflow-x-auto scrollbar-hide pt-6 gap-8 text-xs font-bold text-brand-subtext px-4 max-w-7xl mx-auto scroll-smooth">
        {LEADING_BRANDS.map((brand, idx) => (
          <Link
            key={idx}
            href={`/brand/${brand.slug}`}
            className="whitespace-nowrap hover:text-brand-blue transition-colors uppercase tracking-wider"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
});
