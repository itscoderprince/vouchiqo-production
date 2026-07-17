"use client";

import {
  CheckCircle2,
  Flame,
  Pin,
  RefreshCw,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  adminFetchActiveCoupons,
  adminToggleCouponFlag,
} from "@/lib/api-helpers";

export default function TickerManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchActiveCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminFetchActiveCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Error fetching active coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const getPriority = (coupon) => {
    if (coupon.isFeatured) return 1;
    const plan = coupon.merchantId?.plan || "starter";
    if (plan === "enterprise") return 2;
    if (plan === "pro") return 3;
    if (plan === "growth") return 4;
    return 5;
  };

  const getPlanBadgeVariant = (plan) => {
    switch (plan) {
      case "enterprise":
        return "bg-blue-600/10 text-blue-600 border-blue-600/20";
      case "pro":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "growth":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const handleToggleFlag = async (couponId, field, currentValue) => {
    try {
      setSuccessMsg("");
      await adminToggleCouponFlag(couponId, field, currentValue);
      setCoupons((prev) =>
        prev.map((c) =>
          c._id === couponId ? { ...c, [field]: !currentValue } : c,
        ),
      );
      setSuccessMsg(`Coupon '${field}' flag updated and home cache busted!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error updating coupon flag:", err);
      alert("Failed to update coupon flags.");
    }
  };

  // Sort by priority tier ascending, then by claims desc, then newest
  const sortedCoupons = [...coupons].sort((a, b) => {
    const pA = getPriority(a);
    const pB = getPriority(b);
    if (pA !== pB) return pA - pB;
    const claimsA = a.totalClaims || 0;
    const claimsB = b.totalClaims || 0;
    if (claimsA !== claimsB) return claimsB - claimsA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <DashboardLayout
      title="Homepage Ticker"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-blue" />
          <span>Configure Announcement Ticker</span>
        </h2>

        <p className="text-xs text-brand-subtext font-semibold leading-relaxed">
          The Hot Deals Ticker on the homepage displays active, verified
          coupons. Its sorting order is determined by Priority (Tiers 1-5).
          Admin can pin coupons to Tier 1 using the{" "}
          <strong className="text-brand-navy">Pin to Top (isFeatured)</strong>{" "}
          toggle. The{" "}
          <strong className="text-brand-navy">Hot Deal (isHot)</strong> toggle
          highlights the coupon in the UI.
        </p>

        {successMsg && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-brand-success/5 border border-brand-success/15 text-brand-success text-xs font-semibold items-center animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading
          ? <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
              <span>Loading active coupons...</span>
            </div>
          : sortedCoupons.length > 0
            ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto flex-1">
                  <Table className="w-full text-xs">
                    <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                      <TableRow className="hover:bg-transparent border-b border-brand-border">
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto w-16">
                          Priority
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Brand / Store
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Offer Details
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Merchant Plan
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-center h-auto">
                          Pin to Top (Featured)
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-center h-auto">
                          Hot Deal (isHot)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                      {sortedCoupons.map((coupon) => {
                        const priority = getPriority(coupon);
                        return (
                          <TableRow
                            key={coupon._id}
                            className={`hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0 ${
                              priority === 1
                                ? "bg-amber-500/5 hover:bg-amber-500/10"
                                : ""
                            }`}
                          >
                            <TableCell className="p-4 text-center h-auto">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                  priority === 1
                                    ? "bg-amber-500 text-white"
                                    : "bg-brand-surface text-brand-navy"
                                }`}
                              >
                                P{priority}
                              </span>
                            </TableCell>
                            <TableCell className="p-4 font-bold text-brand-navy h-auto">
                              {coupon.merchantId?.businessName ||
                                "Unknown Merchant"}
                            </TableCell>
                            <TableCell className="p-4">
                              <div className="font-bold">{coupon.title}</div>
                              <div className="text-[10px] text-brand-subtext mt-0.5">
                                Code:{" "}
                                <code className="bg-brand-surface px-1.5 py-0.5 rounded font-bold">
                                  {coupon.code}
                                </code>{" "}
                                | Claims: {coupon.totalClaims || 0}
                              </div>
                            </TableCell>
                            <TableCell className="p-4">
                              <Badge
                                className={`rounded px-2 py-0.5 text-[9px] font-bold border ${getPlanBadgeVariant(coupon.merchantId?.plan)} bg-transparent hover:bg-transparent shadow-none capitalize`}
                              >
                                {coupon.merchantId?.plan || "starter"}
                              </Badge>
                            </TableCell>
                            <TableCell className="p-4 text-center h-auto">
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleFlag(
                                      coupon._id,
                                      "isFeatured",
                                      coupon.isFeatured,
                                    )
                                  }
                                  className={`rounded-lg w-9 h-9 p-0 flex items-center justify-center cursor-pointer ${
                                    coupon.isFeatured
                                      ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                                      : "text-brand-subtext hover:bg-brand-surface"
                                  }`}
                                  title={
                                    coupon.isFeatured
                                      ? "Unpin Coupon"
                                      : "Pin Coupon to Tier 1"
                                  }
                                >
                                  <Pin
                                    className={`w-4 h-4 ${coupon.isFeatured ? "fill-amber-500" : ""}`}
                                  />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="p-4 text-center h-auto">
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleFlag(
                                      coupon._id,
                                      "isHot",
                                      coupon.isHot,
                                    )
                                  }
                                  className={`rounded-lg w-9 h-9 p-0 flex items-center justify-center cursor-pointer ${
                                    coupon.isHot
                                      ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                                      : "text-brand-subtext hover:bg-brand-surface"
                                  }`}
                                  title={
                                    coupon.isHot
                                      ? "Remove Hot Badge"
                                      : "Mark as Hot Deal"
                                  }
                                >
                                  <Flame
                                    className={`w-4 h-4 ${coupon.isHot ? "fill-red-500" : ""}`}
                                  />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            : <EmptyState
                icon={Tag}
                title="No active coupons found"
                description="There are no active and verified coupons currently running on the platform."
              />}
      </div>
    </DashboardLayout>
  );
}
