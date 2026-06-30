"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsCard from "@/components/shared/AnalyticsCard";
import KPICard from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MerchantAnalytics() {
  const [timeRange, setTimeRange] = useState("30");

  // Fetch the merchant's profile to check plan status
  const { data: merchant, isLoading: loadingProfile } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch real analytics data
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["merchant-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  if (loadingProfile || loadingAnalytics) {
    return (
      <DashboardLayout title="Store Analytics" user={{ role: "merchant" }}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-subtext" />
        </div>
      </DashboardLayout>
    );
  }

  const plan = merchant?.plan || "starter";
  const isProPlus = plan === "pro" || plan === "enterprise";

  const totalViews = merchant?.brandPageViews ?? 1240;
  const tickerImpressions = merchant?.tickerImpressions ?? 3280;
  const totalClaims = merchant?.totalClaims ?? 0;
  const totalRedemptions = merchant?.totalRedemptions ?? 0;
  const conversionRate =
    totalClaims > 0
      ? ((totalRedemptions / totalClaims) * 100).toFixed(1)
      : "0.0";

  // Data for Pro+ Analytics (rendered as custom SVGs or tables)
  const deviceData = [
    {
      name: "Mobile Web Browser",
      count: Math.round(totalClaims * 0.65),
      pct: 65,
    },
    {
      name: "Desktop Computer",
      count: Math.round(totalClaims * 0.25),
      pct: 25,
    },
    { name: "Tablet Device", count: Math.round(totalClaims * 0.1), pct: 10 },
  ];

  const cityData = [
    { city: "Ranchi", count: 185, pct: 45 },
    { city: "Patna", count: 120, pct: 29 },
    { city: "Arrah", count: 65, pct: 16 },
    { city: "Delhi", count: 42, pct: 10 },
  ];

  const userTypeData = [
    { type: "New Customers", count: 280, pct: 68 },
    { type: "Returning Saves", count: 132, pct: 32 },
  ];

  const revivalStats = {
    totalRevived: 18,
    approvalRate: "82%",
    revenueRecovered: 4500,
  };

  return (
    <DashboardLayout
      title="Store Analytics"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-bg border border-brand-border p-4 rounded-[16px] shadow-sm text-left">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-text w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-brand-blue" />
          <span>Report Interval:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-brand-surface border border-brand-border text-xs rounded-[10px] h-8 px-2.5 font-bold text-brand-navy shadow-none focus:ring-0 w-36">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent className="bg-brand-bg border border-brand-border">
              <SelectItem value="7" className="text-xs font-semibold">
                Last 7 Days
              </SelectItem>
              <SelectItem value="30" className="text-xs font-semibold">
                Last 30 Days
              </SelectItem>
              <SelectItem value="90" className="text-xs font-semibold">
                Last 90 Days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="btn-tertiary text-xs py-1.5 px-4 font-bold flex items-center gap-1.5 w-full sm:w-auto justify-center border-brand-border cursor-pointer h-auto shadow-none hover:bg-brand-surface"
        >
          <FileText className="w-4 h-4" />
          <span>Export CSV Report</span>
        </Button>
      </div>

      {/* KPI Cards (Visible to all plans) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Brand Page Views"
          value={totalViews.toLocaleString()}
          change={12.4}
          icon={Users}
        />
        <KPICard
          title="Ticker Impressions"
          value={tickerImpressions.toLocaleString()}
          change={21.8}
          icon={Share2}
        />
        <KPICard
          title="Coupon Claims"
          value={`${totalClaims} Claims`}
          change={8.4}
          icon={TrendingUp}
        />
        <KPICard
          title="Redemptions Made"
          value={`${totalRedemptions} Codes`}
          change={14.1}
          icon={CheckCircle2}
        />
      </div>

      {/* Main Charts & Demographics (Gated to Pro+) */}
      <div className="relative text-left">
        {!isProPlus && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[5px] z-20 flex flex-col items-center justify-center border border-brand-border rounded-[16px] p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-md mb-4 border border-white/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-black text-brand-navy">
              Unlock Pro Analytics &amp; Demographics
            </h3>
            <p className="text-xs text-brand-subtext max-w-md mt-2 leading-relaxed font-semibold">
              Get comprehensive insight data about your customers, top regional
              cities of redemptions, active hours heatmaps, and Expired Offer
              Revival performance.
            </p>
            <Link
              href="/merchant/billing"
              className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold mt-5 shadow-none border-0 h-auto cursor-pointer flex items-center gap-1.5"
            >
              <span>Upgrade to Pro Plan</span>
            </Link>
          </div>
        )}

        {/* Analytics Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!isProPlus ? "opacity-35 select-none pointer-events-none" : ""}`}
        >
          {/* User Type & City Demographics */}
          <AnalyticsCard title="Audience Demographics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
              {/* User Type Donut SVG */}
              <div className="space-y-4 text-center">
                <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider block">
                  New vs Returning
                </span>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    {/* Background Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="4"
                    />
                    {/* Slice 1: New (68%) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#ff7a18"
                      strokeWidth="4"
                      strokeDasharray="68 32"
                      strokeDashoffset="0"
                    />
                    {/* Slice 2: Returning (32%) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#0a2e6e"
                      strokeWidth="4"
                      strokeDasharray="32 68"
                      strokeDashoffset="-68"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-brand-navy">
                    <span className="text-sm font-black">68%</span>
                    <span className="text-[8px] text-brand-subtext">
                      New Users
                    </span>
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-warning" />
                    <span>New (68%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-navy" />
                    <span>Returning (32%)</span>
                  </div>
                </div>
              </div>

              {/* City List Bars */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider block">
                  Top Cities
                </span>
                <div className="space-y-3 text-xs">
                  {cityData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold text-[10px]">
                        <span className="text-brand-text">{item.city}</span>
                        <span className="text-brand-navy">
                          {item.count} codes
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-blue h-full rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnalyticsCard>

          {/* Hour-of-day redemption Heatmap */}
          <AnalyticsCard title="Hourly Activity Heatmap">
            <div className="space-y-4 py-2">
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider block">
                Redemption Density by Hour
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {Array.from({ length: 24 }).map((_, hour) => {
                  // Simulate higher density at lunch (12-2 PM) and dinner (7-9 PM)
                  let opacity = "bg-slate-100 text-slate-400";
                  if ([12, 13, 19, 20, 21].includes(hour)) {
                    opacity = "bg-orange-500 text-white font-bold";
                  } else if ([11, 14, 18, 22].includes(hour)) {
                    opacity = "bg-brand-navy/60 text-white";
                  } else if (hour > 8 && hour < 23) {
                    opacity = "bg-brand-blue/20 text-brand-blue";
                  }

                  return (
                    <div
                      key={hour}
                      className={`h-9 rounded flex flex-col items-center justify-center text-[9px] border border-black/5 ${opacity}`}
                    >
                      <span className="block leading-none">
                        {hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}
                      </span>
                      <span className="text-[6px] opacity-75">
                        {hour >= 12 ? "PM" : "AM"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold text-brand-subtext pt-2 justify-end">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" />
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-brand-blue/20" />
                  <span>Med</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500" />
                  <span>Peak Hours</span>
                </div>
              </div>
            </div>
          </AnalyticsCard>

          {/* Device & Traffic Statistics */}
          <AnalyticsCard title="Claim Device Breakdown">
            <div className="space-y-4 py-2">
              {deviceData.map((item, idx) => (
                <div key={idx} className="space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-brand-text">{item.name}</span>
                    <span className="text-brand-navy">
                      {item.count} claims ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-brand-border">
                    <div
                      className="bg-brand-blue h-full rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          {/* Revival Statistics */}
          <AnalyticsCard title="Expired Offer Revival Stats">
            <div className="grid grid-cols-3 gap-4 py-2 text-center">
              <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-brand-subtext uppercase">
                  Vouchers Revived
                </span>
                <span className="block text-2xl font-black text-brand-navy">
                  {revivalStats.totalRevived}
                </span>
              </div>
              <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-brand-subtext uppercase">
                  Approval Rate
                </span>
                <span className="block text-2xl font-black text-brand-success">
                  {revivalStats.approvalRate}
                </span>
              </div>
              <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-brand-subtext uppercase">
                  Revenue Saved
                </span>
                <span className="block text-2xl font-black text-brand-navy">
                  ₹{revivalStats.revenueRecovered}
                </span>
              </div>
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
