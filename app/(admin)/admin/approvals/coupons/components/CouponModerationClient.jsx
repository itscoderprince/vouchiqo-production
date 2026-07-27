"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, RefreshCw, Tag, X } from "lucide-react";
import { useState } from "react";
import EmptyState from "@/components/shared/feedback/EmptyState";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
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
  useAdminPendingCoupons,
  useApproveAdminCoupon,
  useRejectAdminCoupon,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function CouponModerationClient() {
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading, refetch } = useAdminPendingCoupons();
  const approveMutation = useApproveAdminCoupon();
  const rejectMutation = useRejectAdminCoupon();

  // Rejection modal state
  const [rejectCouponId, setRejectCouponId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Real-time listener: invalidates TanStack Query cache instantly on submission & status updates
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.pendingCoupons() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.pendingCoupons() });
  });

  const handleApprove = (couponId) => {
    approveMutation.mutate(couponId);
  };

  const openRejectModal = (couponId) => {
    setRejectCouponId(couponId);
    setRejectionReason("");
    setIsRejectOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectCouponId || !rejectionReason.trim()) return;

    rejectMutation.mutate(
      { couponId: rejectCouponId, reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setIsRejectOpen(false);
          setRejectCouponId(null);
          setRejectionReason("");
        },
      },
    );
  };

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Offer Listing Moderation
            </h1>
            <LiveIndicator label="Real-time Moderation Queue" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve or reject newly submitted discount offers from
            merchants.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start md:self-auto gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Queue
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border/50 rounded-xl bg-card">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading pending offers queue...
          </p>
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No pending offers to review"
          description="All merchant offer listings have been moderated. Newly submitted deals will appear here in real-time."
        />
      ) : (
        <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Offer & Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Code / Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {coupon.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {coupon.merchantName ||
                          coupon.merchantId?.businessName ||
                          "Merchant"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50">
                      {coupon.category || "General"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                      {coupon.discountValue}
                      {coupon.discountType === "percentage" ? "% OFF" : " OFF"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="px-1.5 py-0.5 text-xs rounded bg-muted font-mono border">
                      {coupon.code || "AUTO-APPLY"}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(coupon.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        onClick={() => handleApprove(coupon._id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => openRejectModal(coupon._id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reject Offer Listing
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Please provide a clear reason for rejecting this offer listing.
              This will be shared with the merchant.
            </p>
            <Textarea
              placeholder="e.g. Invalid discount code, misleading title, or improper category..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
