"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  X,
  Loader2,
  RefreshCw,
  Mail,
  FileText,
  AlertTriangle,
  Gift,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/fetcher";

export default function MerchantRevivals() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [alternativeModalOpen, setAlternativeModalOpen] = useState(false);

  // 1. Fetch current merchant profile
  const { data: merchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await apiFetch("/api/merchants/me");
      return res.data;
    },
  });

  // 2. Fetch customer revival requests for this merchant's brand name
  const { data, isLoading } = useQuery({
    queryKey: ["merchant-revival-requests", merchant?._id],
    queryFn: async () => {
      if (!merchant?.businessName) return [];
      // Fetch all customer revivals, filter locally or en route
      const res = await apiFetch(`/api/revivals/customer?admin=true`);
      const allRevivals = res.data?.revivals || [];
      // Filter for this merchant's brand name matching case-insensitively
      const businessNameLower = merchant.businessName.toLowerCase().trim();
      return allRevivals.filter(
        (r) => r.brandName.toLowerCase().trim() === businessNameLower
      );
    },
    enabled: !!merchant?.businessName,
  });

  const requests = data || [];

  // 3. Fetch active coupons for "Offer Alternative" suggestions
  const { data: activeCoupons } = useQuery({
    queryKey: ["merchant-active-coupons", merchant?._id],
    queryFn: async () => {
      if (!merchant?._id) return [];
      const res = await apiFetch(`/api/coupons?merchantId=${merchant._id}`);
      return res.data?.coupons || [];
    },
    enabled: !!merchant?._id,
  });

  // 4. Mutation to resolve customer requests
  const resolveMutation = useMutation({
    mutationFn: async ({ revivalId, outcomeStatus, payload = {} }) => {
      return apiFetch("/api/admin/revivals/resolve", {
        method: "POST",
        body: JSON.stringify({ revivalId, outcomeStatus, ...payload }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["merchant-revival-requests"]);
      setDeclineModalOpen(false);
      setAlternativeModalOpen(false);
      setSelectedRequest(null);
      setDeclineReason("");
    },
  });

  const handleApproveRegenerate = (revivalId) => {
    resolveMutation.mutate({
      revivalId,
      outcomeStatus: "resolved_regenerated",
    });
  };

  const handleDeclineSubmit = () => {
    if (!selectedRequest || declineReason.length < 10) return;
    resolveMutation.mutate({
      revivalId: selectedRequest._id,
      outcomeStatus: "declined",
      payload: { declineReason },
    });
  };

  const handleSelectAlternative = (alternativeOfferId) => {
    if (!selectedRequest) return;
    resolveMutation.mutate({
      revivalId: selectedRequest._id,
      outcomeStatus: "resolved_alternative",
      payload: { alternativeOfferId },
    });
  };

  const maskEmail = (email) => {
    if (!email) return "—";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const name = parts[0];
    const maskedName = name.length > 2 ? name.slice(0, 2) + "**" : "**";
    return `${maskedName}@${parts[1]}`;
  };

  const getStatusBadge = (outcomeStatus, status) => {
    if (outcomeStatus === "resolved_regenerated") {
      return <Badge className="bg-brand-success/10 text-brand-success border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none">Regenerated</Badge>;
    }
    if (outcomeStatus === "resolved_alternative") {
      return <Badge className="bg-brand-blue/10 text-brand-blue border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none">Alternative Offered</Badge>;
    }
    if (outcomeStatus === "declined" || status === "rejected") {
      return <Badge className="bg-brand-error/10 text-brand-error border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none">Declined</Badge>;
    }
    return <Badge className="bg-amber-500/10 text-amber-600 border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none">Pending</Badge>;
  };

  const getDaysSinceSeen = (dateString) => {
    if (!dateString) return "—";
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days <= 0 ? "Today" : `${days} days ago`;
  };

  return (
    <DashboardLayout
      title="Revival Requests"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-6">
        
        {/* Onboarding Welcome Card */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-xl p-5 space-y-2">
          <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
            Coupon Revival Queue
          </h3>
          <p className="text-xs text-brand-subtext leading-relaxed font-semibold">
            Review customer requests to regenerate your expired coupons or suggest alternative active deals.
            Responding quickly improves brand loyalty and customer conversion.
          </p>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
            <span>Loading revival requests...</span>
          </div>
        ) : requests.length > 0 ? (
          <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto flex-1">
              <Table className="w-full text-xs">
                <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                  <TableRow className="hover:bg-transparent border-b border-brand-border">
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Expired Coupon / Code
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Customer Email
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      What they were buying
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Date Requested
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Status
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                  {requests.map((req) => (
                    <TableRow
                      key={req._id}
                      className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                    >
                      <TableCell className="p-4 font-bold text-brand-navy h-auto">
                        <div className="flex flex-col">
                          <span>{req.description || "Expired Coupon"}</span>
                          {req.code && (
                            <span className="text-[10px] text-brand-subtext uppercase font-bold mt-0.5">
                              Code: <code className="bg-brand-surface px-1.5 py-0.5 rounded font-mono font-semibold">{req.code}</code>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-brand-subtext">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-brand-subtext" />
                          {maskEmail(req.email)}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 text-slate-500">
                        {req.whatBuying || "—"}
                      </TableCell>
                      <TableCell className="p-4 text-brand-subtext">
                        {getDaysSinceSeen(req.createdAt)}
                      </TableCell>
                      <TableCell className="p-4">
                        {getStatusBadge(req.outcomeStatus, req.status)}
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        {req.outcomeStatus === "pending" && req.status === "pending" ? (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRegenerate(req._id)}
                              className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 py-1 px-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer h-7"
                              title="Approve & Regenerate Code"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(req);
                                setAlternativeModalOpen(true);
                              }}
                              className="bg-brand-blue/15 text-brand-blue hover:bg-brand-blue hover:text-white border-0 py-1 px-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer h-7"
                              title="Offer Alternative Coupon"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Alternative</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(req);
                                setDeclineModalOpen(true);
                              }}
                              className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 py-1 px-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer h-7"
                              title="Decline Request"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-brand-subtext italic">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="bg-brand-bg border border-brand-border rounded-xl p-12 text-center text-brand-subtext font-semibold shadow-sm">
            <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <h4 className="text-brand-navy">No revival requests yet</h4>
            <p className="text-xs text-brand-subtext leading-relaxed max-w-xs mx-auto mt-1 font-semibold">
              When customers request to revive your expired coupons, they will show up in this queue for validation.
            </p>
          </div>
        )}

        {/* Decline Reason Modal */}
        {declineModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-bg border border-brand-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
                <AlertTriangle className="w-4 h-4 text-brand-error" />
                <span>Decline Revival Request</span>
              </h3>

              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-semibold leading-relaxed">
                  Declining a request requires a mandatory short explanation (minimum 10 characters) which will be shared with the customer.
                </p>
                <Textarea
                  placeholder="e.g. This offer was part of a seasonal clearance that is no longer running..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  className="w-full bg-brand-surface text-xs border-brand-border mt-1 min-h-24 leading-relaxed font-semibold focus:ring-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
                <Button
                  onClick={() => {
                    setDeclineModalOpen(false);
                    setSelectedRequest(null);
                    setDeclineReason("");
                  }}
                  className="bg-transparent border border-brand-border text-brand-navy hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button
                  disabled={declineReason.length < 10}
                  onClick={handleDeclineSubmit}
                  className="bg-brand-error text-white font-bold py-2 px-4 rounded-lg text-xs border-0 hover:bg-red-600 disabled:opacity-50"
                >
                  Confirm Decline
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Offer Alternative Modal */}
        {alternativeModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-bg border border-brand-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
                <Gift className="w-4 h-4 text-brand-blue" />
                <span>Offer Alternative Coupon</span>
              </h3>

              <div className="space-y-3 text-xs max-h-[300px] overflow-y-auto">
                <p className="text-slate-500 font-semibold leading-relaxed">
                  Select one of your currently active offers to send to the customer as an alternative:
                </p>
                {activeCoupons && activeCoupons.length > 0 ? (
                  <div className="space-y-2">
                    {activeCoupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        onClick={() => handleSelectAlternative(coupon._id)}
                        className="bg-brand-surface hover:bg-slate-100 border border-brand-border rounded-lg p-3 cursor-pointer flex justify-between items-center transition-all"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-brand-navy block">{coupon.title}</span>
                          <span className="text-[10px] text-brand-subtext uppercase font-mono">{coupon.code}</span>
                        </div>
                        <Badge className="bg-brand-blue/10 text-brand-blue border-0 rounded text-[9px] font-bold py-0.5 px-2">Select</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 font-bold italic py-4 text-center">No active alternative coupons found. Please create one first.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
                <Button
                  onClick={() => {
                    setAlternativeModalOpen(false);
                    setSelectedRequest(null);
                  }}
                  className="bg-transparent border border-brand-border text-brand-navy hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
