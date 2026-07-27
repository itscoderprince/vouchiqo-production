"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import FormSelect from "@/components/shared/form/FormSelect";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAdminCoupons,
  useApproveAdminCoupon,
  useDeleteAdminCoupon,
  useRejectAdminCoupon,
  useUpdateAdminCoupon,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
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
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
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
        isApproving: approveMutation.isPending,
      }),
    [approveMutation, handleOpenEdit],
  );

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Offer Desk &amp; Moderation
            </h1>
            <LiveIndicator label="Real-time Offers Sync" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all platform deals, approve pending listings, edit
            parameters, and control featuring flags.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start md:self-auto gap-2 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 bg-card border-border/50 shadow-xs">
        <DataTable
          columns={columns}
          data={offers}
          isLoading={isLoading}
          searchKey="title"
          searchKeys={["title", "code", "merchantName"]}
          searchPlaceholder="Search by title, code, or merchant..."
          rightActions={
            <div className="flex items-center gap-2.5">
              <FormSelect
                name="statusFilter"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Select Status"
                triggerClassName="w-[180px] h-8 text-xs bg-background shadow-2xs font-semibold"
              />
            </div>
          }
        />
      </Card>

      {/* Modular Edit Offer Modal */}
      <OfferEditModal
        editCoupon={editCoupon}
        onClose={() => setEditCoupon(null)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        isPending={updateMutation.isPending}
      />

      {/* Modular Reject Offer Modal */}
      <OfferRejectModal
        rejectCoupon={rejectCoupon}
        onClose={() => setRejectCoupon(null)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={handleConfirmReject}
        isPending={rejectMutation.isPending}
      />

      {/* Modular Delete Offer Modal */}
      <ConfirmDeleteModal
        open={!!deleteCoupon}
        onOpenChange={(open) => !open && setDeleteCoupon(null)}
        title="Delete Offer Listing"
        itemName={deleteCoupon?.title}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
