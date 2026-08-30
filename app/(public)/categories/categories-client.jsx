"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Baby,
  Car,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Gamepad2,
  Gem,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  Layers,
  Plane,
  Search,
  Shirt,
  ShoppingCart,
  Smartphone,
  Tag,
  Utensils,
  X,
} from "lucide-react";

// Category Lucide Icon mapping
const CATEGORY_ICONS = {
  fashion: Shirt,
  food: Utensils,
  electronics: Smartphone,
  beauty: Heart,
  travel: Plane,
  home: Home,
  "home-improvement": Hammer,
  fitness: Dumbbell,
  education: GraduationCap,
  "kids-baby": Baby,
  jewellery: Gem,
  automotive: Car,
  entertainment: Gamepad2,
  grocery: ShoppingCart,
  finance: CreditCard,
};

export default function CategoriesClient({
  categories = [],
  totalCategories = 15,
  totalOffers = 0,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-12">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-3 sm:px-4 md:px-5 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mb-0.5">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Categories</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-[15px] font-semibold text-slate-800 tracking-normal">
              Explore Categories
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
              {totalCategories} Categories
            </span>
          </div>

          {/* Search Category Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. 5-CARDS PER ROW RESPONSIVE GRID ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-4">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3.5">
            {filteredCategories.map((cat) => {
              const offerCountLabel =
                cat.total > 0
                  ? `${cat.total} Verified Offers`
                  : "Explore Deals";

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative flex flex-col bg-white border border-slate-200/80 rounded-lg sm:rounded-xl overflow-hidden shadow-2xs hover:shadow-xs hover:border-slate-300 active:scale-[0.98] transition-all duration-200 no-underline text-left cursor-pointer select-none"
                >
                  {/* Category Photographic Banner Header */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

                    {/* Bottom overlay title over image */}
                    <div className="absolute bottom-1.5 left-2 right-2">
                      <p className="text-[11.5px] sm:text-[13px] font-bold text-white leading-tight drop-shadow-xs truncate">
                        {cat.title}
                      </p>
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1.5 sm:gap-2 bg-white">
                    {cat.description && (
                      <p className="text-[9.5px] sm:text-[10.5px] text-slate-500 line-clamp-1 leading-tight">
                        {cat.description}
                      </p>
                    )}

                    {/* Offer count badge & link */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[9.5px] sm:text-[10.5px]">
                      <span className="font-semibold text-blue-700 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-200/60 truncate max-w-[72%] sm:max-w-none">
                        {offerCountLabel}
                      </span>
                      <span className="text-slate-400 group-hover:text-blue-600 font-semibold flex items-center shrink-0 transition-colors">
                        View <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2 max-w-md mx-auto my-8">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              No categories found
            </h3>
            <p className="text-xs text-slate-500">
              No category matched &quot;{searchQuery}&quot;. Try searching another keyword.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
