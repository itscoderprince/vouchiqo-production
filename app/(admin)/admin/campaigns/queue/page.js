"use client";

import { GripVertical, ListOrdered, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/shared/data";

import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRealtime } from "@/hooks/use-realtime";
import { adminFetchCampaignQueue } from "@/lib/api-helpers";
import { SOCKET_EVENTS } from "@/lib/socket/events";

// Dynamic Priority Score Calculation
function calculatePriorityScore(campaign) {
  let score = 50;
  const cType = (campaign.type || "").toLowerCase();
  if (cType === "festival") score += 30;
  else if (cType === "flash") score += 20;

  const addOns = campaign.targeting?.addOns || campaign.addOns || [];
  score += (addOns.length || 0) * 10;

  const startDate = campaign.startDate || campaign.timing?.startDate;
  if (startDate) {
    const hoursToStart = (new Date(startDate) - Date.now()) / (1000 * 60 * 60);
    if (hoursToStart > 0 && hoursToStart <= 72) score += 25;
  }

  const planTier = campaign.merchantId?.plan || campaign.planTier || "starter";
  if (planTier.includes("pro") || planTier.includes("enterprise")) {
    score += 15;
  }

  return score;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All Campaign Types" },
  { value: "festival", label: "Festival Campaign" },
  { value: "flash", label: "Flash Sale" },
  { value: "bundle", label: "Bundle / BOGO" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All Plan Tiers" },
  { value: "starter", label: "Starter Free" },
  { value: "growth", label: "Growth Partner" },
  { value: "pro", label: "Pro Partner" },
  { value: "enterprise", label: "Enterprise" },
];

export default function AdminCampaignQueuePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetchCampaignQueue();
      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaign queue:", err);
      toast.error("Failed to load campaign review queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Real-time listener for new campaign submissions from merchants
  useRealtime(SOCKET_EVENTS.CAMPAIGN_SUBMITTED, () => {
    fetchQueue();
  });

  // Real-time listener for status changes
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, () => {
    fetchQueue();
  });

  const scoredQueue = useMemo(() => {
    return campaigns
      .map((c) => ({
        ...c,
        priorityScore: calculatePriorityScore(c),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [campaigns]);

  const filteredQueue = useMemo(() => {
    return scoredQueue.filter((c) => {
      const cType = (c.type || "").toLowerCase();
      const planTier = (c.merchantId?.plan || c.planTier || "").toLowerCase();

      const matchesType = typeFilter === "all" || cType === typeFilter;
      const matchesPlan =
        planFilter === "all" || planTier.includes(planFilter.toLowerCase());

      return matchesType && matchesPlan;
    });
  }, [scoredQueue, typeFilter, planFilter]);

  const handleResetFilters = useCallback(() => {
    setTypeFilter("all");
    setPlanFilter("all");
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "drag",
        header: "",
        width: "40px",
        cell: () => (
          <GripVertical
            className="w-4 h-4 text-slate-400 cursor-grab"
            title="Drag & Drop Reorder"
          />
        ),
      },
      {
        key: "submissionTime",
        header: "Submission Date & Time",
        sortable: true,
        cell: (row) => (
          <span className="font-mono text-[11px] text-slate-500">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : row.submissionTime || "—"}
          </span>
        ),
      },
      {
        key: "merchantName",
        header: "Merchant Name",
        sortable: true,
        cell: (row) => (
          <span className="font-bold text-slate-900">
            {row.merchantId?.businessName ||
              row.merchantName ||
              "Merchant Partner"}
          </span>
        ),
      },
      {
        key: "campaignType",
        header: "Campaign Type",
        sortable: true,
        cell: (row) => {
          const cType = (row.type || row.campaignType || "flash").toLowerCase();
          return (
            <Badge
              className={`rounded px-2 py-0.5 border-0 text-[9px] font-bold uppercase ${
                cType === "festival"
                  ? "bg-purple-100 text-purple-800"
                  : cType === "flash"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {cType}
            </Badge>
          );
        },
      },
      {
        key: "name",
        header: "Campaign Name",
        sortable: true,
        cell: (row) => (
          <span className="font-bold text-slate-800 max-w-[180px] truncate block">
            {row.name || row.campaignName || "Untitled Campaign"}
          </span>
        ),
      },
      {
        key: "planTier",
        header: "Plan Tier",
        sortable: true,
        cell: (row) => {
          const plan = row.merchantId?.plan || row.planTier || "starter";
          return (
            <Badge
              variant="outline"
              className="text-[9px] font-bold border-slate-200 text-slate-700 capitalize"
            >
              {plan}
            </Badge>
          );
        },
      },
      {
        key: "addOns",
        header: "Add-Ons Purchased",
        cell: (row) => {
          const addOns = row.targeting?.addOns || row.addOns || [];
          return (
            <div className="flex flex-wrap gap-1">
              {addOns.length > 0
                ? addOns.map((ao, idx) => (
                    <Badge
                      key={idx}
                      className="bg-amber-50 text-amber-800 border-amber-200 text-[8px] font-bold"
                    >
                      {ao}
                    </Badge>
                  ))
                : <span className="text-[10px] text-slate-400 font-normal">
                    None
                  </span>}
            </div>
          );
        },
      },
      {
        key: "priorityScore",
        header: "Priority Score",
        sortable: true,
        cell: (row) => (
          <span className="bg-orange-50 text-[#e85d04] px-2 py-0.5 rounded-full border border-orange-100 font-black text-sm">
            ⚡ {row.priorityScore}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => {
          const id = row._id || row.id;
          return (
            <Button
              asChild
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-7 px-3 rounded-lg cursor-pointer"
            >
              <Link href={`/admin/campaigns/queue/${id}`}>
                Review Campaign →
              </Link>
            </Button>
          );
        },
      },
    ],
    [],
  );

  const filterActions = (
    <div className="flex items-center gap-2">
      <FormSelect
        value={typeFilter}
        onValueChange={setTypeFilter}
        placeholder="Campaign Type"
        options={TYPE_OPTIONS}
        triggerClassName="min-w-[165px] h-8 text-xs bg-white border-slate-200 shadow-2xs font-semibold"
      />
      <FormSelect
        value={planFilter}
        onValueChange={setPlanFilter}
        placeholder="Plan Tier"
        options={PLAN_OPTIONS}
        triggerClassName="min-w-[145px] h-8 text-xs bg-white border-slate-200 shadow-2xs font-semibold"
      />
      {(typeFilter !== "all" || planFilter !== "all") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetFilters}
          className="text-[11px] h-8 px-2 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          Reset
        </Button>
      )}
    </div>
  );

  return (
    <DashboardLayout
      title="Dedicated Campaign Review Queue"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ListOrdered className="w-6 h-6 text-[#e85d04]" /> Campaign Review
              Queue
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Auto-calculated Priority Scores • Live database review queue.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LiveIndicator />
            <Badge className="bg-[#e85d04] text-white font-bold text-xs px-3.5 py-1.5 border-0 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              <span>{filteredQueue.length} Pending Review</span>
            </Badge>
          </div>
        </div>

        {/* Dynamic Reusable Table with inline right-aligned Select Filters */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 overflow-hidden text-left">
          <DataTable
            columns={columns}
            data={filteredQueue}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search campaigns by merchant name, title..."
            rightActions={filterActions}
            defaultPageSize={10}
            emptyState={
              loading
                ? <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading real-time campaign queue from DB...</span>
                  </div>
                : "No pending campaigns match the selected filters."
            }
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
