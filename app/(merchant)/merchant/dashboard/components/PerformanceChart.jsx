"use client";

import { MousePointerClick, TicketCheck } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TIME_RANGES = ["7 Days", "30 Days", "90 Days"];

export default function PerformanceChart({
  trendData,
  activeRange = "30 Days",
  setActiveRange,
}) {
  // Build chart data exclusively from real DB trendData — no fake/demo fallback
  const chartData =
    trendData && trendData.length > 0
      ? trendData.map((t) => ({
          label: t.label,
          clicks: t.views || 0,
          redemptions: t.redemptions || t.orders || 0,
        }))
      : [];

  const totalClicksInView = chartData.reduce((s, c) => s + (c.clicks || 0), 0);
  const hasData = chartData.some((c) => c.clicks > 0 || c.redemptions > 0);

  return (
    <Card className="col-span-full xl:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-200 p-0 gap-0 font-sans">
      <CardHeader className="px-4 py-3 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50 min-h-[48px]">
        <div>
          <CardTitle className="font-sans text-xs sm:text-[12px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
            Clicks vs Redemptions
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Performance trend — last {activeRange ?? "30 Days"}
          </CardDescription>
        </div>
        <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-slate-100/90 shrink-0 select-none">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md transition-all uppercase cursor-pointer border-0 ${
                (activeRange ?? "30 Days") === range
                  ? "bg-white text-[#08214d] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 bg-transparent"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-4 pt-3 flex-1 flex flex-col justify-between">
        {/* Chart legend & summary */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <MousePointerClick className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                Clicks
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-[#0f2137] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <TicketCheck className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                Redemptions
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Period Clicks:{" "}
            <strong className="text-slate-900">
              {totalClicksInView.toLocaleString()}
            </strong>
          </span>
        </div>

        {/* Full-Height Dynamic Chart Container */}
        <div className="h-56 sm:h-64 w-full flex-1 pt-1">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
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
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8" }}
                  itemStyle={{ fontSize: "12px", color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2563eb" }}
                  activeDot={{ r: 5 }}
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="redemptions"
                  stroke="#0f2137"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0f2137" }}
                  activeDot={{ r: 5 }}
                  name="Redemptions"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-[12px] font-semibold text-slate-500">
                No activity yet
              </p>
              <p className="text-[11px] text-slate-400 max-w-[220px]">
                Clicks and redemptions will appear here once customers interact
                with your offers.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
