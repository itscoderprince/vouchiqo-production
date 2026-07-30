"use client";

import { Download, FileText } from "lucide-react";
import { DataTable } from "@/components/shared/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/lib/toast";

/** @type {import("@/components/shared/data/DataTable").Column[]} */
const COLUMNS = [
  {
    key: "id",
    header: "Invoice ID",
    cell: (r) => (
      <span className="font-mono text-[11px] font-bold text-slate-800">
        {r.id}
      </span>
    ),
  },
  { key: "period", header: "Date & Period", sortable: true },
  {
    key: "plan",
    header: "Package / Add-On",
    cell: (r) => <span className="font-bold text-slate-900">{r.plan}</span>,
  },
  {
    key: "gstBreakdown",
    header: "Base + 18% GST Breakdown",
    cell: (r) => (
      <div className="flex flex-col text-[11px]">
        <span className="text-slate-600 font-semibold">
          Base: {r.basePrice || r.amount}
        </span>
        <span className="text-blue-600 font-bold text-[10px]">
          + 18% GST: {r.gstBreakdown || "Included"}
        </span>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Total Amount Paid",
    sortable: true,
    cell: (r) => (
      <div className="flex items-center gap-1.5">
        <span className="font-black text-slate-900">{r.amount}</span>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold py-0.5 px-1">
          {r.status || "Paid"}
        </Badge>
      </div>
    ),
  },
  {
    key: "gstInvoice",
    header: "GSTIN Invoice",
    cell: (r) =>
      r.gstInvoice?.startsWith("GSTIN-") ? (
        <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          {r.gstInvoice}
        </span>
      ) : (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-400 border-slate-200 text-[9px] font-medium"
        >
          N/A (B2C Receipt)
        </Badge>
      ),
  },
  {
    key: "download",
    header: "GST Tax Invoice",
    cell: (r) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          showSuccess(`Downloading ${r.id} Official GST Tax Invoice PDF…`)
        }
        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5 mr-1" /> PDF Invoice
      </Button>
    ),
  },
];

/**
 * BillingHistoryTable — shows live invoice history with 18% GST breakdown.
 * @param {{ invoices: object[] }} props
 */
export default function BillingHistoryTable({ invoices = [] }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden text-left font-sans">
      <div className="p-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xs font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <span>Invoice &amp; Billing History (Live Transactions)</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Download official GST tax invoices with itemized 18% GST breakdown
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            showSuccess("Downloading all GST tax invoices in a ZIP archive…")
          }
          className="text-xs h-8 py-1 px-3 font-bold rounded-xl border-slate-200 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-none text-slate-700 hover:bg-slate-50"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          Download All Invoices
        </Button>
      </div>
      <div className="p-3">
        <DataTable
          columns={COLUMNS}
          data={invoices}
          searchable={false}
          defaultPageSize={12}
        />
      </div>
    </div>
  );
}
