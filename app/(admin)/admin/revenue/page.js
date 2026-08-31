"use client";

import {
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  Layers,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  adminFetchRevenueData,
  adminUpdatePayoutStatus,
} from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

// 8 Distinct Pastel Row Palettes (Clearly visible without hover)
const ROW_COLOR_THEMES = [
  { row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900" },
  { row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900" },
  { row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900" },
  { row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900" },
  { row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900" },
  { row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900" },
  { row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900" },
  { row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900" },
];

export default function PlatformRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceTab, setInvoiceTab] = useState("all");
  const [payoutSearch, setPayoutSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const resData = await adminFetchRevenueData();
      setData(resData);
    } catch (err) {
      showError("Failed to fetch live platform revenue details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsPaid = async (payoutId) => {
    try {
      setActionLoading(true);
      await adminUpdatePayoutStatus(payoutId, "paid");
      showSuccess("Payout marked as paid!");
      setData((prev) => {
        if (!prev) return prev;
        const updatedPayouts = (prev.payouts || []).map((p) =>
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

  const {
    mrr = 0,
    paidSubscribers = 0,
    avgPlanValue = 0,
    pendingPayouts = 0,
    invoices = [],
    payouts = [],
  } = data || {};

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (invoiceTab === "paid" && inv.status?.toLowerCase() !== "paid") return false;
      if (invoiceTab === "failed" && inv.status?.toLowerCase() !== "failed") return false;

      if (invoiceSearch.trim()) {
        const q = invoiceSearch.toLowerCase().trim();
        return (
          inv.id?.toLowerCase().includes(q) ||
          inv.merchantName?.toLowerCase().includes(q) ||
          inv.plan?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, invoiceTab, invoiceSearch]);

  const filteredPayouts = useMemo(() => {
    if (!payoutSearch.trim()) return payouts;
    const q = payoutSearch.toLowerCase().trim();
    return payouts.filter(
      (p) =>
        p.merchantName?.toLowerCase().includes(q) ||
        p.bankDetails?.toLowerCase().includes(q) ||
        p.period?.toLowerCase().includes(q),
    );
  }, [payouts, payoutSearch]);

  return (
    <DashboardLayout
      title="Platform Revenue"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Platform SaaS Revenue &amp; Merchant Settlements
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Monthly Recurring Revenue (MRR), subscription billing invoices &amp; merchant payout ledger from MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9.5px] font-medium px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Billing Active
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    disabled={loading}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Fetch live revenue &amp; payouts ledger
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Monthly Recurring (MRR)
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none font-mono">
                    ₹{mrr.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Active Paid Subscribers
                  </span>
                  <span className="text-base font-medium text-blue-700 mt-0.5 block leading-none font-mono">
                    {paidSubscribers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Avg Plan Value (ARPU)
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none font-mono">
                    ₹{avgPlanValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Pending Settlements
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none font-mono">
                    ₹{pendingPayouts.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 1: Recent SaaS Billing Invoices Table */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Recent SaaS Billing Invoices ({invoices.length})</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                  Subscription invoice receipts generated automatically for active paid partners.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative w-full sm:w-52">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                  />
                  {invoiceSearch && (
                    <button
                      type="button"
                      onClick={() => setInvoiceSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none">
                  {[
                    { id: "all", label: "All", count: invoices.length },
                    { id: "paid", label: "Paid", count: invoices.filter((i) => i.status?.toLowerCase() === "paid").length },
                    { id: "failed", label: "Failed", count: invoices.filter((i) => i.status?.toLowerCase() === "failed").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInvoiceTab(tab.id)}
                      className={cn(
                        "text-[10.5px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                        invoiceTab === tab.id
                          ? "bg-white text-blue-600 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 bg-transparent",
                      )}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={cn(
                          "text-[9px] px-1 rounded-full",
                          invoiceTab === tab.id
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-200/70 text-slate-600",
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colorful Invoices Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-3 w-28">Invoice ID</th>
                    <th className="py-2 px-3 w-52">Merchant Partner</th>
                    <th className="py-2 px-3 w-40">Subscription Tier</th>
                    <th className="py-2 px-3 w-32">Invoice Date</th>
                    <th className="py-2 px-3 text-right w-28">Amount</th>
                    <th className="py-2 px-3 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                        Loading billing invoices...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No billing invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv, idx) => {
                      const theme = ROW_COLOR_THEMES[idx % ROW_COLOR_THEMES.length];
                      const isPaid = inv.status?.toLowerCase() === "paid";

                      return (
                        <tr
                          key={inv.id || idx}
                          className={cn("transition-all duration-150", theme.row)}
                        >
                          <td className="py-2 px-3">
                            <span className="font-mono text-[11px] font-medium text-slate-900 bg-white/95 border border-slate-300/90 px-1.5 py-0.5 rounded shadow-2xs">
                              {inv.id}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900 text-[11.5px]">
                            {inv.merchantName}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] font-medium text-blue-700 bg-white/95 border border-blue-200 px-1.5 py-0.2 rounded shadow-2xs">
                              {inv.plan}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[10.5px] text-slate-600">
                            {inv.date}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 text-[11.5px]">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={cn(
                                "px-2 py-0.5 text-[9.5px] font-medium rounded-md border shadow-2xs inline-block whitespace-nowrap",
                                isPaid
                                  ? "bg-white/95 text-emerald-700 border-emerald-300"
                                  : "bg-white/95 text-rose-700 border-rose-300",
                              )}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 2: Merchant Settlement Payout Queue Table */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Merchant Settlement Payout Queue ({payouts.length})</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                  Voucher redemption settlements owed to partner merchants for verified redemptions.
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search payout merchant or bank..."
                  value={payoutSearch}
                  onChange={(e) => setPayoutSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                />
                {payoutSearch && (
                  <button
                    type="button"
                    onClick={() => setPayoutSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Colorful Payout Queue Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-3 w-52">Merchant Partner</th>
                    <th className="py-2 px-3 w-32 text-right">Settlement Value</th>
                    <th className="py-2 px-3">Bank Details &amp; Period</th>
                    <th className="py-2 px-3 text-center w-28">Status</th>
                    <th className="py-2 px-3 text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                        Loading settlement payouts...
                      </td>
                    </tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No pending settlement records found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p, idx) => {
                      const theme = ROW_COLOR_THEMES[(idx + 2) % ROW_COLOR_THEMES.length];
                      const isPaid = p.status === "paid";

                      return (
                        <tr
                          key={p.id || idx}
                          className={cn("transition-all duration-150", theme.row)}
                        >
                          <td className="py-2 px-3 font-medium text-slate-900 text-[11.5px]">
                            {p.merchantName}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 text-[11.5px]">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-mono text-[10.5px] text-slate-700 block">
                              {p.bankDetails || "HDFC Bank - A/C: 50100100000 - IFSC: HDFC0000123"}
                            </span>
                            <span className="text-[9.5px] text-slate-500 block">
                              Period: {p.period || "Current Month"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={cn(
                                "px-2 py-0.5 text-[9.5px] font-medium rounded-md border shadow-2xs inline-block whitespace-nowrap",
                                isPaid
                                  ? "bg-white/95 text-emerald-700 border-emerald-300"
                                  : "bg-white/95 text-amber-700 border-amber-300",
                              )}
                            >
                              {isPaid ? "Settled" : "Pending Payout"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {!isPaid ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    disabled={actionLoading}
                                    onClick={() => handleMarkAsPaid(p.id)}
                                    className="h-6.5 px-2.5 text-[10.5px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer ml-auto shadow-2xs gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Mark Paid</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                                  Mark this settlement as transferred &amp; completed
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 uppercase">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
