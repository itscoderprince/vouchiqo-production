"use client";

import {
  CalendarDays,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  Store,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ALL_NAV_LINKS = [
  { href: "/merchants", icon: Store, label: "Stores" },
  { href: "/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/june-sales", icon: CalendarDays, label: "June Sales" },
  { href: "/indulge", icon: List, label: "Indulge" },
  { href: "/submit", icon: Plus, label: "Submit Coupon" },
];

const VISIBLE_COUNT = 4;
const visibleLinks = ALL_NAV_LINKS.slice(0, VISIBLE_COUNT);
const moreLinks = ALL_NAV_LINKS.slice(VISIBLE_COUNT);

const NavLink = ({ href, icon: Icon, label, className }) => (
  <a
    href={href}
    className={
      className ||
      "flex items-center gap-1.5 text-[14px] font-medium text-gray-700 hover:text-[#2563eb] transition-colors whitespace-nowrap"
    }
  >
    <Icon className="h-[18px] w-[18px] stroke-[1.5] shrink-0" />
    <span>{label}</span>
  </a>
);

const MoreDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[14px] font-medium text-gray-700 hover:text-[#2563eb] transition-colors cursor-pointer bg-transparent border-0"
        aria-haspopup="true"
        aria-expanded={open}
      >
        More
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {moreLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-gray-700 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-colors"
            >
              <Icon className="h-4 w-4 stroke-[1.5] shrink-0" />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const NavLinks = () => (
  <nav className="hidden md:flex items-center gap-6">
    {visibleLinks.map((link) => (
      <NavLink key={link.href} {...link} />
    ))}
    {moreLinks.length > 0 && <MoreDropdown />}
  </nav>
);

export default NavLinks;
