"use client";

import { Flame, LayoutGrid, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LocationSelector from "../LocationSelector";

const ALL_NAV_LINKS = [
  { href: "/brands", icon: Store, label: "Brands" },
  { href: "/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/campaigns", icon: Flame, label: "Trending" },
  { href: "/nearby-offers", icon: MapPin, label: "Nearby Map" },
];

const NavLink = ({ href, icon: Icon, label, isActive }) => (
  <Link
    href={href}
    prefetch={true}
    className={`flex items-center gap-1.5 text-[14px] transition-colors whitespace-nowrap py-1 px-1.5 rounded-md ${
      isActive
        ? "text-slate-950 font-bold"
        : "text-slate-600 hover:text-slate-950 font-medium"
    }`}
  >
    <Icon
      className={`h-[18px] w-[18px] shrink-0 transition-transform ${
        isActive ? "stroke-[2.4] text-slate-950" : "stroke-[1.6] text-slate-500"
      }`}
    />
    <span>{label}</span>
  </Link>
);

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-5">
      {ALL_NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <NavLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            isActive={isActive}
          />
        );
      })}
      <LocationSelector />
    </nav>
  );
};

export default NavLinks;
