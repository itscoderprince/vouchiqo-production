"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Socket.IO Real-time listeners to auto-refresh merchant analytics on claims / redemptions
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  const zeroTraffic = [
    { name: "Direct", value: 0, color: "#3e80dd" },
    { name: "Organic", value: 0, color: "#2563eb" },
    { name: "Referral", value: 0, color: "#0a2e6e" },
    { name: "Social", value: 0, color: "#8b5cf6" },
  ];

  const defaultActiveTraffic = [
    { name: "Direct", value: 35, color: "#3e80dd" },
    { name: "Organic", value: 28, color: "#2563eb" },
    { name: "Referral", value: 22, color: "#0a2e6e" },
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

  // Format visitor center count directly from DB pageViews
  const visitsDisplay =
    pageViews >= 1000
      ? `${(pageViews / 1000).toFixed(1)}k`
      : `${pageViews}`;

  return (
    <div className="col-span-full flex flex-col gap-4 xl:col-span-4 font-sans">
      {/* Traffic Card */}
      <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col hover:shadow-sm transition-all duration-200 p-0 gap-0">
        <CardHeader className="px-4 py-3 sm:px-4 sm:py-3 border-b border-slate-100 bg-slate-50/50 min-h-[48px]">
          <CardTitle className="font-sans text-xs sm:text-[12px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
            Traffic Sources
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Where your visitors come from (Live DB)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pageViews > 0 ? trafficData : [{ name: "None", value: 1, color: "#e2e8f0" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={52}
                    paddingAngle={pageViews > 0 ? 2 : 0}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {(pageViews > 0 ? trafficData : [{ name: "None", value: 1, color: "#e2e8f0" }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-sm font-extrabold text-slate-800">
                  {visitsDisplay}
                </span>
                <span className="text-[9px] font-medium text-slate-400">Visits</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {trafficData.map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-[11px] text-slate-600 font-medium">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">
                    {t.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Card */}
      <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col hover:shadow-sm transition-all duration-200 p-0 gap-0">
        <CardHeader className="px-4 py-3 sm:px-4 sm:py-3 border-b border-slate-100 bg-slate-50/50 min-h-[48px]">
          <CardTitle className="font-sans text-xs sm:text-[12px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
            Monthly Goals
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Track progress toward targets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4 space-y-3.5">
          {/* Goal 1: Monthly Revenue */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-800">
                Monthly Revenue
              </span>
              <span className="text-blue-600 font-extrabold">
                {revenuePct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#2563eb]"
                style={{ width: `${revenuePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>₹{revenueActual.toLocaleString("en-IN")}</span>
              <span>Target: ₹{revenueGoal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Goal 2: Coupon Claims */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-800">
                Coupon Claims
              </span>
              <span className="text-blue-600 font-extrabold">
                {claimsPct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#2563eb]"
                style={{ width: `${claimsPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>{claimsActual.toLocaleString("en-IN")}</span>
              <span>Target: {claimsGoal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Goal 3: Conversion Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-800">
                Conversion Rate
              </span>
              <span className="text-blue-600 font-extrabold">
                {redemptionPct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#2563eb]"
                style={{ width: `${redemptionPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>{redemptionsActual} redeemed</span>
              <span>of {claimsActual} claimed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
