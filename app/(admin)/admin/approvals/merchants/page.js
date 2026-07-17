"use client";

import { Check, Store, X, RefreshCw, Eye, ShieldAlert, CreditCard, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MerchantApprovals() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);

  const fetchPendingMerchants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/merchants?status=pending");
      const json = await res.json();
      if ((json.success || json.status === "success") && json.data) {
        setMerchants(json.data.merchants || []);
      }
    } catch (err) {
      console.error("Error fetching pending merchants:", err);
      toast.error("Failed to load pending merchants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  const handleAction = async (merchantId, action) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";
      const res = await fetch("/api/admin/merchants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, status }),
      });
      if (res.ok) {
        setMerchants((prev) => prev.filter((m) => m._id !== merchantId));
        toast.success(
          action === "approve" ? "Merchant approved & activated!" : "Merchant application rejected."
        );
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.message ?? "Action failed. Please try again.");
      }
    } catch (err) {
      console.error("Error reviewing merchant:", err);
      toast.error("Network error. Please try again.");
    }
  };

  const handleOpenKyc = (merchant) => {
    setSelectedMerchant(merchant);
    setKycDialogOpen(true);
  };

  return (
    <DashboardLayout
      title="Merchant Approvals"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
        Merchant Signup Review Queue
      </h2>

      {loading
        ? <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
            <span>Loading pending applications...</span>
          </div>
        : merchants.length > 0
          ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="overflow-x-auto flex-1">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                    <TableRow className="hover:bg-transparent border-b border-brand-border">
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Brand Details
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Contact Info
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Registered Location
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                        Submitted Date
                      </TableHead>
                      <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                        Moderation Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                    {merchants.map((merchant) => (
                      <TableRow
                        key={merchant._id}
                        className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                      >
                        <TableCell className="p-4 h-auto">
                          <div className="flex flex-col">
                            <span className="font-bold text-brand-navy">
                              {merchant.businessName}
                            </span>
                            {merchant.website && (
                              <a
                                href={merchant.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-brand-blue hover:underline font-bold mt-0.5"
                              >
                                {merchant.website
                                  .replace("https://", "")
                                  .replace("http://", "")}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          {merchant.contactEmail || "No email"}
                        </TableCell>
                        <TableCell className="p-4">
                          {merchant.location
                            ? `${merchant.location.city || ""}, ${merchant.location.country || "IN"}`
                            : "IN"}
                        </TableCell>
                        <TableCell className="p-4 text-brand-subtext">
                          {merchant.createdAt
                            ? new Date(merchant.createdAt).toLocaleDateString()
                            : "Pending"}
                        </TableCell>
                        <TableCell className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 items-center">
                            <Button
                              variant="outline"
                              onClick={() => handleOpenKyc(merchant)}
                              className="text-xs h-8 border-brand-border flex items-center gap-1 hover:bg-brand-surface cursor-pointer shadow-none"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Verify KYC</span>
                            </Button>
                            <Button
                              size="icon"
                              onClick={() =>
                                handleAction(merchant._id, "approve")
                              }
                              className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              onClick={() =>
                                handleAction(merchant._id, "reject")
                              }
                              className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
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
              icon={Store}
              title="No pending merchants"
              description="Excellent work. All merchant application submissions have been reviewed and approved."
            />}

      <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
        <DialogContent className="w-11/12 max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl bg-brand-bg border border-brand-border rounded-xl p-6 text-left max-h-[90vh] overflow-y-auto">
          {selectedMerchant && (
            <Tabs defaultValue="details" className="w-full">
              <DialogHeader className="border-b border-brand-border pb-4 flex flex-row items-center justify-between">
                <div className="space-y-1 text-left">
                  <DialogTitle className="font-heading text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-blue" />
                    <span>KYC Document Verification</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-brand-subtext">
                    Inspect merchant KYC, bank accounts, and uploaded documents before approving.
                  </DialogDescription>
                </div>
                <TabsList className="flex bg-slate-100 p-1 rounded-xl h-10 w-fit shrink-0 gap-1 ml-4 border-0">
                  <TabsTrigger value="details">Merchant Details</TabsTrigger>
                  <TabsTrigger value="assets">Brand Assets &amp; Proofs</TabsTrigger>
                </TabsList>
              </DialogHeader>

              <div className="pt-4 font-semibold text-xs text-brand-text">
                <TabsContent value="details" className="space-y-6 mt-0">
                  {/* Textual Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Section 1: Liaison & Brand Info */}
                    <div className="space-y-3 bg-brand-surface border border-brand-border p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/40 pb-2 mb-3">
                          <Store className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Liaison &amp; Corporate Profile</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-4 leading-relaxed">
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Legal Entity Name</span>
                            <p className="font-bold text-brand-navy text-xs mt-0.5">{selectedMerchant.businessName}</p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Constitution</span>
                            <p className="font-bold text-brand-navy text-xs mt-0.5 capitalize">{selectedMerchant.constitution || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Authorized Liaison</span>
                            <p className="font-bold text-brand-text text-xs mt-0.5">
                              {selectedMerchant.liaisonName || "N/A"}
                            </p>
                            <span className="text-[10px] text-brand-subtext capitalize font-semibold block">({selectedMerchant.liaisonDesignation || "owner"})</span>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Liaison Contact</span>
                            <p className="font-bold text-brand-text text-xs mt-0.5">
                              {selectedMerchant.liaisonPhone || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Regional Hub City</span>
                            <p className="font-bold text-brand-text text-xs mt-0.5 capitalize">
                              {selectedMerchant.regionalHubCity || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Google Maps Link</span>
                            {selectedMerchant.gmapsLink ? (
                              <p className="mt-0.5">
                                <a
                                  href={selectedMerchant.gmapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-blue hover:underline font-bold text-xs"
                                >
                                  View Store Location
                                </a>
                              </p>
                            ) : (
                              <p className="text-slate-400 text-xs mt-0.5">N/A</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Statutory Compliance */}
                    <div className="space-y-3 bg-brand-surface border border-brand-border p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/40 pb-2 mb-3">
                          <ShieldAlert className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Statutory KYC Credentials</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-y-4 leading-relaxed">
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Permanent Account Number (PAN)</span>
                            <p className="font-bold text-brand-navy text-xs font-mono uppercase mt-0.5">{selectedMerchant.pan || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">GST Identification Number (GSTIN)</span>
                            {selectedMerchant.isGstExempt ? (
                              <p className="font-bold text-brand-success text-xs mt-0.5">GST Exempt Consumer (Unregistered)</p>
                            ) : (
                              <p className="font-bold text-brand-navy text-xs font-mono uppercase mt-0.5">{selectedMerchant.gstin || "N/A"}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Bank Particulars */}
                    <div className="space-y-3 bg-brand-surface border border-brand-border p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/40 pb-2 mb-3">
                          <CreditCard className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Settlement Bank Gateway</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-4 leading-relaxed">
                          <div className="col-span-2">
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Bank Account Holder</span>
                            <p className="font-bold text-brand-text text-xs mt-0.5">{selectedMerchant.bankDetails?.holderName || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Account Typology</span>
                            <p className="font-bold text-brand-text text-xs mt-0.5 capitalize">{selectedMerchant.bankDetails?.accountType || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Bank IFSC</span>
                            <p className="font-bold text-brand-navy text-xs font-mono uppercase mt-0.5">{selectedMerchant.bankDetails?.ifsc || "N/A"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-brand-subtext text-[10px] uppercase font-bold">Account Number</span>
                            <p className="font-bold text-brand-navy text-xs font-mono mt-0.5">{selectedMerchant.bankDetails?.accountNumber || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assets" className="mt-0">
                  {/* Visual assets grid styled according to real proportions */}
                  <div className="grid grid-cols-1 md:grid-cols-8 gap-6 bg-brand-surface border border-brand-border p-5 rounded-xl">
                    
                    {/* Store Logo - spans 2 columns */}
                    <div className="md:col-span-2 space-y-2 text-left">
                      <span className="text-brand-subtext text-[10px] uppercase font-bold block">Store Logo (1:1)</span>
                      <div className="relative border border-brand-border rounded-xl h-44 bg-white flex items-center justify-center overflow-hidden shadow-inner p-6">
                        {selectedMerchant.logo ? (
                          <>
                            <img
                              src={selectedMerchant.logo}
                              alt="Logo"
                              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold bg-slate-50">
                              <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                              <span>Logo Unavailable</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No logo uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Shop Photo - spans 3 columns */}
                    <div className="md:col-span-3 space-y-2 text-left">
                      <span className="text-brand-subtext text-[10px] uppercase font-bold block">Shop Photograph (4:3)</span>
                      <div className="relative border border-brand-border rounded-xl h-44 bg-white flex items-center justify-center overflow-hidden shadow-inner p-2">
                        {selectedMerchant.shopImage ? (
                          <>
                            <img
                              src={selectedMerchant.shopImage}
                              alt="Shop Front"
                              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold bg-slate-50">
                              <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                              <span>Photo Unavailable</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No shop photo uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Cancelled Cheque - spans 3 columns */}
                    <div className="md:col-span-3 space-y-2 text-left">
                      <span className="text-brand-subtext text-[10px] uppercase font-bold block">Bank Proof Cheque (4:3)</span>
                      <div className="relative border border-brand-border rounded-xl h-44 bg-white flex items-center justify-center overflow-hidden shadow-inner p-2">
                        {selectedMerchant.bankDetails?.chequeImage ? (
                          <>
                            <img
                              src={selectedMerchant.bankDetails.chequeImage}
                              alt="Cancelled Cheque"
                              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold bg-slate-50">
                              <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                              <span>Proof Unavailable</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No bank proof uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Cover Banner - spans all 8 columns for full width display */}
                    <div className="md:col-span-8 space-y-2 text-left mt-2">
                      <span className="text-brand-subtext text-[10px] uppercase font-bold block">Cover Banner (Landscape)</span>
                      <div className="relative border border-brand-border rounded-xl h-48 bg-white flex items-center justify-center overflow-hidden shadow-inner p-2">
                        {selectedMerchant.banner ? (
                          <>
                            <img
                              src={selectedMerchant.banner}
                              alt="Cover Banner"
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold bg-slate-50">
                              <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                              <span>Banner Unavailable</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No cover banner uploaded</span>
                        )}
                      </div>
                    </div>

                  </div>
                </TabsContent>

              {/* Action Buttons in Modal */}
              <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
                <Button
                  onClick={() => {
                    handleAction(selectedMerchant._id, "reject");
                    setKycDialogOpen(false);
                  }}
                  className="bg-brand-error hover:bg-red-600 text-white text-xs h-9 px-4 font-bold rounded-lg cursor-pointer border-0 shadow-none flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Decline KYC</span>
                </Button>
                <Button
                  onClick={() => {
                    handleAction(selectedMerchant._id, "approve");
                    setKycDialogOpen(false);
                  }}
                  className="bg-brand-success hover:bg-emerald-600 text-white text-xs h-9 px-4 font-bold rounded-lg cursor-pointer border-0 shadow-none flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve &amp; Activate</span>
                </Button>
              </div>
            </div>
          </Tabs>
        )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
