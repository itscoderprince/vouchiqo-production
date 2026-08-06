"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Eye, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import FormSelect from "@/components/shared/form/FormSelect";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminMerchants, useReviewMerchant } from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";

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
      if (planFilter !== "all" && m.subscriptionTier !== planFilter)
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 shrink-0">
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
                className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {row.businessName || "Merchant Partner"}
              </Link>
              <p className="text-xs text-muted-foreground">
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
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="capitalize text-xs font-medium bg-muted"
            >
              {row.category || "General"}
            </Badge>
            <p className="text-xs text-muted-foreground">{cityStr}</p>
          </div>
        );
      },
    },
    {
      header: "Subscription Plan",
      accessorKey: "subscriptionTier",
      cell: (row) => {
        const tier = row.subscriptionTier || row.plan || "starter";
        let tierBg = "bg-muted text-muted-foreground";
        if (tier === "growth")
          tierBg = "bg-blue-500/10 text-blue-500 border-blue-500/20";
        if (tier === "pro")
          tierBg = "bg-purple-500/10 text-purple-500 border-purple-500/20";
        if (tier === "enterprise")
          tierBg = "bg-amber-500/10 text-amber-500 border-amber-500/20";

        return (
          <Badge
            variant="outline"
            className={`capitalize font-semibold text-xs ${tierBg}`}
          >
            {tier}
          </Badge>
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
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className={
                isPaid
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px] uppercase"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] uppercase"
              }
            >
              {isStarter ? "FREE PLAN" : isPaid ? "Payment Done" : "Payment Pending"}
            </Badge>
            {diffStr && (
              <p className="text-[10px] font-mono text-muted-foreground">
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
        let stBg = "bg-amber-500/10 text-amber-500 border-amber-500/20";
        if (st === "approved" || st === "active")
          stBg = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        if (st === "form_accepted" || st === "under_review")
          stBg = "bg-blue-500/10 text-blue-600 border-blue-500/20";
        if (st === "suspended" || st === "rejected")
          stBg = "bg-rose-500/10 text-rose-500 border-rose-500/20";

        return (
          <Badge
            variant="outline"
            className={`capitalize font-semibold text-xs ${stBg}`}
          >
            {st === "approved" ? "Active" : st === "form_accepted" ? "Form Accepted" : st}
          </Badge>
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
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenKyc(row)}
              className="h-8 px-2.5 gap-1 text-xs font-medium cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              KYC Audit
            </Button>

            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-8 px-2.5 text-xs font-medium cursor-pointer"
            >
              <Link href={`/admin/merchants/${row._id}`}>
                Details
              </Link>
            </Button>

            {(row.status === "pending" || !row.status) && (
              <Button
                size="sm"
                className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 font-semibold cursor-pointer shadow-2xs"
                onClick={() => handleAction(row._id, "form_accepted")}
                disabled={isPending}
              >
                Accept Form
              </Button>
            )}

            {(row.status === "form_accepted" || row.status === "under_review") && (
              <Button
                size="sm"
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 font-semibold cursor-pointer shadow-2xs"
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
                className="h-8 text-rose-500 hover:bg-rose-500/10 border-rose-500/20 text-xs px-2.5 font-medium cursor-pointer"
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
                className="h-8 text-emerald-600 hover:bg-emerald-50 border-emerald-200 text-xs px-2.5 font-medium cursor-pointer"
                onClick={() => handleAction(row._id, "approved")}
                disabled={isPending}
              >
                Reactivate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {title}
            </h1>
            <LiveIndicator label="Real-time Merchant Directory" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {description}
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

      <Card className="p-4 bg-card border-border/50 shadow-sm">
        <DataTable
          columns={columns}
          data={filteredMerchants}
          isLoading={isLoading}
          searchKey="businessName"
          rightActions={
            <div className="flex items-center gap-3">
              <FormSelect
                value={planFilter}
                onValueChange={setPlanFilter}
                options={PLAN_OPTIONS}
                className="w-[130px] h-8 text-xs"
              />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 bg-muted/60 p-1">
                  <TabsTrigger value="all" className="text-xs font-semibold">
                    All ({merchants.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-xs font-semibold relative"
                  >
                    Pending
                    {merchants.filter((m) => m.status === "pending").length >
                      0 && (
                      <span className="ml-1 rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.2">
                        {merchants.filter((m) => m.status === "pending").length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs font-semibold">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="suspended" className="text-xs font-semibold">
                    Suspended
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          }
        />
      </Card>

      {/* Merchant KYC Audit Dialog */}
      <MerchantKycDialog
        open={kycDialogOpen}
        onOpenChange={setKycDialogOpen}
        merchant={selectedMerchant}
        onAction={handleAction}
      />
    </div>
  );
}
