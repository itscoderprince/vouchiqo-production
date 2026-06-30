"use client";

import { Check, Copy, History, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClaimedCoupons() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRedemptions() {
      try {
        setLoading(true);
        const res = await fetch("/api/redemptions");
        if (res.ok) {
          const payload = await res.json();
          if (payload.success) {
            setRedemptions(payload.data.redemptions || []);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load redemption history.");
      } finally {
        setLoading(false);
      }
    }
    loadRedemptions();
  }, []);

  const handleCopy = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    toast.success("Code copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <DashboardLayout
      title="Claimed Coupons"
      user={{ name: "Sarah Jenkins", role: "customer" }}
    >
      <div className="flex justify-between items-center border-b border-brand-border pb-3">
        <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider">
          Your Coupon Claims & Redeemed History
        </h2>
        <span className="text-xs text-brand-subtext font-semibold">
          {redemptions.length} Redemptions
        </span>
      </div>

      {loading
        ? <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-subtext" />
          </div>
        : redemptions.length > 0
          ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                    <TableRow className="hover:bg-transparent border-b border-brand-border">
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Brand
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Offer
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Voucher Code
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Redeemed Date
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Saved Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                    {redemptions.map((red, idx) => {
                      const dateStr = new Date(
                        red.createdAt,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      const brandName =
                        red.merchantId?.businessName || "Unknown Merchant";
                      const couponTitle =
                        red.couponId?.title || `${red.discountValue}% OFF`;

                      return (
                        <TableRow
                          key={red._id}
                          className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                        >
                          <TableCell className="p-4 font-bold text-brand-navy">
                            {brandName}
                          </TableCell>
                          <TableCell className="p-4">{couponTitle}</TableCell>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-brand-surface border border-brand-border px-2.5 py-1 rounded text-brand-navy tracking-wide font-bold">
                                {red.couponCode}
                              </span>
                              <button
                                onClick={() => handleCopy(red.couponCode, idx)}
                                className="text-brand-subtext hover:text-brand-blue p-1 rounded hover:bg-brand-surface transition-all cursor-pointer"
                              >
                                {copiedIndex === idx
                                  ? <Check className="w-3.5 h-3.5 text-brand-success" />
                                  : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="p-4">{dateStr}</TableCell>
                          <TableCell className="p-4 text-brand-success font-bold">
                            ₹{red.savingsAmount?.toLocaleString("en-IN") || "0"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          : <EmptyState
              icon={History}
              title="No claims history"
              description="Your claimed voucher codes will appear here once you redeem them."
            />}
    </DashboardLayout>
  );
}
