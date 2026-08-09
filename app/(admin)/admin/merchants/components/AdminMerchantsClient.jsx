"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Eye, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "@/components/shared/data/DataTable";
import FormSelect from "@/components/shared/form/FormSelect";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminMerchants, useReviewMerchant } from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";

import MerchantKycDialog from "../../approvals/merchants/components/MerchantKycDialog";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending Approval" },
  { value: "form_accepted", label: "Form Accepted" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All Plans" },
  { value: "starter", label: "Starter Free" },
  { value: "growth", label: "Growth Partner" },
  { value: "pro", label: "Pro Partner" },
  { value: "enterprise", label: "Enterprise" },
];

export default function AdminMerchantsClient({
  defaultTab = "all",
  title = "Merchants Management",
  description = "Overview of all merchant accounts, application approvals, subscription tiers, and activity logs.",
}) {
  const queryClient = useQueryClient();
  const { data: merchants = [], isLoading, refetch } = useAdminMerchants();
  const reviewMutation = useReviewMerchant();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMerchant = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/merchants/${deleteId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(json.message || "Merchant partner and all associated data deleted in depth!");
        queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
        queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
        refetch();
      } else {
        toast.error(json.error?.message || json.message || "Failed to delete merchant.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while deleting merchant.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleOpenKyc = (merchant) => {
    setSelectedMerchant(merchant);
    setKycDialogOpen(true);
  };

  const handleAction = (merchantId, status) => {
    reviewMutation.mutate(
      { merchantId, status },
      {
        onSuccess: () => setKycDialogOpen(false),
      },
    );
  };

  const getMerchantRowColor = (row, index) => {
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

  // Socket listener for real-time applications and status updates
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      // Tab filter
      if (activeTab === "pending" && m.status !== "pending") return false;
      if (
        activeTab === "approved" &&
        m.status !== "approved" &&
        m.status !== "active"
      )
        return false;
      if (activeTab === "suspended" && m.status !== "suspended") return false;

      // Status dropdown filter
      if (statusFilter !== "all") {
        if (
          statusFilter === "active" &&
          m.status !== "approved" &&
          m.status !== "active"
        )
          return false;
        if (statusFilter !== "active" && m.status !== statusFilter)
          return false;
      }

      // Plan filter
      if (planFilter !== "all" && m.subscriptionTier !== planFilter && m.plan !== planFilter)
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const bName = (m.businessName || "").toLowerCase();
        const name = (m.name || m.userId?.name || "").toLowerCase();
        const email = (m.email || m.userId?.email || "").toLowerCase();
        const city = (m.city || "").toLowerCase();
        return (
          bName.includes(query) ||
          name.includes(query) ||
          email.includes(query) ||
          city.includes(query)
        );
      }

      return true;
    });
  }, [merchants, activeTab, statusFilter, planFilter, searchQuery]);

  const columns = [
    {
      header: "Business & Owner",
      accessorKey: "businessName",
      cell: (row) => {
        const ownerName =
          row.liaisonName ||
          row.ownerName ||
          row.contactPerson ||
          (row.userId?.name && !row.userId.name.includes("@")
            ? row.userId.name
            : null) ||
          row.businessName ||
          "Merchant Owner";
        const emailStr = row.userId?.email || row.contactEmail || "No Email";

        return (
          <div className="flex items-center gap-2.5 py-0.5">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs overflow-hidden border border-blue-200 shrink-0">
              {row.logoUrl || row.logo ? (
                // biome-ignore lint/performance/noImgElement: dynamic user avatar
                <img
                  src={row.logoUrl || row.logo}
                  alt={row.businessName}
                  className="h-full w-full object-cover"
                />
              ) : (
                (row.businessName?.[0] || "M").toUpperCase()
              )}
            </div>
            <div>
              <Link
                href={`/admin/merchants/${row._id}`}
                className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-xs leading-snug block"
              >
                {row.businessName || "Merchant Partner"}
              </Link>
              <p className="text-[11px] text-slate-600 font-normal">
                {ownerName} • {emailStr}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category / City",
      accessorKey: "category",
      cell: (row) => {
        const cityStr = row.location?.city || row.city || "Ranchi";
        return (
          <div className="space-y-0.5 py-0.5">
            <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded bg-white/90 text-slate-800 border border-slate-300 inline-block shadow-2xs">
              {row.category || "General"}
            </span>
            <p className="text-[11px] text-slate-600 font-normal">{cityStr}</p>
          </div>
        );
      },
    },
    {
      header: "Subscription Plan",
      accessorKey: "subscriptionTier",
      cell: (row) => {
        const tier = (row.subscriptionTier || row.plan || "starter").toLowerCase();
        let tierBg = "bg-white text-slate-800 border-slate-300";
        let tierLabel = "Starter";

        if (tier.includes("growth")) {
          tierBg = "bg-emerald-600 text-white border-emerald-700";
          tierLabel = "Growth";
        } else if (tier.includes("pro")) {
          tierBg = "bg-blue-600 text-white border-blue-700";
          tierLabel = "Pro";
        } else if (tier.includes("enterprise")) {
          tierBg = "bg-amber-600 text-white border-amber-700";
          tierLabel = "Enterprise";
        }

        return (
          <span className={cn("px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap", tierBg)}>
            {tierLabel}
          </span>
        );
      },
    },
    {
      header: "Payment & Expiry",
      accessorKey: "paymentStatus",
      cell: (row) => {
        const isStarter =
          (row.plan || "starter").toLowerCase().includes("starter") ||
          (row.plan || "").toLowerCase().includes("free");
        const isPaid =
          isStarter ||
          row.paymentStatus === "completed" ||
          row.subscriptionStatus === "active" ||
          (row.planExpiry && new Date(row.planExpiry).getTime() > Date.now());
        const expiry = row.planExpiry ? new Date(row.planExpiry) : null;
        let diffStr = "";
        if (expiry && !isStarter) {
          const diff = expiry.getTime() - Date.now();
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diffStr = `${days}d left`;
          } else {
            diffStr = "Expired";
          }
        }

        return (
          <div className="space-y-0.5 py-0.5">
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap",
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200",
              )}
            >
              {isStarter ? "FREE PLAN" : isPaid ? "PAYMENT DONE" : "PENDING"}
            </span>
            {diffStr && (
              <p className="text-[10px] font-mono text-slate-600 font-normal">
                {diffStr}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const st = row.status || "pending";
        let stBg = "bg-amber-50 text-amber-700 border-amber-200";
        let stLabel = st;
        if (st === "approved" || st === "active") {
          stBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
          stLabel = "Active";
        } else if (st === "form_accepted" || st === "under_review") {
          stBg = "bg-blue-50 text-blue-700 border-blue-200";
          stLabel = "Form Accepted";
        } else if (st === "suspended" || st === "rejected") {
          stBg = "bg-rose-50 text-rose-700 border-rose-200";
        }

        return (
          <span className={cn("px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap", stBg)}>
            {stLabel}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "_id",
      cell: (row) => {
        const isPending =
          reviewMutation.isPending &&
          reviewMutation.variables?.merchantId === row._id;

        return (
          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenKyc(row)}
              className="h-7 px-2.5 gap-1 text-[11px] font-medium border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs"
            >
              <Eye className="h-3 w-3" />
              <span>Audit</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-7 px-2.5 text-[11px] font-medium border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs"
            >
              <Link href={`/admin/merchants/${row._id}`}>
                Details
              </Link>
            </Button>

            {(row.status === "pending" || !row.status) && (
              <Button
                size="sm"
                className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[11px] px-2.5 font-medium rounded-lg cursor-pointer shadow-2xs"
                onClick={() => handleAction(row._id, "form_accepted")}
                disabled={isPending}
              >
                Accept Form
              </Button>
            )}

            {(row.status === "form_accepted" || row.status === "under_review") && (
              <Button
                size="sm"
                className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 font-medium rounded-lg cursor-pointer shadow-2xs"
                onClick={() => handleAction(row._id, "approved")}
                disabled={isPending}
              >
                Approve
              </Button>
            )}

            {(row.status === "approved" || row.status === "active") && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-amber-700 hover:bg-amber-50 border-amber-300 bg-white text-[11px] px-2.5 font-medium rounded-lg cursor-pointer shadow-2xs"
                onClick={() => handleAction(row._id, "suspended")}
                disabled={isPending}
              >
                Suspend
              </Button>
            )}

            {row.status === "suspended" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-emerald-700 hover:bg-emerald-50 border-emerald-300 bg-white text-[11px] px-2.5 font-medium rounded-lg cursor-pointer shadow-2xs"
                onClick={() => handleAction(row._id, "approved")}
                disabled={isPending}
              >
                Reactivate
              </Button>
            )}

            <Button
              size="sm"
              variant="destructive"
              title="Delete Merchant & All Data"
              className="h-7 w-7 p-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-lg cursor-pointer shadow-2xs shrink-0"
              onClick={() => setDeleteId(row._id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-3 pb-12 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <LiveIndicator label="Real-time Directory" />
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
            {description}
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

      <div className="w-full overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredMerchants}
          isLoading={isLoading}
          searchKey="businessName"
          getRowClassName={getMerchantRowColor}
          rightActions={
            <div className="flex items-center gap-2">
              <FormSelect
                value={planFilter}
                onValueChange={setPlanFilter}
                options={PLAN_OPTIONS}
                className="w-[120px] h-7 text-[11px] border-slate-200 bg-white"
              />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 bg-slate-100/90 p-0.5 rounded-lg h-7 border border-slate-200/80">
                  <TabsTrigger value="all" className="text-[11px] font-medium rounded-md h-6 px-2">
                    All ({merchants.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-[11px] font-medium rounded-md h-6 px-2 relative"
                  >
                    Pending
                    {merchants.filter((m) => m.status === "pending").length >
                      0 && (
                      <span className="ml-1 rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.2">
                        {merchants.filter((m) => m.status === "pending").length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-[11px] font-medium rounded-md h-6 px-2">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="suspended" className="text-[11px] font-medium rounded-md h-6 px-2">
                    Suspended
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          }
        />
      </div>

      {/* Merchant KYC Audit Dialog */}
      <MerchantKycDialog
        open={kycDialogOpen}
        onOpenChange={setKycDialogOpen}
        merchant={selectedMerchant}
        onAction={handleAction}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Merchant Account & All Associated Data"
        description="This action cannot be undone. This will permanently delete the merchant partner account, all their posted offer listings, active customer claims, redemptions, campaigns, and user profile data from the database."
        onConfirm={handleDeleteMerchant}
        isPending={isDeleting}
      />
    </div>
  );
}
