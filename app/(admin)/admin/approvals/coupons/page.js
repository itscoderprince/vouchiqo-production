"use client";

import { AlertTriangle, Check, RefreshCw, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApproveCoupon,
  adminFetchPendingCoupons,
  adminRejectCoupon,
} from "@/lib/api-helpers";

export default function CouponModeration() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal state
  const [rejectCouponId, setRejectCouponId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const fetchPendingCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminFetchPendingCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Error fetching pending coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCoupons();
  }, []);

  const handleApprove = async (couponId) => {
    try {
      setActionLoading(true);
      await adminApproveCoupon(couponId);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (err) {
      console.error("Error approving coupon:", err);
      alert("Failed to approve coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (couponId) => {
    setRejectCouponId(couponId);
    setRejectionReason("");
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      await adminRejectCoupon(rejectCouponId, rejectionReason.trim());
      setCoupons((prev) => prev.filter((c) => c._id !== rejectCouponId));
      setIsRejectOpen(false);
    } catch (err) {
      console.error("Error rejecting coupon:", err);
      alert("Failed to reject coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Coupon Moderation"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
        Coupon Moderation Queue
      </h2>

      {loading
        ? <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
            <span>Loading coupons pending moderation...</span>
          </div>
        : coupons.length > 0
          ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="overflow-x-auto flex-1">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                    <TableRow className="hover:bg-transparent border-b border-brand-border">
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Merchant / Brand
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Offer Title
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Discount Value
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Redemption Rules
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Expiry Date
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                        Moderation Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                    {coupons.map((coupon) => (
                      <TableRow
                        key={coupon._id}
                        className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                      >
                        <TableCell className="p-4 font-bold text-brand-navy h-auto">
                          {coupon.merchantId?.businessName ||
                            "Unknown Merchant"}
                          <span className="block text-[10px] text-brand-subtext font-bold uppercase mt-0.5">
                            Plan: {coupon.merchantId?.plan || "starter"}
                          </span>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="font-bold text-brand-text">
                            {coupon.title}
                          </div>
                          {coupon.description && (
                            <div className="text-[10px] text-brand-subtext mt-0.5 line-clamp-1">
                              {coupon.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="p-4 text-brand-blue font-bold">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : coupon.discountType === "fixed"
                              ? `₹${coupon.discountValue} OFF`
                              : "FREEBIE"}
                        </TableCell>
                        <TableCell className="p-4 text-brand-subtext max-w-[200px] truncate">
                          Code:{" "}
                          <code className="bg-brand-surface px-1.5 py-0.5 rounded font-bold text-brand-navy">
                            {coupon.code}
                          </code>
                        </TableCell>
                        <TableCell className="p-4 text-brand-subtext">
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="icon"
                              disabled={actionLoading}
                              onClick={() => handleApprove(coupon._id)}
                              className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                              title="Approve & Publish"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              disabled={actionLoading}
                              onClick={() => handleRejectClick(coupon._id)}
                              className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                              title="Reject Offer"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          : <EmptyState
              icon={Tag}
              title="No coupons pending review"
              description="Good job. All discount campaigns are currently active and moderated."
            />}

      {/* Rejection Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="bg-white border border-brand-border rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-brand-navy font-bold text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-brand-error" />
              <span>Reject Coupon Offer</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <p className="text-xs text-brand-subtext font-semibold">
              Please provide a clear reason for rejecting this offer. The
              merchant will see this feedback in their campaign manager.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid discount percentage, voucher code doesn't work, inappropriate content..."
              className="bg-brand-surface border border-brand-border text-xs min-h-20"
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              className="text-xs border-brand-border font-bold h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={actionLoading}
              className="bg-brand-error hover:bg-brand-error/90 text-white text-xs font-bold h-9 px-4 border-0 cursor-pointer"
            >
              Reject & Notify Merchant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
