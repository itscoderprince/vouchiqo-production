"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Clock, Info, Lock, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import KpiCards from "./components/KpiCards";
import OnboardingCard from "./components/OnboardingCard";
import PerformanceChart from "./components/PerformanceChart";
import PlanUsageCard from "./components/PlanUsageCard";
import QuickActionsCard from "./components/QuickActionsCard";
import RecentOrdersAndActivity from "./components/RecentOrdersAndActivity";
import TopCouponsTable from "./components/TopCouponsTable";
import TrafficAndGoals from "./components/TrafficAndGoals";

export default function MerchantDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeRange, setActiveRange] = useState("30 Days");
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const { isProfileIncomplete, health, openModal } = useMerchantLock();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnboardingDismissed(
        localStorage.getItem("onboarding_dismissed") === "true",
      );
    }
  }, []);

  // Listen for real-time customer coupon claims
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, (data) => {
    toast.success(
      `New Claim! "${data.couponTitle || "Offer"}" saved by a customer.`,
      {
        icon: "🎉",
        duration: 5000,
      },
    );
    queryClient.invalidateQueries({ queryKey: ["merchant-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["merchant-recent-claims"] });
  });

  // Listen for real-time customer coupon redemptions
  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, (data) => {
    toast.success(
      `Coupon Redeemed! "${data.couponTitle || "Offer"}" (Saved ₹${data.savingsAmount || 0})`,
      { icon: "💰", duration: 5000 },
    );
    queryClient.invalidateQueries({ queryKey: ["merchant-analytics"] });
    queryClient.invalidateQueries({
      queryKey: ["merchant-recent-redemptions"],
    });
  });

  // Fetch merchant analytics from real API
  const { data: analyticsData } = useQuery({
    queryKey: ["merchant-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch merchant profile (plan info)
  const { data: merchantProfile } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch recent redemptions
  const { data: redemptionsData } = useQuery({
    queryKey: ["merchant-recent-redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/redemptions?limit=5");
      if (!res.ok) return { redemptions: [] };
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch recent claims
  const { data: claimsData } = useQuery({
    queryKey: ["merchant-recent-claims"],
    queryFn: async () => {
      const res = await fetch("/api/claims?limit=5");
      if (!res.ok) return { claims: [] };
      const json = await res.json();
      return json.data;
    },
  });

  const trendData = analyticsData?.trend ?? [];
  const merchant = analyticsData?.merchant ?? merchantProfile;
  const overviewStats = analyticsData?.overview ?? {};

  // KPI computations from real DB
  const pageViews = Object.values(overviewStats).reduce(
    (sum, s) => sum + (s.views || 0),
    0,
  );
  const totalClaims = Object.values(overviewStats).reduce(
    (sum, s) => sum + (s.claims || 0),
    0,
  );
  const totalRedemptions = Object.values(overviewStats).reduce(
    (sum, s) => sum + (s.redemptions || 0),
    0,
  );
  const totalRevenue = trendData.reduce(
    (sum, t) => sum + (Number(t?.revenue) || 0),
    0,
  );

  // Month-over-month change
  function momChange(key) {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1]?.[key] ?? 0;
    const prev = trendData[trendData.length - 2]?.[key] ?? 0;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }
  const revenueMoM = momChange("revenue");
  const ordersMoM = momChange("orders");

  // Plan info
  const plan = merchantProfile?.plan ?? "starter";
  const planLimit = plan === "starter" ? 3 : plan === "growth" ? 15 : -1;
  const activeCoupons =
    merchant?.totalCoupons ?? Object.keys(overviewStats).length;

  // Contextual alerts
  const alerts = [];
  if (activeCoupons >= planLimit * 0.9) {
    alerts.push({
      type: "orange",
      icon: Zap,
      msg: `You're using ${activeCoupons}/${planLimit} listings. Consider upgrading your plan.`,
    });
  }
  // Check for any expiring coupons (from overviewStats keys count as proxy)
  if (trendData.length > 0 && totalRedemptions === 0) {
    alerts.push({
      msg: "No redemptions yet. Share your offer codes with customers to drive your first sale.",
      type: "info",
      icon: Info,
    });
  }
  if (totalClaims > 0 && totalRedemptions / totalClaims < 0.1) {
    alerts.push({
      type: "amber",
      icon: AlertTriangle,
      msg: `Low redemption rate (${Math.round((totalRedemptions / totalClaims) * 100)}%). Try adjusting your offer discount to convert more claims.`,
    });
  }

  const recentRedemptions = redemptionsData?.redemptions ?? [];
  const recentClaims = claimsData?.claims ?? [];
  const recentActivities = analyticsData?.recentActivities ?? [];

  // Top performing coupons from overview stats
  const topCoupons = Object.entries(overviewStats)
    .map(([id, stats]) => ({
      id,
      title: stats.title || "Offer Listing",
      views: stats.views || 0,
      claims: stats.claims || 0,
      redemptions: stats.redemptions || 0,
      conversion:
        stats.views > 0
          ? Math.round((stats.redemptions / stats.views) * 100)
          : 0,
      status: stats.isActive !== false ? "Active" : "Paused",
    }))
    .sort((a, b) => b.redemptions - a.redemptions)
    .slice(0, 5);

  return (
    <DashboardLayout
      title="Dashboard"
      user={{ name: merchant?.businessName || "Merchant", role: "merchant" }}
    >
      <div className="relative space-y-4 text-left font-sans min-h-[75vh]">
        {/* Full Dashboard Blur Overlay when Profile is Incomplete */}
        {isProfileIncomplete && (
          <div
            onClick={openModal}
            className="absolute inset-0 z-30 bg-slate-900/50 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all animate-in fade-in duration-300 select-none overflow-hidden"
          >
            <div className="max-w-md w-full bg-slate-900/90 text-white rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-5 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/90 flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                <Lock className="w-8 h-8 text-slate-300" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Dashboard Locked
                  </h3>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] font-bold">
                    {health?.percentage || 0}% Complete
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Your store profile is currently incomplete. Complete all 15 required details to unlock your listings, analytics, and partner controls.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/merchant/profile?edit=true");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-11 shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Complete Profile Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Application Under Review Overlay Banner */}
        {merchant?.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-amber-950 uppercase tracking-wide">
                APPLICATION UNDER REVIEW
              </h2>
              <p className="text-xs text-amber-800 max-w-lg mx-auto font-medium">
                Your merchant profile &amp; KYC verification are currently under
                review by our super admin team. Account features will be
                activated upon approval (usually 24–48 hours).
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push("/merchant/profile")}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8 px-4 rounded-lg shadow-2xs cursor-pointer"
              >
                Modify Business Profile &amp; Documents
              </button>
              <button
                type="button"
                onClick={() => router.push("/merchant/application-status")}
                className="border border-amber-300 text-amber-900 bg-white hover:bg-amber-50 text-xs font-semibold h-8 px-4 rounded-lg cursor-pointer"
              >
                Track Live Application Status
              </button>
            </div>
          </div>
        )}
        {/* Contextual Alert Cards */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, idx) => {
              const Icon = alert.icon;
              const styles = {
                amber: "bg-blue-50 border-blue-200 text-blue-900",
                blue: "bg-blue-50 border-blue-200 text-blue-900",
                orange: "bg-blue-50 border-blue-200 text-blue-900",
              };
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 border rounded-xl px-3.5 py-2.5 text-xs font-semibold font-sans ${styles[alert.type]}`}
                >
                  <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-600" />
                  <span>{alert.msg}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Onboarding Welcome Card */}
        <OnboardingCard
          totalCoupons={merchant?.totalCoupons}
          onboardingDismissed={onboardingDismissed}
          setOnboardingDismissed={setOnboardingDismissed}
        />

        {/* 4 KPI Cards */}
        <div data-tour="kpi-cards">
          <KpiCards
            totalRevenue={totalRevenue}
            revenueMoM={revenueMoM}
            totalClaims={totalClaims}
            totalRedemptions={totalRedemptions}
            ordersMoM={ordersMoM}
            pageViews={pageViews}
            trendData={trendData}
            activeCoupons={activeCoupons}
            planLimit={planLimit}
          />
        </div>

        {/* Main Chart + Right Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Dual Line Chart: Clicks vs Redemptions */}
          <PerformanceChart
            trendData={trendData}
            activeRange={activeRange}
            setActiveRange={setActiveRange}
          />

          {/* Right column: Traffic + Goals */}
          <TrafficAndGoals
            pageViews={pageViews}
            totalRevenue={totalRevenue}
            totalClaims={totalClaims}
            totalRedemptions={totalRedemptions}
            analyticsData={analyticsData}
          />
        </div>

        {/* Top Performing Coupons Table */}
        <div data-tour="top-coupons">
          <TopCouponsTable coupons={topCoupons} />
        </div>

        {/* Bottom Row: Quick Actions + Plan Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickActionsCard plan={plan} />
          <PlanUsageCard
            plan={plan}
            activeCoupons={activeCoupons}
            planLimit={planLimit}
          />
        </div>

        {/* Recent Orders & Activity Feed */}
        <div data-tour="recent-orders">
          <RecentOrdersAndActivity
            recentRedemptions={recentRedemptions}
            recentClaims={recentClaims}
            recentActivities={recentActivities}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
