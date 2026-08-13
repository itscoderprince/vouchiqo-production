"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Tag, ShoppingBag, ExternalLink, Copy, Check, Edit2, Trash2, Power } from "lucide-react";
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
import toast from "react-hot-toast";
import OfferDetailsModal from "./OfferDetailsModal";
import OfferEditModal from "./OfferEditModal";
import OfferRejectModal from "./OfferRejectModal";
import { getOfferTableColumns } from "./OfferTableColumns";
import AffiliateProductModal from "@/app/(merchant)/merchant/affiliate-products/components/AffiliateProductModal";

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
  const [activeTab, setActiveTab] = useState("coupons"); // 'coupons' | 'affiliates'

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Audit Details Modal State
  const [viewDetailsOffer, setViewDetailsOffer] = useState(null);

  // Edit Modal State (Coupons)
  const [editCoupon, setEditCoupon] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Reject Modal State
  const [rejectCoupon, setRejectCoupon] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Delete Modal State
  const [deleteCoupon, setDeleteCoupon] = useState(null);

  // Admin Affiliate Products state
  const [affiliateProducts, setAffiliateProducts] = useState([]);
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [deleteAffiliateId, setDeleteAffiliateId] = useState(null);
  const [isDeletingAffiliate, setIsDeletingAffiliate] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // TanStack Query for coupons list
  const {
    data: offers = [],
    isLoading,
    refetch,
  } = useAdminCoupons({
    status: statusFilter === "all" ? "" : statusFilter,
    search: debouncedSearch,
  });

  // Fetch admin affiliate products
  const fetchAdminAffiliates = useCallback(async () => {
    setLoadingAffiliates(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") query.set("status", statusFilter);
      if (debouncedSearch) query.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/affiliate-products?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAffiliateProducts(json.data || json || []);
      }
    } catch (err) {
      console.error("Error fetching admin affiliate products:", err);
    } finally {
      setLoadingAffiliates(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    if (activeTab === "affiliates") {
      fetchAdminAffiliates();
    }
  }, [activeTab, fetchAdminAffiliates]);

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

  // Affiliate Actions
  const handleToggleAffiliateStatus = async (product) => {
    const nextStatus = product.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/admin/affiliate-products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(`Product status updated to ${nextStatus}`);
        fetchAdminAffiliates();
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("Error updating status.");
    }
  };

  const handleConfirmDeleteAffiliate = async () => {
    if (!deleteAffiliateId) return;
    setIsDeletingAffiliate(true);
    try {
      const res = await fetch(`/api/admin/affiliate-products/${deleteAffiliateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Affiliate deal deleted.");
        setDeleteAffiliateId(null);
        fetchAdminAffiliates();
      } else {
        toast.error("Failed to delete deal.");
      }
    } catch {
      toast.error("Error deleting deal.");
    } finally {
      setIsDeletingAffiliate(false);
    }
  };

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
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Offer Desk &amp; Verification
            </h1>
            <LiveIndicator label="Real-time Platform Sync" />
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
            Manage all platform coupons, merchant affiliate products, service packages, and deal parameters.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("coupons")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "coupons"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Standard Coupons ({offers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("affiliates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "affiliates"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Affiliate Products &amp; Brand Deals</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === "coupons") refetch();
              else fetchAdminAffiliates();
            }}
            disabled={isLoading || loadingAffiliates}
            className="gap-1.5 h-8 px-2.5 text-[11px] font-medium border-slate-200 text-slate-700 rounded-xl shrink-0 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3 w-3 ${(isLoading || loadingAffiliates) ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tab 1: Standard Coupons */}
      {activeTab === "coupons" ? (
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
      ) : (
        /* Tab 2: Admin Affiliate Products & Brand Service Deals */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <input
              type="text"
              placeholder="Search affiliate deals by title, tagline, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-normal"
            />

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <FormSelect
                name="statusFilter"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Select Status"
                triggerClassName="w-[160px] h-7 text-[11px] bg-white border-slate-200 font-medium"
              />
            </div>
          </div>

          {loadingAffiliates ? (
            <div className="py-16 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              Fetching affiliate deals across merchants...
            </div>
          ) : affiliateProducts.length === 0 ? (
            <div className="py-16 text-center text-xs font-medium text-slate-400 bg-white border border-slate-200/80 rounded-2xl">
              No affiliate products or brand deals found.
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Product / Deal</th>
                      <th className="px-4 py-3">Merchant</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Pricing / Offer</th>
                      <th className="px-4 py-3">Destination URL</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {affiliateProducts.map((p) => {
                      const merchantName = p.merchantId?.businessName || "Unknown Merchant";
                      const hasExact = p.originalPrice > 0 && p.discountPrice > 0;
                      const hasFixed = p.discountPrice > 0 && p.originalPrice === 0;

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="max-w-[200px]">
                                <span className="font-bold text-slate-900 line-clamp-1 block">{p.title}</span>
                                {p.description && (
                                  <span className="text-[10px] text-slate-500 line-clamp-1 block">{p.description}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {merchantName}
                          </td>

                          <td className="px-4 py-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px] border border-slate-200">
                              {p.category}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-bold">
                            {hasExact ? (
                              <div className="space-y-0.5">
                                <span className="text-blue-600 block">₹{p.discountPrice?.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400 line-through block">₹{p.originalPrice?.toLocaleString()}</span>
                              </div>
                            ) : hasFixed ? (
                              <div className="space-y-0.5">
                                <span className="text-emerald-600 block font-bold">₹{p.discountPrice?.toLocaleString()}</span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 block truncate max-w-[140px]">
                                  {p.discountText || `Just @ ₹${p.discountPrice}`}
                                </span>
                              </div>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                                {p.discountText || `${p.discountPercentage}% OFF`}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 max-w-[160px]">
                              <span className="truncate text-slate-600 text-[11px]">{p.affiliateUrl}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(p.affiliateUrl);
                                  setCopiedId(p._id);
                                  toast.success("Link copied!");
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="p-1 hover:text-blue-600 rounded shrink-0 cursor-pointer"
                              >
                                {copiedId === p._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                              </button>
                              <a href={p.affiliateUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-blue-600 rounded shrink-0">
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-600">
                            {p.clickCount || 0}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {p.status?.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleAffiliateStatus(p)}
                                className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                  p.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                }`}
                                title={p.status === "active" ? "Pause Deal" : "Activate Deal"}
                              >
                                <Power className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingAffiliate(p)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 cursor-pointer"
                                title="Edit Deal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteAffiliateId(p._id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                                title="Delete Deal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Confirm Delete Coupon Modal */}
      <ConfirmDeleteModal
        open={!!deleteCoupon}
        onOpenChange={(open) => !open && setDeleteCoupon(null)}
        title="Delete Offer Listing"
        description="Are you sure you want to permanently delete this offer listing? This will remove it from customer views and search results."
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Admin Edit Affiliate Product Modal */}
      {editingAffiliate && (
        <AffiliateProductModal
          isOpen={!!editingAffiliate}
          onClose={() => setEditingAffiliate(null)}
          initialData={editingAffiliate}
          onSuccess={() => fetchAdminAffiliates()}
          isAdmin={true}
        />
      )}

      {/* Admin Delete Affiliate Product Modal */}
      <ConfirmDeleteModal
        open={!!deleteAffiliateId}
        onOpenChange={(open) => !open && setDeleteAffiliateId(null)}
        title="Delete Affiliate Deal"
        description="Are you sure you want to delete this affiliate product / brand deal? It will no longer appear on public brand pages or search results."
        onConfirm={handleConfirmDeleteAffiliate}
        isPending={isDeletingAffiliate}
      />
    </div>
  );
}
