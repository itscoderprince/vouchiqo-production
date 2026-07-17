"use client";

import {
  AlertCircle,
  Check,
  IndianRupee,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  adminFetchRevenueData,
  adminUpdatePayoutStatus,
} from "@/lib/api-helpers";

export default function PlatformRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const resData = await adminFetchRevenueData();
      setData(resData);
    } catch (err) {
      console.error("Error fetching revenue details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const handleMarkAsPaid = async (payoutId) => {
    try {
      setActionLoading(true);
      await adminUpdatePayoutStatus(payoutId, "paid");

      // Optimistically update the UI
      setData((prev) => {
        if (!prev) return prev;

        const updatedPayouts = prev.payouts.map((p) =>
          p.id === payoutId ? { ...p, status: "paid" } : p,
        );

        const newPendingPayouts = updatedPayouts
          .filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          ...prev,
          payouts: updatedPayouts,
          pendingPayouts: newPendingPayouts,
        };
      });
    } catch (err) {
      console.error("Error updating payout status:", err);
      alert("Failed to update payout status.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Platform Revenue"
        user={{ name: "Platform Admin", role: "admin" }}
      >
        <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
          <span>Loading SaaS revenue audit details...</span>
        </div>
      </DashboardLayout>
    );
  }

  const {
    mrr,
    paidSubscribers,
    avgPlanValue,
    pendingPayouts,
    planCounts,
    invoices,
    payouts,
  } = data || {};

  return (
    <DashboardLayout
      title="Platform Revenue"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6">
        {/* Title */}
        <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-brand-blue" />
          <span>SaaS Revenue & Commissions Dashboard</span>
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* MRR */}
          <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">
                Monthly Recurring Revenue
              </span>
              <div className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-brand-navy">
                {formatCurrency(mrr || 0)}
              </div>
              <p className="text-[10px] text-brand-success font-semibold mt-1">
                +12.4% from last month
              </p>
            </CardContent>
          </Card>

          {/* Paid Subscribers */}
          <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">
                Paid SaaS Subscribers
              </span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-brand-navy">
                {paidSubscribers || 0}
              </div>
              <p className="text-[10px] text-brand-subtext font-semibold mt-1">
                Active merchant plans
              </p>
            </CardContent>
          </Card>

          {/* Avg Plan Value */}
          <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">
                Average Plan Value
              </span>
              <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600">
                <Receipt className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-brand-navy">
                {formatCurrency(avgPlanValue || 0)}
              </div>
              <p className="text-[10px] text-brand-subtext font-semibold mt-1">
                Per active subscriber / mo
              </p>
            </CardContent>
          </Card>

          {/* Pending Payouts */}
          <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider">
                Pending Payouts
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <TrendingDown className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-brand-navy">
                {formatCurrency(pendingPayouts || 0)}
              </div>
              <p className="text-[10px] text-brand-subtext font-semibold mt-1">
                Owed commissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Layout Split: Subscription Tiers & Commission Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Subscription Breakdown (4 Cols) */}
          <Card className="lg:col-span-4 bg-brand-bg border border-brand-border rounded-xl shadow-sm">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
                SaaS Subscription Tiers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Starter */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-brand-text">Starter (Free)</span>
                </div>
                <span className="text-brand-navy font-bold">
                  {planCounts?.starter || 0} merchants
                </span>
              </div>

              {/* Growth */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-brand-text">Growth (₹1,499)</span>
                </div>
                <span className="text-brand-navy font-bold">
                  {planCounts?.growth || 0} merchants
                </span>
              </div>

              {/* Pro */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-brand-text">Pro (₹3,999)</span>
                </div>
                <span className="text-brand-navy font-bold">
                  {planCounts?.pro || 0} merchants
                </span>
              </div>

              {/* Enterprise */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-brand-text">Enterprise (₹9,999)</span>
                </div>
                <span className="text-brand-navy font-bold">
                  {planCounts?.enterprise || 0} merchants
                </span>
              </div>

              <div className="pt-3 border-t border-brand-border text-[10px] text-brand-subtext font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  MRR aggregates active, approved merchant billing profiles.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Commission Payouts (8 Cols) */}
          <Card className="lg:col-span-8 bg-brand-bg border border-brand-border rounded-xl shadow-sm">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
                Merchant Commission Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {payouts && payouts.length > 0
                ? <Table className="w-full text-xs">
                    <TableHeader className="bg-brand-surface hover:bg-transparent">
                      <TableRow className="hover:bg-transparent border-b border-brand-border">
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Merchant
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Period
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Commission Due
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Bank details
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Status
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                      {payouts.map((payout) => (
                        <TableRow
                          key={payout.id}
                          className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                        >
                          <TableCell className="p-4 font-bold text-brand-navy h-auto">
                            {payout.businessName}
                          </TableCell>
                          <TableCell className="p-4">{payout.period}</TableCell>
                          <TableCell className="p-4 text-brand-blue font-bold">
                            {formatCurrency(payout.amount)}
                          </TableCell>
                          <TableCell
                            className="p-4 text-brand-subtext font-bold max-w-[150px] truncate"
                            title={payout.bankDetails}
                          >
                            {payout.bankDetails}
                          </TableCell>
                          <TableCell className="p-4">
                            <Badge
                              className={`rounded-full text-[9px] font-bold py-0.5 px-2 border-0 shadow-none capitalize ${
                                payout.status === "paid"
                                  ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
                                  : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/10"
                              }`}
                            >
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-4 text-right">
                            {payout.status === "pending"
                              ? <Button
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleMarkAsPaid(payout.id)}
                                  className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 py-1.5 px-3 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer h-7 ml-auto shadow-none"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Paid</span>
                                </Button>
                              : <span className="text-brand-subtext text-[10px] italic">
                                  Completed
                                </span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                : <div className="p-6 text-center text-brand-subtext font-semibold">
                    No commission payout records.
                  </div>}
            </CardContent>
          </Card>
        </div>

        {/* Invoice History Grid */}
        <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm">
          <CardHeader className="border-b border-brand-border pb-3">
            <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
              Recent SaaS Billing Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {invoices && invoices.length > 0
              ? <Table className="w-full text-xs">
                  <TableHeader className="bg-brand-surface hover:bg-transparent">
                    <TableRow className="hover:bg-transparent border-b border-brand-border">
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Invoice ID
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Merchant
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Billing Plan
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Billing Date
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Amount Billed
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Payment Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                    {invoices.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                      >
                        <TableCell className="p-4 font-bold text-brand-navy h-auto">
                          {inv.id}
                        </TableCell>
                        <TableCell className="p-4">
                          {inv.businessName}
                        </TableCell>
                        <TableCell className="p-4">{inv.plan}</TableCell>
                        <TableCell className="p-4 text-brand-subtext">
                          {new Date(inv.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="p-4 text-brand-navy font-bold">
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell className="p-4">
                          <Badge
                            className={`rounded-full text-[9px] font-bold py-0.5 px-2 border-0 shadow-none capitalize ${
                              inv.status === "Paid"
                                ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
                                : "bg-brand-error/10 text-brand-error hover:bg-brand-error/10"
                            }`}
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              : <div className="p-6 text-center text-brand-subtext font-semibold">
                  No active billing history. Only paid plan subscribers appear
                  here.
                </div>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
