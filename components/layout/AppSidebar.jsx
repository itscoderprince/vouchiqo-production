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
                title: "Homepage",
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
                title: "Demand Intelligence",
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
                title: "Homepage",
                url: "/",
                icon: Home,
              },
              {
                title: "Dashboard",
                url: "/merchant/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Analytics",
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
                title: "Homepage",
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
    <Sidebar collapsible="icon" side="left" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div
          className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs">
            V
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left leading-tight min-w-0">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground truncate">
                Vouchiqo
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60">
                {role} Console
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser user={user} role={role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
