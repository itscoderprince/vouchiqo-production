"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle,
  ExternalLink,
  Filter,
  HelpCircle,
  Loader2,
  MessageSquare,
  PhoneCall,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/fetcher";

export default function MerchantDemandReport() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // "", "never_listed", "previously_listed"
  const [outreachStatus, setOutreachStatus] = useState(""); // "", "not_contacted", "contacted", etc.
  const [doNotContact, setDoNotContact] = useState("false"); // "all", "true", "false"
  const [selectedLead, setSelectedLead] = useState(null);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  // 1. Fetch Merchant Demand leads
  const { data, isLoading } = useQuery({
    queryKey: ["merchant-demand", search, status, outreachStatus, doNotContact],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (outreachStatus) params.set("outreachStatus", outreachStatus);
      if (doNotContact !== "all") params.set("doNotContact", doNotContact);

      const res = await apiFetch(
        `/api/admin/merchant-demand?${params.toString()}`,
      );
      return res.data;
    },
  });

  const leads = data?.demands || [];

  // 2. Mutation to update outreach
  const updateMutation = useMutation({
    mutationFn: async ({ demandId, payload }) => {
      return apiFetch("/api/admin/merchant-demand", {
        method: "PUT",
        body: JSON.stringify({ demandId, ...payload }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["merchant-demand"]);
      setOutreachModalOpen(false);
      setSelectedLead(null);
    },
  });

  const handleUpdateOutreachStatus = (demandId, status) => {
    updateMutation.mutate({
      demandId,
      payload: { outreachStatus: status },
    });
  };

  const handleToggleDNC = (demandId, currentDNC) => {
    updateMutation.mutate({
      demandId,
      payload: { doNotContact: !currentDNC },
    });
  };

  const openOutreachModal = (lead) => {
    setSelectedLead(lead);
    const count = lead.submissionCount || 1;
    const template =
      lead.status === "previously_listed"
        ? `Hi ${lead.businessName || "Partner"}, we've received ${count} customer request(s) requesting your expired offers on Vouchiqo. We'd love to win you back! Let's reactivate your listing.`
        : `Hi ${lead.businessName || "Merchant"}, we've noticed high customer demand for your brand in ${lead.city || "Ranchi"} with ${count} requests for expired offers. Let's get you listed on Vouchiqo!`;
    setMessageText(template);
    setOutreachModalOpen(true);
  };

  const submitOutreach = () => {
    if (!selectedLead) return;
    // Log outreach trigger and mark outreachStatus as contacted
    updateMutation.mutate({
      demandId: selectedLead._id,
      payload: { outreachStatus: "contacted" },
    });
  };

  return (
    <DashboardLayout
      title="Merchant Demand Report"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="flex flex-col gap-6">
        {/* Description Header */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-xl p-5 space-y-2">
          <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
            Merchant Demand Report & Intelligence
          </h3>
          <p className="text-xs text-brand-subtext leading-relaxed font-semibold">
            This dashboard aggregates customer coupon revival requests for
            unlisted (Category C) and churned/inactive (Category B) merchants.
            Use this data as your high-intent cold outreach lead pipeline.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4 bg-brand-bg border border-brand-border p-4 rounded-xl shadow-sm">
          {/* Search Input */}
          <InputGroup className="bg-brand-surface border border-brand-border rounded-lg h-9 px-1 w-full sm:w-60 shadow-none">
            <InputGroupAddon>
              <Search className="w-3.5 h-3.5 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search unlisted brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs placeholder-brand-subtext h-full"
            />
          </InputGroup>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-brand-subtext">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Statuses</option>
              <option value="never_listed">Never Listed (C)</option>
              <option value="previously_listed">Previously Listed (B)</option>
            </select>
          </div>

          {/* Outreach Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-brand-subtext">Outreach:</span>
            <select
              value={outreachStatus}
              onChange={(e) => setOutreachStatus(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Stages</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
              <option value="awaiting_response">Awaiting Response</option>
              <option value="declined">Declined</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          {/* DNC Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-brand-subtext">Do-Not-Contact:</span>
            <select
              value={doNotContact}
              onChange={(e) => setDoNotContact(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="all">All</option>
              <option value="false">Contact Allowed</option>
              <option value="true">DNC Suppressed</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        {isLoading
          ? <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
              <span>Loading demand leads database...</span>
            </div>
          : leads.length > 0
            ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto flex-1">
                  <Table className="w-full text-xs">
                    <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                      <TableRow className="hover:bg-transparent border-b border-brand-border">
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Merchant / Brand
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto text-center">
                          Demand Count
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Category
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          City
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Source Platforms
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                          Outreach Status
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto text-center">
                          DNC Suppressed
                        </TableHead>
                        <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                      {leads.map((lead) => (
                        <TableRow
                          key={lead._id}
                          className={`hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0 ${
                            lead.doNotContact ? "opacity-60 bg-red-500/5" : ""
                          }`}
                        >
                          <TableCell className="p-4 font-bold text-brand-navy h-auto">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-brand-subtext" />
                              <span>{lead.businessName}</span>
                              {lead.status === "previously_listed"
                                ? <Badge className="bg-amber-500/10 text-amber-600 border-0 rounded px-1.5 py-0.5 text-[8px] font-bold">
                                    Churned
                                  </Badge>
                                : <Badge className="bg-brand-blue/10 text-brand-blue border-0 rounded px-1.5 py-0.5 text-[8px] font-bold">
                                    New Lead
                                  </Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-center h-auto">
                            <span className="bg-brand-surface border border-brand-border/40 rounded px-2.5 py-0.5 font-bold text-brand-navy text-[11px]">
                              {lead.submissionCount || 1}
                            </span>
                          </TableCell>
                          <TableCell className="p-4 uppercase tracking-wider text-[10px] text-slate-500">
                            {lead.category || "—"}
                          </TableCell>
                          <TableCell className="p-4">
                            {lead.city || "Ranchi"}
                          </TableCell>
                          <TableCell className="p-4 text-brand-subtext">
                            <div className="flex flex-wrap gap-1">
                              {lead.sourcePlatforms?.map((plat) => (
                                <span
                                  key={plat}
                                  className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                >
                                  {plat}
                                </span>
                              )) || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="p-4 h-auto">
                            <select
                              value={lead.outreachStatus || "not_contacted"}
                              onChange={(e) =>
                                handleUpdateOutreachStatus(
                                  lead._id,
                                  e.target.value,
                                )
                              }
                              className="bg-brand-surface border border-brand-border rounded text-[11px] h-7 px-1.5 focus:outline-none"
                            >
                              <option value="not_contacted">
                                Not Contacted
                              </option>
                              <option value="contacted">Contacted</option>
                              <option value="awaiting_response">
                                Awaiting Response
                              </option>
                              <option value="declined">Declined</option>
                              <option value="converted">Converted</option>
                            </select>
                          </TableCell>
                          <TableCell className="p-4 text-center h-auto">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleDNC(lead._id, lead.doNotContact)
                              }
                              className={`w-10 h-5 rounded-full p-0.5 transition-colors border-0 cursor-pointer ${
                                lead.doNotContact
                                  ? "bg-red-500 text-right"
                                  : "bg-slate-200 text-left"
                              }`}
                            >
                              <span className="block w-4 h-4 bg-white rounded-full shadow-sm" />
                            </button>
                          </TableCell>
                          <TableCell className="p-4 text-right">
                            <Button
                              size="sm"
                              disabled={lead.doNotContact}
                              onClick={() => openOutreachModal(lead)}
                              className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white border-0 py-1 px-2.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer h-7 shadow-none disabled:opacity-40"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Outreach</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            : <div className="bg-brand-bg border border-brand-border rounded-xl p-12 text-center text-brand-subtext font-semibold shadow-sm">
                <Filter className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <h4 className="text-brand-navy">No demand leads found</h4>
                <p className="text-xs text-brand-subtext leading-relaxed max-w-xs mx-auto mt-1 font-semibold">
                  There are currently no Category B or C revival requests in the
                  database matching these filters.
                </p>
              </div>}

        {/* Outreach Script Modal */}
        {outreachModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-bg border border-brand-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
                <MessageSquare className="w-4 h-4 text-brand-blue" />
                <span>Generate Outreach outreach script</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="block font-bold text-slate-700">
                    Target Business:
                  </span>
                  <span className="text-brand-navy font-semibold text-[13px]">
                    {selectedLead.businessName}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-700">
                    Outreach Message Content:
                  </span>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    className="w-full bg-brand-surface text-xs border-brand-border mt-1 min-h-24 leading-relaxed font-semibold focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
                <Button
                  onClick={() => setOutreachModalOpen(false)}
                  className="bg-transparent border border-brand-border text-brand-navy hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitOutreach}
                  className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg text-xs border-0"
                >
                  Mark as Contacted
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
