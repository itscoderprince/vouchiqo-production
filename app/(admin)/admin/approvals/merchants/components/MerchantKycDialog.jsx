"use client";

import {
  Building2,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MerchantKycDialog({
  open,
  onOpenChange,
  merchant,
  onAction,
}) {
  if (!merchant) return null;

  const lat = merchant.location?.coordinates?.lat || merchant.lat || "N/A";
  const lng = merchant.location?.coordinates?.lng || merchant.lng || "N/A";
  const mapsUrl =
    merchant.gmapsLink ||
    (lat !== "N/A" && lng !== "N/A"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-5xl w-full bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 text-left shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader className="space-y-1 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Merchant Audit: {merchant.businessName}
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-normal uppercase">
                    {merchant.status || "Pending Audit"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-normal">
                  Detailed KYC audit, location verification, statutory identity
                  documents, and settlement bank credentials.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>
                Submitted:{" "}
                {merchant.createdAt
                  ? new Date(merchant.createdAt).toLocaleDateString("en-IN")
                  : "Recent"}
              </span>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="business" className="w-full text-xs pt-2 space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 p-1 rounded-xl gap-1">
            <TabsTrigger
              value="business"
              className="text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-700"
            >
              <Store className="w-3.5 h-3.5" /> Profile &amp; Location
            </TabsTrigger>
            <TabsTrigger
              value="legal"
              className="text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-700"
            >
              <FileText className="w-3.5 h-3.5" /> Statutory KYC
            </TabsTrigger>
            <TabsTrigger
              value="bank"
              className="text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-700"
            >
              <CreditCard className="w-3.5 h-3.5" /> Settlement Bank
            </TabsTrigger>
            <TabsTrigger
              value="visuals"
              className="text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-700"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Store Media
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: PROFILE & LOCATION ────────────────────────────── */}
          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Core Business Overview */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-medium text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-blue-600" /> Business
                  Overview
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Business Name
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {merchant.businessName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Category
                    </span>
                    <span className="font-medium text-slate-800 capitalize">
                      {merchant.category || "General"}
                    </span>
                    {merchant.category === "others" &&
                      merchant.customCategoryNotes && (
                        <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                          <span className="font-semibold block text-[10px] uppercase text-blue-700">
                            Special Category Notes (20+ Words):
                          </span>
                          <p className="text-[11px] font-normal leading-relaxed">
                            {merchant.customCategoryNotes}
                          </p>
                        </div>
                      )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Constitution Type
                    </span>
                    <span className="font-medium text-slate-800 uppercase">
                      {merchant.constitution || "Proprietorship"}
                    </span>
                  </div>
                  {merchant.website && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Official Website
                      </span>
                      <a
                        href={merchant.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Globe className="w-3 h-3" /> {merchant.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Contact & Authorized Liaison */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-medium text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Contact &amp;
                  Liaison
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Authorized Liaison Name
                    </span>
                    <span className="font-semibold text-slate-900">
                      {merchant.liaisonName ||
                        merchant.contactPerson ||
                        "Store Owner"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Designation
                    </span>
                    <span className="font-medium text-slate-800 capitalize">
                      {merchant.liaisonDesignation || "Owner"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Contact Email
                    </span>
                    <span className="font-mono text-slate-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />{" "}
                      {merchant.contactEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Contact Phone &amp; WhatsApp
                    </span>
                    <span className="font-mono text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />{" "}
                      {merchant.contactPhone ||
                        merchant.whatsappNumber ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Physical Address & Coordinates */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-medium text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Store Location
                  &amp; Coordinates
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Street Address
                    </span>
                    <span className="font-medium text-slate-800 block leading-snug">
                      {merchant.location?.address || "Registered Address"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        City &amp; State
                      </span>
                      <span className="font-medium text-slate-900">
                        {merchant.location?.city
                          ? `${merchant.location.city}, ${merchant.location.state || ""}`
                          : "Ranchi, Jharkhand"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        PIN Code
                      </span>
                      <span className="font-mono font-medium text-slate-900">
                        {merchant.location?.pincode || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      GPS Pinpoint Coordinates
                    </span>
                    <span className="font-mono text-xs font-medium text-blue-700 block">
                      Lat: {lat} | Lng: {lng}
                    </span>
                  </div>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View Location on
                      Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

            {merchant.description && (
              <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Business Description
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {merchant.description}
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── TAB 2: STATUTORY KYC ─────────────────────────────────── */}
          <TabsContent value="legal" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Primary Document Type
                </span>
                <span className="font-semibold text-blue-700">
                  {merchant.docType || "GST Registration Certificate"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Permanent Account Number (PAN)
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {merchant.pan || "Not Provided (Optional)"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  GSTIN Registration
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {merchant.isGstExempt
                    ? "Exempt Micro-Merchant"
                    : merchant.gstin || "Not Provided (Optional)"}
                </span>
              </div>
            </div>

            {/* PRIMARY IDENTITY DOCUMENT IMAGE PREVIEW */}
            <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-200 text-center space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-medium text-slate-900 block">
                  Primary Identity Document Image (
                  {merchant.docType || "GST Certificate"})
                </span>
                {merchant.docImage && (
                  <a
                    href={merchant.docImage}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Full Size Image
                  </a>
                )}
              </div>

              {merchant.docImage ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={merchant.docImage}
                    alt={merchant.docType || "Primary Identity Document"}
                    className="max-h-80 mx-auto object-contain rounded-xl border border-slate-200 shadow-xs bg-white p-1"
                  />
                </div>
              ) : (
                <div className="py-8 text-center space-y-1">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <span className="text-xs text-slate-400 font-normal block">
                    No primary identity document image uploaded by merchant
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 3: SETTLEMENT BANK DETAILS ──────────────────────── */}
          <TabsContent value="bank" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Account Holder Name
                </span>
                <span className="font-semibold text-slate-900">
                  {merchant.bankDetails?.holderName ||
                    merchant.businessName ||
                    "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Account Typology
                </span>
                <span className="font-semibold text-slate-900 uppercase">
                  {merchant.bankDetails?.accountType || "Current"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Account Serial Number
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {merchant.bankDetails?.accountNumber ||
                    "Not Provided (Optional)"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Bank IFSC Code
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {merchant.bankDetails?.ifsc || "Not Provided (Optional)"}
                </span>
              </div>
            </div>

            {merchant.bankDetails?.chequeImage && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-xs font-medium text-slate-900 block">
                  Cancelled Cheque / Bank Proof Photograph
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={merchant.bankDetails.chequeImage}
                  alt="Cancelled Cheque Proof"
                  className="max-h-60 mx-auto object-contain rounded-xl border border-slate-200 bg-white"
                />
              </div>
            )}
          </TabsContent>

          {/* ── TAB 4: STORE VISUALS & PHOTOS ───────────────────────── */}
          <TabsContent value="visuals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-xs font-semibold text-slate-900 block">
                  Shop Front Photograph
                </span>
                {merchant.shopImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.shopImage}
                    alt="Shop Front"
                    className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="py-8 text-center space-y-1">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-xs text-slate-400 font-normal block">
                      No shop front photo uploaded
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-xs font-semibold text-slate-900 block">
                  Store Brand Logo
                </span>
                {merchant.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.logo}
                    alt="Store Logo"
                    className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="py-8 text-center space-y-1">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-xs text-slate-400 font-normal block">
                      No store logo uploaded
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-xs font-semibold text-slate-900 block">
                  Store Banner Image
                </span>
                {merchant.banner ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.banner}
                    alt="Store Banner"
                    className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="py-8 text-center space-y-1">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-xs text-slate-400 font-normal block">
                      No banner image uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AUTHORIZED DIGITAL SIGNATURE DISPLAY */}
            {merchant.signatureImage && (
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 text-center space-y-2">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <span className="text-xs font-semibold text-slate-900 block">
                    Authorized Digital Signature Image
                  </span>
                  <a
                    href={merchant.signatureImage}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Full Size Signature
                  </a>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={merchant.signatureImage}
                  alt="Digital Signature"
                  className="max-h-32 mx-auto object-contain rounded-lg border border-slate-200 bg-white p-2 shadow-2xs"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onAction(merchant._id, "rejected")}
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-xs font-normal rounded-lg cursor-pointer shadow-none gap-1.5 px-4"
          >
            <X className="w-4 h-4" /> Reject Application
          </Button>

          <div className="flex items-center gap-2">
            {(merchant.status === "pending" || !merchant.status) && (
              <Button
                onClick={() => onAction(merchant._id, "form_accepted")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-none gap-1.5 px-5"
              >
                <Check className="w-4 h-4" /> Accept Form for Review
              </Button>
            )}

            {(merchant.status === "form_accepted" || merchant.status === "under_review" || merchant.status === "pending" || !merchant.status) && (
              <Button
                onClick={() => onAction(merchant._id, "approved")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-none gap-1.5 px-5"
              >
                <Check className="w-4 h-4" /> Approve & Activate Merchant
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
