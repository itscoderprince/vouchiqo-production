"use client";

import {
  Award,
  Check,
  Download,
  Lock,
  PiggyBank,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRef, useState } from "react";
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
  "#FF7A18",
  "#1E4FAF",
  "#00B67A",
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
  const [hoveredChartIdx, setHoveredChartIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartSvgRef = useRef(null);

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

  const maxSaved = Math.max(...activeTimeline.map((t) => t.saved), 10);
  const maxSpent = Math.max(...activeTimeline.map((t) => t.spent), 10);
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 55;
  const paddingY = 30;
  const graphWidth = svgWidth - paddingX - 25;
  const graphHeight = svgHeight - paddingY - 15;
  const nPoints = activeTimeline.length;

  const pointsSaved = activeTimeline.map((t, idx) => {
    const x =
      paddingX +
      (nPoints > 1 ? (idx / (nPoints - 1)) * graphWidth : graphWidth / 2);
    const y = svgHeight - paddingY - (t.saved / maxSaved) * graphHeight;
    return {
      x,
      y,
      saved: t.saved,
      spent: t.spent,
      label: t.label,
      count: t.count,
    };
  });

  const pointsSpent = activeTimeline.map((t, idx) => {
    const x =
      paddingX +
      (nPoints > 1 ? (idx / (nPoints - 1)) * graphWidth : graphWidth / 2);
    const y = svgHeight - paddingY - (t.spent / maxSpent) * graphHeight;
    return { x, y };
  });

  const lineSavedPath = pointsSaved
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaSavedPath =
    pointsSaved.length > 0
      ? `${lineSavedPath} L ${
          pointsSaved[pointsSaved.length - 1].x
        } ${svgHeight - paddingY} L ${pointsSaved[0].x} ${
          svgHeight - paddingY
        } Z`
      : "";

  const lineSpentPath = pointsSpent
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaSpentPath =
    pointsSpent.length > 0
      ? `${lineSpentPath} L ${
          pointsSpent[pointsSpent.length - 1].x
        } ${svgHeight - paddingY} L ${pointsSpent[0].x} ${
          svgHeight - paddingY
        } Z`
      : "";

  const handleSvgMouseMove = (e) => {
    if (!chartSvgRef.current || pointsSaved.length === 0) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    pointsSaved.forEach((p, idx) => {
      const diff = Math.abs(p.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredChartIdx(closestIdx);
    setTooltipPos({
      x: (pointsSaved[closestIdx].x / svgWidth) * rect.width,
      y: (pointsSaved[closestIdx].y / svgHeight) * rect.height - 70,
    });
  };

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
          change={14.8}
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
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-warning fill-brand-warning/10" />
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

      {/* Timeline chart & share card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-brand-bg border border-brand-border rounded-[16px] p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border pb-3">
            <div>
              <h3 className="font-heading text-xs font-bold text-brand-navy tracking-wider uppercase">
                Savings vs. Spending Timeline
              </h3>
            </div>
            <div className="flex items-center border border-brand-border rounded-lg p-0.5 bg-brand-surface shrink-0 select-none">
              {["3", "6", "12", "all"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setTimelineRange(r);
                    setHoveredChartIdx(null);
                  }}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all uppercase cursor-pointer ${
                    timelineRange === r
                      ? "bg-brand-navy text-white shadow-sm"
                      : "text-brand-subtext hover:text-brand-navy"
                  }`}
                >
                  {r === "all" ? "All Time" : `${r}M`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-h-[200px]">
            <svg
              ref={chartSvgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={() => setHoveredChartIdx(null)}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="savings-grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A18" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="spent-grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E4FAF" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#1E4FAF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <line
                  key={i}
                  x1={paddingX}
                  y1={paddingY + (i / 4) * graphHeight}
                  x2={svgWidth - 25}
                  y2={paddingY + (i / 4) * graphHeight}
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}

              {pointsSpent.length > 1 && (
                <>
                  <path d={areaSpentPath} fill="url(#spent-grad2)" />
                  <path
                    d={lineSpentPath}
                    fill="none"
                    stroke="#1E4FAF"
                    strokeWidth="2"
                  />
                </>
              )}
              {pointsSaved.length > 1 && (
                <>
                  <path d={areaSavedPath} fill="url(#savings-grad2)" />
                  <path
                    d={lineSavedPath}
                    fill="none"
                    stroke="#FF7A18"
                    strokeWidth="2.5"
                  />
                </>
              )}

              {/* Nodes */}
              {pointsSaved.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="#ffffff"
                  stroke="#FF7A18"
                  strokeWidth="1.5"
                />
              ))}

              {/* Left Y Axis */}
              <text
                x={10}
                y={paddingY + 3}
                className="text-[9px] font-bold fill-brand-subtext"
              >
                ₹{Math.round(maxSaved)}
              </text>
              <text
                x={10}
                y={svgHeight - paddingY + 3}
                className="text-[9px] font-bold fill-brand-subtext"
              >
                ₹0
              </text>

              {/* Right Y Axis */}
              <text
                x={svgWidth - 20}
                y={paddingY + 3}
                className="text-[9px] font-bold fill-brand-subtext text-right"
              >
                ₹{Math.round(maxSpent)}
              </text>
              <text
                x={svgWidth - 20}
                y={svgHeight - paddingY + 3}
                className="text-[9px] font-bold fill-brand-subtext text-right"
              >
                ₹0
              </text>

              {/* X Axis */}
              {activeTimeline.map((t, i) => {
                const x =
                  paddingX +
                  (nPoints > 1
                    ? (i / (nPoints - 1)) * graphWidth
                    : graphWidth / 2);
                if (nPoints > 7 && i % 2 !== 0) return null;
                return (
                  <text
                    key={i}
                    x={x}
                    y={svgHeight - paddingY + 14}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-brand-subtext"
                  >
                    {t.label.split(" ")[0]}
                  </text>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredChartIdx !== null && pointsSaved[hoveredChartIdx] && (
              <div
                className="absolute z-20 bg-brand-navy text-white text-[10px] font-semibold p-2.5 rounded-lg shadow-xl w-44 pointer-events-none text-left"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-black border-b border-white/10 pb-1 mb-1 text-[10px] text-brand-warning uppercase">
                  {pointsSaved[hoveredChartIdx].label}
                </div>
                <div className="flex justify-between">
                  <span>Saved:</span>
                  <span className="font-bold text-orange-400">
                    ₹
                    {pointsSaved[hoveredChartIdx].saved.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span className="font-bold text-blue-300">
                    ₹
                    {pointsSaved[hoveredChartIdx].spent.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6 text-[9px] font-bold text-brand-subtext pt-2 border-t border-brand-border/40 select-none">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>Savings</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>Spending</span>
            </div>
          </div>
        </div>

        {/* Share card Widget */}
        <div className="lg:col-span-4 bg-brand-navy border border-white/10 text-white rounded-[16px] p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] text-brand-warning font-bold uppercase tracking-wider font-heading">
              Highlight Card
            </span>
            <h3 className="font-heading text-sm font-bold">
              Personalized Savings Card
            </h3>
            <p className="text-[10px] text-slate-300 leading-normal">
              Generate an image card displaying your tracked savings on Vouchiqo
              to share on WhatsApp or Twitter!
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-3">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">
              Monthly savings certificate
            </span>
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-300 block font-semibold">
                I SAVED THIS MONTH
              </span>
              <span className="text-2xl font-black text-brand-gradient tracking-tight block">
                ₹{savingsData.kpis.totalSavedMonth.toLocaleString("en-IN")}
              </span>
              <span className="text-[8px] text-slate-400 block font-medium">
                with verified discount vouchers
              </span>
            </div>
          </div>

          <Button
            onClick={handleShareSavings}
            className="btn-primary w-full py-2.5 text-xs font-bold border-0 h-auto cursor-pointer flex justify-center items-center gap-1 text-white shadow-none"
          >
            {copiedShareCard ? (
              <Check className="w-4 h-4" />
            ) : (
              <Share2 className="w-4 h-4" />
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
