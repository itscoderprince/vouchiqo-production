"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Plus,
  Search,
  Tag,
  Ticket,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteCoupon, useMerchantCoupons } from "@/hooks/use-coupons";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";

/**
 * Compact summary stat card with clean typography
 */
function StatCard({
  title,
  count,
  description,
  colorClass,
  icon: Icon,
  iconBg,
}) {
  return (
    <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-xl p-3 sm:p-3.5 transition-all hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{title}</span>
        {Icon && (
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg || "bg-slate-100 text-slate-500"}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className={`text-lg sm:text-xl font-semibold ${colorClass}`}>
          {count}
        </div>
        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
          {description}
        </p>
      </div>
    </Card>
  );
}

/**
 * Format discount display string
 */
function formatDiscount(coupon) {
  if (!coupon) return "Special Offer";
  const val = coupon.rawDiscountValue || coupon.discountValue;
  const isNum =
    val !== null &&
    val !== undefined &&
    val !== "" &&
    !Number.isNaN(Number(val));

  if (coupon.offerType === "deal" && coupon.salePrice) {
    return `₹${coupon.salePrice} Deal`;
  }
  if (coupon.discountType === "percentage" && isNum) return `${val}% OFF`;
  if (coupon.discountType === "fixed" && isNum) return `₹${val} OFF`;
  if (coupon.discountType === "freebie" || coupon.offerType === "special") {
    if (coupon.specialOfferType) return coupon.specialOfferType;
    if (typeof val === "string" && val.trim() && !isNum) return val;
    return "Freebie / Gift";
  }
  if (val) return isNum ? `${val}% OFF` : String(val);
  return "Special Offer";
}

/**
 * Format expiry date safely
 */
function formatDateSafe(dateVal) {
  if (!dateVal) return "No Expiry";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "No Expiry";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MerchantCouponsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [deleteId, setDeleteId] = useState(null);

  // Sync statusFilter whenever URL search parameter changes
  useEffect(() => {
    setStatusFilter(statusParam);
  }, [statusParam]);

  const deleteMutation = useDeleteCoupon();
  const { data: merchant, isLoading: loadingMerchant } = useMerchantProfile();
  const { data: couponsData = [], isLoading: loadingCoupons } =
    useMerchantCoupons(merchant?._id);

  // Real-time Socket Event Listeners
  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, (data) => {
    if (data?.couponId && merchant?._id) {
      queryClient.setQueryData(["merchant-coupons", merchant._id], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          String(item._id || item.id) === String(data.couponId)
            ? {
                ...item,
                status: data.status,
                isVerified: data.isVerified,
                rejectionReason: data.rejectionReason ?? item.rejectionReason,
              }
            : item,
        );
      });
    }
    queryClient.invalidateQueries({
      queryKey: ["merchant-coupons"],
      exact: false,
      refetchType: "active",
    });
  });

  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED_CONFIRMATION, () => {
    queryClient.invalidateQueries({
      queryKey: ["merchant-coupons"],
      exact: false,
      refetchType: "active",
    });
  });

  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({
      queryKey: ["merchant-coupons"],
      exact: false,
      refetchType: "active",
    });
  });

  const isLoading = loadingMerchant || loadingCoupons;

  // Filter coupons based on search query and status filter selection
  const filteredCoupons = useMemo(() => {
    return couponsData.filter((coupon) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        coupon.title?.toLowerCase().includes(q) ||
        coupon.code?.toLowerCase().includes(q) ||
        coupon.category?.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "active" || statusFilter === "approved") {
        matchesStatus =
          coupon.status === "active" || coupon.status === "approved";
      } else if (statusFilter === "expired") {
        const isPastDate =
          coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
        matchesStatus = coupon.status === "expired" || isPastDate;
      } else if (statusFilter === "pending") {
        matchesStatus = coupon.status === "pending";
      } else if (statusFilter !== "all") {
        matchesStatus = coupon.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [couponsData, searchQuery, statusFilter]);

  // Compute live statistics for summary cards
  const stats = useMemo(() => {
    return {
      total: couponsData.length,
      pending: couponsData.filter((c) => c.status === "pending").length,
      active: couponsData.filter(
        (c) => c.status === "active" || c.status === "approved",
      ).length,
      expired: couponsData.filter((c) => {
        const isPastDate =
          c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
        return c.status === "expired" || isPastDate;
      }).length,
    };
  }, [couponsData]);

  // Columns definition for reusable DataTable component
  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Offer Detail",
        sortable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-slate-900 text-xs">
              {r.title}
            </span>
            <div className="flex items-center gap-1.5">
              {r.code && (
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium uppercase">
                  {r.code}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-normal font-mono">
                #{String(r._id).slice(-6)}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "discount",
        header: "Discount",
        sortable: true,
        cell: (r) => (
          <span className="text-[10px] font-medium text-[#F72853] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80">
            {formatDiscount(r)}
          </span>
        ),
      },
      {
        key: "totalClaims",
        header: "Claims",
        sortable: true,
        cell: (r) => (
          <span className="font-normal text-xs text-slate-700">
            {r.totalClaims || 0}
          </span>
        ),
      },
      {
        key: "totalRedemptions",
        header: "Redemptions",
        sortable: true,
        cell: (r) => (
          <span className="font-normal text-xs text-slate-700">
            {r.totalRedemptions || 0}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <StatusBadge
            status={r.status}
            label={r.status === "pending" ? "Pending Audit" : undefined}
            size="sm"
          />
        ),
      },
      {
        key: "expiresAt",
        header: "Expiry Date",
        sortable: true,
        cell: (r) => (
          <span className="text-slate-500 font-normal text-xs font-mono">
            {formatDateSafe(r.expiresAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (r) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/merchant/coupons/${r._id}`)}
              className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#F72853] hover:bg-rose-50/50 cursor-pointer shadow-none"
              title="Edit Offer"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(r._id)}
              disabled={deleteMutation.isPending}
              className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer shadow-none disabled:opacity-50"
              title="Delete Offer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [router, deleteMutation.isPending],
  );

  return (
    <DashboardLayout
      title="My Offers"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-3.5 text-left font-sans">
        {/* Stats Summary Cards Row */}
        <div
          data-tour="coupons-list"
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
        >
          <StatCard
            title="Total Offers"
            count={stats.total}
            description="All posted deals in your account"
            colorClass="text-slate-900"
            icon={Tag}
            iconBg="bg-rose-50 text-[#F72853]"
          />
          <StatCard
            title="Pending Approval"
            count={stats.pending}
            description="Offers awaiting admin audit"
            colorClass="text-amber-600"
            icon={Clock}
            iconBg="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Active Offers"
            count={stats.active}
            description="Deals currently live and claimable"
            colorClass="text-emerald-600"
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Expired Offers"
            count={stats.expired}
            description="Deals past expiration date"
            colorClass="text-slate-600"
            icon={AlertCircle}
            iconBg="bg-slate-100 text-slate-500"
          />
        </div>

        {/* Header Controls (Search & Status Filter) */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <InputGroup className="bg-white border border-slate-200 rounded-xl h-8 sm:h-9 px-2 w-full sm:w-64 shadow-2xs">
              <InputGroupAddon>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="Search my offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs placeholder:text-slate-400 h-full font-normal"
              />
            </InputGroup>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                if (val === "all") router.push("/merchant/coupons");
                else router.push(`/merchant/coupons?status=${val}`);
              }}
            >
              <SelectTrigger className="bg-white border border-slate-200 text-xs rounded-xl h-8 sm:h-9 px-3 font-medium text-slate-700 shadow-2xs focus:ring-0 w-full sm:w-auto sm:min-w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 z-[300]">
                <SelectItem value="all" className="text-xs font-medium">
                  All Status
                </SelectItem>
                <SelectItem value="active" className="text-xs font-medium">
                  Active
                </SelectItem>
                <SelectItem value="expired" className="text-xs font-medium">
                  Expired
                </SelectItem>
                <SelectItem value="pending" className="text-xs font-medium">
                  Pending Audit
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/merchant/coupons/new"
              data-tour="create-coupon-btn"
              className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium py-1.5 px-3.5 flex items-center gap-1.5 shadow-xs w-full sm:w-auto justify-center rounded-xl border-0 h-8 sm:h-9 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Offer</span>
            </Link>
          </div>
        </div>

        {/* Offers Table using Shared DataTable */}
        <Card className="border border-slate-200/90 rounded-xl shadow-xs overflow-hidden bg-white p-3 sm:p-4">
          <DataTable
            columns={columns}
            data={filteredCoupons}
            loading={isLoading}
            searchable={false}
            defaultPageSize={10}
            emptyState={
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F72853] flex items-center justify-center border border-rose-100/80">
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-800">
                    No offer listings found
                  </h4>
                  <p className="text-xs text-slate-500 font-normal max-w-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "No offers match your current search or status filter."
                      : "Create your first discount coupon, voucher, or promotional deal to start attracting customers."}
                  </p>
                </div>
                {!searchQuery && statusFilter === "all" && (
                  <Link
                    href="/merchant/coupons/new"
                    className="inline-flex items-center gap-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Your First Offer</span>
                  </Link>
                )}
              </div>
            }
          />
        </Card>
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Offer Listing"
        description="This action cannot be undone. This will permanently delete the offer and disable any active customer claims."
        onConfirm={() => {
          deleteMutation.mutate(deleteId, {
            onSettled: () => setDeleteId(null),
          });
        }}
        isPending={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}

export default function MerchantCouponsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-xs text-slate-400 font-semibold">
          Loading listings...
        </div>
      }
    >
      <MerchantCouponsContent />
    </Suspense>
  );
}
