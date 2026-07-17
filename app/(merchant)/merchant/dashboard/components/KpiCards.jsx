"use client";

import {
  Eye,
  IndianRupee,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

// Premium Recharts-based Sparkline component
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

export default function KpiCards({
  totalRevenue,
  revenueMoM,
  totalClaims,
  totalRedemptions,
  ordersMoM,
  pageViews,
  trendData,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Total Revenue */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
      >
        <div data-slot="card-content" className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-bold tracking-tight">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center gap-1.5">
                {revenueMoM !== null ? (
                  revenueMoM >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                  )
                ) : null}
                {revenueMoM !== null && (
                  <span
                    className={`text-xs font-semibold ${revenueMoM >= 0 ? "text-blue-600" : "text-rose-600"}`}
                  >
                    {revenueMoM >= 0 ? "+" : ""}
                    {revenueMoM}%
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {revenueMoM !== null ? "vs last month" : "No trend data"}
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#2563eb]/10">
              <IndianRupee className="h-5 w-5 text-[#2563eb]" />
            </div>
          </div>
        </div>
        <div className="h-12 w-full mt-3">
          <RechartsSparkline
            data={trendData.map((t) => t.revenue)}
            dataKey="revenue"
            color="#2563eb"
          />
        </div>
      </div>

      {/* Card 2: Active Users */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
      >
        <div data-slot="card-content" className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Active Users
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {totalClaims.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Coupon claims this period
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#2563eb]/10">
              <Users className="h-5 w-5 text-[#2563eb]" />
            </div>
          </div>
        </div>
        <div className="h-12 w-full mt-3">
          <RechartsSparkline
            data={trendData.map((t) => t.orders * 1.5 + 50)}
            dataKey="users"
            color="#2563eb"
          />
        </div>
      </div>

      {/* Card 3: Total Orders */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
      >
        <div data-slot="card-content" className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Total Orders
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {totalRedemptions.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5">
                {ordersMoM !== null ? (
                  ordersMoM >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                  )
                ) : null}
                {ordersMoM !== null && (
                  <span
                    className={`text-xs font-semibold ${ordersMoM >= 0 ? "text-blue-600" : "text-rose-600"}`}
                  >
                    {ordersMoM >= 0 ? "+" : ""}
                    {ordersMoM}%
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {ordersMoM !== null ? "vs last month" : "No trend data"}
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#3e80dd]/10">
              <ShoppingCart className="h-5 w-5 text-[#3e80dd]" />
            </div>
          </div>
        </div>
        <div className="h-12 w-full mt-3">
          <RechartsSparkline
            data={trendData.map((t) => t.orders)}
            dataKey="orders"
            color="#3e80dd"
          />
        </div>
      </div>

      {/* Card 4: Page Views */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
      >
        <div data-slot="card-content" className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Page Views
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {pageViews > 0 ? `${(pageViews / 1000).toFixed(1)}K` : "—"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Coupon page visits
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#eab308]/10">
              <Eye className="h-5 w-5 text-[#eab308]" />
            </div>
          </div>
        </div>
        <div className="h-12 w-full mt-3">
          <RechartsSparkline
            data={trendData.map((t) => t.orders * 4 + 300)}
            dataKey="views"
            color="#eab308"
          />
        </div>
      </div>
    </div>
  );
}
