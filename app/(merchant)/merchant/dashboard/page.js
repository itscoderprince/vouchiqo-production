"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OnboardingCard from "./components/OnboardingCard";
import KpiCards from "./components/KpiCards";
import PerformanceChart from "./components/PerformanceChart";
import TrafficAndGoals from "./components/TrafficAndGoals";
import RecentOrdersAndActivity from "./components/RecentOrdersAndActivity";

export default function MerchantDashboard() {
  const [activeMetricTab, setActiveMetricTab] = useState("revenue");
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnboardingDismissed(localStorage.getItem("onboarding_dismissed") === "true");
    }
  }, []);

  // Fetch merchant analytics from the real API
  const { data: analyticsData } = useQuery({
    queryKey: ["merchant-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch recent redemptions for the table
  const { data: redemptionsData } = useQuery({
    queryKey: ["merchant-recent-redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/redemptions?limit=5");
      if (!res.ok) return { redemptions: [] };
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch recent claims for the table
  const { data: claimsData } = useQuery({
    queryKey: ["merchant-recent-claims"],
    queryFn: async () => {
      const res = await fetch("/api/claims?limit=5");
      if (!res.ok) return { claims: [] };
      const json = await res.json();
      return json.data;
    },
  });

  // Only use real DB trend data — no fake fallback numbers
  const trendData = analyticsData?.trend ?? [];

  const merchant = analyticsData?.merchant;
  const overviewStats = analyticsData?.overview ?? {};

  // Sum real counts from database — show 0 if no data yet (no fake fallbacks)
  const pageViews = Object.values(overviewStats).reduce((sum, s) => sum + (s.views || 0), 0);
  const totalClaims = Object.values(overviewStats).reduce((sum, s) => sum + (s.claims || 0), 0);
  const totalRedemptions = Object.values(overviewStats).reduce((sum, s) => sum + (s.redemptions || 0), 0);

  // Total revenue is direct sum of database redemptions' savings
  const totalRevenue = trendData.reduce((sum, t) => sum + t.revenue, 0);

  // Compute real month-over-month percentage change from trendData
  function momChange(key) {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1]?.[key] ?? 0;
    const prev = trendData[trendData.length - 2]?.[key] ?? 0;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }
  const revenueMoM = momChange("revenue");
  const ordersMoM = momChange("orders");

  // Map real redemptions from DB to table rows.
  const recentRedemptions =
    redemptionsData?.redemptions?.length > 0
      ? redemptionsData.redemptions.map((r) => {
          const name = r.userId?.name || "Customer User";
          const email = r.userId?.email || "customer@vouchiqo.com";
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return {
            initials,
            bg: "bg-[#3e80dd]",
            name,
            email,
            id: r._id.toString().slice(-8).toUpperCase(),
            product: r.couponId?.title || "Special Deal Offer",
            status: "Completed",
            amount: `₹${r.savingsAmount || 0}`,
          };
        })
      : [];

  // Map real claims from DB to table rows.
  const recentClaims =
    claimsData?.claims?.length > 0
      ? claimsData.claims.map((c) => {
          const name = c.userName || "Customer User";
          const email = c.userEmail || "customer@vouchiqo.com";
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return {
            initials,
            bg: "bg-indigo-600",
            name,
            email,
            id: c._id.toString().slice(-8).toUpperCase(),
            product: c.coupon?.title || "Special Deal Offer",
            status: "Claimed",
            amount: c.coupon?.code || "VOUCHIQO",
          };
        })
      : [];

  // Generate activities dynamically from real database redemptions history
  const recentActivities =
    redemptionsData?.redemptions?.length > 0
      ? redemptionsData.redemptions.map((r) => {
          const name = r.userId?.name || "Customer User";
          const date = new Date(r.createdAt);
          const timeLabel = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            icon: ShoppingCart,
            color: "text-[#2563eb]",
            bg: "bg-[#2563eb]/10",
            title: "Coupon Redeemed",
            desc: `${name} redeemed "${r.couponId?.title || "Coupon"}" (Saved ₹${r.savingsAmount || 0})`,
            time: timeLabel,
          };
        })
      : [];

  return (
    <DashboardLayout
      title="Dashboard"
      user={{ name: merchant?.businessName || "Aigars S.", role: "merchant" }}
    >
      <div className="space-y-6 text-left font-sans">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Welcome back, {merchant?.businessName || "Aigars"}. Here's what's
              happening with your business today.
            </p>
          </div>
          <Link
            href="/merchant/coupons/new"
            className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Link>
        </div>

        {/* Onboarding Welcome Card (Premium Design) */}
        <OnboardingCard
          totalCoupons={merchant?.totalCoupons}
          onboardingDismissed={onboardingDismissed}
          setOnboardingDismissed={setOnboardingDismissed}
        />

        {/* 4 Column KPI Cards Grid with Filled Sparkline SVGs */}
        <KpiCards
          totalRevenue={totalRevenue}
          revenueMoM={revenueMoM}
          totalClaims={totalClaims}
          totalRedemptions={totalRedemptions}
          ordersMoM={ordersMoM}
          pageViews={pageViews}
          trendData={trendData}
        />

        {/* Middle Section: Main Chart Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <PerformanceChart
            trendData={trendData}
            activeMetricTab={activeMetricTab}
            setActiveMetricTab={setActiveMetricTab}
          />
          <TrafficAndGoals
            pageViews={pageViews}
            totalRevenue={totalRevenue}
            totalClaims={totalClaims}
            totalRedemptions={totalRedemptions}
            analyticsData={analyticsData}
          />
        </div>

        {/* Bottom Section: Recent Orders & Recent Activity */}
        <RecentOrdersAndActivity
          recentRedemptions={recentRedemptions}
          recentClaims={recentClaims}
          recentActivities={recentActivities}
        />
      </div>
    </DashboardLayout>
  );
}
