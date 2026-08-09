"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  Check,
  Eye,
  FileText,
  Layers,
  RefreshCw,
  Store,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import EmptyState from "@/components/shared/feedback/EmptyState";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export default function CouponModerationClient() {
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading, refetch } = useAdminPendingCoupons();
  const approveMutation = useApproveAdminCoupon();
  const rejectMutation = useRejectAdminCoupon();

  // Audit details modal state
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    approveMutation.mutate(couponId, {
      onSuccess: () => {
        setIsDetailsOpen(false);
        setSelectedCoupon(null);
      },
    });
  };

  const handleOpenDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsOpen(true);
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
          setIsDetailsOpen(false);
          setSelectedCoupon(null);
          setRejectCouponId(null);
          setRejectionReason("");
        },
      },
    );
  };

  const getCouponRowColor = (index) => {
    const rowStyles = [
      "bg-blue-100/70 hover:bg-blue-100/90 border-l-4 border-l-blue-600 border-b border-blue-200/90 transition-all text-slate-900",
      "bg-emerald-100/70 hover:bg-emerald-100/90 border-l-4 border-l-emerald-600 border-b border-emerald-200/90 transition-all text-slate-900",
      "bg-amber-100/70 hover:bg-amber-100/90 border-l-4 border-l-amber-600 border-b border-amber-200/90 transition-all text-slate-900",
      "bg-purple-100/70 hover:bg-purple-100/90 border-l-4 border-l-purple-600 border-b border-purple-200/90 transition-all text-slate-900",
      "bg-indigo-100/70 hover:bg-indigo-100/90 border-l-4 border-l-indigo-600 border-b border-indigo-200/90 transition-all text-slate-900",
      "bg-rose-100/70 hover:bg-rose-100/90 border-l-4 border-l-rose-600 border-b border-rose-200/90 transition-all text-slate-900",
    ];
    return rowStyles[index % rowStyles.length];
  };

  return (
    <div className="w-full space-y-3 pb-12 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Offer Listing Moderation
            </h1>
            <LiveIndicator label="Real-time Moderation Queue" />
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
            Review and approve or decline newly submitted discount offers from merchant partners.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start sm:self-auto gap-1.5 h-7 px-2.5 text-[11px] font-medium border-slate-200 text-slate-700 rounded-lg shrink-0 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 border border-slate-200/80 rounded-xl bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">
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
        <div className="w-full overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-100/90 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-700 h-9">Offer &amp; Business</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 h-9">Category</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 h-9">Discount</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 h-9">Code / Type</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 h-9">Submitted</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 h-9 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon, index) => (
                <TableRow key={coupon._id} className={getCouponRowColor(index)}>
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-xs leading-snug">
                        {coupon.title}
                      </span>
                      <span className="text-[11px] text-slate-600 font-normal">
                        {coupon.merchantName ||
                          coupon.merchantId?.businessName ||
                          "Merchant Partner"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded bg-white/90 text-slate-800 border border-slate-300 inline-block shadow-2xs">
                      {coupon.category || "General"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span className="font-medium text-emerald-800 text-xs">
                      {coupon.discountValue}
                      {coupon.discountType === "percentage" ? "% OFF" : " OFF"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <code className="px-2 py-0.5 text-[10px] rounded bg-white/90 font-mono border border-slate-300 text-slate-800 shadow-2xs">
                      {coupon.code || "AUTO-APPLY"}
                    </code>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-[11px] text-slate-600 font-normal">
                    {new Date(coupon.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetails(coupon)}
                        className="h-7 px-2.5 gap-1 text-[11px] font-medium border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Audit</span>
                      </Button>

                      <Button
                        size="sm"
                        className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 font-medium rounded-lg cursor-pointer shadow-2xs gap-1"
                        onClick={() => handleApprove(coupon._id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        title="Reject Offer"
                        className="h-7 w-7 p-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-lg cursor-pointer shadow-2xs shrink-0"
                        onClick={() => openRejectModal(coupon._id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Offer Full Details Audit Dialog Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto font-sans text-left">
          {selectedCoupon && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span>{selectedCoupon.title}</span>
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-normal mt-0.5 flex items-center gap-1">
                      <Store className="h-3 w-3 text-slate-400" />
                      <span>
                        {selectedCoupon.merchantName ||
                          selectedCoupon.merchantId?.businessName ||
                          "Merchant Partner"}
                      </span>
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-medium px-2 py-0.5">
                    Pending Review
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Banner / Image Preview */}
                {(selectedCoupon.imageUrl || selectedCoupon.bannerUrl) && (
                  <div className="h-36 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={selectedCoupon.imageUrl || selectedCoupon.bannerUrl}
                      alt={selectedCoupon.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Offer Key Specifications Grid */}
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                      Discount Value
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {selectedCoupon.discountValue}
                      {selectedCoupon.discountType === "percentage" ? "% OFF" : " OFF"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                      Coupon Code
                    </span>
                    <code className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                      {selectedCoupon.code || "AUTO-APPLY"}
                    </code>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                      Category
                    </span>
                    <span className="font-medium text-slate-800 capitalize">
                      {selectedCoupon.category || "General"}
                      {selectedCoupon.subcategory ? ` • ${selectedCoupon.subcategory}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                      Validity Period
                    </span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {selectedCoupon.expiryDate
                        ? `Expires ${new Date(selectedCoupon.expiryDate).toLocaleDateString()}`
                        : "Ongoing"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Offer Description
                  </h4>
                  <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
                    {selectedCoupon.description || "No specific description provided."}
                  </p>
                </div>

                {/* Terms & Conditions */}
                {selectedCoupon.termsConditions && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      Terms &amp; Conditions
                    </h4>
                    <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
                      {selectedCoupon.termsConditions}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailsOpen(false)}
                  className="h-8 text-xs font-medium border-slate-300 text-slate-700"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openRejectModal(selectedCoupon._id)}
                  disabled={rejectMutation.isPending}
                  className="h-8 text-xs font-medium"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reject Offer
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(selectedCoupon._id)}
                  disabled={approveMutation.isPending}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Approve Offer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle className="h-5 w-5" />
              <span>Reject Offer Listing</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-left">
            <p className="text-xs text-slate-500 font-normal">
              Please provide a clear reason for rejecting this offer listing.
              This explanation will be shared directly with the merchant partner.
            </p>
            <Textarea
              placeholder="e.g. Invalid discount code, misleading title, or improper category..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none text-xs border-slate-200"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectOpen(false)}
              disabled={rejectMutation.isPending}
              className="h-8 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
              className="h-8 text-xs font-medium"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
