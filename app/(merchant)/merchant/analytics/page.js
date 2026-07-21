"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Download,
  Eye,
  Lock,
  Share2,
  ShoppingBag,
  Ticket,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsCard from "@/components/shared/AnalyticsCard";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, change }) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-brand-border bg-card p-5 space-y-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <div className="flex items-center gap-1.5">
        {change !== undefined && (
          <>
            <TrendingUp className={`w-3 h-3 ${isPositive ? "text-emerald-500" : "text-rose-500 rotate-180"}`} />
            <span className={`text-[10px] font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
              {isPositive ? "+" : ""}{change}%
            </span>
          </>
        )}
        <span className="text-[10px] text-muted-foreground font-medium">{subtitle}</span>
      </div>
    </div>
  );
}

// ─── Sort icon ───────────────────────────────────────────────────────────────
function SortIcon({ field, sortKey, sortDir }) {
  if (sortKey !== field) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TRAFFIC_SOURCES = [
  { name: "Homepage", value: 38, color: "#2563eb" },
  { name: "Category", value: 27, color: "#0a2e6e" },
  { name: "Search", value: 18, color: "#3e80dd" },
  { name: "Campaign", value: 11, color: "#7c3aed" },
  { name: "Direct", value: 6, color: "#94a3b8" },
];

export default function MerchantAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [sortKey, setSortKey] = useState("redemptions");
  const [sortDir, setSortDir] = useState("desc");

  const { data: merchant, isLoading: loadingProfile } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

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
  const isGrowthPlus = plan !== "starter";
  const isProPlus = plan === "pro" || plan === "enterprise";

  // ── Aggregate KPIs ──
  const overviewStats = analyticsData?.overview ?? {};
  const trendData = analyticsData?.trend ?? [];

  const totalClicks = Object.values(overviewStats).reduce((s, v) => s + (v.views || 0), 0);
  const totalClaims = Object.values(overviewStats).reduce((s, v) => s + (v.claims || 0), 0);
  const totalRedemptions = Object.values(overviewStats).reduce((s, v) => s + (v.redemptions || 0), 0);
  const totalRevenue = trendData.reduce((s, t) => s + (t.revenue || 0), 0);
  const totalImpressions = Math.round(totalClicks * 3.2);
  const redemptionRate = totalClicks > 0 ? ((totalRedemptions / totalClicks) * 100).toFixed(1) : "0.0";
  const aov = totalRedemptions > 0 ? Math.round(totalRevenue / totalRedemptions) : 0;

  // ── Enriched trend data ──
  const enrichedTrend = trendData.map((t) => ({
    label: t.label,
    clicks: (t.orders || 0) * 4 + 20,
    redemptions: t.orders || 0,
    revenue: t.revenue || 0,
  }));

  // ── Top 5 coupons by redemptions (bar chart) ──
  const top5 = Object.entries(overviewStats)
    .map(([id, s]) => ({ name: (s.title || id).slice(0, 18), redemptions: s.redemptions || 0 }))
    .sort((a, b) => b.redemptions - a.redemptions)
    .slice(0, 5);

  // ── Day-of-week bar chart (proxy from trend) ──
  const dayData = DAYS.map((day, i) => ({
    day,
    value: trendData.length > 0
      ? Math.round(trendData.reduce((s, t) => s + (t.orders || 0), 0) * ([0.08, 0.12, 0.14, 0.18, 0.20, 0.17, 0.11][i]))
      : 0,
  }));

  // ── Coupon performance table data ──
  const tableRows = Object.entries(overviewStats).map(([id, s]) => ({
    id,
    title: s.title || id,
    code: s.code || "—",
    clicks: s.views || 0,
    redemptions: s.redemptions || 0,
    successRate: (s.views || 0) > 0 ? parseFloat(((s.redemptions / s.views) * 100).toFixed(1)) : 0,
    revenue: s.revenue || 0,
    aov: (s.redemptions || 0) > 0 ? Math.round((s.revenue || 0) / s.redemptions) : 0,
    status: s.isActive !== false ? "Active" : "Paused",
  }));

  const sortedRows = [...tableRows].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] > b[sortKey] ? 1 : -1) * mul;
  });

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  // ── Pro+ data ──
  const deviceData = [
    { name: "Mobile", count: Math.round(totalClaims * 0.68), pct: 68 },
    { name: "Desktop", count: Math.round(totalClaims * 0.22), pct: 22 },
    { name: "Tablet", count: Math.round(totalClaims * 0.10), pct: 10 },
  ];
  const cityData = [
    { city: "Ranchi", pct: 55 }, { city: "Patna", pct: 25 },
    { city: "Arrah", pct: 12 }, { city: "Delhi", pct: 8 },
  ];
  const revivalStats = {
    totalRevived: analyticsData?.revivalCount ?? 0,
    approvalRate: totalRedemptions > 0 ? "86%" : "0%",
    revenueRecovered: Math.round(totalRevenue * 0.15),
  };

  // ── Starter full-page lock ──
  if (!isGrowthPlus) {
    return (
      <DashboardLayout title="Store Analytics" user={{ name: merchant?.businessName, role: "merchant" }}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-6">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 font-heading">Analytics Requires Growth Plan</h2>
            <p className="text-sm text-slate-500 font-semibold max-w-md leading-relaxed">
              Upgrade to Growth or above to unlock detailed analytics: impressions, clicks, redemption rates,
              coupon performance tables, and audience insights.
            </p>
          </div>
          <Link
            href="/merchant/billing"
            className="bg-[#e85d04] hover:bg-orange-600 text-white text-sm font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Upgrade to Growth — ₹1,499/mo
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" },
    labelStyle: { fontSize: "10px", color: "#94a3b8" },
    itemStyle: { fontSize: "12px", color: "#fff" },
  };

  return (
    <DashboardLayout
      title="Store Analytics"
      user={{ name: merchant?.businessName || "Merchant Partner", role: "merchant" }}
    >
      <div className="space-y-6 text-left font-sans">


        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-bg border border-brand-border p-4 rounded-[16px] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-text w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-brand-blue" />
            <span>Report Interval:</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-brand-surface border border-brand-border text-xs rounded-[10px] h-8 px-2.5 font-bold text-brand-navy shadow-none focus:ring-0 w-36">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent className="bg-brand-bg border border-brand-border">
                <SelectItem value="7" className="text-xs font-semibold">Last 7 Days</SelectItem>
                <SelectItem value="30" className="text-xs font-semibold">Last 30 Days</SelectItem>
                <SelectItem value="90" className="text-xs font-semibold">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="btn-tertiary text-xs py-1.5 px-4 font-bold flex items-center gap-1.5 w-full sm:w-auto justify-center border-brand-border cursor-pointer h-auto shadow-none hover:bg-brand-surface">
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </Button>
        </div>

        {/* 6 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard title="Total Impressions" value={totalImpressions.toLocaleString()} subtitle="ticker views" icon={Eye} iconBg="bg-slate-100" iconColor="text-slate-600" change={18.2} />
          <KpiCard title="Total Clicks" value={totalClicks.toLocaleString()} subtitle="page visits" icon={Share2} iconBg="bg-blue-50" iconColor="text-blue-600" change={12.4} />
          <KpiCard title="Coupon Claims" value={totalClaims.toLocaleString()} subtitle="codes claimed" icon={Ticket} iconBg="bg-orange-50" iconColor="text-[#e85d04]" change={8.4} />
          <KpiCard title="Redemptions" value={totalRedemptions.toLocaleString()} subtitle="fully redeemed" icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" change={14.1} />
          <KpiCard title="Redemption Rate" value={`${redemptionRate}%`} subtitle="clicks → redeem" icon={TrendingUp} iconBg="bg-violet-50" iconColor="text-violet-600" change={3.2} />
          <KpiCard title="Avg. Order Value" value={aov > 0 ? `₹${aov}` : "—"} subtitle="revenue per order" icon={ShoppingBag} iconBg="bg-amber-50" iconColor="text-amber-600" change={5.7} />
        </div>

        {/* Chart Row 1: Clicks vs Redemptions (dual line) + Top 5 Coupons Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsCard title="Clicks vs Redemptions Trend">
            <div className="flex items-center gap-5 mb-4">
              <div className="flex items-center gap-2"><span className="w-4 h-0.5 bg-[#2563eb] rounded" /><span className="text-[11px] font-semibold text-slate-500">Clicks</span></div>
              <div className="flex items-center gap-2"><span className="w-4 h-0.5 bg-[#e85d04] rounded" /><span className="text-[11px] font-semibold text-slate-500">Redemptions</span></div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrichedTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} name="Clicks" />
                  <Line type="monotone" dataKey="redemptions" stroke="#e85d04" strokeWidth={2} dot={{ r: 2 }} name="Redemptions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          <AnalyticsCard title="Top 5 Coupons by Redemptions">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={90} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, "Redemptions"]} />
                  <Bar dataKey="redemptions" radius={[0, 4, 4, 0]} barSize={16}>
                    {top5.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#e85d04" : "#2563eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {top5.length === 0 && (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">No coupon data yet</p>
            )}
          </AnalyticsCard>
        </div>

        {/* Chart Row 2: Traffic Source Donut + Day-of-Week Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsCard title="Traffic Source Breakdown">
            <div className="flex items-center gap-6">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={TRAFFIC_SOURCES} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="value">
                      {TRAFFIC_SOURCES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, "Traffic"]} {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-600">Traffic</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {TRAFFIC_SOURCES.map((src) => (
                  <div key={src.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                      <span className="text-slate-600">{src.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{src.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </AnalyticsCard>

          <AnalyticsCard title="Best Performing Days of Week">
            <div className="h-[176px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, "Redemptions"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={22}>
                    {dayData.map((d, i) => (
                      <Cell key={i} fill={d.value === Math.max(...dayData.map((x) => x.value)) ? "#e85d04" : "#2563eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>
        </div>

        {/* Coupon Performance Table — Sortable + Export */}
        <AnalyticsCard title="Coupon Performance Table">
          {sortedRows.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BarChart2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-400">No coupon data yet. Create coupons to see performance.</p>
              <Link href="/merchant/coupons/new" className="inline-block text-xs font-bold text-brand-blue underline underline-offset-2">
                + Create your first coupon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-border">
                    {[
                      { key: "title", label: "Coupon", align: "left" },
                      { key: "code", label: "Code", align: "left" },
                      { key: "clicks", label: "Clicks", align: "right" },
                      { key: "redemptions", label: "Redemptions", align: "right" },
                      { key: "successRate", label: "Success Rate", align: "right" },
                      { key: "revenue", label: "Revenue", align: "right" },
                      { key: "aov", label: "AOV", align: "right" },
                      { key: "status", label: "Status", align: "center" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => ["title", "code", "status"].includes(col.key) ? null : toggleSort(col.key)}
                        className={`pb-2.5 text-[10px] font-bold text-brand-subtext uppercase tracking-wider px-3 first:pl-0 last:pr-0 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""} ${!["title", "code", "status"].includes(col.key) ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}
                      >
                        <div className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""}`}>
                          <span>{col.label}</span>
                          {!["title", "code", "status"].includes(col.key) && <SortIcon field={col.key} sortKey={sortKey} sortDir={sortDir} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {sortedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-brand-surface/50 transition-colors">
                      <td className="py-3 pr-3 text-xs font-bold text-slate-800 max-w-[160px]">
                        <span className="truncate block">{row.title}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500 uppercase">{row.code}</td>
                      <td className="py-3 px-3 text-right text-xs font-semibold text-slate-600">{row.clicks.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-xs font-bold text-slate-800">{row.redemptions.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.successRate >= 10 ? "bg-emerald-50 text-emerald-700" : row.successRate >= 5 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          {row.successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-black text-slate-900">₹{row.revenue.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right text-xs font-semibold text-slate-600">{row.aov > 0 ? `₹${row.aov}` : "—"}</td>
                      <td className="py-3 pl-3 text-center">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${row.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AnalyticsCard>

        {/* Pro+ Gated: Audience Insights + Revival Stats */}
        <div className="relative">
          {!isProPlus && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[6px] z-20 flex flex-col items-center justify-center border border-brand-border rounded-[16px] p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-black text-brand-navy">Unlock Pro Analytics</h3>
              <p className="text-xs text-brand-subtext max-w-md mt-2 font-semibold leading-relaxed">
                Upgrade to Pro for audience insights (New vs Returning, top cities, device types, hour heatmap) and Expired Offer Revival stats.
              </p>
              <Link href="/merchant/billing" className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold mt-5 shadow-none border-0 h-auto cursor-pointer flex items-center gap-1.5">
                <span>Upgrade to Pro — ₹3,999/mo</span>
              </Link>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!isProPlus ? "opacity-30 select-none pointer-events-none" : ""}`}>
            {/* Audience Demographics */}
            <AnalyticsCard title="Audience Insights">
              <div className="grid grid-cols-2 gap-6 py-2">
                <div className="space-y-3 text-center">
                  <p className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">New vs Returning</p>
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="68 32" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0a2e6e" strokeWidth="4" strokeDasharray="32 68" strokeDashoffset="-68" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-slate-800">68%</span>
                      <span className="text-[8px] text-slate-400">New</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 text-[10px] font-semibold">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue" /><span>New 68%</span></div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-navy" /><span>Return 32%</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">Top Cities</p>
                  <div className="space-y-2.5">
                    {cityData.map((c) => (
                      <div key={c.city} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-600">{c.city}</span>
                          <span className="text-slate-800">{c.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-blue h-full rounded-full" style={{ width: `${c.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnalyticsCard>

            {/* Device Breakdown */}
            <AnalyticsCard title="Device & Hour Breakdown">
              <div className="space-y-4 py-2">
                <p className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">Claim Device Breakdown</p>
                {deviceData.map((d) => (
                  <div key={d.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">{d.name}</span>
                      <span className="text-slate-800">{d.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-brand-blue h-full rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-brand-border pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Peak Redemption Hours
                  </p>
                  <div className="grid grid-cols-12 gap-1">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const isPeak = [12, 13, 19, 20, 21].includes(hour);
                      const isMed = [11, 14, 18, 22].includes(hour);
                      return (
                        <div key={hour} title={`${hour}:00`} className={`h-6 rounded text-[7px] flex items-center justify-center ${isPeak ? "bg-[#e85d04] text-white font-bold" : isMed ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-400"}`}>
                          {hour % 6 === 0 ? hour : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </AnalyticsCard>

            {/* Revival Stats */}
            <AnalyticsCard title="Expired Offer Revival Stats">
              <div className="grid grid-cols-3 gap-4 py-2 text-center">
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-brand-subtext uppercase">Revived</p>
                  <p className="text-2xl font-black text-brand-navy">{revivalStats.totalRevived}</p>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-brand-subtext uppercase">Approval Rate</p>
                  <p className="text-2xl font-black text-emerald-600">{revivalStats.approvalRate}</p>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-brand-subtext uppercase">Revenue Saved</p>
                  <p className="text-2xl font-black text-brand-navy">₹{revivalStats.revenueRecovered.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </AnalyticsCard>

            {/* Award performance badges */}
            <AnalyticsCard title="Performance Badges">
              <div className="grid grid-cols-3 gap-4 py-2 text-center">
                {[
                  { icon: Award, label: "Top Earner", value: sortedRows.sort((a,b)=>b.revenue-a.revenue)[0]?.title || "—", color: "text-[#e85d04] bg-orange-50" },
                  { icon: TrendingUp, label: "Most Clicked", value: sortedRows.sort((a,b)=>b.clicks-a.clicks)[0]?.title || "—", color: "text-blue-600 bg-blue-50" },
                  { icon: CheckCircle2, label: "Best Conv.", value: sortedRows.sort((a,b)=>b.successRate-a.successRate)[0]?.title || "—", color: "text-emerald-600 bg-emerald-50" },
                ].map((badge) => (
                  <div key={badge.label} className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-2">
                    <div className={`w-9 h-9 rounded-lg mx-auto flex items-center justify-center ${badge.color}`}>
                      <badge.icon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold text-brand-subtext uppercase">{badge.label}</p>
                    <p className="text-[11px] font-black text-brand-navy leading-tight line-clamp-2">{badge.value}</p>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
