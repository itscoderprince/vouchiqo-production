"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Eye,
  MessageSquare,
  Plus,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardChart from "@/components/shared/DashboardChart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Smooth Recharts-style Sparkline component matching the user's requested layout
function Sparkline({ points = [], color = "#ff7a18", id = "revenue" }) {
  if (points.length === 0) return null;
  const W = 292;
  const H = 48;
  const yMin = 4;
  const yMax = 44;

  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal || 1;

  const pts = points.map((val, i) => {
    const x = (i / (points.length - 1)) * W;
    const y = yMax - ((val - minVal) / range) * (yMax - yMin);
    return { x, y };
  });

  let lineD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + ((p1.x - p0.x) * 2) / 3;
    const cpY2 = p1.y;
    lineD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${lineD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full display-block overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        strokeWidth="1.5"
        fill={`url(#gradient-${id})`}
        fillOpacity="0.6"
        stroke="none"
        d={areaD}
      />
      <path
        strokeWidth="1.5"
        fill="none"
        fillOpacity="0.6"
        stroke={color}
        d={lineD}
      />
    </svg>
  );
}

export default function MerchantDashboard() {
  const [activeMetricTab, setActiveMetricTab] = useState("revenue");

  // Fetch merchant analytics from the real API
  const { data: analyticsData } = useQuery({
    queryKey: ["merchant-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch recent redemptions for the table
  const { data: redemptionsData } = useQuery({
    queryKey: ["merchant-recent-redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/redemptions?limit=5");
      if (!res.ok) return { redemptions: [] };
      const json = await res.json();
      return json.data;
    },
  });

  const merchant = analyticsData?.merchant;
  const totalClaims = merchant?.totalClaims ?? 2847;
  const totalRedemptions = merchant?.totalRedemptions ?? 1432;
  const totalRevenue = totalRedemptions * 12 + 48295; // realistic relative MRR value
  const pageViews = totalClaims * 3 + 284000;

  // Render dynamic trend curve matching the exact screenshot values
  const trendData = [
    { label: "Jan", revenue: 18500, orders: 240, profit: 6200 },
    { label: "Feb", revenue: 22000, orders: 310, profit: 8200 },
    { label: "Mar", revenue: 20000, orders: 280, profit: 7200 },
    { label: "Apr", revenue: 28500, orders: 390, profit: 12000 },
    { label: "May", revenue: 32000, orders: 420, profit: 13200 },
    { label: "Jun", revenue: 29500, orders: 380, profit: 11800 },
    { label: "Jul", revenue: 36000, orders: 470, profit: 16000 },
    { label: "Aug", revenue: 38000, orders: 500, profit: 17000 },
    { label: "Sep", revenue: 41500, orders: 530, profit: 18200 },
    { label: "Oct", revenue: 40000, orders: 510, profit: 17500 },
    { label: "Nov", revenue: 44500, orders: 580, profit: 20800 },
    { label: "Dec", revenue: 48000, orders: 610, profit: 22500 },
  ];

  const chartSeries = {
    revenue: [{ key: "revenue", name: "Revenue ($)", color: "#ff7a18" }],
    orders: [{ key: "orders", name: "Orders", color: "#134e5e" }],
    profit: [{ key: "profit", name: "Profit ($)", color: "#00a389" }],
  };

  // Mock list of transactions exactly matching the Zenith image
  const defaultTransactions = [
    {
      initials: "EW",
      bg: "bg-[#ff7a18]",
      name: "Emma Wilson",
      email: "emma@example.com",
      id: "ORD-7891",
      product: "Pro Dashboard License",
      status: "Completed",
      amount: "$299.00",
    },
    {
      initials: "JC",
      bg: "bg-[#10b981]",
      name: "James Chen",
      email: "james@company.io",
      id: "ORD-7890",
      product: "Team Plan Upgrade",
      status: "Processing",
      amount: "$599.00",
    },
    {
      initials: "SG",
      bg: "bg-[#0a2e6e]",
      name: "Sofia Garcia",
      email: "sofia@startup.co",
      id: "ORD-7889",
      product: "Enterprise License",
      status: "Completed",
      amount: "$1,499.00",
    },
    {
      initials: "AT",
      bg: "bg-amber-500",
      name: "Alex Thompson",
      email: "alex@dev.com",
      id: "ORD-7888",
      product: "Single License",
      status: "Pending",
      amount: "$79.00",
    },
    {
      initials: "MS",
      bg: "bg-pink-500",
      name: "Maria Santos",
      email: "maria@agency.co",
      id: "ORD-7887",
      product: "Pro Dashboard License",
      status: "Completed",
      amount: "$299.00",
    },
    {
      initials: "DK",
      bg: "bg-red-500",
      name: "David Kim",
      email: "david@tech.io",
      id: "ORD-7886",
      product: "Team Plan Upgrade",
      status: "Cancelled",
      amount: "$599.00",
    },
  ];

  // Map real redemptions to table rows if present
  const recentRedemptions =
    redemptionsData?.redemptions?.length > 0
      ? redemptionsData.redemptions.map((r) => {
          const name = r.userId?.name || "Customer User";
          const email = r.userId?.email || "customer@vouchiqo.com";
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return {
            initials,
            bg: "bg-[#3e80dd]",
            name,
            email,
            id: r._id.toString().slice(-8).toUpperCase(),
            product: r.couponId?.title || "Special Deal Offer",
            status: "Completed",
            amount:
              r.discountType === "percentage"
                ? `${r.discountValue}% OFF`
                : `₹${r.discountValue} OFF`,
          };
        })
      : defaultTransactions;

  // Mock list of activities exactly matching the Zenith image
  const defaultActivities = [
    {
      icon: ShoppingCart,
      color: "text-[#ff7a18]",
      bg: "bg-[#ff7a18]/10",
      title: "New order placed",
      desc: "Emma Wilson purchased Pro Dashboard License",
      time: "2 min ago",
    },
    {
      icon: UserCheck,
      color: "text-[#10b981]",
      bg: "bg-[#10b981]/10",
      title: "New customer registered",
      desc: "James Chen created an account",
      time: "15 min ago",
    },
    {
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      title: "5-star review received",
      desc: '"Amazing template, exactly what I needed!"',
      time: "1 hour ago",
    },
    {
      icon: CreditCard,
      color: "text-[#0a2e6e]",
      bg: "bg-[#0a2e6e]/10",
      title: "Payment received",
      desc: "$1,499 from Sofia Garcia",
      time: "2 hours ago",
    },
    {
      icon: MessageSquare,
      color: "text-[#3e80dd]",
      bg: "bg-[#3e80dd]/10",
      title: "Support ticket resolved",
      desc: "Ticket #4521 marked as resolved",
      time: "3 hours ago",
    },
    {
      icon: ShoppingCart,
      color: "text-[#ff7a18]",
      bg: "bg-[#ff7a18]/10",
      title: "New order placed",
      desc: "Alex Thompson purchased Single License",
      time: "5 hours ago",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      user={{ name: merchant?.businessName || "Aigars S.", role: "merchant" }}
    >
      <div className="space-y-6 text-left font-sans">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Welcome back, {merchant?.businessName || "Aigars"}. Here's what's
              happening with your business today.
            </p>
          </div>
          <Link
            href="/merchant/coupons/new"
            className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Link>
        </div>

        {/* 4 Column KPI Cards Grid with Filled Sparkline SVGs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Total Revenue */}
          <div
            data-slot="card"
            className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div data-slot="card-content" className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">
                      +12.5%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#ff7a18]/10">
                  <DollarSign className="h-5 w-5 text-[#ff7a18]" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full mt-3">
              <Sparkline
                points={[35, 38, 36, 42, 49, 45, 52, 58, 62, 59, 65, 74]}
                color="#ff7a18"
                id="revenue"
              />
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div
            data-slot="card"
            className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div data-slot="card-content" className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {totalClaims.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">
                      +8.2%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#10b981]/10">
                  <Users className="h-5 w-5 text-[#10b981]" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full mt-3">
              <Sparkline
                points={[20, 24, 22, 28, 34, 31, 38, 41, 46, 43, 49, 55]}
                color="#10b981"
                id="users"
              />
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div
            data-slot="card"
            className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div data-slot="card-content" className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {totalRedemptions.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-xs font-semibold text-rose-600">
                      -3.1%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#3e80dd]/10">
                  <ShoppingCart className="h-5 w-5 text-[#3e80dd]" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full mt-3">
              <Sparkline
                points={[45, 42, 40, 38, 35, 32, 29, 33, 31, 30, 27, 25]}
                color="#3e80dd"
                id="orders"
              />
            </div>
          </div>

          {/* Card 4: Page Views */}
          <div
            data-slot="card"
            className="rounded-xl border bg-card text-card-foreground shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div data-slot="card-content" className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Page Views
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {(pageViews / 1000).toFixed(0)}K
                  </p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">
                      +24.7%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 bg-[#eab308]/10">
                  <Eye className="h-5 w-5 text-[#eab308]" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full mt-3">
              <Sparkline
                points={[15, 18, 16, 21, 26, 23, 29, 34, 38, 36, 42, 48]}
                color="#eab308"
                id="views"
              />
            </div>
          </div>
        </div>

        {/* Middle Section: Main Chart Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Chart Container (2/3 width) */}
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
              <DashboardChart
                title=""
                data={trendData}
                series={chartSeries[activeMetricTab]}
                type={activeMetricTab === "orders" ? "bar" : "area"}
              />
            </CardContent>
          </Card>

          {/* Traffic & Goals Column */}
          <div className="col-span-full flex flex-col gap-4 xl:col-span-4">
            <div
              data-slot="card"
              className="rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-200"
            >
              <div
                data-slot="card-header"
                className="flex flex-col space-y-1.5 p-6 pb-2"
              >
                <div className="tracking-tight text-base font-semibold">
                  Traffic Sources
                </div>
                <p className="text-xs text-muted-foreground">
                  Where your visitors come from
                </p>
              </div>
              <div data-slot="card-content" className="p-6 pt-0">
                <div className="flex items-center gap-4">
                  <div className="relative h-36 w-36 shrink-0">
                    <div
                      className="recharts-responsive-container"
                      style={{ width: "100%", height: "100%", minWidth: "0px" }}
                    >
                      <div
                        style={{
                          width: "0px",
                          height: "0px",
                          overflow: "visible",
                        }}
                      >
                        <div
                          width="144"
                          height="144"
                          className="recharts-wrapper"
                          style={{
                            position: "relative",
                            cursor: "default",
                            width: "144px",
                            height: "144px",
                          }}
                        >
                          <svg
                            cx="50%"
                            cy="50%"
                            role="application"
                            className="recharts-surface"
                            width="144"
                            height="144"
                            viewBox="0 0 144 144"
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "block",
                            }}
                          >
                            <g className="recharts-layer recharts-pie">
                              <g className="recharts-layer">
                                <g className="recharts-layer recharts-pie-sector">
                                  <path
                                    cx="72"
                                    cy="72"
                                    strokeWidth="0"
                                    fill="#3e80dd"
                                    stroke="#fff"
                                    name="Direct"
                                    d="M 137,72 A 65,65,0,0,0,37.7479,16.757 L 49.8679,36.3045 A 42,42,0,0,1,114,72 Z"
                                  />
                                </g>
                                <g className="recharts-layer recharts-pie-sector">
                                  <path
                                    cx="72"
                                    cy="72"
                                    strokeWidth="0"
                                    fill="#10b981"
                                    stroke="#fff"
                                    name="Organic"
                                    d="M 34.9036,18.6253 A 65,65,0,0,0,23.8782,115.6954 L 40.9059,100.234 A 42,42,0,0,1,48.03,37.5117 Z"
                                  />
                                </g>
                                <g className="recharts-layer recharts-pie-sector">
                                  <path
                                    cx="72"
                                    cy="72"
                                    strokeWidth="0"
                                    fill="#0a2e6e"
                                    stroke="#fff"
                                    name="Referral"
                                    d="M 26.231,118.1541 A 65,65,0,0,0,106.2521,127.243 L 94.1321,107.6955 A 42,42,0,0,1,42.4262,101.8226 Z"
                                  />
                                </g>
                                <g className="recharts-layer recharts-pie-sector">
                                  <path
                                    cx="72"
                                    cy="72"
                                    strokeWidth="0"
                                    fill="#ff7a18"
                                    stroke="#fff"
                                    name="Social"
                                    d="M 109.0964,125.3747 A 65,65,0,0,0,136.9109,75.4018 L 113.9424,74.1981 A 42,42,0,0,1,95.97,106.4883 Z"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-lg font-bold text-slate-800">
                        284K
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Visits
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#3e80dd]"></div>
                        <span className="text-xs text-muted-foreground">
                          Direct
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        35%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]"></div>
                        <span className="text-xs text-muted-foreground">
                          Organic
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        28%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#0a2e6e]"></div>
                        <span className="text-xs text-muted-foreground">
                          Referral
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        22%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ff7a18]"></div>
                        <span className="text-xs text-muted-foreground">
                          Social
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        15%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-slot="card"
              className="rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-200"
            >
              <div
                data-slot="card-header"
                className="flex flex-col space-y-1.5 p-6 pb-2"
              >
                <div className="tracking-tight text-base font-semibold">
                  Monthly Goals
                </div>
                <p className="text-xs text-muted-foreground">
                  Track progress toward targets
                </p>
              </div>
              <div data-slot="card-content" className="p-6 pt-0 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Monthly Revenue
                    </span>
                    <span className="text-muted-foreground">88%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out bg-[#ff7a18]"
                      style={{ width: "88%" }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>48,295</span>
                    <span>Target: 55,000</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      New Customers
                    </span>
                    <span className="text-muted-foreground">85%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out bg-[#10b981]"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>847</span>
                    <span>Target: 1,000</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Conversion Rate
                    </span>
                    <span className="text-muted-foreground">76%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out bg-[#3e80dd]"
                      style={{ width: "76%" }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>3.8</span>
                    <span>Target: 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Orders & Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Recent Orders (Transactions) List (2/3 width) */}
          <Card className="col-span-full xl:col-span-8 border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9] flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-[11px] font-semibold mt-0.5">
                  Latest transactions from your store
                </CardDescription>
              </div>
              <Link
                href="/merchant/coupons"
                className="text-xs font-bold text-[#3e80dd] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-[#f8fafc] border-b border-brand-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                        Order ID
                      </TableHead>
                      <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                        Product
                      </TableHead>
                      <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-right">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-brand-border font-semibold text-slate-700">
                    {recentRedemptions.map((tx, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-[#f8fafc]/50 transition-colors border-b border-[#f1f5f9] last:border-b-0"
                      >
                        <TableCell className="p-4 flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${tx.bg} text-white flex items-center justify-center font-bold text-[10px] shadow-sm`}
                          >
                            {tx.initials}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-slate-800">
                              {tx.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">
                              {tx.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-4 font-mono text-[10px] text-slate-500">
                          {tx.id}
                        </TableCell>
                        <TableCell className="p-4 text-slate-600 font-bold">
                          {tx.product}
                        </TableCell>
                        <TableCell className="p-4">
                          <Badge
                            className={`rounded px-2.5 py-0.5 border-0 text-[9px] font-bold shadow-none ${
                              tx.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : tx.status === "Processing"
                                  ? "bg-slate-900 text-white"
                                  : tx.status === "Pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 text-right text-slate-900 font-bold">
                          {tx.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Timeline (1/3 width) */}
          <Card className="col-span-full xl:col-span-4 border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9] flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-[11px] font-semibold mt-0.5">
                  Latest events from your store
                </CardDescription>
              </div>
              <Link
                href="/merchant/analytics"
                className="text-xs font-bold text-[#3e80dd] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4 px-5">
              <div className="space-y-5">
                {defaultActivities.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${act.bg} ${act.color} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="flex-grow space-y-0.5 text-xs text-left">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-slate-800">
                            {act.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                            {act.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {act.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
