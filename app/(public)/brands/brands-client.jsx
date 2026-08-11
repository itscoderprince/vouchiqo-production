"use client";

import { useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";

export default function BrandsClient({ brands = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter real database brands by search query
  const filteredBrands = useMemo(() => {
    let list = brands;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    return list;
  }, [brands, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50/60 py-6 md:py-10 font-sans text-left select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
        {/* Header Bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Partner Brands &amp; Stores
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Discover authentic partner brands with verified offers, discounts, and affiliate products.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 font-bold shadow-2xs focus:outline-none focus:border-blue-600 transition-all placeholder:font-medium"
            />
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
          <span>
            Showing <strong className="text-slate-900">{filteredBrands.length}</strong> partner stores
          </span>
        </div>

        {/* Compact Brands Grid (Matching Homepage Popular Stores Ratio 100%) */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredBrands.map((brand) => (
              <BrandGridItem
                key={brand._id}
                name={brand.businessName}
                logo={brand.logo}
                banner={brand.banner}
                href={`/brand/${brand.slug}`}
                coupons={(brand.totalCoupons || 0) + (brand.totalAffiliateProducts || 0)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3 shadow-2xs">
            <Store className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              No real partner brands found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

