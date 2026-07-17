"use client";

import { Check, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real user redemptions history
  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/redemptions");
        if (res.ok) {
          const json = await res.json();
          setRedemptions(json.data?.redemptions || []);
        }
      } catch (err) {
        console.error("Error loading wallet transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRedemptions();
  }, []);

  // Calculate real balances based on user redemptions:
  // We award a flat 10% extra cashback on all actual validated coupon savings!
  const totalCashback = redemptions.reduce(
    (sum, r) => sum + (r.savingsAmount || 0) * 0.1,
    0,
  );

  // Hardcoded pending is 0 since all user redemptions are instantly verified in demo database
  const pendingCashback = 0;

  return (
    <div className="space-y-6 text-left select-none">
      {/* Balance cards with reduced border radius (rounded-md) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm space-y-1 relative">
          <span className="text-[10px] text-brand-subtext font-bold uppercase tracking-wider">
            Available Balance
          </span>
          <span className="text-2xl font-black font-heading text-brand-navy block">
            ₹{totalCashback.toFixed(2)}
          </span>
          <span className="text-[9px] text-brand-success font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Ready to withdraw
          </span>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm space-y-1 relative">
          <span className="text-[10px] text-brand-subtext font-bold uppercase tracking-wider">
            Pending Balance
          </span>
          <span className="text-2xl font-black font-heading text-slate-400 block">
            ₹{pendingCashback.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400 font-semibold">
            All redemptions verified
          </span>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm flex flex-col justify-center items-stretch gap-2.5">
          <Button
            disabled={totalCashback <= 0}
            className="w-full py-2 text-xs font-bold border-0 h-auto cursor-pointer bg-brand-navy text-white shadow-none hover:bg-brand-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Wallet Payout
          </Button>
          <span className="text-[9px] text-brand-subtext text-center font-bold flex items-center justify-center gap-1 select-none">
            <Info className="w-3.5 h-3.5 text-brand-blue" />
            Payout requests require ₹100 minimum
          </span>
        </div>
      </div>

      {/* Wallet history table with reduced border radius (rounded-md) */}
      <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm space-y-4">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider">
          Cashback Transaction Log
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-subtext" />
          </div>
        ) : redemptions.length > 0 ? (
          <div className="border border-brand-border rounded-md overflow-hidden">
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
                {redemptions.map((row) => {
                  const saved = row.savingsAmount || 0;
                  const spent = row.originalPrice || saved * 2;
                  const cashbackEarned = saved * 0.1;
                  const dateString = new Date(row.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    },
                  );
                  const brandName =
                    row.merchantId?.businessName || "Premium Partner";

                  return (
                    <TableRow
                      key={row._id}
                      className="hover:bg-brand-surface border-b border-brand-border last:border-0"
                    >
                      <TableCell className="p-3 text-brand-subtext">
                        {dateString}
                      </TableCell>
                      <TableCell className="p-3 font-bold text-brand-navy">
                        {brandName}
                      </TableCell>
                      <TableCell className="p-3 text-slate-500">
                        ₹{spent.toFixed(2)}
                      </TableCell>
                      <TableCell className="p-3 text-center">10%</TableCell>
                      <TableCell className="p-3 text-right text-brand-success font-bold">
                        +₹{cashbackEarned.toFixed(2)}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Badge className="border-0 rounded-full text-[9px] font-bold px-2 py-0.5 shadow-none bg-brand-success/15 text-brand-success hover:bg-brand-success/20">
                          Approved
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border border-dashed border-brand-border rounded-md p-8 text-center text-xs text-slate-400 select-none">
            No cashback transactions recorded yet. Validated claims earn a flat
            10% cashback bonus!
          </div>
        )}
      </div>
    </div>
  );
}
