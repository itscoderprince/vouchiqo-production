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
  Home,
  Plane,
  Search,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tag,
  Utensils,
} from "lucide-react";

// Category Lucide Icon & pastel color themes for all 15 categories
const CATEGORY_STYLES = {
  fashion: {
    Icon: Shirt,
    bannerBg: "bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-rose-500/25",
    dotColor: "#e11d48",
    iconBg: "bg-rose-50 text-rose-600 border-rose-200 shadow-rose-500/10",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    hoverBorder: "group-hover:border-rose-400 group-hover:shadow-rose-500/15",
  },
  food: {
    Icon: Utensils,
    bannerBg: "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/25",
    dotColor: "#d97706",
    iconBg: "bg-amber-50 text-amber-600 border-amber-200 shadow-amber-500/10",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    hoverBorder: "group-hover:border-amber-400 group-hover:shadow-amber-500/15",
  },
  electronics: {
    Icon: Smartphone,
    bannerBg: "bg-gradient-to-br from-blue-500/15 via-sky-500/10 to-blue-500/25",
    dotColor: "#2563eb",
    iconBg: "bg-blue-50 text-blue-600 border-blue-200 shadow-blue-500/10",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    hoverBorder: "group-hover:border-blue-400 group-hover:shadow-blue-500/15",
  },
  beauty: {
    Icon: Sparkles,
    bannerBg: "bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-purple-500/25",
    dotColor: "#9333ea",
    iconBg: "bg-purple-50 text-purple-600 border-purple-200 shadow-purple-500/10",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    hoverBorder: "group-hover:border-purple-400 group-hover:shadow-purple-500/15",
  },
  travel: {
    Icon: Plane,
    bannerBg: "bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-indigo-500/25",
    dotColor: "#4f46e5",
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-indigo-500/10",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    hoverBorder: "group-hover:border-indigo-400 group-hover:shadow-indigo-500/15",
  },
  home: {
    Icon: Home,
    bannerBg: "bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/25",
    dotColor: "#059669",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-500/10",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hoverBorder: "group-hover:border-emerald-400 group-hover:shadow-emerald-500/15",
  },
  "home-improvement": {
    Icon: Hammer,
    bannerBg: "bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-orange-500/25",
    dotColor: "#ea580c",
    iconBg: "bg-orange-50 text-orange-600 border-orange-200 shadow-orange-500/10",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    hoverBorder: "group-hover:border-orange-400 group-hover:shadow-orange-500/15",
  },
  fitness: {
    Icon: Dumbbell,
    bannerBg: "bg-gradient-to-br from-red-500/15 via-rose-500/10 to-red-500/25",
    dotColor: "#dc2626",
    iconBg: "bg-red-50 text-red-600 border-red-200 shadow-red-500/10",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    hoverBorder: "group-hover:border-red-400 group-hover:shadow-red-500/15",
  },
  education: {
    Icon: GraduationCap,
    bannerBg: "bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-cyan-500/25",
    dotColor: "#0891b2",
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200 shadow-cyan-500/10",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    hoverBorder: "group-hover:border-cyan-400 group-hover:shadow-cyan-500/15",
  },
  "kids-baby": {
    Icon: Baby,
    bannerBg: "bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-violet-500/25",
    dotColor: "#7c3aed",
    iconBg: "bg-violet-50 text-violet-600 border-violet-200 shadow-violet-500/10",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    hoverBorder: "group-hover:border-violet-400 group-hover:shadow-violet-500/15",
  },
  jewellery: {
    Icon: Gem,
    bannerBg: "bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-yellow-500/25",
    dotColor: "#ca8a04",
    iconBg: "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-yellow-500/10",
    badgeBg: "bg-yellow-50 text-yellow-800 border-yellow-200",
    hoverBorder: "group-hover:border-yellow-400 group-hover:shadow-yellow-500/15",
  },
  automotive: {
    Icon: Car,
    bannerBg: "bg-gradient-to-br from-slate-600/15 via-zinc-500/10 to-slate-600/25",
    dotColor: "#475569",
    iconBg: "bg-slate-100 text-slate-700 border-slate-200 shadow-slate-500/10",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    hoverBorder: "group-hover:border-slate-400 group-hover:shadow-slate-500/15",
  },
  entertainment: {
    Icon: Gamepad2,
    bannerBg: "bg-gradient-to-br from-fuchsia-500/15 via-pink-500/10 to-fuchsia-500/25",
    dotColor: "#c026d3",
    iconBg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 shadow-fuchsia-500/10",
    badgeBg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    hoverBorder: "group-hover:border-fuchsia-400 group-hover:shadow-fuchsia-500/15",
  },
  grocery: {
    Icon: ShoppingCart,
    bannerBg: "bg-gradient-to-br from-lime-500/15 via-emerald-500/10 to-lime-500/25",
    dotColor: "#65a30d",
    iconBg: "bg-lime-50 text-lime-700 border-lime-200 shadow-lime-500/10",
    badgeBg: "bg-lime-50 text-lime-800 border-lime-200",
    hoverBorder: "group-hover:border-lime-400 group-hover:shadow-lime-500/15",
  },
  finance: {
    Icon: CreditCard,
    bannerBg: "bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-teal-500/25",
    dotColor: "#0d9488",
    iconBg: "bg-teal-50 text-teal-600 border-teal-200 shadow-teal-500/10",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    hoverBorder: "group-hover:border-teal-400 group-hover:shadow-teal-500/15",
  },
};

