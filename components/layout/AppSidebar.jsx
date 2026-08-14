"use client";

import {
  AlertCircle,
  BarChart2,
  Bell,
  Bookmark,
  Building2,
  CheckSquare,
  Clock,
  CreditCard,
  HelpCircle,
  History,
  Home,
  Layers,
  LayoutDashboard,
  Link as LinkIcon,
  Mail,
  MapPin,
  Megaphone,
  PiggyBank,
  PlusCircle,
  Percent,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  ShoppingBag,
  Tag,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NavMain } from "@/components/layout/NavMain";
import { NavUser } from "@/components/layout/NavUser";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { useUser } from "@/hooks/use-user";
import { SOCKET_EVENTS } from "@/lib/socket/events";

// Map DB plan slug → display label shown in the sidebar badge
const PLAN_LABELS = {
  starter: "STARTER",
  growth: "GROWTH PARTNER",
  pro: "PRO PARTNER",
  enterprise: "ENTERPRISE",
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { user: authUser } = useUser();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [merchantPlan, setMerchantPlan] = useState(null);

  // Real-time admin pending action badge counts
  const [adminBadges, setAdminBadges] = useState({
    pendingMerchants: 0,
    pendingCoupons: 0,
    pendingCampaigns: 0,
  });

  const userRole = authUser?.role;
  const isAdmin = userRole === "admin" || pathname.startsWith("/admin");
  const isMerchant = !isAdmin && (userRole === "merchant" || pathname.startsWith("/merchant"));
  const role = isAdmin ? "admin" : isMerchant ? "merchant" : userRole || "customer";

  // Cached live merchant sidebar badges (prevents state flicker on tab navigation)
  const { data: merchantBadgesData } = useQuery({
    queryKey: ["merchant-badges"],
    queryFn: async () => {
      if (!isMerchant) return null;
      const res = await fetch("/api/merchant/badges");
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    },
    enabled: isMerchant,
    staleTime: 15000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const merchantBadges = {
    status: merchantBadgesData?.status || "pending",
    totalCoupons: merchantBadgesData?.totalCoupons || 0,
    activeCoupons: merchantBadgesData?.activeCoupons || 0,
    expiredCoupons: merchantBadgesData?.expiredCoupons || 0,
    totalCampaigns: merchantBadgesData?.totalCampaigns || 0,
    unreadNotifications: merchantBadgesData?.unreadNotifications || 0,
  };

  useEffect(() => {
    if (merchantBadgesData?.plan) {
      setMerchantPlan(merchantBadgesData.plan);
    }
  }, [merchantBadgesData?.plan]);

  // Activity Seen tracking state (stored in localStorage)
  const [seenState, setSeenState] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("vouchiqo_sidebar_seen");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Real-time polling for admin notification counts from merchant submissions
  const fetchAdminBadges = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data?.badges) {
        setAdminBadges({
          pendingMerchants: json.data.badges.pendingMerchants || 0,
          pendingCoupons: json.data.badges.pendingCoupons || 0,
          pendingCampaigns: json.data.badges.pendingCampaigns || 0,
        });
      }
    } catch {
      // Ignore network errors gracefully
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAdminBadges();
    const interval = setInterval(fetchAdminBadges, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, fetchAdminBadges]);

  const queryClient = useQueryClient();

  // Real-time instant updates for sidebar badges on all platform WebSocket events
  const handleRealtimeBadgeUpdate = useCallback(() => {
    if (isAdmin) fetchAdminBadges();
    if (isMerchant) {
      queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });
    }
  }, [isAdmin, isMerchant, fetchAdminBadges, queryClient]);

  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.CAMPAIGN_SUBMITTED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.NOTIFICATION_NEW, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, handleRealtimeBadgeUpdate);

  // Automatically mark items as seen when user visits/views the target page in real time
  useEffect(() => {
    if (typeof window === "undefined") return;

    setSeenState((prev) => {
      const updated = { ...prev };
      let changed = false;

      // Initialize baseline on first load if undefined
      if (
        updated.seenCoupons === undefined &&
        merchantBadges.totalCoupons > 0
      ) {
        updated.seenCoupons = merchantBadges.totalCoupons;
        changed = true;
      }
      if (
        updated.seenCampaigns === undefined &&
        merchantBadges.totalCampaigns > 0
      ) {
        updated.seenCampaigns = merchantBadges.totalCampaigns;
        changed = true;
      }
      if (
        updated.seenAdminMerchants === undefined &&
        adminBadges.pendingMerchants > 0
      ) {
        updated.seenAdminMerchants = adminBadges.pendingMerchants;
        changed = true;
      }
      if (
        updated.seenAdminCoupons === undefined &&
        adminBadges.pendingCoupons > 0
      ) {
        updated.seenAdminCoupons = adminBadges.pendingCoupons;
        changed = true;
      }
      if (
        updated.seenAdminCampaigns === undefined &&
        adminBadges.pendingCampaigns > 0
      ) {
        updated.seenAdminCampaigns = adminBadges.pendingCampaigns;
        changed = true;
      }

      // Merchant visits Coupons / Listings
      if (pathname.startsWith("/merchant/coupons")) {
        if (updated.seenCoupons !== merchantBadges.totalCoupons) {
          updated.seenCoupons = merchantBadges.totalCoupons;
          changed = true;
        }
      }

      // Merchant visits Campaigns
      if (pathname.startsWith("/merchant/campaigns")) {
        if (updated.seenCampaigns !== merchantBadges.totalCampaigns) {
          updated.seenCampaigns = merchantBadges.totalCampaigns;
          changed = true;
        }
      }

      // Merchant visits Notifications
      if (pathname.startsWith("/merchant/notifications")) {
        if (updated.seenNotifications !== merchantBadges.unreadNotifications) {
          updated.seenNotifications = merchantBadges.unreadNotifications;
          changed = true;
        }
      }

      // Admin visits Merchant Approvals / Directory
      if (
        pathname.startsWith("/admin/approvals/merchants") ||
        pathname.startsWith("/admin/merchants")
      ) {
        if (updated.seenAdminMerchants !== adminBadges.pendingMerchants) {
          updated.seenAdminMerchants = adminBadges.pendingMerchants;
          changed = true;
        }
      }

      // Admin visits Coupon Moderation
      if (
        pathname.startsWith("/admin/approvals/coupons") ||
        pathname.startsWith("/admin/offers")
      ) {
        if (updated.seenAdminCoupons !== adminBadges.pendingCoupons) {
          updated.seenAdminCoupons = adminBadges.pendingCoupons;
          changed = true;
        }
      }

      // Admin visits Campaign Queue
      if (pathname.startsWith("/admin/campaigns")) {
        if (updated.seenAdminCampaigns !== adminBadges.pendingCampaigns) {
          updated.seenAdminCampaigns = adminBadges.pendingCampaigns;
          changed = true;
        }
      }

      if (changed) {
        try {
          localStorage.setItem(
            "vouchiqo_sidebar_seen",
            JSON.stringify(updated),
          );
        } catch {}
        return updated;
      }
      return prev;
    });
  }, [pathname, merchantBadges, adminBadges]);

  const user = authUser
    ? {
        name: authUser.businessName || authUser.name,
        email: authUser.email,
        avatar: authUser.image || `/avatars/${role}.jpg`,
        image: authUser.image,
      }
    : {
        name: isMerchant ? "Merchant Partner" : "Super Admin",
        email: isMerchant ? "merchant@vouchiqo.com" : "admin@vouchiqo.com",
        avatar: `/avatars/${role}.jpg`,
        image: null,
      };

  const getNavGroups = () => {
    // Unseen Activity Counts for Merchant
    const unseenCoupons =
      seenState.seenCoupons !== undefined
        ? Math.max(0, merchantBadges.totalCoupons - seenState.seenCoupons)
        : 0;

    const unseenCampaigns =
      seenState.seenCampaigns !== undefined
        ? Math.max(0, merchantBadges.totalCampaigns - seenState.seenCampaigns)
        : 0;

    const unseenNotifications =
      seenState.seenNotifications === merchantBadges.unreadNotifications
        ? 0
        : merchantBadges.unreadNotifications;

    // Unseen Activity Counts for Admin
    const unseenAdminMerchants =
      seenState.seenAdminMerchants === adminBadges.pendingMerchants
        ? 0
        : adminBadges.pendingMerchants;

    const unseenAdminCoupons =
      seenState.seenAdminCoupons === adminBadges.pendingCoupons
        ? 0
        : adminBadges.pendingCoupons;

    const unseenAdminCampaigns =
      seenState.seenAdminCampaigns === adminBadges.pendingCampaigns
        ? 0
        : adminBadges.pendingCampaigns;

    const totalUnseenAdminApprovals = unseenAdminMerchants + unseenAdminCoupons;

    switch (role) {
      case "admin": {
        return [
          {
            title: "OVERVIEW",
            items: [
              {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
              },
            ],
          },
          {
            title: "PENDING & APPROVALS",
            items: [
              {
                title: "Pending Approvals",
                url: "/admin/approvals/merchants",
                icon: ShieldCheck,
                defaultOpen: true,
                badge:
                  totalUnseenAdminApprovals > 0
                    ? String(totalUnseenAdminApprovals)
                    : null,
                badgeColor:
                  "bg-red-500 text-white font-extrabold shadow-sm shadow-red-500/30",
                subItems: [
                  {
                    title: "Merchant Approvals",
                    url: "/admin/approvals/merchants",
                    icon: ShieldCheck,
                    badge:
                      unseenAdminMerchants > 0
                        ? String(unseenAdminMerchants)
                        : null,
                    badgeColor: "bg-red-500 text-white font-extrabold",
                  },
                  {
                    title: "Offer Moderation",
                    url: "/admin/approvals/coupons",
                    icon: Tag,
                    badge:
                      unseenAdminCoupons > 0
                        ? String(unseenAdminCoupons)
                        : null,
                    badgeColor: "bg-red-500 text-white font-extrabold",
                  },
                  {
                    title: "Offer Verification",
                    url: "/admin/offers",
                    icon: CheckSquare,
                  },
                ],
              },
              {
                title: "User Management",
                url: "/admin/users",
                icon: Users,
              },
              {
                title: "Merchant Directory",
                url: "/admin/merchants",
                icon: Store,
                badge:
                  unseenAdminMerchants > 0
                    ? String(unseenAdminMerchants)
                    : null,
                badgeColor: "bg-red-500 text-white font-extrabold",
              },
            ],
          },
          {
            title: "CAMPAIGN MANAGEMENT",
            items: [
              {
                title: "Campaign Hub",
                url: "/admin/campaigns/queue",
                icon: Megaphone,
                badge:
                  unseenAdminCampaigns > 0
                    ? String(unseenAdminCampaigns)
                    : null,
                subItems: [
                  {
                    title: "Campaign Queue",
                    url: "/admin/campaigns/queue",
                    icon: Megaphone,
                    badge:
                      unseenAdminCampaigns > 0
                        ? String(unseenAdminCampaigns)
                        : null,
                    badgeColor: "bg-red-500 text-white font-extrabold",
                  },
                  {
                    title: "Live Monitoring",
                    url: "/admin/campaigns/live",
                    icon: TrendingUp,
                  },
                  {
                    title: "Campaign Calendar",
                    url: "/admin/campaigns/calendar",
                    icon: Clock,
                  },
                  {
                    title: "Campaign Analytics",
                    url: "/admin/campaigns/analytics",
                    icon: BarChart2,
                  },
                ],
              },
            ],
          },
          {
            title: "CONTENT & MARKETING",
            items: [
              {
                title: "Banners & Highlights",
                url: "/admin/banners",
                icon: Sliders,
                subItems: [
                  {
                    title: "Homepage Banners",
                    url: "/admin/banners",
                    icon: Sliders,
                  },
                  {
                    title: "Featured Deals",
                    url: "/admin/featured",
                    icon: Tag,
                  },
                ],
              },
              {
                title: "Terms & Policies",
                url: "/admin/content/policies",
                icon: ShieldCheck,
              },
              {
                title: "Marketing Tools",
                url: "/admin/campaigns/festival-wizard",
                icon: Zap,
                subItems: [
                  {
                    title: "Festival Wizard",
                    url: "/admin/campaigns/festival-wizard",
                    icon: Zap,
                  },
                  {
                    title: "Email Blast Builder",
                    url: "/admin/campaigns/email-blast-builder",
                    icon: Mail,
                  },
                  {
                    title: "Push Builder",
                    url: "/admin/campaigns/push-builder",
                    icon: Bell,
                  },
                ],
              },
              {
                title: "Demand & Revivals",
                url: "/admin/merchant-demand",
                icon: Building2,
                subItems: [
                  {
                    title: "Merchant Demand",
                    url: "/admin/merchant-demand",
                    icon: Building2,
                  },
                  {
                    title: "Master Revivals",
                    url: "/admin/revivals",
                    icon: AlertCircle,
                  },
                ],
              },
            ],
          },
          {
            title: "FINANCIALS",
            items: [
              {
                title: "Revenue & Earnings",
                url: "/admin/revenue",
                icon: Wallet,
                subItems: [
                  {
                    title: "Platform Revenue",
                    url: "/admin/revenue",
                    icon: Wallet,
                  },
                  {
                    title: "Campaign Revenue",
                    url: "/admin/campaigns/revenue",
                    icon: CreditCard,
                  },
                ],
              },
              {
                title: "Commission Rates",
                url: "/admin/commission-rates",
                icon: Percent,
              },
              {
                title: "Merchant Plans & Pricing",
                url: "/admin/plans",
                icon: CreditCard,
              },
            ],
          },
        ];
      }
      case "merchant":
        return [
          {
            title: "NAVIGATION",
            items: [
              {
                title: "Dashboard Overview",
                url: "/merchant/dashboard",
                icon: Home,
              },
              {
                title: "My Listings",
                url: "/merchant/coupons",
                icon: Layers,
                tourId: "tour-my-listings",
                badge: unseenCoupons > 0 ? String(unseenCoupons) : null,
                badgeColor:
                  "bg-red-500 text-white font-extrabold shadow-sm shadow-red-500/30",
                subItems: [
                  {
                    title: "All Listings",
                    url: "/merchant/coupons",
                    icon: Ticket,
                    badge: unseenCoupons > 0 ? String(unseenCoupons) : null,
                    badgeColor: "bg-red-500 text-white font-extrabold",
                  },
                  {
                    title: "Active Offers",
                    url: "/merchant/coupons?status=active",
                    icon: CheckSquare,
                  },
                  {
                    title: "Expired Offers",
                    url: "/merchant/coupons?status=expired",
                    icon: Clock,
                  },
                  {
                    title: "Affiliate Products",
                    url: "/merchant/affiliate-products",
                    icon: ShoppingBag,
                  },
                ],
              },
              {
                title: "Affiliate Products",
                url: "/merchant/affiliate-products",
                icon: ShoppingBag,
              },
              {
                title: "Post New Listing",
                url: "/merchant/coupons/new",
                icon: PlusCircle,
                isCta: true,
              },
              {
                title: "Analytics",
                url: "/merchant/analytics",
                icon: BarChart2,
              },
              {
                title: "Campaigns",
                url: "/merchant/campaigns",
                icon: Megaphone,
                badge: unseenCampaigns > 0 ? String(unseenCampaigns) : null,
                badgeColor:
                  "bg-red-500 text-white font-extrabold shadow-sm shadow-red-500/30",
              },
              {
                title: "Notifications",
                url: "/merchant/notifications",
                icon: Bell,
                badge:
                  unseenNotifications > 0 ? String(unseenNotifications) : null,
                badgeColor:
                  "bg-red-500 text-white font-black shadow-sm shadow-red-500/40 animate-pulse",
              },
              {
                title: "Subscription & Billing",
                url: "/merchant/billing",
                icon: CreditCard,
              },
              {
                title: "Affiliate & Commission",
                url: "/merchant/affiliates",
                icon: LinkIcon,
              },
              {
                title: "Business Profile & KYC",
                url: "/merchant/profile",
                icon: Store,
              },
              {
                title: "Application Tracking",
                url: "/merchant/application-status",
                icon: ShieldCheck,
                badge: merchantBadges.status
                  ? merchantBadges.status.toUpperCase()
                  : "UNDER AUDIT",
                badgeColor:
                  merchantBadges.status === "approved"
                    ? "bg-emerald-600 text-white font-extrabold"
                    : merchantBadges.status === "rejected"
                      ? "bg-red-600 text-white font-extrabold"
                      : "bg-amber-500 text-slate-950 font-black",
              },
              {
                title: "Account Settings",
                url: "/merchant/settings",
                icon: Settings,
              },
              { title: "Help & Support", url: "/faq", icon: HelpCircle },
            ],
          },
        ];
      default:
        return [
          {
            title: "MAIN",
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
            ],
          },
          {
            title: "ACTIVITY & DISCOVERY",
            items: [
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
              { title: "My Offers", url: "/customer/claimed", icon: Ticket },
              {
                title: "Settings",
                url: "/profile?tab=settings",
                icon: Settings,
              },
              { title: "Homepage", url: "/", icon: Home },
            ],
          },
        ];
    }
  };

  const groups = getNavGroups();

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className="bg-white text-slate-900 border-r border-slate-200 shadow-sm font-sans"
      {...props}
    >
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-slate-200 bg-white px-3.5 py-0">
        <div
          className={`flex items-center gap-2.5 w-full ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-black text-sm shadow-xs overflow-hidden border border-blue-100">
            <Image
              src="/favicon.ico"
              alt="VouchIQ Logo"
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left leading-tight min-w-0 flex-1">
              <span className="text-sm font-black tracking-tight truncate text-slate-900">
                {role === "admin" ? "Super Admin" : user.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[8px] font-extrabold px-1.5 py-0">
                  {merchantPlan
                    ? (PLAN_LABELS[merchantPlan] ?? merchantPlan.toUpperCase())
                    : role === "admin"
                      ? "PLATFORM ADMIN"
                      : "PARTNER"}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3 bg-white text-slate-900">
        <NavMain groups={groups} isMerchant={isMerchant} />
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 bg-white">
        <NavUser user={user} role={role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
