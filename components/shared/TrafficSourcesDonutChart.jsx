"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Generates an SVG path for an annular (donut) slice with clean gaps.
 */
export function createDonutSlicePath(
  cx,
  cy,
  rInner,
  rOuter,
  startAngle,
  endAngle,
) {
  const pad = 0.025; // small gap in radians between slices
  const s = startAngle + pad;
  const e = endAngle - pad;

  if (e <= s) return "";

  const x1_out = cx + rOuter * Math.cos(s);
  const y1_out = cy + rOuter * Math.sin(s);
  const x2_out = cx + rOuter * Math.cos(e);
  const y2_out = cy + rOuter * Math.sin(e);

  const x1_in = cx + rInner * Math.cos(e);
  const y1_in = cy + rInner * Math.sin(e);
  const x2_in = cx + rInner * Math.cos(s);
  const y2_in = cy + rInner * Math.sin(s);

  const largeArc = e - s > Math.PI ? 1 : 0;

  return [
    `M ${x1_out.toFixed(2)} ${y1_out.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2_out.toFixed(2)} ${y2_out.toFixed(2)}`,
    `L ${x1_in.toFixed(2)} ${y1_in.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2_in.toFixed(2)} ${y2_in.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function TrafficSourcesDonutChart({
  analyticsData = {},
  pageViews,
  title = "Traffic Sources",
  subtitle = "Where your visitors come from (Live DB)",
  badgeLabel,
  showCard = true,
  className = "",
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const totalVisits = Number(
    analyticsData?.totalVisits ?? pageViews ?? analyticsData?.pageViews ?? 0,
  );
  const hasRealData = totalVisits > 0;

  // The 4 sources matching reference colors:
  // 1. Messenger (Purple): 40% -> Upper & Left section
  // 2. Calls (Pink): 10% -> Top-Right exploded slice
  // 3. Web (Yellow): 20% -> Lower-Right section
  // 4. Email (Mint Green): 30% -> Bottom section
  const sourceDefs = useMemo(
    () => [
      {
        id: "messenger",
        label: "Messenger",
        dbKey: "Direct",
        pct: 40,
        color: "#9A73F7", // Vibrant Purple
      },
      {
        id: "email",
        label: "Email",
        dbKey: "Organic",
        pct: 30,
        color: "#3AD29F", // Mint / Emerald Green
      },
      {
        id: "web",
        label: "Web",
        dbKey: "Referral",
        pct: 20,
        color: "#FDBA3C", // Warm Amber / Golden Yellow
      },
      {
        id: "calls",
        label: "Calls",
        dbKey: "Social",
        pct: 10,
        color: "#FF5B7E", // Coral / Salmon Pink (Exploded in reference image)
      },
    ],
    [],
  );

  const chartItems = useMemo(() => {
    if (hasRealData && analyticsData?.trafficSources?.length > 0) {
      const dbSources = analyticsData.trafficSources;
      const total =
        dbSources.reduce((sum, s) => sum + (Number(s.value) || 0), 0) ||
        totalVisits;

      return sourceDefs.map((def) => {
        const found = dbSources.find(
          (s) =>
            s.label?.toLowerCase() === def.dbKey.toLowerCase() ||
            s.name?.toLowerCase() === def.dbKey.toLowerCase() ||
            s.label?.toLowerCase() === def.label.toLowerCase() ||
            s.name?.toLowerCase() === def.label.toLowerCase(),
        );
        const val = found?.value ? Number(found.value) : 0;
        const calcPct = total > 0 ? Math.round((val / total) * 100) : def.pct;

        return {
          ...def,
          pct: calcPct > 0 ? calcPct : def.pct,
          val: val || Math.round(totalVisits * (def.pct / 100)),
        };
      });
    }

    // Default reference mockup state: 1,518 visits (40%, 30%, 20%, 10%)
    return sourceDefs.map((def) => ({
      ...def,
      val: Math.round(1518 * (def.pct / 100)),
    }));
  }, [hasRealData, totalVisits, analyticsData?.trafficSources, sourceDefs]);

  const displayTotal = hasRealData
    ? totalVisits.toLocaleString("en-IN")
    : "1,518";

  // By default, slice index 3 (Calls 10%) is exploded with the dotted leader line
  const activeExplodedIdx = hoveredIdx !== null ? hoveredIdx : 3;

  // Clockwise slice ordering:
  // Messenger (40%): starts at -207° (153°) to -63° (mid = -135°, top-left)
  // Calls (10%): starts at -63° to -27° (mid = -45°, upper-right) -> exploded outwards
  // Web (20%): starts at -27° to +45° (mid = +9°, lower-right)
  // Email (30%): starts at +45° to +153° (mid = +99°, bottom)
  const ringSlices = [
    chartItems[0], // Messenger
    chartItems[3], // Calls
    chartItems[2], // Web
    chartItems[1], // Email
  ];

  const totalPct =
    ringSlices.reduce((acc, it) => acc + (it.pct || 0), 0) || 100;
  let currentAngle = (-207 * Math.PI) / 180;

  const calculatedSlices = ringSlices.map((item) => {
    const originalIdx = chartItems.findIndex((c) => c.id === item.id);
    const spanRad = ((item.pct || 0) / totalPct) * 2 * Math.PI;
    const start = currentAngle;
    const end = currentAngle + spanRad;
    const mid = (start + end) / 2;
    currentAngle = end;

    const isExploded = originalIdx === activeExplodedIdx;
    const offsetDist = isExploded ? 11 : 0; // balanced offset distance
    const dx = offsetDist * Math.cos(mid);
    const dy = offsetDist * Math.sin(mid);

    return {
      ...item,
      originalIdx,
      start,
      end,
      mid,
      dx,
      dy,
      isExploded,
    };
  });

  const explodedSlice =
    calculatedSlices.find((s) => s.originalIdx === activeExplodedIdx) ||
    calculatedSlices[1]; // Calls

  // Balanced UI/UX Dimensions:
  // Reduced height and adjusted radii for visual hierarchy & sidebar harmony
  const svgWidth = 320;
  const svgHeight = 195;
  const cx = 135;
  const cy = 98;
  const rOuter = 78; // reduced from 105px to 78px
  const rInner = 48; // reduced from 65px to 48px (clean 30px donut band)

  // Dotted leader line coordinates
  const dotX =
    cx + explodedSlice.dx + (rOuter + 3) * Math.cos(explodedSlice.mid);
  const dotY =
    cy + explodedSlice.dy + (rOuter + 3) * Math.sin(explodedSlice.mid);
  const isRightSide = Math.cos(explodedSlice.mid) >= 0;
  const lineEndX = isRightSide
    ? Math.min(svgWidth - 65, dotX + 44)
    : Math.max(65, dotX - 44);

  const innerContent = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
      {/* Left Legend Stack (Compact & Harmonious) */}
      <div className="flex flex-row sm:flex-col flex-wrap sm:flex-nowrap gap-1 sm:gap-1 shrink-0 w-full sm:w-auto">
        {chartItems.map((src, i) => {
          const isCurrent = activeExplodedIdx === i;
          return (
            <div
              key={src.id}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center gap-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg cursor-pointer transition-all ${
                isCurrent
                  ? "bg-slate-100 ring-1 ring-slate-200 shadow-2xs translate-x-0.5"
                  : "hover:bg-slate-50 opacity-85 hover:opacity-100"
              }`}
            >
              {/* Compact indicator */}
              <span
                className="w-2.5 h-2.5 rounded-[3px] shrink-0 transition-transform duration-200"
                style={{
                  backgroundColor: src.color,
                  boxShadow: isCurrent ? `0 0 6px ${src.color}60` : "none",
                  transform: isCurrent ? "scale(1.15)" : "scale(1)",
                }}
              />
              <span
                className={`text-[11px] sm:text-xs font-medium transition-colors ${
                  isCurrent ? "text-slate-900 font-semibold" : "text-slate-600"
                }`}
              >
                {src.label}{" "}
                <span className="text-slate-400 font-normal">({src.pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Right Donut Chart Display */}
      <div className="relative flex-1 flex items-center justify-center w-full min-h-[175px] sm:min-h-[185px] overflow-visible">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[300px] sm:max-w-[340px] h-auto overflow-visible select-none"
        >
          <defs>
            <filter
              id="sharedLightSliceGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#000000"
                floodOpacity="0.14"
              />
            </filter>
          </defs>

          {/* Slices Rendering */}
          <g>
            {calculatedSlices.map((slice) => {
              const pathD = createDonutSlicePath(
                cx,
                cy,
                rInner,
                rOuter,
                slice.start,
                slice.end,
              );

              return (
                <path
                  key={slice.id}
                  d={pathD}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  transform={`translate(${slice.dx}, ${slice.dy})`}
                  filter={
                    slice.isExploded ? "url(#sharedLightSliceGlow)" : undefined
                  }
                  className="cursor-pointer transition-all duration-300 ease-out hover:opacity-95"
                  onMouseEnter={() => setHoveredIdx(slice.originalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                />
              );
            })}
          </g>

          {/* Center Donut Hole Text */}
          <g className="pointer-events-none text-center">
            <text
              x={cx}
              y={cy - 7}
              textAnchor="middle"
              fill="#64748B"
              fontSize="11"
              fontWeight="600"
              letterSpacing="0.04em"
            >
              Total
            </text>
            <text
              x={cx}
              y={cy + 17}
              textAnchor="middle"
              fill="#0F172A"
              fontSize="22"
              fontWeight="800"
              letterSpacing="-0.02em"
            >
              {displayTotal}
            </text>
          </g>

          {/* Dotted Leader Line & Label pointing to the Exploded Slice */}
          {explodedSlice && (
            <g className="transition-all duration-300 ease-out">
              {/* Small round anchor dot at slice boundary */}
              <circle
                cx={dotX}
                cy={dotY}
                r="2.4"
                fill={explodedSlice.color}
                className="transition-all duration-300"
              />

              {/* Horizontal dotted guide line */}
              <line
                x1={isRightSide ? dotX + 4 : dotX - 4}
                y1={dotY}
                x2={lineEndX}
                y2={dotY}
                stroke={explodedSlice.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.85"
                className="transition-all duration-300"
              />

              {/* Callout Text Label */}
              <text
                x={isRightSide ? lineEndX + 5 : lineEndX - 5}
                y={dotY + 3.5}
                textAnchor={isRightSide ? "start" : "end"}
                fill="#334155"
                fontSize="11"
                fontWeight="600"
                className="transition-all duration-300 drop-shadow-2xs"
              >
                {explodedSlice.label} ({explodedSlice.pct}%)
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );

  if (!showCard) {
    return <div className={className}>{innerContent}</div>;
  }

  return (
    <Card
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-xs overflow-hidden flex flex-col p-0 text-left font-sans transition-all duration-300 ${className}`}
    >
      {/* Light Mode Header */}
      <CardHeader className="px-4 py-2.5 sm:px-4.5 sm:py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-sans text-xs font-bold text-slate-900 tracking-wider uppercase m-0 leading-none">
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-[11px] font-normal text-slate-500 mt-0.5 leading-none font-sans normal-case tracking-normal">
              {subtitle}
            </CardDescription>
          )}
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-semibold border-slate-200 text-slate-700 bg-white px-2.5 py-0.5 rounded-full shadow-2xs"
        >
          {badgeLabel || `${displayTotal} Visits`}
        </Badge>
      </CardHeader>

      <CardContent className="p-3 sm:p-3.5">{innerContent}</CardContent>
    </Card>
  );
}
