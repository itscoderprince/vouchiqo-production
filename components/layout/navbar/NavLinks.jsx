"use client";

import { Flame, LayoutGrid, MapPin, Store } from "lucide-react";
import LocationSelector from "../LocationSelector";

const ALL_NAV_LINKS = [
  { href: "/brands", icon: Store, label: "Brands" },
  { href: "/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/campaigns", icon: Flame, label: "Trending" },
  { href: "/nearby-offers", icon: MapPin, label: "Nearby Map" },
];

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

export const NavLinks = () => (
  <nav className="hidden md:flex items-center gap-6">
    {ALL_NAV_LINKS.map((link) => (
      <NavLink key={link.href} {...link} />
    ))}
    <LocationSelector />
  </nav>
);

export default NavLinks;
