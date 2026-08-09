"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Eye, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminMerchants, useReviewMerchant } from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import MerchantKycDialog from "./MerchantKycDialog";

import { cn } from "@/lib/utils";

export default function MerchantApprovalsClient() {
  const queryClient = useQueryClient();
  const { data: allMerchants = [], isLoading, refetch } = useAdminMerchants({ limit: 100 });
  const reviewMutation = useReviewMerchant();

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Tab filtered merchants
  const filteredMerchants = useMemo(() => {
    if (activeTab === "pending") {
      return allMerchants.filter((m) => m.status === "pending" || !m.status);
    }
    if (activeTab === "approved") {
      return allMerchants.filter((m) => m.status === "approved" || m.status === "active");
    }
    if (activeTab === "rejected") {
      return allMerchants.filter((m) => m.status === "rejected");
    }
    return allMerchants;
  }, [allMerchants, activeTab]);

  const pendingCount = useMemo(() => {
    return allMerchants.filter((m) => m.status === "pending" || !m.status).length;
  }, [allMerchants]);

  // Real-time listener for new merchant applications and status updates
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  const handleAction = (merchantId, status) => {
    reviewMutation.mutate(
      { merchantId, status },
      {
        onSuccess: () => setKycDialogOpen(false),
      },
    );
  };

  const handleOpenKyc = (merchant) => {
    setSelectedMerchant(merchant);
    setKycDialogOpen(true);
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

  const columns = [
    {
      header: "Business Name",
      accessorKey: "businessName",
      cell: (row) => {
        const locationStr =
          row.location?.city && row.location?.state
            ? `${row.location.city}, ${row.location.state}`
            : row.location?.city || row.location?.address || row.city || row.slug || "Main Outlet";
        return (
          <div className="py-0.5">
            <p className="font-medium text-slate-900 text-xs leading-snug">{row.businessName || "Merchant Business"}</p>
            <p className="text-[11px] text-slate-600 font-normal">{locationStr}</p>
          </div>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded bg-white/90 text-slate-800 border border-slate-300 inline-block shadow-2xs">
          {row.category || "General"}
        </span>
      ),
    },
    {
      header: "Chosen Plan",
      accessorKey: "plan",
      cell: (row) => {
        const rawPlan = (row.plan || "starter").toLowerCase();
        const planMap = {
          starter: { label: "Starter", bg: "bg-white text-slate-800 border-slate-300" },
          growth: { label: "Growth Partner", bg: "bg-emerald-600 text-white border-emerald-700" },
          pro: { label: "Pro Merchant", bg: "bg-blue-600 text-white border-blue-700" },
          enterprise: { label: "Enterprise", bg: "bg-amber-600 text-white border-amber-700" },
        };
        const pInfo = planMap[rawPlan] || planMap.starter;
        return (
          <span className={cn("px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap", pInfo.bg)}>
            {pInfo.label}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status || "pending"} size="sm" />,
    },
    {
      header: "Owner / Email",
      accessorKey: "userId",
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
        return (
          <div className="py-0.5">
            {ownerName && (
              <p className="text-xs font-medium text-slate-900 capitalize leading-snug">
                {ownerName}
              </p>
            )}
            <p className="text-[11px] text-slate-600 font-normal truncate max-w-[180px]">
              {row.userId?.email || row.contactEmail || "No Email"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row) => (
        <span className="text-xs text-slate-800 font-mono font-normal">
          {row.phone || row.contactPhone || row.location?.phone || "No Phone"}
        </span>
      ),
    },
    {
      header: "Applied On",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-600 font-normal">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenKyc(row)}
            className="h-7 px-2.5 gap-1 text-[11px] font-medium border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs"
          >
            <Eye className="h-3 w-3" />
            <span>Review</span>
          </Button>

          {/* Step 1: If pending, show Accept Form button */}
          {(row.status === "pending" || !row.status) && (
            <Button
              size="sm"
              className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white gap-1 text-[11px] font-medium rounded-lg cursor-pointer shadow-2xs"
              onClick={() => handleAction(row._id, "form_accepted")}
              disabled={reviewMutation.isPending}
            >
              <Check className="h-3 w-3" />
              <span>Accept Form</span>
            </Button>
          )}

          {/* Step 2: If form_accepted or under_review, show Approve button */}
          {(row.status === "form_accepted" || row.status === "under_review") && (
            <Button
              size="sm"
              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px] font-medium rounded-lg cursor-pointer shadow-2xs"
              onClick={() => handleAction(row._id, "approved")}
              disabled={reviewMutation.isPending}
            >
              <Check className="h-3 w-3" />
              <span>Approve</span>
            </Button>
          )}

          {row.status !== "approved" && row.status !== "rejected" && (
            <Button
              size="sm"
              variant="destructive"
              title="Reject"
              className="h-7 w-7 p-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-lg cursor-pointer shadow-2xs shrink-0"
              onClick={() => handleAction(row._id, "rejected")}
              disabled={reviewMutation.isPending}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Merchant Applications Queue
            </h1>
            <LiveIndicator label="Real-time Applications Queue" />
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Review submitted merchant account applications, verify business
            credentials, and approve or decline partner access.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start md:self-auto gap-2 text-xs font-medium border-slate-200 text-slate-700 rounded-xl"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Queue
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="all" className="text-xs font-medium rounded-lg">
                  All ({allMerchants.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs font-medium rounded-lg">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs font-medium rounded-lg">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs font-medium rounded-lg">
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
      </div>

      {/* Merchant KYC Review Dialog */}
      <MerchantKycDialog
        open={kycDialogOpen}
        onOpenChange={setKycDialogOpen}
        merchant={selectedMerchant}
        onAction={handleAction}
      />
    </div>
  );
}
