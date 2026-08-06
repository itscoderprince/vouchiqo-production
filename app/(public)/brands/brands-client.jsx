"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, CheckCircle2, Store } from "lucide-react";

const FALLBACK_BANNERS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
];

export default function BrandsClient({ brands = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [failedLogos, setFailedLogos] = useState({});
  const [failedBanners, setFailedBanners] = useState({});

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
    <main className="min-h-screen bg-slate-50/50 py-8 md:py-12 font-sans text-left">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Partner Brands & Stores
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Discover authentic partner brands with verified coupons, discounts, and affiliate products.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium shadow-2xs focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Real Database Brands Cards Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
            {filteredBrands.map((brand, idx) => {
              const fallbackIndex = idx % FALLBACK_BANNERS.length;
              const bannerSrc =
                brand.banner && !failedBanners[brand._id]
                  ? brand.banner
                  : FALLBACK_BANNERS[fallbackIndex];

              const totalActiveOffers =
                (brand.totalCoupons || 0) + (brand.totalAffiliateProducts || 0);

              return (
                <Link
                  key={brand._id}
                  href={`/brand/${brand.slug}`}
                  className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col text-center"
                >
                  {/* Top Banner Image with subtle gradient overlay */}
                  <div className="relative h-28 sm:h-32 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={bannerSrc}
                      alt={`${brand.businessName} banner`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() =>
                        setFailedBanners((prev) => ({
                          ...prev,
                          [brand._id]: true,
                        }))
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                    {/* Category pill badge on top left */}
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-white/50 shadow-2xs">
                      {brand.category || "Store"}
                    </div>
                  </div>

                  {/* Centered Brand Logo */}
                  <div className="relative -mt-7 mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 shadow-md p-1.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10 overflow-hidden shrink-0">
                    {brand.logo && !failedLogos[brand._id] ? (
                      <img
                        src={brand.logo}
                        alt={brand.businessName}
                        className="w-full h-full object-contain"
                        onError={() =>
                          setFailedLogos((prev) => ({
                            ...prev,
                            [brand._id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-blue-50 text-blue-600 font-black text-xl flex items-center justify-center">
                        {brand.businessName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 pt-3 flex flex-col flex-1 items-center justify-between text-center space-y-3">
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-center gap-1.5">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                          {brand.businessName}
                        </h3>
                        {brand.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 w-fit mx-auto">
                        {totalActiveOffers > 0
                          ? `${totalActiveOffers} Verified Deals & Offers`
                          : "Deals & Offers Available"}
                      </p>
                    </div>

                    {/* CTA Link */}
                    <div className="pt-2.5 w-full flex items-center justify-center border-t border-slate-100">
                      <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1 transition-colors">
                        <span>View Offers</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-2xs">
            <Store className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              No real partner brands found matching &quot;{searchQuery || activeLetter}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveLetter("all");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
