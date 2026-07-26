"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import DeleteConfirmDialog from "@/components/shared/modals/DeleteConfirmDialog";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { showError, showSuccess } from "@/lib/toast";
import CampaignListGrid from "./components/CampaignListGrid";
import CampaignReportModal from "./components/CampaignReportModal";
import CampaignsHeader from "./components/CampaignsHeader";
import EditCampaignModal from "./components/EditCampaignModal";

export default function MerchantCampaigns() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch merchant profile
  const { data: merchant, isLoading: loadingProfile } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error("Failed to load profile");
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch real-time merchant campaigns from backend API
  const { data: dbCampaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["merchant-campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  // Listen for real-time campaign status changes from admin moderation
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, (data) => {
    if (data?.campaignId) {
      queryClient.setQueryData(["merchant-campaigns"], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((c) =>
          c._id === data.campaignId || c.id === data.campaignId
            ? {
                ...c,
                status: data.status,
                rejectionReason: data.rejectionReason,
              }
            : c,
        );
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
    }
  });

  const handleCreateClick = useCallback(() => {
    router.push("/merchant/campaigns/new");
  }, [router]);

  const handleEditClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  }, []);

  const handleDuplicateClick = useCallback(() => {
    router.push("/merchant/campaigns/new");
  }, [router]);

  const handleReportClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setReportModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCampaign?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns?id=${selectedCampaign._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete campaign");
      showSuccess("Campaign deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
      setDeleteModalOpen(false);
    } catch (err) {
      showError(err.message || "Failed to delete campaign");
    } finally {
      setDeleting(false);
    }
  }, [selectedCampaign, queryClient]);

  const isPro = useMemo(
    () => merchant?.plan === "pro" || merchant?.plan === "enterprise",
    [merchant],
  );

  if (loadingProfile || loadingCampaigns) {
    return (
      <DashboardLayout title="Campaign Manager" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Campaign Manager"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-6 text-left font-sans">
        <CampaignsHeader
          campaignsCount={dbCampaigns.length}
          isPro={isPro}
          planName={merchant?.plan}
          onCreateClick={handleCreateClick}
        />

        <div data-tour="campaigns-list">
          <CampaignListGrid
            campaigns={dbCampaigns}
            onCreateClick={handleCreateClick}
            onEdit={handleEditClick}
            onDuplicate={handleDuplicateClick}
            onReport={handleReportClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        campaign={selectedCampaign}
        onSaveSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
        }}
      />

      {/* Campaign Analytics Report Modal */}
      <CampaignReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        campaign={selectedCampaign}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${selectedCampaign?.name}"? This action cannot be undone.`}
        isPending={deleting}
      />
    </DashboardLayout>
  );
}
