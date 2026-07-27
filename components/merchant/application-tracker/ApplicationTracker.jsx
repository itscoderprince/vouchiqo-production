"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  FileCheck,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Store,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import ErrorState from "@/components/shared/feedback/ErrorState";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApplicationStatus } from "@/hooks/use-application-status";
import { showSuccess } from "@/lib/toast";
import AdminReviewModal from "./AdminReviewModal";

/**
 * ApplicationTracker — Clean, professional Merchant Application Status Tracker.
 * Built using Shadcn UI components (Card, Badge, Progress, Button).
 * Displays green ticks for completed stages and clean gray circles for pending steps.
 */
export default function ApplicationTracker({ initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Real-time status query + WebSockets + fallback polling
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isConnected,
  } = useApplicationStatus();

  const handleRefresh = async () => {
    await refetch();
    showSuccess("Application status refreshed!");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto font-sans">
        <ErrorState
          title="Could not load application status"
          description="We encountered an issue checking your submission status."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const {
    hasSubmitted = true,
    applicationId = "VQ-2026-89421",
    businessName = "Merchant Partner Enterprise",
    ownerName = "Authorized Partner",
    email = "merchant@vouchiqo.com",
    phone = "+91 98765 43210",
    category = "Retail Deals & Offers",
    city = "Ranchi",
    state = "Jharkhand",
    gstin = "Exempt / N/A",
    panNumber = "N/A",
    status = "pending",
    rejectionReason = "",
    submittedAt,
    lastUpdatedAt,
    documents = [],
  } = data;

  if (hasSubmitted === false || status === "not_submitted") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-left font-sans pb-12 pt-6">
        <Card className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">
              No Merchant Application Submitted Yet
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete the merchant onboarding wizard to submit your store details, statutory documents, and business profile for admin verification.
            </p>
          </div>
          <Button
            onClick={() => router.push("/merchant/onboarding")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 rounded-xl cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <span>Start Merchant Onboarding</span>
          </Button>
        </Card>
      </div>
    );
  }

  const isApproved = status === "approved" || status === "active";
  const isRejected = status === "rejected";
  const isAccepted =
    status === "form_accepted" ||
    status === "under_review" ||
    isApproved;

  // Compute overall progress percentage for Shadcn Progress component
  const progressPercentage = isApproved
    ? 100
    : isRejected
      ? 66
      : isAccepted
        ? 66
        : 33;

  const submittedDateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const verifiedDateStr = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  // Stepper Definition
  const steps = [
    {
      id: 1,
      name: "Form Submitted",
      subtitle: submittedDateStr,
      isComplete: true,
      isCurrent: !isAccepted && !isRejected && !isApproved,
      isError: false,
    },
    {
      id: 2,
      name: isApproved ? "Audit Passed" : isRejected ? "Audit Rejected" : "Compliance Audit",
      subtitle: isAccepted || isApproved ? "Form Accepted" : isRejected ? (rejectionReason || "Action Required") : "In Progress",
      isComplete: isAccepted || isApproved,
      isCurrent: isAccepted && !isApproved,
      isError: isRejected,
    },
    {
      id: 3,
      name: "Account Activated",
      subtitle: isApproved ? `Verified on ${verifiedDateStr}` : isRejected ? "Suspended" : "Final Step",
      isComplete: isApproved,
      isCurrent: false,
      isError: isRejected,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left font-sans pb-12">
      {/* ── 1. HERO STATUS BANNER ── */}
      <Card
        className={`p-6 sm:p-8 rounded-2xl border transition-all text-left shadow-xs ${
          isApproved
            ? "bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-emerald-700/50"
            : isRejected
              ? "bg-gradient-to-r from-rose-900 to-slate-900 text-white border-rose-700/50"
              : "bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white border-slate-800"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge className="bg-white/10 text-white border-white/20 font-mono text-xs px-3 py-1 rounded-md">
                Application #{applicationId}
              </Badge>

              <LiveIndicator />

              {isApproved && (
                <Badge className="bg-emerald-500 text-white font-bold text-xs px-3 py-1 border-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Account Verified &amp; Active
                </Badge>
              )}

              {isAccepted && !isApproved && (
                <Badge className="bg-blue-600 text-white font-bold text-xs px-3 py-1 border-0 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Form Accepted — Audit Underway
                </Badge>
              )}

              {!isAccepted && !isRejected && (
                <Badge className="bg-slate-700 text-slate-100 font-bold text-xs px-3 py-1 border-0 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Form Submitted — Awaiting Acceptance
                </Badge>
              )}

              {isRejected && (
                <Badge className="bg-rose-500 text-white font-bold text-xs px-3 py-1 border-0 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Action Required
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {isApproved
                ? `${businessName} is Verified & Live!`
                : isAccepted
                  ? `Form Accepted — Review Underway for ${businessName}`
                  : isRejected
                    ? "KYC Verification Needs Correction"
                    : `Form Submitted for ${businessName}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {isApproved
                ? "Your business profile, GST credentials, and store details have been verified. You can now create campaigns and publish discount offers."
                : isAccepted
                  ? "Form accepted. Our compliance desk is auditing your store location and statutory documents."
                  : isRejected
                    ? rejectionReason ||
                      "Some details need correction. Please review your profile and update your KYC information."
                    : "Form Submitted — Waiting for admin to accept your application form for review."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <Button
              onClick={() => router.push("/merchant/profile?edit=true")}
              className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold h-10 px-5 rounded-xl cursor-pointer shadow-md flex items-center gap-2 transition-all border-0"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
              <span>Edit Application Details</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold h-10 px-5 rounded-xl cursor-pointer flex items-center gap-2"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span>Refresh Status</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 2. SHADCN STEPPER TRACKER WITH SHADCN PROGRESS COMPONENT ── */}
      <Card className="p-6 rounded-2xl border border-slate-200/90 bg-white text-left shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Verification Pipeline &amp; Audit Progress
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Track real-time statutory review steps and store onboarding milestone.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              {progressPercentage}% Completed
            </span>
            <Badge className="bg-slate-100 text-slate-700 text-[10px] font-mono border-slate-200">
              #{applicationId}
            </Badge>
          </div>
        </div>

        {/* Shadcn UI Progress Bar Component */}
        <div className="space-y-1.5">
          <Progress
            value={progressPercentage}
            className="h-2.5 rounded-full bg-slate-100"
            indicatorClassName={
              isApproved
                ? "bg-emerald-600"
                : isRejected
                  ? "bg-rose-500"
                  : "bg-blue-600"
            }
          />
        </div>

        {/* Professional 3-Step Indicator Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {steps.map((step) => {
            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  step.isComplete
                    ? "bg-emerald-50/50 border-emerald-200/80"
                    : step.isError
                      ? "bg-rose-50/50 border-rose-200/80"
                      : step.isCurrent
                        ? "bg-blue-50/50 border-blue-200/80"
                        : "bg-slate-50/50 border-slate-200/80 opacity-75"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Clean Step Circle Indicator: Green tick if completed, gray if pending */}
                  {step.isComplete ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : step.isError ? (
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <XCircle className="w-5 h-5" />
                    </div>
                  ) : step.isCurrent ? (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-sm border-2 border-blue-700">
                      {step.id}
                    </div>
                  ) : (
                    /* Clean Gray Circle for Pending / Not Completed Steps */
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 border-2 border-slate-200 flex items-center justify-center shrink-0 font-bold text-xs">
                      {step.id}
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        step.isComplete
                          ? "text-emerald-900"
                          : step.isError
                            ? "text-rose-900"
                            : step.isCurrent
                              ? "text-blue-950"
                              : "text-slate-600"
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold truncate">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 3. SUBMITTED BUSINESS & KYC DETAILS SUMMARY ── */}
      <Card className="p-6 rounded-2xl border border-slate-200/80 bg-white text-left shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              Submitted Business &amp; KYC Particulars
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Summary of business information provided during onboarding.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => router.push("/merchant/profile?edit=true")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </Button>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Business Name
            </span>
            <span className="font-bold text-slate-900 block truncate">
              {businessName}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Category
            </span>
            <span className="font-bold text-blue-700 block truncate">
              {category}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Liaison Representative
            </span>
            <span className="font-bold text-slate-900 block truncate">
              {ownerName}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Contact Email
            </span>
            <span className="font-bold text-slate-800 block truncate">
              {email}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Phone Number
            </span>
            <span className="font-bold text-slate-900 font-mono block">
              {phone}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Location
            </span>
            <span className="font-bold text-slate-800 block truncate">
              {city}, {state}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              GSTIN
            </span>
            <span className="font-mono font-bold text-slate-900 block">
              {gstin}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              PAN Number
            </span>
            <span className="font-mono font-bold text-slate-900 block">
              {panNumber}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Review Desk
            </span>
            <span className="font-bold text-slate-800 block">
              Vouchiqo Audit Desk #4
            </span>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verification Documents ({documents.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800 truncate pr-2 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{doc.name}</span>
                </span>

                <Badge
                  className={`text-[9px] font-bold border-0 shrink-0 capitalize ${
                    doc.status === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {doc.status === "verified" ? "Verified" : "Auditing"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── 4. QUICK ACTIONS TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            Need help or want to update your submission?
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push("/merchant/profile?edit=true")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4 rounded-xl cursor-pointer border-0"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            <span>Edit Profile</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                `https://wa.me/919876543210?text=Hi%20Vouchiqo%20Support%2C%20I%20am%20checking%20status%20for%20Application%20${applicationId}`,
                "_blank",
              )
            }
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold h-8 px-4 rounded-xl cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Contact Support</span>
          </Button>

          {/* Dev/Demo Admin Review Simulator */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAdminModalOpen(true)}
            className="text-slate-400 hover:text-white text-xs font-semibold h-8 px-3 rounded-xl cursor-pointer"
          >
            <span>[Dev] Test Status</span>
          </Button>
        </div>
      </div>

      {/* Admin Simulator Modal */}
      <AdminReviewModal
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
        applicationId={applicationId}
        onStatusUpdated={() => {
          queryClient.invalidateQueries({
            queryKey: ["merchant-application-status"],
          });
        }}
      />
    </div>
  );
}
