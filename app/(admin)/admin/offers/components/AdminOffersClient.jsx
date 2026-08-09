"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import FormSelect from "@/components/shared/form/FormSelect";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import {
  useAdminCoupons,
  useApproveAdminCoupon,
  useDeleteAdminCoupon,
  useRejectAdminCoupon,
  useUpdateAdminCoupon,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import OfferDetailsModal from "./OfferDetailsModal";
import OfferEditModal from "./OfferEditModal";
import OfferRejectModal from "./OfferRejectModal";
import { getOfferTableColumns } from "./OfferTableColumns";

const STATUS_OPTIONS = [
  { value: "all", label: "All Active & Paused" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
  { value: "deleted", label: "Deleted" },
];

export default function AdminOffersClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Audit Details Modal State
  const [viewDetailsOffer, setViewDetailsOffer] = useState(null);

  // Edit Modal State
  const [editCoupon, setEditCoupon] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Reject Modal State
  const [rejectCoupon, setRejectCoupon] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Delete Modal State
  const [deleteCoupon, setDeleteCoupon] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // TanStack Query for offers list
  const {
    data: offers = [],
    isLoading,
    refetch,
  } = useAdminCoupons({
    status: statusFilter === "all" ? "" : statusFilter,
    search: debouncedSearch,
  });

  const approveMutation = useApproveAdminCoupon();
  const rejectMutation = useRejectAdminCoupon();
  const updateMutation = useUpdateAdminCoupon();
  const deleteMutation = useDeleteAdminCoupon();

  // Real-time WebSocket event listeners
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  });

  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  });

  const getOfferRowColor = (row, index) => {
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

  const handleOpenEdit = useCallback((coupon) => {
    setEditCoupon(coupon);
    setEditForm({
      title: coupon.title || "",
      description: coupon.description || "",
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || 0,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || "",
      category: coupon.category || "general",
      status: coupon.status || "active",
      isVerified: coupon.isVerified ?? true,
      isFeatured: coupon.isFeatured ?? false,
      isHot: coupon.isHot ?? false,
      expiresAt: coupon.expiresAt || coupon.expiryDate
        ? new Date(coupon.expiresAt || coupon.expiryDate).toISOString().split("T")[0]
        : "",
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editCoupon) return;
    updateMutation.mutate(
      { couponId: editCoupon._id, ...editForm },
      {
        onSuccess: () => setEditCoupon(null),
      },
    );
  }, [editCoupon, editForm, updateMutation]);

  const handleConfirmReject = useCallback(() => {
    if (!rejectCoupon || !rejectionReason.trim()) return;
    rejectMutation.mutate(
      { couponId: rejectCoupon._id, reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setRejectCoupon(null);
          setRejectionReason("");
        },
      },
    );
  }, [rejectCoupon, rejectionReason, rejectMutation]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteCoupon) return;
    deleteMutation.mutate(deleteCoupon._id, {
      onSuccess: () => setDeleteCoupon(null),
    });
  }, [deleteCoupon, deleteMutation]);

  const columns = useMemo(
    () =>
      getOfferTableColumns({
        onApprove: (id) => approveMutation.mutate(id),
        onReject: (coupon) => setRejectCoupon(coupon),
        onEdit: handleOpenEdit,
        onDelete: (coupon) => setDeleteCoupon(coupon),
        onViewDetails: (coupon) => setViewDetailsOffer(coupon),
        isApproving: approveMutation.isPending,
      }),
    [approveMutation, handleOpenEdit],
  );

  return (
    <div className="w-full space-y-3 pb-12 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Offer Desk &amp; Verification
            </h1>
            <LiveIndicator label="Real-time Offers Sync" />
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
            Manage all platform deals, approve pending listings, edit parameters, and inspect submitted offer details.
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
          <span>Refresh</span>
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          columns={columns}
          data={offers}
          isLoading={isLoading}
          searchKey="title"
          searchKeys={["title", "code", "merchantName"]}
          searchPlaceholder="Search by title, code, or merchant..."
          getRowClassName={getOfferRowColor}
          rightActions={
            <div className="flex items-center gap-2">
              <FormSelect
                name="statusFilter"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Select Status"
                triggerClassName="w-[160px] h-7 text-[11px] bg-white border-slate-200 font-medium"
              />
            </div>
          }
        />
      </div>

      {/* Offer Audit Details Modal */}
      <OfferDetailsModal
        offer={viewDetailsOffer}
        onClose={() => setViewDetailsOffer(null)}
        onEdit={handleOpenEdit}
        onDelete={(coupon) => setDeleteCoupon(coupon)}
        onApprove={(id) => approveMutation.mutate(id)}
      />

      {/* Modular Edit Offer Modal */}
      <OfferEditModal
        editCoupon={editCoupon}
        onClose={() => setEditCoupon(null)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        isPending={updateMutation.isPending}
      />

      {/* Rejection Reason Modal */}
      <OfferRejectModal
        rejectCoupon={rejectCoupon}
        onClose={() => setRejectCoupon(null)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={handleConfirmReject}
        isPending={rejectMutation.isPending}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={!!deleteCoupon}
        onOpenChange={(open) => !open && setDeleteCoupon(null)}
        title="Delete Offer Listing"
        description="Are you sure you want to permanently delete this offer listing? This will remove it from customer views and search results."
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
