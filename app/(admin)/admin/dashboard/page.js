"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, IndianRupee, Store, Tag, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPICard from "@/components/shared/cards/KPICard";
import DashboardChart from "@/components/shared/data/DashboardChart";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import MonthlyGoalsCard from "./components/MonthlyGoalsCard";
import RecentActivityTimeline from "./components/RecentActivityTimeline";
import TrafficSourcesCard from "./components/TrafficSourcesCard";

const DEFAULT_TREND_DATA = [
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

import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeMetricTab, setActiveMetricTab] = useState("revenue");

  // Real-time notifications and pending counts hook
  const { unreadCount } = useAdminNotifications();

  // Real-time socket listeners for live merchant data & applications
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
  });

  // Fetch admin analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const kpis = analyticsData?.kpis ?? {
    totalUsers: 2847,
    totalMerchants: 165,
    activeCoupons: 1432,
    monthlyRevenue: 6860,
  };

  const trendData = analyticsData?.trendData ?? DEFAULT_TREND_DATA;

  const chartSeries = {
    revenue: [{ key: "revenue", name: "Revenue (₹)", color: "#2563eb" }],
    orders: [{ key: "orders", name: "Orders", color: "#1d4ed8" }],
    profit: [{ key: "profit", name: "Profit (₹)", color: "#0a2e6e" }],
  };

  const orderColumns = [
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
            {row.customer.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              {row.customer}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold">
              {row.type} Moderation
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "Order ID",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.id}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <span className="font-semibold text-slate-700">{row.product}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      cell: (row) => (
        <div className="text-right">
          <span className="font-bold text-slate-900 block">{row.amount}</span>
          <Link
            href={
              row.type === "Merchant"
                ? "/admin/approvals/merchants"
                : "/admin/approvals/coupons"
            }
            className="text-[10px] text-[#2563eb] hover:underline font-semibold"
          >
            Review →
          </Link>
        </div>
      ),
    },
  ];

  const livePendingOrders = (analyticsData?.pendingActions || []).map(
    (item) => ({
      id: item.id.slice(-8).toUpperCase(),
      customer: item.name,
      type: item.type,
      product: `${item.type} Moderation Audit`,
      status: item.status.toLowerCase().includes("pending")
        ? "pending"
        : "under_review",
      amount: item.type === "Merchant" ? "₹1,499.00" : "₹0.00",
    }),
  );

  return (
    <DashboardLayout
      title="Dashboard"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                Super Admin Dashboard
              </h1>
              <LiveIndicator />
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Welcome back, Admin. Here's what's happening with your business
              today.
            </p>
          </div>
          <Link
            href="/admin/approvals/merchants"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs relative"
          >
            <span>Review Queue</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* 4 Reusable KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <KPICard
            title="Total Revenue"
            value={`₹${kpis.monthlyRevenue.toLocaleString()}`}
            change={12.5}
            isPositive={true}
            icon={IndianRupee}
            iconClassName="bg-emerald-50 border-emerald-200/80 text-emerald-600"
          />
          <KPICard
            title="Active Users"
            value={kpis.totalUsers.toLocaleString()}
            change={8.2}
            isPositive={true}
            icon={Users}
            iconClassName="bg-blue-50 border-blue-200/80 text-blue-600"
          />
          <KPICard
            title="Total Orders"
            value={kpis.activeCoupons.toLocaleString()}
            change={3.1}
            isPositive={false}
            icon={Tag}
            iconClassName="bg-amber-50 border-amber-200/80 text-amber-600"
          />
          <KPICard
            title="Page Views"
            value={kpis.totalMerchants}
            change={24.7}
            isPositive={true}
            icon={Store}
            iconClassName="bg-purple-50 border-purple-200/80 text-purple-600"
          />
        </div>

        {/* Overview Chart & Traffic Column */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <Card className="col-span-full xl:col-span-8 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full hover:shadow-xs transition-all duration-200 p-0 gap-0">
            <CardHeader className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50 min-h-[48px]">
              <div>
                <CardTitle className="font-sans text-xs font-semibold text-slate-900 tracking-wider uppercase m-0 leading-none">
                  Overview
                </CardTitle>
                <CardDescription className="text-[11px] font-normal text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
                  Monthly performance for the current year
                </CardDescription>
              </div>
              <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-slate-100/90 shrink-0 select-none">
                {["revenue", "orders", "profit"].map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setActiveMetricTab(metric)}
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md transition-all uppercase cursor-pointer border-0 ${
                      activeMetricTab === metric
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-4">
              <DashboardChart
                title=""
                data={trendData}
                series={chartSeries[activeMetricTab]}
                type={activeMetricTab === "orders" ? "bar" : "area"}
              />
            </CardContent>
          </Card>

          <div className="col-span-full flex flex-col gap-4 xl:col-span-4">
            <TrafficSourcesCard analyticsData={analyticsData} />
            <MonthlyGoalsCard analyticsData={analyticsData} />
          </div>
        </div>

        {/* Recent Orders & Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Card className="col-span-full xl:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-full hover:shadow-xs transition-all duration-200 p-0 gap-0">
            <CardHeader className="px-4 py-3.5 sm:px-5 sm:py-3.5 border-b border-slate-100 flex flex-row justify-between items-center gap-3 bg-slate-50/50 min-h-[56px]">
              <div>
                <CardTitle className="font-heading text-xs sm:text-[13px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-[11px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
                  Latest transactions from your store
                </CardDescription>
              </div>
              <Link
                href="/admin/approvals/merchants"
                className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-4">
              <DataTable
                columns={orderColumns}
                data={livePendingOrders}
                searchable={false}
                defaultPageSize={5}
                emptyState="No pending moderation orders in queue."
              />
            </CardContent>
          </Card>

          <div className="col-span-full xl:col-span-4">
            <RecentActivityTimeline />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
