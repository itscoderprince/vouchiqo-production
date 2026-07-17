"use client";

import {
  AlertCircle,
  Bookmark,
  CheckSquare,
  ChevronRight,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Store,
  Tag,
  Sliders,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Sidebar({ role = "customer" }) {
  const pathname = usePathname();
  const router = useRouter();

  const getLinks = () => {
    switch (role) {
      case "admin":
        return [
          {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Merchant Approvals",
            href: "/admin/approvals/merchants",
            icon: Store,
          },
          {
            name: "Coupon Moderation",
            href: "/admin/approvals/coupons",
            icon: CheckSquare,
          },
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Featured Deals", href: "/admin/featured", icon: Tag },
          { name: "Homepage Ticker", href: "/admin/ticker", icon: TrendingUp },
          { name: "Homepage Banners", href: "/admin/banners", icon: Sliders },
          {
            name: "Revival Requests",
            href: "/admin/revivals",
            icon: AlertCircle,
          },
          {
            name: "Platform Revenue",
            href: "/admin/revenue",
            icon: CreditCard,
          },
          {
            name: "Platform Content",
            href: "/admin/content",
            icon: Settings,
          },
        ];
      case "merchant":
        return [
          {
            name: "Dashboard",
            href: "/merchant/dashboard",
            icon: LayoutDashboard,
          },
          { name: "My Coupons", href: "/merchant/coupons", icon: Tag },
          {
            name: "Create Coupon",
            href: "/merchant/coupons/new",
            icon: PlusCircle,
          },
          {
            name: "Business Analytics",
            href: "/merchant/analytics",
            icon: TrendingUp,
          },
          { name: "Business Profile", href: "/merchant/profile", icon: Store },
          {
            name: "Billing & Plans",
            href: "/merchant/billing",
            icon: CreditCard,
          },
        ];
      default:
        return [
          {
            name: "Dashboard",
            href: "/customer/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Savings Dashboard",
            href: "/customer/savings",
            icon: TrendingUp,
          },
          { name: "Saved Coupons", href: "/customer/saved", icon: Bookmark },
          { name: "Claimed Coupons", href: "/customer/claimed", icon: History },
          { name: "Followed Brands", href: "/customer/brands", icon: Store },
          { name: "Settings", href: "/profile/settings", icon: Settings },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-brand-navy text-slate-300 min-h-screen flex flex-col border-r border-white/10 hidden md:flex flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-1.5">
            <span className="text-brand-gradient">Vouchiqo</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            {role.toUpperCase()} CONSOLE
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-brand-blue text-white shadow-sm"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${isActive ? "text-brand-warning" : "text-slate-400 group-hover:text-slate-200"}`}
                />
                <span>{link.name}</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 opacity-0 transition-opacity ${isActive ? "opacity-100" : "group-hover:opacity-50"}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
          variant="ghost"
          className="flex items-center justify-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer h-auto border-0 bg-transparent shadow-none"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
