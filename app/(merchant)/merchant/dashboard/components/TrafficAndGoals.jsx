"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export default function TrafficAndGoals({
  pageViews,
  totalRevenue,
  totalClaims,
  totalRedemptions,
  analyticsData,
}) {
  const trafficData = [
    { name: "Direct", value: 35, color: "#3e80dd" },
    { name: "Organic", value: 28, color: "#2563eb" },
    { name: "Referral", value: 22, color: "#0a2e6e" },
    { name: "Social", value: 15, color: "#2563eb" },
  ];

  const revenueGoal = analyticsData?.goals?.revenueTarget ?? 0;
  const revenueActual = totalRevenue;
  const revenuePct =
    revenueGoal > 0
      ? Math.min(100, Math.round((revenueActual / revenueGoal) * 100))
      : 0;

  const claimsGoal = analyticsData?.goals?.claimsTarget ?? 0;
  const claimsPct =
    claimsGoal > 0
      ? Math.min(100, Math.round((totalClaims / claimsGoal) * 100))
      : 0;

  const redemptionPct =
    totalClaims > 0
      ? Math.min(100, Math.round((totalRedemptions / totalClaims) * 100))
      : 0;

  return (
    <div className="col-span-full flex flex-col gap-4 xl:col-span-4">
      {/* Traffic Card */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-200"
      >
        <div
          data-slot="card-header"
          className="flex flex-col space-y-1.5 p-6 pb-2"
        >
          <div className="tracking-tight text-base font-semibold">
            Traffic Sources
          </div>
          <p className="text-xs text-muted-foreground">
            Where your visitors come from
          </p>
        </div>
        <div data-slot="card-content" className="p-6 pt-0">
          <div className="flex items-center gap-4">
            <div className="relative h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={63}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-lg font-bold text-slate-800">
                  {pageViews > 0 ? `${(pageViews / 1000).toFixed(0)}K` : "—"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Visits
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {trafficData.map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {t.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goals Card */}
      <div
        data-slot="card"
        className="rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-200"
      >
        <div
          data-slot="card-header"
          className="flex flex-col space-y-1.5 p-6 pb-2"
        >
          <div className="tracking-tight text-base font-semibold">
            Monthly Goals
          </div>
          <p className="text-xs text-muted-foreground">
            Track progress toward targets
          </p>
        </div>
        <div data-slot="card-content" className="p-6 pt-0 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                Monthly Revenue
              </span>
              <span className="text-muted-foreground">
                {revenueGoal > 0 ? `${revenuePct}%` : "—"}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#2563eb]"
                style={{ width: revenueGoal > 0 ? `${revenuePct}%` : "0%" }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>₹{revenueActual.toLocaleString("en-IN")}</span>
              <span>
                {revenueGoal > 0
                  ? `Target: ₹${revenueGoal.toLocaleString("en-IN")}`
                  : "No target set"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Coupon Claims</span>
              <span className="text-muted-foreground">
                {claimsGoal > 0 ? `${claimsPct}%` : "—"}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#2563eb]"
                style={{ width: claimsGoal > 0 ? `${claimsPct}%` : "0%" }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{totalClaims.toLocaleString()}</span>
              <span>
                {claimsGoal > 0
                  ? `Target: ${claimsGoal.toLocaleString()}`
                  : "No target set"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                Conversion Rate
              </span>
              <span className="text-muted-foreground">
                {totalClaims > 0 ? `${redemptionPct}%` : "—"}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#3e80dd]"
                style={{ width: `${redemptionPct}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{totalRedemptions} redeemed</span>
              <span>of {totalClaims} claimed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
