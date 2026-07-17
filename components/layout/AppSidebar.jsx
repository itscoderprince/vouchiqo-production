"use client";

import {
  AlertCircle,
  Bookmark,
  Building2,
  CheckSquare,
  CreditCard,
  History,
  Home,
  LayoutDashboard,
  MapPin,
  PiggyBank,
  PlusCircle,
  RotateCcw,
  Settings,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Ticket,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavMain } from "@/components/layout/NavMain";
import { NavUser } from "@/components/layout/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { user: authUser, role: authRole } = useUser();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Dynamically resolve role from pathname or user session
  const role = authUser
    ? authRole
    : pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/merchant")
        ? "merchant"
        : "customer";

  // User details based on the active session
  const user = authUser
    ? {
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.image || `/avatars/${role}.jpg`,
        image: authUser.image,
      }
    : {
        name: "Admin User",
        email: "admin@vouchiqo.com",
        avatar: `/avatars/${role}.jpg`,
        image: null,
      };

  // Grouped Navigation Items matching Vouchiqo structure
  const getNavGroups = () => {
    switch (role) {
      case "admin":
        return [
          {
            title: "Overview",
            items: [
              {
                title: "Go to Homepage",
                url: "/",
                icon: Home,
              },
              {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Merchant Approvals",
                url: "/admin/approvals/merchants",
                icon: Store,
              },
              {
                title: "Coupon Moderation",
                url: "/admin/approvals/coupons",
                icon: CheckSquare,
              },
              {
                title: "User Management",
                url: "/admin/users",
                icon: Users,
              },
              {
                title: "Merchant Intelligence",
                url: "/admin/merchant-demand",
                icon: Building2,
              },
            ],
          },
          {
            title: "System",
            items: [
              {
                title: "Featured Deals",
                url: "/admin/featured",
                icon: Tag,
              },
              {
                title: "Homepage Ticker",
                url: "/admin/ticker",
                icon: TrendingUp,
              },
              {
                title: "Homepage Banners",
                url: "/admin/banners",
                icon: Sliders,
              },
              {
                title: "Revival Requests",
                url: "/admin/revivals",
                icon: AlertCircle,
              },
              {
                title: "Platform Revenue",
                url: "/admin/revenue",
                icon: CreditCard,
              },
              {
                title: "Platform Content",
                url: "/admin/content",
                icon: Settings,
              },
            ],
          },
        ];
      case "merchant":
        return [
          {
            title: "Overview",
            items: [
              {
                title: "Go to Homepage",
                url: "/",
                icon: Home,
              },
              {
                title: "Dashboard",
                url: "/merchant/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Business Analytics",
                url: "/merchant/analytics",
                icon: TrendingUp,
              },
              {
                title: "Business Profile",
                url: "/merchant/profile",
                icon: Store,
              },
            ],
          },
          {
            title: "Commerce",
            items: [
              {
                title: "My Coupons",
                url: "/merchant/coupons",
                icon: Tag,
              },
              {
                title: "Create Coupon",
                url: "/merchant/coupons/new",
                icon: PlusCircle,
              },
              {
                title: "Campaigns",
                url: "/merchant/campaigns",
                icon: Sparkles,
              },
              {
                title: "Revival Requests",
                url: "/merchant/revivals",
                icon: RotateCcw,
              },
              {
                title: "Billing & Plans",
                url: "/merchant/billing",
                icon: CreditCard,
              },
            ],
          },
        ];
      default:
        return [
          {
            title: "Navigation",
            items: [
              {
                title: "Dashboard",
                url: "/customer/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "My Savings",
                url: "/profile?tab=savings",
                icon: PiggyBank,
              },
              {
                title: "Saved Deals",
                url: "/profile?tab=saved",
                icon: Bookmark,
              },
              {
                title: "Cashback Wallet",
                url: "/profile?tab=wallet",
                icon: Wallet,
              },
              {
                title: "My Activity",
                url: "/profile?tab=activity",
                icon: History,
              },
              {
                title: "Nearby Offers",
                url: "/profile?tab=nearby",
                icon: MapPin,
              },
              {
                title: "My Coupons",
                url: "/customer/claimed",
                icon: Ticket,
              },
              {
                title: "Settings",
                url: "/profile?tab=settings",
                icon: Settings,
              },
              {
                title: "Go to Homepage",
                url: "/",
                icon: Home,
              },
            ],
          },
        ];
    }
  };

  const groups = getNavGroups();

  return (
    <Sidebar
      collapsible="icon"
      style={{
        "--sidebar": "var(--brand-bg)",
        "--sidebar-foreground": "var(--brand-subtext)",
        "--sidebar-border": "var(--brand-border)",
        "--sidebar-accent": "var(--brand-surface)",
        "--sidebar-accent-foreground": "var(--brand-navy)",
      }}
      {...props}
    >
      <SidebarHeader className="p-0 border-b border-sidebar-border">
        <div
          className={`flex h-[60px] items-center gap-2 ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0f172a] text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-white"
            >
              <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold tracking-tight text-slate-800 truncate max-w-[170px]">
                {user.name || "Vouchiqo"}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                Dashboard
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent
        className={`py-2 ${isCollapsed ? "px-1" : "px-2"} space-y-2`}
      >
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter
        className={`border-t border-sidebar-border ${isCollapsed ? "p-1.5 flex justify-center" : "p-3"}`}
      >
        <NavUser user={user} role={role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
