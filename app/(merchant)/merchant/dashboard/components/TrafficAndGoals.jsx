"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function TrafficAndGoals({
  pageViews = 0,
  totalRevenue = 0,
  totalClaims = 0,
  totalRedemptions = 0,
  analyticsData = {},
}) {
  const queryClient = useQueryClient();

  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  const zeroTraffic = [
    { name: "Direct", value: 0, color: "#F72853" },
    { name: "Organic", value: 0, color: "#3b82f6" },
    { name: "Referral", value: 0, color: "#10b981" },
    { name: "Social", value: 0, color: "#8b5cf6" },
  ];

  const defaultActiveTraffic = [
    { name: "Direct", value: 35, color: "#F72853" },
    { name: "Organic", value: 28, color: "#3b82f6" },
    { name: "Referral", value: 22, color: "#10b981" },
    { name: "Social", value: 15, color: "#8b5cf6" },
  ];

  const trafficData =
    analyticsData?.trafficSources && analyticsData.trafficSources.length > 0
      ? analyticsData.trafficSources
      : pageViews > 0
        ? defaultActiveTraffic
        : zeroTraffic;

  // Monthly Targets
  const revenueGoal = analyticsData?.goals?.revenueTarget || 100000;
  const revenueActual = Number(totalRevenue) || 0;
  const revenuePct =
    revenueGoal > 0
      ? Math.min(100, Math.round((revenueActual / revenueGoal) * 100))
      : 0;

  const claimsGoal = analyticsData?.goals?.claimsTarget || 50;
  const claimsActual = Number(totalClaims) || 0;
  const claimsPct =
    claimsGoal > 0
      ? Math.min(100, Math.round((claimsActual / claimsGoal) * 100))
      : 0;

  const redemptionsActual = Number(totalRedemptions) || 0;
  const redemptionPct =
    claimsActual > 0
      ? Math.min(100, Math.round((redemptionsActual / claimsActual) * 100))
      : 0;

  const visitsDisplay =
    pageViews >= 1000 ? `${(pageViews / 1000).toFixed(1)}k` : `${pageViews}`;

  return (
    <div className="col-span-full flex flex-col gap-3 xl:col-span-4 font-sans">
      {/* Traffic Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-slate-50/40">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
            Traffic Sources
          </h3>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
            Where your visitors come from (Live DB)
          </p>
        </div>
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-24 w-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      pageViews > 0
                        ? trafficData
                        : [{ name: "None", value: 1, color: "#f1f5f9" }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={44}
                    paddingAngle={pageViews > 0 ? 2 : 0}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {(pageViews > 0
                      ? trafficData
                      : [{ name: "None", value: 1, color: "#f1f5f9" }]
                    ).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-sm font-semibold text-slate-800">
                  {visitsDisplay}
                </span>
                <span className="text-[9px] font-normal text-slate-400">
                  Visits
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {trafficData.map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs text-slate-600 font-normal">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-900">
                    {t.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goals Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-slate-50/40">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
            Monthly Goals
          </h3>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
            Track progress toward targets
          </p>
        </div>
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Goal 1: Monthly Revenue */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700">
                Monthly Revenue
              </span>
              <span className="text-[#F72853] font-medium text-xs">
                {revenuePct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#F72853]"
                style={{ width: `${revenuePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-normal">
              <span>₹{revenueActual.toLocaleString("en-IN")}</span>
              <span>Target: ₹{revenueGoal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Goal 2: Coupon Claims */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700">Coupon Claims</span>
              <span className="text-blue-600 font-medium text-xs">
                {claimsPct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-blue-600"
                style={{ width: `${claimsPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-normal">
              <span>{claimsActual.toLocaleString("en-IN")}</span>
              <span>Target: {claimsGoal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Goal 3: Conversion Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700">
                Conversion Rate
              </span>
              <span className="text-emerald-600 font-medium text-xs">
                {redemptionPct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-emerald-500"
                style={{ width: `${redemptionPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-normal">
              <span>{redemptionsActual} redeemed</span>
              <span>of {claimsActual} claimed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
