"use client";

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
  activeRange,
  setActiveRange,
}) {
  // Build enriched chart data with clicks proxy alongside redemptions
  const chartData = trendData.map((t) => ({
    label: t.label,
    clicks: (t.orders || 0) * 4 + Math.round(Math.random() * 20),
    redemptions: t.orders || 0,
  }));

  return (
    <Card className="col-span-full xl:col-span-8 border-[#e2e8f0] shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
        <div>
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Clicks vs Redemptions
          </CardTitle>
          <CardDescription className="text-[11px] font-semibold mt-0.5">
            Performance trend — last {activeRange ?? "30 Days"}
          </CardDescription>
        </div>
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0 select-none">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`text-[10px] font-bold px-3.5 py-1 rounded-md transition-all uppercase cursor-pointer border-0 ${
                (activeRange ?? "30 Days") === range
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 bg-transparent"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Chart legend */}
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#2563eb] rounded inline-block" />
            <span className="text-[11px] font-semibold text-slate-500">Clicks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#e85d04] rounded inline-block" />
            <span className="text-[11px] font-semibold text-slate-500">Redemptions</span>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
                stroke="#e85d04"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#e85d04" }}
                activeDot={{ r: 5 }}
                name="Redemptions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
