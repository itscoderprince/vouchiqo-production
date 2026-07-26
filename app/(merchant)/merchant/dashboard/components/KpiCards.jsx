"use client";

import {
  CheckCircle2,
  Eye,
  IndianRupee,
  LayoutList,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

function RechartsSparkline({
  data = [],
  dataKey = "value",
  color = "#2563eb",
}) {
  if (data.length === 0) return null;
  const chartData = data.map((val, idx) => ({ id: idx, value: val }));
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <defs>
            <linearGradient
              id={`sparkGrad-${dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkGrad-${dataKey})`}
            dot={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  sparkData,
  sparkKey,
  sparkColor,
}) {
  return (
    <div
      data-slot="card"
      className="rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-xs group relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-blue-300 font-sans"
    >
      <div data-slot="card-content" className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">{title}</p>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">
              {value}
            </p>
            <div className="flex items-center gap-1.5 pt-0.5">
              {trend !== null && trend !== undefined ? (
                trend >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-600" />
                )
              ) : null}
              {trend !== null && trend !== undefined && (
                <span
                  className={`text-[11px] font-bold ${trend >= 0 ? "text-blue-600" : "text-rose-600"}`}
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium">
                {trend !== null && trend !== undefined
                  ? "vs last month"
                  : subtitle}
              </span>
            </div>
          </div>
          <div
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0 ${iconBg}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </div>
      <div className="h-8 w-full mt-2">
        <RechartsSparkline
          data={sparkData}
          dataKey={sparkKey}
          color={sparkColor}
        />
      </div>
    </div>
  );
}

export default function KpiCards({
  totalRevenue = 0,
  revenueMoM,
  totalClaims = 0,
  totalRedemptions = 0,
  ordersMoM,
  pageViews = 0,
  trendData = [],
  activeCoupons = 0,
  planLimit = 0,
}) {
  const listingPct =
    planLimit > 0
      ? Math.min(100, Math.round((activeCoupons / planLimit) * 100))
      : 0;

  const numRevenue = Number(totalRevenue);
  const safeTotalRevenue = Number.isNaN(numRevenue) ? 0 : numRevenue;
  const numRedemptions = Number(totalRedemptions);
  const safeTotalRedemptions = Number.isNaN(numRedemptions) ? 0 : numRedemptions;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Total Clicks (page views proxy) */}
      <KpiCard
        title="Total Clicks This Month"
        value={pageViews > 0 ? pageViews.toLocaleString("en-IN") : "0"}
        subtitle="Coupon page visits"
        icon={Eye}
        iconBg="bg-[#2563eb]/10"
        iconColor="text-[#2563eb]"
        sparkData={trendData.map((t) => t.views || 0)}
        sparkKey="clicks"
        sparkColor="#2563eb"
      />

      {/* Card 2: Coupon Redemptions */}
      <KpiCard
        title="Coupon Redemptions"
        value={safeTotalRedemptions.toLocaleString("en-IN")}
        trend={ordersMoM}
        icon={CheckCircle2}
        iconBg="bg-[#059669]/10"
        iconColor="text-[#059669]"
        sparkData={trendData.map((t) => t.redemptions || t.orders || 0)}
        sparkKey="redemptions"
        sparkColor="#059669"
      />

      {/* Card 3: Revenue Driven */}
      <KpiCard
        title="Est. Revenue Driven (₹)"
        value={`₹${safeTotalRevenue.toLocaleString("en-IN")}`}
        trend={revenueMoM}
        icon={IndianRupee}
        iconBg="bg-blue-50 border border-blue-100"
        iconColor="text-blue-600"
        sparkData={trendData.map((t) => t.revenue || 0)}
        sparkKey="revenue"
        sparkColor="#2563eb"
      />

      {/* Card 4: Active Listings with plan limit */}
      <div
        data-slot="card"
        className="rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-xs group relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-blue-300 font-sans"
      >
        <div data-slot="card-content" className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1 w-full">
              <p className="text-[11px] font-semibold text-slate-500">
                Active Listings
              </p>
              <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                {activeCoupons ?? 0}
                {planLimit > 0 && (
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    / {planLimit}
                  </span>
                )}
              </p>
              {planLimit > 0 ? (
                <div className="space-y-0.5 w-full pt-0.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${listingPct >= 90 ? "bg-rose-500" : "bg-blue-600"}`}
                      style={{ width: `${listingPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {listingPct}% of plan limit used
                  </p>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Live coupons &amp; deals
                </span>
              )}
            </div>
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 bg-blue-50 border border-blue-100 ml-2.5 shrink-0">
              <LayoutList className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="h-8 w-full mt-2">
          <RechartsSparkline
            data={trendData.map((t) => t.views || t.orders || 0)}
            dataKey="listings"
            color="#7c3aed"
          />
        </div>
      </div>
    </div>
  );
}
