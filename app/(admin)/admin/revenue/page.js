"use client";

import { Check, IndianRupee, Receipt, Users } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPICard from "@/components/shared/cards/KPICard";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  adminFetchRevenueData,
  adminUpdatePayoutStatus,
} from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

export default function PlatformRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const resData = await adminFetchRevenueData();
        if (isMounted) setData(resData);
      } catch (err) {
        if (isMounted) showError("Failed to fetch revenue details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const resData = await adminFetchRevenueData();
      setData(resData);
    } catch (err) {
      showError("Failed to fetch revenue details.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (payoutId) => {
    try {
      setActionLoading(true);
      await adminUpdatePayoutStatus(payoutId, "paid");
      showSuccess("Payout marked as paid!");
      setData((prev) => {
        if (!prev) return prev;
        const updatedPayouts = prev.payouts.map((p) =>
          p.id === payoutId ? { ...p, status: "paid" } : p,
        );
        return { ...prev, payouts: updatedPayouts };
      });
    } catch (err) {
      showError("Failed to update payout status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Platform Revenue" user={{ role: "admin" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const {
    mrr = 0,
    paidSubscribers = 0,
    avgPlanValue = 0,
    pendingPayouts = 0,
    invoices = [],
    payouts = [],
  } = data || {};

  const invoiceColumns = [
    {
      key: "merchantName",
      header: "Merchant Partner",
      sortable: true,
      cell: (r) => (
        <span className="font-bold text-slate-900">{r.merchantName}</span>
      ),
    },
    {
      key: "plan",
      header: "Subscription Tier",
      cell: (r) => (
        <span className="font-mono text-xs text-blue-600 font-bold uppercase">
          {r.plan}
        </span>
      ),
    },
    {
      key: "date",
      header: "Invoice Date",
      sortable: true,
      cell: (r) => (
        <span className="font-mono text-xs text-slate-500">{r.date}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      cell: (r) => (
        <span className="font-bold text-slate-900">
          ₹{r.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Payment Status",
      cell: (r) => <StatusBadge status={r.status} size="sm" />,
    },
  ];

  const payoutColumns = [
    {
      key: "merchantName",
      header: "Merchant Partner",
      sortable: true,
      cell: (r) => (
        <span className="font-bold text-slate-900">{r.merchantName}</span>
      ),
    },
    {
      key: "amount",
      header: "Settlement Value",
      sortable: true,
      cell: (r) => (
        <span className="font-bold text-[#e85d04]">
          ₹{r.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "bankAccount",
      header: "Bank Account",
      cell: (r) => (
        <span className="font-mono text-xs text-slate-500">
          {r.bankAccount || "Primary Settlement"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: "actions",
      header: "Action",
      cell: (r) =>
        r.status === "pending"
          ? <Button
              size="sm"
              disabled={actionLoading}
              onClick={() => handleMarkAsPaid(r.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg h-7 px-2.5 gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Mark Paid
            </Button>
          : <span className="text-[10px] font-bold text-slate-400 uppercase">
              Settled
            </span>,
    },
  ];

  return (
    <DashboardLayout
      title="Platform Revenue"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" /> Platform SaaS
          Revenue &amp; Merchant Settlements
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Monthly Recurring (MRR)"
            value={`₹${mrr.toLocaleString("en-IN")}`}
            change={14.2}
            isPositive={true}
            icon={IndianRupee}
          />
          <KPICard
            title="Active Subscribers"
            value={paidSubscribers}
            change={8.5}
            isPositive={true}
            icon={Users}
          />
          <KPICard
            title="Avg. Plan Value (ARPU)"
            value={`₹${avgPlanValue.toLocaleString("en-IN")}`}
            change={3.1}
            isPositive={true}
            icon={Receipt}
          />
          <KPICard
            title="Pending Payouts"
            value={`₹${pendingPayouts.toLocaleString("en-IN")}`}
            subtitle="merchant settlements"
            icon={IndianRupee}
          />
        </div>

        {/* Recent Invoices Table */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Recent SaaS Billing Invoices
          </h3>
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            searchable={true}
            searchPlaceholder="Search invoices..."
            defaultPageSize={5}
          />
        </Card>

        {/* Merchant Settlement Payouts Table */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Merchant Settlement Payout Queue
          </h3>
          <DataTable
            columns={payoutColumns}
            data={payouts}
            searchable={true}
            searchPlaceholder="Search payouts..."
            defaultPageSize={5}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