const CATEGORY_DESCRIPTIONS = {
  fashion: "Apparel, ethnic wear, western wear, footwear & bags",
  food: "Restaurants, cafes, cloud kitchens & food delivery",
  electronics: "Mobiles, laptops, accessories, repairs & gadgets",
  beauty: "Salons, spas, skincare, cosmetics & personal care",
  travel: "Hotels, flight tickets, tour operators & car rentals",
  home: "Furniture, home décor, kitchenware & furnishings",
  "home-improvement": "Tiles, hardware, paints & electrical fittings",
  fitness: "Gyms, clinics, pharmacies & diagnostic labs",
  education: "Coaching institutes, e-learning & skill workshops",
  "kids-baby": "Toys, clothing, learning kits & baby care",
  jewellery: "Gold, silver, artificial jewellery & luxury watches",
  automotive: "Car service, accessories, tyres & detailing",
  entertainment: "Gaming peripherals, events & entertainment hubs",
  grocery: "Digital kirana, organic foods, dairy & essentials",
  finance: "Insurance, loans, mutual funds & financial services",
};

export default function CategoriesClient({ categories = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    let list = categories;
    if (searchQuery.trim()) {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [categories, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 md:py-12 font-sans text-left">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Find verified discount offers, promo codes and store deals across 15 popular categories.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium shadow-2xs focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* 15 Category Cards Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
            {filteredCategories.map((cat) => {
              const style = CATEGORY_STYLES[cat.slug] || {
                Icon: Tag,
                bannerBg: "bg-gradient-to-br from-blue-500/10 to-blue-500/20",
                dotColor: "#2563eb",
                iconBg: "bg-blue-50 text-blue-600 border-blue-200 shadow-blue-500/10",
                badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
                hoverBorder: "group-hover:border-blue-400 group-hover:shadow-blue-500/15",
              };
              const IconComp = style.Icon;
              const description =
                CATEGORY_DESCRIPTIONS[cat.slug] ||
                "Verified offers and discount codes";

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${style.hoverBorder}`}
                >
                  {/* Top Banner with unique light gradient background & dotted graphics */}
                  <div
                    className={`relative h-24 w-full ${style.bannerBg} overflow-hidden border-b border-slate-100`}
                  >
                    {/* Radial Dotted Background Pattern */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(${style.dotColor} 1.2px, transparent 1.2px)`,
                        backgroundSize: "12px 12px",
                      }}
                    />

                    {/* Decorative Ambient Light Glow Orb */}
                    <div
                      className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl opacity-40 pointer-events-none"
                      style={{ backgroundColor: style.dotColor }}
                    />
                  </div>

                  {/* Icon floating in center over banner boundary */}
                  <div
                    className={`relative -mt-7 mx-auto w-14 h-14 rounded-2xl ${style.iconBg} border shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10`}
                  >
                    <IconComp className="w-7 h-7" />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 pt-3 flex flex-col flex-1 items-center justify-between text-center space-y-3">
                    <div className="space-y-1.5 w-full">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                        {cat.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed px-1">
                        {description}
                      </p>
                    </div>

                    {/* Offers Badge & CTA Link */}
                    <div className="pt-2 w-full flex flex-col items-center gap-2 border-t border-slate-100">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}
                      >
                        {cat.total > 0
                          ? `${cat.total.toLocaleString()} Verified Offers`
                          : "Offers Available"}
                      </span>

                      <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1 transition-colors">
                        <span>Explore Offers</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              No category found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
