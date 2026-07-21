"use client";

import {
  CheckCircle2,
  Eye,
  IndianRupee,
  LayoutList,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

function RechartsSparkline({ data = [], dataKey = "value", color = "#2563eb" }) {
  if (data.length === 0) return null;
  const chartData = data.map((val, idx) => ({ id: idx, value: val }));
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`sparkGrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
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

function KpiCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendLabel, sparkData, sparkKey, sparkColor }) {
  return (
    <div
      data-slot="card"
      className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
    >
      <div data-slot="card-content" className="p-5 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend !== null && trend !== undefined ? (
                trend >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                )
              ) : null}
              {trend !== null && trend !== undefined && (
                <span className={`text-xs font-semibold ${trend >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                  {trend >= 0 ? "+" : ""}{trend}%
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {trend !== null && trend !== undefined ? "vs last month" : subtitle}
              </span>
            </div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </div>
      <div className="h-12 w-full mt-3">
        <RechartsSparkline data={sparkData} dataKey={sparkKey} color={sparkColor} />
      </div>
    </div>
  );
}

export default function KpiCards({
  totalRevenue,
  revenueMoM,
  totalClaims,
  totalRedemptions,
  ordersMoM,
  pageViews,
  trendData,
  activeCoupons,
  planLimit,
}) {
  const listingPct = planLimit > 0 ? Math.min(100, Math.round((activeCoupons / planLimit) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Total Clicks (page views proxy) */}
      <KpiCard
        title="Total Clicks This Month"
        value={pageViews > 0 ? pageViews.toLocaleString() : "0"}
        subtitle="Coupon page visits"
        icon={Eye}
        iconBg="bg-[#2563eb]/10"
        iconColor="text-[#2563eb]"
        sparkData={trendData.map((t) => t.orders * 4 + 50)}
        sparkKey="clicks"
        sparkColor="#2563eb"
      />

      {/* Card 2: Coupon Redemptions */}
      <KpiCard
        title="Coupon Redemptions"
        value={totalRedemptions.toLocaleString()}
        trend={ordersMoM}
        icon={CheckCircle2}
        iconBg="bg-[#059669]/10"
        iconColor="text-[#059669]"
        sparkData={trendData.map((t) => t.orders)}
        sparkKey="redemptions"
        sparkColor="#059669"
      />

      {/* Card 3: Revenue Driven */}
      <KpiCard
        title="Est. Revenue Driven (₹)"
        value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        trend={revenueMoM}
        icon={IndianRupee}
        iconBg="bg-[#e85d04]/10"
        iconColor="text-[#e85d04]"
        sparkData={trendData.map((t) => t.revenue)}
        sparkKey="revenue"
        sparkColor="#e85d04"
      />

      {/* Card 4: Active Listings with plan limit */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
      >
        <div data-slot="card-content" className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2 w-full">
              <p className="text-xs font-medium text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold tracking-tight">
                {activeCoupons ?? 0}
                {planLimit > 0 && (
                  <span className="text-sm font-semibold text-muted-foreground ml-1">/ {planLimit}</span>
                )}
              </p>
              {planLimit > 0 ? (
                <div className="space-y-1 w-full">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${listingPct >= 90 ? "bg-rose-500" : listingPct >= 70 ? "bg-amber-500" : "bg-[#2563eb]"}`}
                      style={{ width: `${listingPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{listingPct}% of plan limit used</p>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Live coupons &amp; deals</span>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-violet-100 ml-3 shrink-0">
              <LayoutList className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>
        <div className="h-12 w-full mt-3">
          <RechartsSparkline
            data={trendData.map((t) => t.orders * 1.2 + 10)}
            dataKey="listings"
            color="#7c3aed"
          />
        </div>
      </div>
    </div>
  );
}
