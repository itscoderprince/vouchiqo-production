"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function TrafficSourcesCard({ analyticsData = {} }) {
  const queryClient = useQueryClient();

  // Socket.IO Real-time listeners to keep analytics fresh
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  });

  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  });

  const totalVisits = Number(analyticsData?.totalVisits) || 0;
  const sources =
    analyticsData?.trafficSources && analyticsData.trafficSources.length > 0
      ? analyticsData.trafficSources
      : [
          { label: "Direct", value: 0, pct: "0%", color: "bg-[#3e80dd]" },
          { label: "Organic", value: 0, pct: "0%", color: "bg-[#2563eb]" },
          { label: "Referral", value: 0, pct: "0%", color: "bg-[#0a2e6e]" },
          { label: "Social", value: 0, pct: "0%", color: "bg-[#8b5cf6]" },
        ];

  const visitsDisplay =
    totalVisits >= 1000
      ? `${(totalVisits / 1000).toFixed(1)}K`
      : `${totalVisits}`;

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col p-0 gap-0 text-left font-sans">
      <CardHeader className="px-4 py-3 sm:px-5 sm:py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/40 min-h-[48px] flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-sans text-xs font-medium text-slate-800 tracking-wider uppercase m-0 leading-none">
            Traffic Sources
          </CardTitle>
          <CardDescription className="text-[11px] font-normal text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Where your visitors come from (Live DB)
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-[10px] font-normal border-slate-200 text-slate-700 bg-white">
          {visitsDisplay} Visits
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Total Visits Center Display */}
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="text-center">
              <span className="text-xl font-medium text-slate-900 block leading-none">
                {visitsDisplay}
              </span>
              <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider mt-1 block">
                Total Visits
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {sources.map((src, i) => {
              const numVal =
                typeof src.value === "number"
                  ? src.value
                  : Number.parseInt(src.pct || "0", 10) || 0;

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-normal">
                    <span className="text-slate-700">
                      {src.label || src.name}
                    </span>
                    <span className="text-slate-800 font-medium">
                      {src.pct || `${numVal}%`}
                    </span>
                  </div>
                  {/* Shadcn UI Progress Component */}
                  <Progress
                    value={numVal}
                    className="h-1.5 rounded-full bg-slate-100"
                    indicatorClassName={src.color || "bg-[#2563eb]"}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
