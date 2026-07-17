"use client";

import {
  Award,
  Check,
  Download,
  Lock,
  PiggyBank,
  Search,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KPICard from "@/components/shared/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DONUT_COLORS = [
  "#2563eb",
  "#1E4FAF",
  "#2563eb",
  "#FFB020",
  "#A855F7",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
];

export default function SavingsTab({
  savingsData,
  handleShareSavings,
  copiedShareCard,
  handleExportCSV,
}) {
  // Chart range & toggles
  const [timelineRange, setTimelineRange] = useState("12");

  // Table search/pagination/sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Category filter (from Donut slice click)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 1. Transaction history computations
  let filteredTx = savingsData?.recentTransactions || [];
  if (selectedCategory) {
    filteredTx = filteredTx.filter(
      (t) => t.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filteredTx = filteredTx.filter(
      (t) =>
        t.brand.toLowerCase().includes(term) ||
        t.code.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term),
    );
  }

  // Sort
  filteredTx.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === "saved") {
      valA = parseFloat(a.amountSaved.replace(/[^0-9.]/g, ""));
      valB = parseFloat(b.amountSaved.replace(/[^0-9.]/g, ""));
    } else if (sortField === "date") {
      valA = new Date(a.date.split(" ").reverse().join(" "));
      valB = new Date(b.date.split(" ").reverse().join(" "));
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalFilteredCount = filteredTx.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTx = filteredTx.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // 2. Timeline calculations
  let activeTimeline = [...(savingsData?.timeline || [])];
  if (timelineRange === "3") activeTimeline = activeTimeline.slice(-3);
  else if (timelineRange === "6") activeTimeline = activeTimeline.slice(-6);
  else if (timelineRange === "12") activeTimeline = activeTimeline.slice(-12);

  const chartData = activeTimeline.map((t) => ({
    name: t.label.split(" ")[0],
    savings: t.saved,
    spending: t.spent,
    fullLabel: t.label,
  }));

  // Donut slices
  const totalSavedVal =
    savingsData?.categoryBreakdown?.reduce(
      (sum, item) => sum + item.saved,
      0,
    ) || 0;
  const donutCircumference = 2 * Math.PI * 60;
  let cumulativePct = 0;

  const donutSlices = (savingsData?.categoryBreakdown || []).map(
    (item, idx) => {
      const percentage = item.saved / (totalSavedVal || 1);
      const strokeDash = percentage * donutCircumference;
      const strokeOffset =
        donutCircumference - strokeDash + cumulativePct * donutCircumference;
      cumulativePct -= percentage;
      return {
        category: item.category,
        saved: item.saved,
        pct: item.pct,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
        dashArray: `${strokeDash} ${donutCircumference}`,
        dashOffset: strokeOffset,
      };
    },
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Saved This Month"
          value={`₹${savingsData.kpis.totalSavedMonth.toLocaleString("en-IN")}`}
          change={savingsData.kpis.savingsRate || 12.5}
          icon={PiggyBank}
        />
        <KPICard
          title="Total Lifetime Saved"
          value={`₹${savingsData.kpis.totalSavedAllTime.toLocaleString("en-IN")}`}
          change={8.2}
          icon={Award}
        />
        <KPICard
          title="Total Spent Tracked"
          value={`₹${savingsData.kpis.totalSpentAllTime.toLocaleString("en-IN")}`}
          change={4.5}
          icon={TrendingUp}
        />
        <div className="bg-brand-bg border border-brand-border rounded-[16px] p-5 shadow-sm space-y-3 relative overflow-hidden">
          <span className="text-[10px] text-brand-subtext font-bold uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-heading ${
                savingsData.kpis.savingsRate > 20
                  ? "text-brand-success"
                  : savingsData.kpis.savingsRate >= 10
                    ? "text-brand-warning"
                    : "text-brand-subtext"
              }`}
            >
              {savingsData.kpis.savingsRate}%
            </span>
          </div>
          <p className="text-[10px] text-brand-subtext font-semibold">
            You save ₹{savingsData.kpis.savingsRate} for every ₹100 spent.
          </p>
        </div>
      </div>

      {/* Achievements row */}
      <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <span>Savings Milestone Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {savingsData.milestones.map((m) => {
            const dateStr = m.achievedAt
              ? new Date(m.achievedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "";
            return (
              <div
                key={m.id}
                className={`relative group rounded-xl p-4 border text-center transition-all ${
                  m.achieved
                    ? "bg-brand-surface border-brand-success/20 text-brand-success"
                    : "bg-brand-surface/40 border-brand-border/60 text-brand-subtext"
                }`}
              >
                <div className="mx-auto w-9 h-9 rounded-full flex items-center justify-center border bg-white mb-2 shadow-sm">
                  {m.achieved ? (
                    <Award className="w-5 h-5 text-brand-success" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <span className="text-[10px] font-bold block truncate uppercase tracking-wider">
                  {m.title}
                </span>
                {m.achieved ? (
                  <span className="text-[9px] text-brand-subtext block mt-1 font-semibold">
                    Unlocked {dateStr}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 block mt-1 font-semibold">
                    Target ₹{m.threshold}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Recharts Spline Timeline Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-zinc-850 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-550 uppercase tracking-wider">
                Savings vs. Spending Timeline
              </h3>
            </div>
            <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-md p-0.5 bg-slate-50 dark:bg-zinc-900 shrink-0 select-none">
              {["3", "6", "12", "all"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setTimelineRange(r);
                  }}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-sm transition-all uppercase cursor-pointer border-0 ${
                    timelineRange === r
                      ? "bg-slate-950 dark:bg-zinc-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-800 dark:hover:text-white bg-transparent"
                  }`}
                >
                  {r === "all" ? "All" : `${r}M`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSpending"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 dark:bg-zinc-900 border border-slate-800 text-white text-[10px] p-2.5 rounded shadow-lg min-w-[130px] text-left">
                          <div className="font-semibold text-slate-400 border-b border-white/10 pb-1 mb-1 text-[9px] uppercase">
                            {data.fullLabel}
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-350 font-light">
                              Saved:
                            </span>
                            <span className="font-semibold text-blue-400">
                              ₹{data.savings.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 mt-0.5">
                            <span className="text-slate-355 font-light">
                              Spent:
                            </span>
                            <span className="font-semibold text-slate-400">
                              ₹{data.spending.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorSpending)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-[9px] font-medium text-slate-400 pt-2 border-t border-slate-100 dark:border-zinc-850 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-blue-600"></span>
              <span>Savings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-slate-500"></span>
              <span>Spending</span>
            </div>
          </div>
        </div>

        {/* Right Side: Highlight Card (Compact, Less Rounding, Simple Fonts) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Highlight Card
            </span>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              Personalized Savings Card
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-light">
              Generate an image card displaying your tracked savings on Vouchiqo
              to share on WhatsApp or Twitter!
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 rounded-md p-3.5 text-center space-y-3">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
              Monthly savings certificate
            </span>
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-normal">
                I SAVED THIS MONTH
              </span>
              <span className="text-2xl font-semibold text-brand-blue tracking-tight block">
                ₹{savingsData.kpis.totalSavedMonth.toLocaleString("en-IN")}
              </span>
              <span className="text-[8px] text-slate-400 block font-light">
                with verified discount vouchers
              </span>
            </div>
          </div>

          <Button
            onClick={handleShareSavings}
            className="w-full py-2 rounded-sm text-xs font-semibold text-white bg-brand-blue hover:bg-blue-600 border-0 h-auto cursor-pointer flex justify-center items-center gap-1.5 shadow-none transition-all"
          >
            {copiedShareCard ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>
              {copiedShareCard ? "Copied Share Text!" : "Copy Savings Link"}
            </span>
          </Button>
        </div>
      </div>

      {/* Category breakdown slice & top brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-bg border border-brand-border rounded-[16px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-heading text-xs font-bold text-brand-navy tracking-wider uppercase">
                Category Breakdown
              </h3>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-[9px] font-bold text-brand-error uppercase hover:underline cursor-pointer bg-transparent border-0"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                {donutSlices.length > 0 ? (
                  donutSlices.map((slice, i) => (
                    <circle
                      key={slice.category}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="15"
                      strokeDasharray={slice.dashArray}
                      strokeDashoffset={slice.dashOffset}
                      className="cursor-pointer transition-all duration-300 hover:stroke-[18]"
                      onClick={() => setSelectedCategory(slice.category)}
                    />
                  ))
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="15"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                <span className="text-[8px] text-brand-subtext font-bold uppercase">
                  Total
                </span>
                <span className="text-xs font-black text-brand-navy">
                  ₹
                  {savingsData.kpis.totalSavedAllTime.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1 flex-grow max-w-[180px]">
              {donutSlices.length > 0 ? (
                donutSlices.map((slice) => (
                  <button
                    key={slice.category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        slice.category === selectedCategory
                          ? null
                          : slice.category,
                      )
                    }
                    className={`w-full flex items-center justify-between text-[9px] font-bold p-1 rounded transition-all cursor-pointer border-0 ${
                      selectedCategory === slice.category
                        ? "bg-brand-surface text-brand-navy"
                        : "text-brand-text bg-transparent hover:bg-brand-surface"
                    }`}
                  >
                    <div className="flex items-center gap-1 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      ></span>
                      <span className="truncate">{slice.category}</span>
                    </div>
                    <span>{slice.pct}%</span>
                  </button>
                ))
              ) : (
                <div className="text-[10px] text-brand-subtext font-semibold text-center py-4">
                  No category savings recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-[16px] p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-xs font-bold text-brand-navy tracking-wider uppercase">
            Top Partner Brands
          </h3>
          <div className="space-y-3">
            {savingsData.brandBreakdown.map((brand) => {
              const savedVal = parseFloat(brand.saved.replace(/[^0-9.]/g, ""));
              const maxSavedVal =
                parseFloat(
                  savingsData.brandBreakdown[0].saved.replace(/[^0-9.]/g, ""),
                ) || 1;
              return (
                <div key={brand.brand} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>
                      {brand.brand} ({brand.claims} claims)
                    </span>
                    <span className="text-brand-success">{brand.saved}</span>
                  </div>
                  <div className="w-full bg-brand-surface h-1.5 rounded-full overflow-hidden border border-brand-border">
                    <div
                      className="bg-brand-blue h-full rounded-full"
                      style={{ width: `${(savedVal / maxSavedVal) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions table history */}
      <div className="bg-brand-bg border border-brand-border rounded-[16px] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-brand-border pb-3">
          <div>
            <h3 className="font-heading text-xs font-bold text-brand-navy tracking-wider uppercase">
              Transaction Log
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-brand-subtext absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 h-8 text-[10px] w-36 bg-brand-surface border-brand-border"
              />
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="btn-tertiary h-8 text-[10px] font-bold border-brand-border flex items-center gap-1 shadow-none px-3 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </Button>
          </div>
        </div>

        {paginatedTx.length > 0 ? (
          <div className="space-y-3">
            <div className="border border-brand-border rounded-xl overflow-hidden">
              <Table className="w-full text-xs">
                <TableHeader className="bg-brand-surface border-b border-brand-border">
                  <TableRow>
                    <TableHead
                      onClick={() => toggleSort("date")}
                      className="p-3 cursor-pointer text-brand-subtext font-bold"
                    >
                      Date{" "}
                      {sortField === "date" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("brand")}
                      className="p-3 cursor-pointer text-brand-subtext font-bold"
                    >
                      Brand{" "}
                      {sortField === "brand" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="p-3 text-brand-subtext font-bold">
                      Code
                    </TableHead>
                    <TableHead className="p-3 text-brand-subtext font-bold text-right">
                      Saved
                    </TableHead>
                    <TableHead className="p-3 text-brand-subtext font-bold">
                      Category
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-semibold text-brand-text">
                  {paginatedTx.map((tx) => (
                    <TableRow
                      key={tx._id}
                      className="hover:bg-brand-surface border-b border-brand-border last:border-0"
                    >
                      <TableCell className="p-3 text-brand-subtext">
                        {tx.date}
                      </TableCell>
                      <TableCell className="p-3 font-bold text-brand-navy">
                        {tx.brand}
                      </TableCell>
                      <TableCell className="p-3 font-mono text-[10px] text-brand-blue">
                        {tx.code}
                      </TableCell>
                      <TableCell className="p-3 text-right text-brand-success font-bold text-sm">
                        {tx.amountSaved}
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge className="bg-brand-surface text-brand-navy border border-brand-border text-[9px] px-2 py-0.5 shadow-none hover:bg-brand-surface/80">
                          {tx.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-[10px] text-brand-subtext font-semibold">
                <span>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, totalFilteredCount)} of{" "}
                  {totalFilteredCount}
                </span>
                <div className="flex gap-1 select-none">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="h-7 text-[9px] px-2 cursor-pointer"
                  >
                    Prev
                  </Button>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="h-7 text-[9px] px-2 cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-brand-subtext font-bold bg-brand-surface/40 rounded-xl select-none">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
