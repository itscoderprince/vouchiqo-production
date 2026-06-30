"use client";

import {
  CalendarDays,
  LayoutGrid,
  List,
  Menu,
  Plus,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";

const MOBILE_NAV_LINKS = [
  { href: "/merchants", icon: Store, label: "Stores" },
  { href: "/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/june-sales", icon: CalendarDays, label: "June Sales" },
  { href: "/indulge", icon: List, label: "Indulge" },
  { href: "/submit", icon: Plus, label: "Submit Coupon" },
];

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-gray-700 hover:text-gray-900 transition cursor-pointer bg-transparent border-0"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-scale">
          {MOBILE_NAV_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-gray-700 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-colors"
            >
              <Icon className="h-5 w-5 stroke-[1.5] shrink-0" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
