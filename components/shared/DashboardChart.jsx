"use client";

import { useState } from "react";

export default function DashboardChart({
  data = [],
  series = [],
  title = "Performance Trend",
  type = "area", // "area" | "bar"
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Chart layout specs
  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0 || !series || series.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-slate-400 font-semibold">
        No trend data available
      </div>
    );
  }

  const activeSeries = series[0];
  const isCurrency =
    activeSeries.key === "revenue" || activeSeries.key === "profit";

  // Calculate customized neat Y-axis limits matching the user's images
  let yMax = 100;
  const yTicks = 4;
  if (activeSeries.key === "revenue") {
    yMax = 60000;
  } else if (activeSeries.key === "profit") {
    yMax = 24000;
  } else if (activeSeries.key === "orders") {
    yMax = 800;
  } else {
    const rawMax = Math.max(...data.map((d) => d[activeSeries.key] || 0), 10);
    yMax = Math.ceil(rawMax / 10) * 10;
  }

  // Generate ticks
  const ticks = Array.from({ length: yTicks + 1 }).map(
    (_, i) => (i / yTicks) * yMax,
  );

  // Helper to format values on Y-axis
  const formatYValue = (val) => {
    if (isCurrency) {
      return `$${(val / 1000).toFixed(0)}k`;
    }
    return val.toLocaleString();
  };

  // Convert points
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const val = d[activeSeries.key] || 0;
    const y = paddingTop + chartHeight - (val / yMax) * chartHeight;
    return { x, y, value: val, label: d.label };
  });

  return (
    <div className="relative w-full">
      {/* SVG Canvas */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient
              id={`grad-${activeSeries.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={activeSeries.color}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={activeSeries.color}
                stopOpacity="0.00"
              />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {ticks.map((tickVal, i) => {
            const y = paddingTop + chartHeight - (tickVal / yMax) * chartHeight;
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 font-sans font-semibold text-[10px]"
                >
                  {formatYValue(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Render Area/Line Chart */}
          {type === "area" && points.length >= 2 && (
            <g>
              {/* Curved Area Path */}
              {(() => {
                let pathD = `M ${points[0].x} ${points[0].y}`;
                let areaD = `M ${points[0].x} ${paddingTop + chartHeight} L ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                  const prev = points[i - 1];
                  const curr = points[i];
                  const cpX1 = prev.x + (curr.x - prev.x) / 3;
                  const cpY1 = prev.y;
                  const cpX2 = prev.x + (2 * (curr.x - prev.x)) / 3;
                  const cpY2 = curr.y;
                  pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
                  areaD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
                }
                areaD += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;

                return (
                  <>
                    <path
                      d={areaD}
                      fill={`url(#grad-${activeSeries.key})`}
                      className="transition-all duration-300"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={activeSeries.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </>
                );
              })()}

              {/* Hover States Dots */}
              {points.map((pt, i) => (
                <g key={i}>
                  {/* Invisible larger hover area */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={12}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? 6 : 4}
                    fill="#FFFFFF"
                    stroke={activeSeries.color}
                    strokeWidth="2.5"
                    className="pointer-events-none transition-all duration-150"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Render Vertical Bar Chart */}
          {type === "bar" && (
            <g>
              {points.map((pt, i) => {
                const barWidth = 24;
                const x = pt.x - barWidth / 2;
                const y = pt.y;
                const bottom = paddingTop + chartHeight;
                const barHeight = bottom - y;
                const r = 6; // top rounded corner radius

                // top-only rounded vertical bar path
                const pathD =
                  barHeight > r
                    ? `M ${x} ${y + r} 
                     a ${r} ${r} 0 0 1 ${r} ${-r} 
                     h ${barWidth - 2 * r} 
                     a ${r} ${r} 0 0 1 ${r} ${r} 
                     v ${barHeight - r} 
                     h ${-barWidth} 
                     Z`
                    : `M ${x} ${y} h ${barWidth} v ${barHeight} h ${-barWidth} Z`;

                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <path
                      d={pathD}
                      fill={activeSeries.color}
                      opacity={hoveredIndex === i ? 0.85 : 1}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* X Axis Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className="fill-slate-400 font-sans font-semibold text-[10px]"
            >
              {pt.label}
            </text>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-slate-900 text-white text-[10px] font-bold p-2.5 rounded-lg shadow-lg border border-slate-800 z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-0.5"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 4}%`,
            }}
          >
            <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider block">
              {points[hoveredIndex].label}
            </span>
            <span className="text-white block font-black">
              {activeSeries.name}:{" "}
              {isCurrency
                ? `$${points[hoveredIndex].value.toLocaleString()}`
                : points[hoveredIndex].value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
