"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Layers,
  Pause,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
  isActive,
  onClick,
}) {
  return (
    <Card
      onClick={onClick}
      className={`border shadow-2xs bg-white rounded-xl p-3 sm:p-3.5 transition-all font-sans cursor-pointer ${
        isActive
          ? "border-[#F72853] ring-1 ring-[#F72853]/30 bg-rose-50/20"
          : "border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
      }`}
    >
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
 * Format coupon discount display string
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
  const typeParam = searchParams?.get("type") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [typeFilter, setTypeFilter] = useState(typeParam);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [isDeletingAffiliate, setIsDeletingAffiliate] = useState(false);

  // Sync state with URL search params
  useEffect(() => {
    setStatusFilter(statusParam);
  }, [statusParam]);

  useEffect(() => {
    setTypeFilter(typeParam);
  }, [typeParam]);

  const handleStatusTab = (status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("status", status);
    router.replace(`/merchant/coupons?${params.toString()}`, { scroll: false });
  };

  const handleTypeTab = (type) => {
    setTypeFilter(type);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("type", type);
    router.replace(`/merchant/coupons?${params.toString()}`, { scroll: false });
  };

  const deleteCouponMutation = useDeleteCoupon();
  const { data: merchant, isLoading: loadingMerchant } = useMerchantProfile();

  // 1. Fetch Coupons
  const { data: couponsData = [], isLoading: loadingCoupons } =
    useMerchantCoupons(merchant?._id);

  // 2. Fetch Affiliate Products listed by merchant
  const { data: affiliateProductsData = [], isLoading: loadingAffiliates } =
    useQuery({
      queryKey: ["merchant-affiliate-products", merchant?._id],
      queryFn: async () => {
        const res = await fetch("/api/merchant/affiliate-products");
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data : [];
      },
      enabled: !!merchant?._id,
    });

  // Real-time Socket Event Listeners for Coupons
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

  const isLoading = loadingMerchant || loadingCoupons || loadingAffiliates;

  // Toggle Affiliate product status (active <-> paused)
  const handleToggleAffiliateStatus = useCallback(
    async (item) => {
      const nextStatus = item.status === "active" ? "paused" : "active";
      setTogglingId(item._id);
      try {
        const res = await fetch(
          `/api/merchant/affiliate-products/${item._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          },
        );

        if (res.ok) {
          toast.success(`Affiliate deal set to ${nextStatus}`);
          queryClient.invalidateQueries({
            queryKey: ["merchant-affiliate-products", merchant?._id],
          });
          queryClient.invalidateQueries({
            queryKey: ["merchant-badges"],
          });
        } else {
          toast.error("Failed to update affiliate product status.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error updating status.");
      } finally {
        setTogglingId(null);
      }
    },
    [merchant?._id, queryClient],
  );

  // Unified Listings Data (Coupons + Affiliate Products)
  const allListings = useMemo(() => {
    const couponItems = (couponsData || []).map((c) => ({
      ...c,
      _id: String(c._id || c.id),
      listingType: "coupon",
      title: c.title,
      code: c.code,
      discountText: formatDiscount(c),
      category: c.category || "General",
      status: c.status || "active",
      expiresAt: c.expiresAt,
      clicks: Number(c.clickCount || c.viewCount || 0),
      redemptions: Number(c.totalRedemptions || 0),
      claims: Number(c.totalClaims || 0),
      affiliateUrl: null,
      imageUrl: null,
    }));

    const affiliateItems = (affiliateProductsData || []).map((a) => {
      const isDiscounted =
        a.discountPrice && a.originalPrice && a.discountPrice < a.originalPrice;
      const discountDisplay = a.discountPercentage
        ? `${a.discountPercentage}% OFF`
        : isDiscounted
          ? `₹${a.discountPrice} (Save ₹${a.originalPrice - a.discountPrice})`
          : a.originalPrice
            ? `₹${a.originalPrice}`
            : "Affiliate Deal";

      return {
        ...a,
        _id: String(a._id || a.id),
        listingType: "affiliate",
        title: a.title,
        code: null,
        discountText: discountDisplay,
        category: a.category || "General",
        status: a.status || "active",
        expiresAt: a.expiresAt || null,
        clicks: Number(a.clickCount || 0),
        redemptions: 0,
        claims: Number(a.clickCount || 0),
        affiliateUrl: a.affiliateUrl,
        imageUrl: a.imageUrl,
        originalPrice: a.originalPrice,
        discountPrice: a.discountPrice,
      };
    });

    return [...couponItems, ...affiliateItems];
  }, [couponsData, affiliateProductsData]);

  // Filter listings based on search query, type filter, and status filter selection
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.code?.toLowerCase().includes(q) ||
        item.affiliateUrl?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

      let matchesType = true;
      if (typeFilter !== "all") {
        matchesType = item.listingType === typeFilter;
      }

      let matchesStatus = true;
      if (statusFilter === "active" || statusFilter === "approved") {
        matchesStatus = item.status === "active" || item.status === "approved";
      } else if (statusFilter === "expired") {
        const isPastDate =
          item.expiresAt && new Date(item.expiresAt).getTime() < Date.now();
        matchesStatus = item.status === "expired" || isPastDate;
      } else if (statusFilter === "pending") {
        matchesStatus = item.status === "pending";
      } else if (statusFilter === "paused") {
        matchesStatus = item.status === "paused";
      } else if (statusFilter !== "all") {
        matchesStatus = item.status === statusFilter;
      }

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allListings, searchQuery, typeFilter, statusFilter]);

  // Compute live statistics for summary cards
  const stats = useMemo(() => {
    const paused = allListings.filter((c) => c.status === "paused").length;
    const expired = allListings.filter((c) => {
      const isPastDate =
        c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
      return c.status === "expired" || isPastDate;
    }).length;

    return {
      total: allListings.length,
      pending: allListings.filter((c) => c.status === "pending").length,
      active: allListings.filter(
        (c) => c.status === "active" || c.status === "approved",
      ).length,
      expired: expired + paused,
      pausedCount: paused,
      expiredCount: expired,
      couponsCount: couponsData.length,
      affiliatesCount: affiliateProductsData.length,
    };
  }, [allListings, couponsData, affiliateProductsData]);

  // Confirm and handle deletion for either coupon or affiliate item
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.listingType === "coupon") {
      deleteCouponMutation.mutate(deleteTarget._id, {
        onSettled: () => setDeleteTarget(null),
      });
    } else {
      setIsDeletingAffiliate(true);
      try {
        const res = await fetch(
          `/api/merchant/affiliate-products/${deleteTarget._id}`,
          { method: "DELETE" },
        );
        if (res.ok) {
          toast.success("Affiliate product deleted successfully");
          queryClient.invalidateQueries({
            queryKey: ["merchant-affiliate-products", merchant?._id],
          });
          queryClient.invalidateQueries({
            queryKey: ["merchant-badges"],
          });
        } else {
          toast.error("Failed to delete affiliate product");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error deleting affiliate product");
      } finally {
        setIsDeletingAffiliate(false);
        setDeleteTarget(null);
      }
    }
  };

  // Columns definition for reusable DataTable component
  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Listing Detail",
        sortable: true,
        cell: (r) => {
          const isAffiliate = r.listingType === "affiliate";
          return (
            <div className="flex items-start gap-2.5 py-0.5">
              {/* Thumbnail or Type Icon */}
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                {r.imageUrl
                  ? <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="w-full h-full object-cover"
                    />
                  : isAffiliate
                    ? <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    : <Ticket className="w-4 h-4 text-[#F72853]" />}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className="font-medium text-slate-900 text-xs truncate max-w-xs sm:max-w-sm"
                  title={r.title}
                >
                  {r.title}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Type Badge */}
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded font-sans uppercase tracking-wider border ${
                      isAffiliate
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        : "bg-rose-50 text-[#F72853] border-rose-200/60"
                    }`}
                  >
                    {isAffiliate ? "Affiliate Deal" : "Coupon Voucher"}
                  </span>

                  {/* Code or Affiliate Link */}
                  {isAffiliate
                    ? <a
                        href={r.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                        title={r.affiliateUrl}
                      >
                        <span>Affiliate Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    : r.code
                      ? <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium uppercase">
                          {r.code}
                        </span>
                      : null}

                  <span className="text-[10px] text-slate-400 font-normal font-mono">
                    #{String(r._id).slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "discount",
        header: "Discount / Deal",
        sortable: true,
        cell: (r) => (
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border font-sans ${
              r.listingType === "affiliate"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200/80"
                : "text-[#F72853] bg-rose-50 border-rose-200/80"
            }`}
          >
            {r.discountText}
          </span>
        ),
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        cell: (r) => (
          <span className="text-[11px] font-normal text-slate-600 capitalize bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60 inline-flex items-center gap-1">
            <Tag className="w-2.5 h-2.5 text-slate-400" />
            {r.category || "General"}
          </span>
        ),
      },
      {
        key: "performance",
        header: "Engagement",
        sortable: true,
        cell: (r) => {
          if (r.listingType === "affiliate") {
            return (
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs text-slate-800">
                  {(r.clicks || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  shopper visits
                </span>
              </div>
            );
          }
          return (
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs text-slate-800">
                {(r.claims || 0).toLocaleString()}{" "}
                <span className="text-[10px] text-slate-400 font-normal">
                  claims
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {(r.redemptions || 0).toLocaleString()} redemptions
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (r) => (
          <StatusBadge
            status={r.status}
            label={
              r.status === "pending"
                ? "Pending Audit"
                : r.status === "paused"
                  ? "Paused"
                  : undefined
            }
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
        cell: (r) => {
          const isAffiliate = r.listingType === "affiliate";
          const editHref = isAffiliate
            ? `/merchant/affiliate-products/${r._id}`
            : `/merchant/coupons/${r._id}`;

          return (
            <div className="flex justify-end items-center gap-1">
              {/* Edit Listing */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(editHref)}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shadow-none"
                title={
                  isAffiliate ? "Edit Affiliate Product" : "Edit Coupon Offer"
                }
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>

              {/* Toggle Status (Pause / Resume for affiliate deals) */}
              {isAffiliate && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={togglingId === r._id}
                  onClick={() => handleToggleAffiliateStatus(r)}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shadow-none disabled:opacity-50"
                  title={r.status === "active" ? "Pause Deal" : "Resume Deal"}
                >
                  {r.status === "active"
                    ? <Pause className="w-3.5 h-3.5" />
                    : <Play className="w-3.5 h-3.5" />}
                </Button>
              )}

              {/* Delete Listing */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTarget(r)}
                disabled={deleteCouponMutation.isPending || isDeletingAffiliate}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer shadow-none disabled:opacity-50"
                title="Delete Listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      router,
      deleteCouponMutation.isPending,
      isDeletingAffiliate,
      togglingId,
      handleToggleAffiliateStatus,
    ],
  );

  return (
    <DashboardLayout
      title="All Store Listings"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-3.5 text-left font-sans">
        {/* Stats Summary Cards Row (Interactive Filters) */}
        <div
          data-tour="coupons-list"
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
        >
          <StatCard
            title="Total Listings"
            count={stats.total}
            description="All active, pending & paused deals"
            colorClass="text-slate-900"
            icon={Layers}
            iconBg="bg-rose-50 text-[#F72853]"
            isActive={statusFilter === "all" && typeFilter === "all"}
            onClick={() => {
              handleStatusTab("all");
              handleTypeTab("all");
            }}
          />
          <StatCard
            title="Active Listings"
            count={stats.active}
            description="Live, claimable deals & products"
            colorClass="text-emerald-600"
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
            isActive={statusFilter === "active"}
            onClick={() => handleStatusTab("active")}
          />
          <StatCard
            title="Pending Approval"
            count={stats.pending}
            description="Coupon offers awaiting audit"
            colorClass="text-amber-600"
            icon={Clock}
            iconBg="bg-amber-50 text-amber-600"
            isActive={statusFilter === "pending"}
            onClick={() => handleStatusTab("pending")}
          />
          <StatCard
            title="Expired / Paused"
            count={stats.expired}
            description="Deals inactive or past validity"
            colorClass="text-slate-600"
            icon={AlertCircle}
            iconBg="bg-slate-100 text-slate-500"
            isActive={statusFilter === "expired" || statusFilter === "paused"}
            onClick={() => handleStatusTab("expired")}
          />
        </div>

        {/* Unified Card: Filters, Action Button & Table All-in-One Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {/* Top Row: Both Selects + Search Input + Post Action Button */}
          <div className="p-3 sm:p-3.5 border-b border-slate-100">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
              {/* Filter Controls: Both Selects + Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
                {/* Type Select Dropdown */}
                <div className="w-full sm:w-48 shrink-0">
                  <Select value={typeFilter} onValueChange={handleTypeTab}>
                    <SelectTrigger className="w-full h-9 text-xs bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl font-medium shadow-2xs cursor-pointer">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 shadow-md">
                      <SelectItem value="all">
                        All Types ({stats.total})
                      </SelectItem>
                      <SelectItem value="coupon">
                        🏷️ Coupons ({stats.couponsCount})
                      </SelectItem>
                      <SelectItem value="affiliate">
                        🛍️ Affiliate Deals ({stats.affiliatesCount})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Select Dropdown */}
                <div className="w-full sm:w-48 shrink-0">
                  <Select value={statusFilter} onValueChange={handleStatusTab}>
                    <SelectTrigger className="w-full h-9 text-xs bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl font-medium shadow-2xs cursor-pointer">
                      <SelectValue placeholder="All Listings" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 shadow-md">
                      <SelectItem value="all">
                        All Listings ({stats.total})
                      </SelectItem>
                      <SelectItem value="active">
                        Active ({stats.active})
                      </SelectItem>
                      <SelectItem value="pending">
                        Pending Audit ({stats.pending})
                      </SelectItem>
                      <SelectItem value="paused">
                        Paused ({stats.pausedCount})
                      </SelectItem>
                      <SelectItem value="expired">
                        Expired ({stats.expiredCount})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Bar */}
                <InputGroup className="bg-slate-50/70 border border-slate-200/90 rounded-xl h-9 px-2.5 flex-1 min-w-[180px] shadow-2xs focus-within:bg-white focus-within:border-slate-300">
                  <InputGroupAddon>
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="Search by title, code, deal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs placeholder:text-slate-400 h-full font-normal"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] text-slate-400 hover:text-slate-700 px-1 cursor-pointer font-medium"
                    >
                      Clear
                    </button>
                  )}
                </InputGroup>
              </div>

              {/* Quick Create Action CTA */}
              <div className="shrink-0 flex items-center justify-end">
                <Link
                  href="/merchant/coupons/new"
                  data-tour="create-coupon-btn"
                  className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-1.5 shadow-xs rounded-xl border-0 h-9 cursor-pointer transition-all shrink-0 w-full sm:w-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post New Listing</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Table Section inside the same single card */}
          <div className="p-3 sm:p-4">
            <DataTable
              columns={columns}
              data={filteredListings}
              loading={isLoading}
              searchable={false}
              defaultPageSize={10}
              emptyState={
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F72853] flex items-center justify-center border border-rose-100/80">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-slate-800">
                      No listings found
                    </h4>
                    <p className="text-xs text-slate-500 font-normal max-w-sm">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      typeFilter !== "all"
                        ? "No listings match your active filters or search terms."
                        : "Create your first coupon voucher or affiliate product deal to start attracting shoppers."}
                    </p>
                  </div>
                  {!searchQuery &&
                    statusFilter === "all" &&
                    typeFilter === "all" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/merchant/coupons/new"
                          className="inline-flex items-center gap-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium px-4 py-1.5 rounded-xl transition-all shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Post New Listing</span>
                        </Link>
                      </div>
                    )}
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.listingType === "affiliate"
            ? "Delete Affiliate Deal"
            : "Delete Coupon Listing"
        }
        itemName={deleteTarget?.title || deleteTarget?.code}
        description={
          deleteTarget?.listingType === "affiliate"
            ? "Are you sure you want to delete this affiliate product listing? It will no longer be visible to shoppers on Vouchiqo."
            : "This action cannot be undone. This will permanently delete the offer and disable any active customer claims."
        }
        onConfirm={handleConfirmDelete}
        isPending={deleteCouponMutation.isPending || isDeletingAffiliate}
      />
    </DashboardLayout>
  );
}

export default function MerchantCouponsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-xs text-slate-400 font-semibold">
          Loading store listings...
        </div>
      }
    >
      <MerchantCouponsContent />
    </Suspense>
  );
}
