import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * KPICard — Compact, high-contrast KPI analytics card built with Shadcn UI.
 *
 * @param {string} title - metric label (e.g. "TOTAL IMPRESSIONS")
 * @param {string|number} value - primary metric number (e.g. "3", "₹12,450", "0.0%")
 * @param {number} [change] - percentage change value
 * @param {boolean} [isPositive=true] - positive vs negative trend color
 * @param {React.ComponentType} [icon] - Lucide icon component
 * @param {string} [iconClassName] - custom background/text classes for icon container
 * @param {string} [subtitle] - helper description (e.g. "ticker views", "codes claimed")
 * @param {string} [timeFrame="vs last month"] - trend comparison label
 * @param {boolean} [loading=false] - loading skeleton state
 * @param {string} [href] - optional link wrapper
 * @param {string} [className] - custom container classes
 */
export default function KPICard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconClassName,
  subtitle,
  timeFrame = "vs last month",
  loading = false,
  href,
  className,
  variant = "default",
}) {
  const variantStyles = {
    emerald: "bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/20 border-emerald-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-emerald-500/5",
    blue: "bg-gradient-to-br from-blue-50/80 via-white to-blue-50/20 border-blue-200/80 hover:border-blue-300 shadow-sm hover:shadow-md hover:shadow-blue-500/5",
    amber: "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/20 border-amber-200/80 hover:border-amber-300 shadow-sm hover:shadow-md hover:shadow-amber-500/5",
    purple: "bg-gradient-to-br from-purple-50/80 via-white to-purple-50/20 border-purple-200/80 hover:border-purple-300 shadow-sm hover:shadow-md hover:shadow-purple-500/5",
    default: "bg-white border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-sm",
  };

  const topBarStyles = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-600",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    default: "bg-[#08214d]",
  };

  const cardContent = (
    <Card
      className={cn(
        "rounded-2xl p-0 transition-all duration-300 overflow-hidden relative flex flex-col justify-between h-full group hover:-translate-y-0.5 font-sans border",
        variantStyles[variant] || variantStyles.default,
        className,
      )}
    >
      {/* Top Color Accent Bar */}
      <div className={cn("h-1 w-full absolute top-0 left-0", topBarStyles[variant] || topBarStyles.default)} />

      <CardContent className="p-3 sm:p-3.5 flex flex-col justify-between h-full pt-3.5">
        {loading ? (
          <div className="space-y-2 py-0.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-6.5 w-6.5 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md my-1" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full">
            {/* Header: Title & Icon Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span
                className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-wider block truncate max-w-[calc(100%-1.75rem)]"
                title={title}
              >
                {title}
              </span>
              {Icon && (
                <div
                  className={cn(
                    "w-6.5 h-6.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs group-hover:scale-105 transition-all",
                    iconClassName,
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Metric Value */}
            <div className="my-0.5">
              <span className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight leading-tight block">
                {value}
              </span>
            </div>

            {/* Subtitle / Helper Label */}
            {subtitle && (
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5 capitalize leading-tight">
                {subtitle}
              </p>
            )}

            {/* Trend Indicator & Timeframe */}
            <div className="flex items-center flex-wrap gap-1 pt-0.5 text-[10px] sm:text-[11px] font-medium">
              {change !== undefined && change !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded-md border",
                    isPositive
                      ? "text-blue-600 bg-blue-50/90 border-blue-100"
                      : "text-rose-600 bg-rose-50/90 border-rose-100",
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3 h-3 shrink-0" />
                  )}
                  <span>
                    {isPositive ? "+" : ""}
                    {change}%
                  </span>
                </span>
              )}
              {change !== undefined && change !== null && timeFrame && (
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                  {timeFrame}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full cursor-pointer">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
