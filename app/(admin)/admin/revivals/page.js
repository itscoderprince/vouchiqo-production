"use client";

import {
  Check,
  Eye,
  Forward,
  Mail,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminFetchCustomerRevivals,
  adminFetchMerchantRevivals,
  adminReviewCustomerRevival,
  adminReviewMerchantRevival,
} from "@/lib/api-helpers";

export default function RevivalManagement() {
  const [activeTab, setActiveTab] = useState("merchant"); // "merchant" | "customer"
  const [merchantRequests, setMerchantRequests] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMerchantRequests = async () => {
    try {
      const data = await adminFetchMerchantRevivals();
      setMerchantRequests(data);
    } catch (err) {
      console.error("Error fetching merchant revivals:", err);
    }
  };

  const fetchCustomerRequests = async () => {
    try {
      const data = await adminFetchCustomerRevivals();
      setCustomerRequests(data);
    } catch (err) {
      console.error("Error fetching customer revivals:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchMerchantRequests(), fetchCustomerRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMerchantAction = async (revivalId, action) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";
      await adminReviewMerchantRevival(revivalId, status);
      setMerchantRequests((prev) => prev.filter((r) => r._id !== revivalId));
    } catch (err) {
      console.error("Error reviewing merchant revival request:", err);
      alert("Failed to review merchant revival request.");
    }
  };

  const handleCustomerAction = async (revivalId, status) => {
    try {
      await adminReviewCustomerRevival(revivalId, status);
      setCustomerRequests((prev) =>
        prev.map((r) => (r._id === revivalId ? { ...r, status } : r)),
      );
    } catch (err) {
      console.error("Error reviewing customer revival request:", err);
      alert("Failed to update customer revival request status.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-brand-success/10 text-brand-success border-0 rounded-full font-bold text-[10px] px-2 py-0.5 shadow-none">
            Resolved
          </Badge>
        );
      case "contacted":
        return (
          <Badge className="bg-brand-blue/10 text-brand-blue border-0 rounded-full font-bold text-[10px] px-2 py-0.5 shadow-none">
            Contacted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-brand-error/10 text-brand-error border-0 rounded-full font-bold text-[10px] px-2 py-0.5 shadow-none">
            Declined
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-0 rounded-full font-bold text-[10px] px-2 py-0.5 shadow-none">
            Pending
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout
      title="Revival Requests"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="flex flex-col gap-5">
        {/* Tab switcher */}
        <div className="flex border-b border-brand-border pb-px gap-4">
          <button
            onClick={() => setActiveTab("merchant")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent border-0 border-b-2 px-1 ${
              activeTab === "merchant"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-brand-subtext hover:text-brand-text"
            }`}
          >
            Merchant Extensions ({merchantRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent border-0 border-b-2 px-1 ${
              activeTab === "customer"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-brand-subtext hover:text-brand-text"
            }`}
          >
            Customer Requests ({customerRequests.length})
          </button>
        </div>

        {loading
          ? <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
              <span>Loading revival queues...</span>
            </div>
          : activeTab === "merchant"
            ? // MERCHANT EXTENSIONS TAB
              merchantRequests.length > 0
              ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="overflow-x-auto flex-1">
                    <Table className="w-full text-xs">
                      <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                        <TableRow className="hover:bg-transparent border-b border-brand-border">
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Merchant / Brand
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Expired Coupon
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Requested Expiry
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Reason For Revival
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                        {merchantRequests.map((req) => (
                          <TableRow
                            key={req._id}
                            className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                          >
                            <TableCell className="p-4 font-bold text-brand-navy h-auto">
                              {req.merchantId?.businessName ||
                                "Unknown Merchant"}
                            </TableCell>
                            <TableCell className="p-4">
                              <div className="font-bold">
                                {req.couponId?.title || "Unknown Coupon"}
                              </div>
                              <div className="text-[10px] text-brand-subtext mt-0.5">
                                Code:{" "}
                                <code className="bg-brand-surface px-1.5 py-0.5 rounded">
                                  {req.couponId?.code || "—"}
                                </code>
                              </div>
                            </TableCell>
                            <TableCell className="p-4">
                              {req.newExpiresAt
                                ? new Date(
                                    req.newExpiresAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell className="p-4 text-brand-subtext">
                              {req.reason || "No reason provided"}
                            </TableCell>
                            <TableCell className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  size="icon"
                                  onClick={() =>
                                    handleMerchantAction(req._id, "approve")
                                  }
                                  className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                                  title="Approve & Revive Coupon"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  onClick={() =>
                                    handleMerchantAction(req._id, "reject")
                                  }
                                  className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                                  title="Reject Request"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              : <EmptyState
                  icon={RefreshCw}
                  title="No pending merchant extensions"
                  description="All merchant-submitted coupon extension requests have been processed."
                />
            : // CUSTOMER REVIVALS TAB
              customerRequests.length > 0
              ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="overflow-x-auto flex-1">
                    <Table className="w-full text-xs">
                      <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                        <TableRow className="hover:bg-transparent border-b border-brand-border">
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Brand / Store Name
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Expired Code
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Customer Submitter
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-center h-auto">
                            Votes
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Status
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                            Moderation Controls
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                        {customerRequests.map((req) => (
                          <TableRow
                            key={req._id}
                            className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                          >
                            <TableCell className="p-4 font-bold text-brand-navy h-auto">
                              {req.brandName}
                            </TableCell>
                            <TableCell className="p-4 text-brand-blue font-bold">
                              {req.code}
                            </TableCell>
                            <TableCell className="p-4 text-brand-subtext">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-brand-subtext" />
                                {req.email}
                              </span>
                            </TableCell>
                            <TableCell className="p-4 text-center h-auto">
                              <span className="bg-brand-surface border border-brand-border/40 rounded px-2 py-0.5 font-bold">
                                {req.votes || 1}
                              </span>
                            </TableCell>
                            <TableCell className="p-4">
                              {getStatusBadge(req.status)}
                            </TableCell>
                            <TableCell className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {req.status === "pending" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleCustomerAction(req._id, "contacted")
                                    }
                                    className="bg-brand-blue/15 text-brand-blue hover:bg-brand-blue hover:text-white border-0 py-1 px-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer h-7"
                                    title="Forward/Notify Brand"
                                  >
                                    <Forward className="w-3.5 h-3.5" />
                                    <span>Contact Brand</span>
                                  </Button>
                                )}

                                {req.status !== "approved" && (
                                  <Button
                                    size="icon"
                                    onClick={() =>
                                      handleCustomerAction(req._id, "approved")
                                    }
                                    className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-7 h-7 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                                    title="Mark as Resolved"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </Button>
                                )}

                                {req.status !== "rejected" && (
                                  <Button
                                    size="icon"
                                    onClick={() =>
                                      handleCustomerAction(req._id, "rejected")
                                    }
                                    className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-7 h-7 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                                    title="Decline Request"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              : <EmptyState
                  icon={RefreshCw}
                  title="No customer revival requests"
                  description="No user restoration requests found in the database."
                />}
      </div>
    </DashboardLayout>
  );
}
