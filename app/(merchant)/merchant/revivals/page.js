"use client";

import { useState } from "react";
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
  Clock,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/fetcher";

export default function MerchantRevivals() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [alternativeModalOpen, setAlternativeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
      const res = await apiFetch("/api/merchant/revivals");
      return res.data?.revivals || [];
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
      return apiFetch("/api/merchant/revivals/resolve", {
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
      return (
        <Badge className="bg-brand-success/10 text-brand-success border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none hover:bg-brand-success/10">
          Regenerated
        </Badge>
      );
    }
    if (outcomeStatus === "resolved_alternative") {
      return (
        <Badge className="bg-brand-blue/10 text-brand-blue border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none hover:bg-brand-blue/10">
          Alternative Offered
        </Badge>
      );
    }
    if (outcomeStatus === "declined" || status === "rejected") {
      return (
        <Badge className="bg-brand-error/10 text-brand-error border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none hover:bg-brand-error/10">
          Declined
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-0 rounded-full font-bold text-[10px] px-2.5 py-0.5 shadow-none hover:bg-amber-500/10">
        Pending
      </Badge>
    );
  };

  const getDaysSinceSeen = (dateString) => {
    if (!dateString) return "—";
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days <= 0 ? "Today" : `${days} days ago`;
  };

  // Filter requests according to category selection
  const getFilteredRequests = (category) => {
    if (category === "all") return requests;
    return requests.filter((r) => r.category?.toLowerCase() === category.toLowerCase());
  };

  // Compute live statistics for summary cards
  const pendingCount = requests.filter((r) => r.status === "pending" || r.outcomeStatus === "pending").length;
  const approvedCount = requests.filter((r) => r.outcomeStatus === "resolved_regenerated" || r.outcomeStatus === "resolved_alternative").length;
  const declinedCount = requests.filter((r) => r.outcomeStatus === "declined").length;

  return (
    <DashboardLayout
      title="Revival Requests"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-6 text-left font-sans">
        {/* Onboarding Welcome Card */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-xl p-5 space-y-2">
          <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
            Coupon Revival Queue
          </h3>
          <p className="text-xs text-brand-subtext leading-relaxed font-semibold">
            Review customer requests to regenerate your expired coupons or
            suggest alternative active deals. Responding quickly improves brand
            loyalty and customer conversion.
          </p>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Revivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Awaiting your approval or alternative offer
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Approved Revivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Successfully extended or alternative offered
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Declined Revivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{declinedCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Rejected requests with feedback comments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs font-bold px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">All Requests</TabsTrigger>
            <TabsTrigger value="a" className="text-xs font-bold px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 text-rose-600 data-[state=active]:text-rose-600">
              <Clock className="w-3.5 h-3.5" />
              <span>Category A (SLA)</span>
            </TabsTrigger>
            <TabsTrigger value="b" className="text-xs font-bold px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Category B</TabsTrigger>
            <TabsTrigger value="c" className="text-xs font-bold px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Category C</TabsTrigger>
          </TabsList>

          {["all", "a", "b", "c"].map((category) => (
            <TabsContent key={category} value={category} className="mt-4 focus-visible:outline-none">
              {isLoading ? (
                <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
                  <span>Loading revival requests...</span>
                </div>
              ) : getFilteredRequests(category).length > 0 ? (
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
                        {getFilteredRequests(category).map((req) => (
                          <TableRow
                            key={req._id}
                            className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                          >
                            <TableCell className="p-4 font-bold text-brand-navy h-auto">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span>{req.description || "Expired Coupon"}</span>
                                  {req.category && (
                                    <Badge className="bg-slate-100 text-slate-800 text-[8px] font-bold py-0.5 px-1.5 uppercase hover:bg-slate-100">
                                      Cat {req.category}
                                    </Badge>
                                  )}
                                  {req.needsFollowUp && (
                                    <Badge className="bg-red-100 text-red-700 text-[8px] font-bold py-0.5 px-1.5 uppercase hover:bg-red-100 flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      <span>SLA Overdue</span>
                                    </Badge>
                                  )}
                                </div>
                                {req.code && (
                                  <span className="text-[10px] text-brand-subtext uppercase font-bold mt-0.5">
                                    Code:{" "}
                                    <code className="bg-brand-surface px-1.5 py-0.5 rounded font-mono font-semibold">
                                      {req.code}
                                    </code>
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
                            <TableCell className="p-4 text-brand-subtext font-medium">
                              {getDaysSinceSeen(req.createdAt)}
                            </TableCell>
                            <TableCell className="p-4">
                              {getStatusBadge(req.outcomeStatus, req.status)}
                            </TableCell>
                            <TableCell className="p-4 text-right">
                              {(req.outcomeStatus === "pending" && req.status === "pending") ? (
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
                                <span className="text-[11px] text-brand-subtext italic">
                                  Processed
                                </span>
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
                  <h4 className="text-brand-navy">No requests in this tab</h4>
                  <p className="text-xs text-brand-subtext leading-relaxed max-w-xs mx-auto mt-1 font-semibold">
                    No matching customer revival requests were found.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Decline Reason Modal using Shadcn Dialog */}
        <Dialog open={declineModalOpen} onOpenChange={(open) => !open && setDeclineModalOpen(false)}>
          <DialogContent className="max-w-md bg-brand-bg border border-brand-border rounded-xl p-6">
            <DialogHeader className="border-b border-brand-border pb-3">
              <DialogTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-error" />
                <span>Decline Revival Request</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-xs leading-relaxed mt-1 text-left">
                Declining a request requires a explanation (minimum 10 characters) shared with the customer.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Textarea
                placeholder="e.g. This offer was part of a seasonal clearance that is no longer running..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="w-full bg-brand-surface text-xs border-brand-border leading-relaxed font-semibold focus:ring-brand-blue"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button
                variant="outline"
                onClick={() => {
                  setDeclineModalOpen(false);
                  setSelectedRequest(null);
                  setDeclineReason("");
                }}
                className="bg-transparent border border-brand-border text-brand-navy hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                disabled={declineReason.length < 10}
                onClick={handleDeclineSubmit}
                className="bg-brand-error text-white font-bold py-2 px-4 rounded-lg text-xs border-0 hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                Confirm Decline
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Offer Alternative Modal using Shadcn Dialog */}
        <Dialog open={alternativeModalOpen} onOpenChange={(open) => !open && setAlternativeModalOpen(false)}>
          <DialogContent className="max-w-lg bg-brand-bg border border-brand-border rounded-xl p-6">
            <DialogHeader className="border-b border-brand-border pb-3">
              <DialogTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-blue" />
                <span>Offer Alternative Coupon</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-xs leading-relaxed mt-1 text-left">
                Select one of your currently active offers to send to the customer as a quick alternative:
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 max-h-[280px] overflow-y-auto space-y-2">
              {activeCoupons && activeCoupons.length > 0 ? (
                activeCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    onClick={() => handleSelectAlternative(coupon._id)}
                    className="bg-brand-surface hover:bg-slate-100 border border-brand-border rounded-lg p-3 cursor-pointer flex justify-between items-center transition-all"
                  >
                    <div className="space-y-0.5 text-left">
                      <span className="font-bold text-brand-navy block">
                        {coupon.title}
                      </span>
                      <span className="text-[10px] text-brand-subtext uppercase font-mono">
                        {coupon.code}
                      </span>
                    </div>
                    <Badge className="bg-brand-blue/10 text-brand-blue border-0 rounded text-[9px] font-bold py-0.5 px-2 hover:bg-brand-blue/20">
                      Select
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 font-bold italic py-4 text-center text-xs">
                  No active alternative coupons found. Please create one first.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button
                variant="outline"
                onClick={() => {
                  setAlternativeModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="bg-transparent border border-brand-border text-brand-navy hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
