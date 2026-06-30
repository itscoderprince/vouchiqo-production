"use client";

import { Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function WalletTab() {
  return (
    <div className="space-y-6 text-left">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-1 relative">
          <span className="text-[10px] text-brand-subtext font-bold uppercase tracking-wider">
            Available Balance
          </span>
          <span className="text-2xl font-black font-heading text-brand-navy block">
            ₹240.00
          </span>
          <span className="text-[9px] text-brand-success font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Ready to withdraw
          </span>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-1 relative">
          <span className="text-[10px] text-brand-subtext font-bold uppercase tracking-wider">
            Pending Balance
          </span>
          <span className="text-2xl font-black font-heading text-slate-500 block">
            ₹64.00
          </span>
          <span className="text-[9px] text-slate-400 font-semibold">
            Awaiting merchant verification (up to 7 days)
          </span>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-center items-stretch gap-2.5">
          <Button
            disabled
            className="w-full py-2 text-xs font-bold border-0 h-auto cursor-not-allowed opacity-50 bg-brand-navy text-white shadow-none hover:bg-brand-navy/90"
          >
            Request Wallet Payout
          </Button>
          <span className="text-[9px] text-brand-subtext text-center font-bold flex items-center justify-center gap-1 select-none">
            <Info className="w-3.5 h-3.5 text-brand-blue" />
            Redemption requests are Coming Soon
          </span>
        </div>
      </div>

      {/* Wallet history table */}
      <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider">
          Cashback Transaction Log
        </h3>
        <div className="border border-brand-border rounded-xl overflow-hidden">
          <Table className="w-full text-xs">
            <TableHeader className="bg-brand-surface border-b border-brand-border">
              <TableRow>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase">
                  Date
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase">
                  Merchant
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase">
                  Transaction Amount
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase text-center">
                  Cashback %
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase text-right">
                  Cashback Earned
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase text-center">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-semibold text-brand-text">
              {[
                {
                  date: "2026-06-20",
                  brand: "Burger House",
                  spent: "₹600.00",
                  pct: "5%",
                  earned: "₹30.00",
                  status: "Approved",
                },
                {
                  date: "2026-06-18",
                  brand: "StyleZone",
                  spent: "₹1,500.00",
                  pct: "10%",
                  earned: "₹150.00",
                  status: "Pending",
                },
                {
                  date: "2026-06-15",
                  brand: "TechGadgets",
                  spent: "₹800.00",
                  pct: "8%",
                  earned: "₹64.00",
                  status: "Approved",
                },
              ].map((row, idx) => (
                <TableRow
                  key={idx}
                  className="hover:bg-brand-surface border-b border-brand-border last:border-0"
                >
                  <TableCell className="p-3 text-brand-subtext">
                    {row.date}
                  </TableCell>
                  <TableCell className="p-3 font-bold text-brand-navy">
                    {row.brand}
                  </TableCell>
                  <TableCell className="p-3 text-slate-500">
                    {row.spent}
                  </TableCell>
                  <TableCell className="p-3 text-center">{row.pct}</TableCell>
                  <TableCell className="p-3 text-right text-brand-success font-bold">
                    +{row.earned}
                  </TableCell>
                  <TableCell className="p-3 text-center">
                    <Badge
                      className={`border-0 rounded-full text-[9px] font-bold px-2 py-0.5 shadow-none ${
                        row.status === "Approved"
                          ? "bg-brand-success/15 text-brand-success hover:bg-brand-success/20"
                          : "bg-brand-warning/15 text-brand-warning hover:bg-brand-warning/20"
                      }`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
