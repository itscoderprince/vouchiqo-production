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
          <div>
            <p className="font-bold text-slate-900">{row.businessName || "Merchant Business"}</p>
            <p className="text-xs text-slate-500 font-medium">{locationStr}</p>
          </div>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="capitalize text-xs font-medium px-2 py-0.5 rounded bg-muted">
          {row.category || "General"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status || "pending"} />,
    },
    {
      header: "Owner / Email",
      accessorKey: "userId",
      cell: (row) => {
        const ownerName =
          row.userId?.name ||
          row.ownerName ||
          row.contactPerson ||
          (row.contactEmail ? row.contactEmail.split("@")[0] : null);
        return (
          <div>
            {ownerName && (
              <p className="text-xs font-bold text-slate-800 capitalize">
                {ownerName}
              </p>
            )}
            <p className="text-xs text-slate-500 font-medium">
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
        <span className="text-xs text-slate-600 font-mono">
          {row.phone || row.contactPhone || row.location?.phone || "No Phone"}
        </span>
      ),
    },
    {
      header: "Applied On",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenKyc(row)}
            className="h-8 gap-1 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            Review KYC
          </Button>

          {/* Step 1: If pending, show Accept Form button */}
          {(row.status === "pending" || !row.status) && (
            <Button
              size="sm"
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs font-semibold cursor-pointer shadow-xs"
              onClick={() => handleAction(row._id, "form_accepted")}
              disabled={reviewMutation.isPending}
            >
              <Check className="h-3.5 w-3.5" />
              Accept Form
            </Button>
          )}

          {/* Step 2: If form_accepted or under_review, show Approve Merchant button */}
          {(row.status === "form_accepted" || row.status === "under_review") && (
            <Button
              size="sm"
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-semibold cursor-pointer shadow-xs"
              onClick={() => handleAction(row._id, "approved")}
              disabled={reviewMutation.isPending}
            >
              <Check className="h-3.5 w-3.5" />
              Approve Merchant
            </Button>
          )}

          {row.status !== "approved" && row.status !== "rejected" && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 gap-1 text-xs cursor-pointer"
              onClick={() => handleAction(row._id, "rejected")}
              disabled={reviewMutation.isPending}
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Merchant Applications Queue
            </h1>
            <LiveIndicator label="Real-time Applications Queue" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Review submitted merchant account applications, verify business
            credentials, and approve or decline partner access.
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 bg-muted/60 p-1">
                <TabsTrigger value="all" className="text-xs font-semibold">
                  All ({allMerchants.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs font-semibold">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs font-semibold">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs font-semibold">
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
      </Card>

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
