"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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

export default function PerformanceChart({
  trendData,
  activeMetricTab,
  setActiveMetricTab,
}) {
  return (
    <Card className="col-span-full xl:col-span-8 border-[#e2e8f0] shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
        <div>
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Overview
          </CardTitle>
          <CardDescription className="text-[11px] font-semibold mt-0.5">
            Monthly performance for the current year
          </CardDescription>
        </div>
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0 select-none">
          {["revenue", "orders", "profit"].map((metric) => (
            <button
              key={metric}
              type="button"
              onClick={() => setActiveMetricTab(metric)}
              className={`text-[10px] font-bold px-3.5 py-1 rounded-md transition-all uppercase cursor-pointer border-0 ${
                activeMetricTab === metric
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 bg-transparent"
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetricTab === "orders" ? (
              <BarChart
                data={trendData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
                  }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8" }}
                  itemStyle={{ fontSize: "12px", color: "#fff" }}
                  formatter={(value) => [`${value} Orders`, "Volume"]}
                />
                <Bar
                  dataKey="orders"
                  fill="#134e5e"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="mainAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
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
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(tick) => `₹${(tick / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                  }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8" }}
                  itemStyle={{ fontSize: "12px", color: "#fff" }}
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    activeMetricTab === "revenue" ? "Revenue" : "Profit",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetricTab}
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#mainAreaGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
