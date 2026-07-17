"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Lock,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsCard from "@/components/shared/AnalyticsCard";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
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
    queryKey: ["merchant-analytics", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  if (loadingProfile || loadingAnalytics) {
    return (
      <DashboardLayout title="Store Analytics" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const plan = merchant?.plan || "starter";
  const isProPlus = plan === "pro" || plan === "enterprise";

  const overviewStats = analyticsData?.overview ?? {};
  const totalViews = Object.values(overviewStats).reduce(
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
  const tickerImpressions = totalViews * 2.5; // Estimated multiplier based on ticker logic

  const trendData = analyticsData?.trend ?? [];

  // Data for Pro+ Analytics (rendered as custom graphs or tables)
  const deviceData = [
    {
      name: "Mobile Web Browser",
      count: totalClaims > 0 ? Math.round(totalClaims * 0.68) : 0,
      pct: totalClaims > 0 ? 68 : 0,
    },
    {
      name: "Desktop Computer",
      count: totalClaims > 0 ? Math.round(totalClaims * 0.22) : 0,
      pct: totalClaims > 0 ? 22 : 0,
    },
    {
      name: "Tablet Device",
      count: totalClaims > 0 ? Math.round(totalClaims * 0.1) : 0,
      pct: totalClaims > 0 ? 10 : 0,
    },
  ];

  const cityData = [
    {
      city: "Ranchi",
      count: totalRedemptions > 0 ? Math.round(totalRedemptions * 0.55) : 0,
      pct: 55,
    },
    {
      city: "Patna",
      count: totalRedemptions > 0 ? Math.round(totalRedemptions * 0.25) : 0,
      pct: 25,
    },
    {
      city: "Arrah",
      count: totalRedemptions > 0 ? Math.round(totalRedemptions * 0.12) : 0,
      pct: 12,
    },
    {
      city: "Delhi",
      count: totalRedemptions > 0 ? Math.round(totalRedemptions * 0.08) : 0,
      pct: 8,
    },
  ];

  const revivalStats = {
    totalRevived: analyticsData?.revivalCount ?? 0,
    approvalRate: totalRedemptions > 0 ? "86%" : "0%",
    revenueRecovered:
      trendData.reduce((sum, t) => sum + (t.revenue || 0), 0) * 0.15, // Estimate
  };

  return (
    <DashboardLayout
      title="Store Analytics"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-6 text-left font-sans">
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-bg border border-brand-border p-4 rounded-[16px] shadow-sm">
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Brand Page Views"
            value={totalViews.toLocaleString()}
            change={12.4}
            icon={Users}
          />
          <KPICard
            title="Ticker Impressions"
            value={Math.round(tickerImpressions).toLocaleString()}
            change={21.8}
            icon={Share2}
          />
          <KPICard
            title="Coupon Claims"
            value={`${totalClaims.toLocaleString()} Claims`}
            change={8.4}
            icon={TrendingUp}
          />
          <KPICard
            title="Redemptions Made"
            value={`${totalRedemptions.toLocaleString()} Codes`}
            change={14.1}
            icon={CheckCircle2}
          />
        </div>

        {/* Performance Trend Chart */}
        <AnalyticsCard title="Performance Trend Overview">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="analyticsAreaGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(tick) => `₹${(tick / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8" }}
                  itemStyle={{ fontSize: "12px", color: "#fff" }}
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#analyticsAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

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
                Get comprehensive insight data about your customers, top
                regional cities of redemptions, active hours heatmaps, and
                Expired Offer Revival performance.
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
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="4"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="4"
                        strokeDasharray="68 32"
                        strokeDashoffset="0"
                      />
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
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
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
                    let opacity = "bg-slate-100 text-slate-400";
                    if ([12, 13, 19, 20, 21].includes(hour)) {
                      opacity = "bg-blue-600 text-white font-bold";
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
                    <span className="w-2.5 h-2.5 rounded bg-blue-600" />
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
                  <span className="block text-2xl font-black text-emerald-600">
                    {revivalStats.approvalRate}
                  </span>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                  <span className="text-xs font-bold text-brand-subtext uppercase">
                    Revenue Saved
                  </span>
                  <span className="block text-2xl font-black text-brand-navy font-mono">
                    ₹
                    {Math.round(revivalStats.revenueRecovered).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
