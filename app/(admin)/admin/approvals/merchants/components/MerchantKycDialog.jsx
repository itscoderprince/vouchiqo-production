"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
  Clock,
  Calendar,
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
  const queryClient = useQueryClient();
  const [isExtending, setIsExtending] = useState(false);

  const isPaymentDone =
    merchant?.paymentStatus === "completed" ||
    merchant?.subscriptionStatus === "active" ||
    (merchant?.planExpiry && new Date(merchant.planExpiry).getTime() > Date.now());
  const planExpiryDate = merchant?.planExpiry ? new Date(merchant.planExpiry) : null;
  const [countdownStr, setCountdownStr] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("23:59");

  const handleApplyCustomDate = () => {
    if (!customDate) {
      toast.error("Please select a valid custom expiry date.");
      return;
    }
    const [hours, minutes] = customTime.split(":").map(Number);
    const dateObj = new Date(customDate);
    dateObj.setHours(hours || 23, minutes || 59, 0, 0);

    handleControlPlan({ customExpiryDate: dateObj.toISOString() });
  };

  useEffect(() => {
    if (!planExpiryDate) {
      setCountdownStr("");
      return;
    }
    const calculate = () => {
      const diff = planExpiryDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr("Plan Expired");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(`${days}d ${hours}h ${mins}m ${secs}s remaining`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [merchant?.planExpiry]);

  const handleControlPlan = async (actionPayload) => {
    setIsExtending(true);
    toast.loading(`Processing admin action...`, { id: "ctrl-plan" });
    try {
      const res = await fetch(`/api/admin/merchants/${merchant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionPayload),
      });
      if (!res.ok) throw new Error("Failed to update merchant plan status.");
      toast.dismiss("ctrl-plan");
      toast.success(`Merchant plan updated successfully!`);
      queryClient.invalidateQueries();
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      toast.dismiss("ctrl-plan");
      toast.error(err.message || "Failed to update plan");
    } finally {
      setIsExtending(false);
    }
  };

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
              value="visuals"
              className="text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-700"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Store Media
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-700"
            >
              <CreditCard className="w-3.5 h-3.5" /> Subscription &amp; Payment
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

            {/* WEEKLY OPERATING HOURS SCHEDULE DISPLAY */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block border-b border-slate-200 pb-1">
                Weekly Store Operating Hours Schedule
              </span>
              {merchant.operatingHours && typeof merchant.operatingHours === "object" && Object.keys(merchant.operatingHours).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const dayData = merchant.operatingHours[day];
                    const isClosed = dayData ? (dayData.closed === true || dayData.isOpen === false) : false;
                    const isOpen = !isClosed;
                    const openTime = dayData?.open || dayData?.openTime || "10:00 AM";
                    const closeTime = dayData?.close || dayData?.closeTime || (day === "Sunday" ? "11:00 PM" : "08:00 PM");

                    return (
                      <div key={day} className={`p-2 rounded-lg border text-center ${isOpen ? "bg-white border-slate-200 shadow-2xs" : "bg-rose-50/60 border-rose-200"}`}>
                        <span className="text-[11px] font-bold text-slate-800 block">{day.slice(0, 3)}</span>
                        {isOpen ? (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold block mt-0.5">
                            {openTime} – {closeTime}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">CLOSED</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-700">
                  Mon–Sat 10:00 AM – 08:00 PM, Sun 10:00 AM – 11:00 PM
                </div>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
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
                  GSTIN Registration
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {merchant.isGstExempt
                    ? "Exempt Micro-Merchant"
                    : merchant.gstin || "Exempt / N/A"}
                </span>
              </div>
            </div>

            {/* PRIMARY IDENTITY DOCUMENT IMAGE PREVIEW */}
            {(() => {
              const docImgUrl =
                merchant.docImage ||
                merchant.docFileUrl ||
                merchant.docUrl ||
                merchant.identityDocumentUrl ||
                merchant.docFile;
              return (
                <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-200 text-center space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                    <span className="text-xs font-medium text-slate-900 block">
                      Primary Identity Document Image (
                      {merchant.docType || "GST Certificate"})
                    </span>
                    {docImgUrl && (
                      <a
                        href={docImgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Full Size Image
                      </a>
                    )}
                  </div>

                  {docImgUrl ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={docImgUrl}
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
              );
            })()}
          </TabsContent>

          {/* ── TAB 3: STORE VISUALS & PHOTOS ───────────────────────── */}
          <TabsContent value="visuals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const shopImgUrl =
                  merchant.shopImage ||
                  merchant.shopPhotoUrl ||
                  merchant.shopFrontUrl ||
                  merchant.storePhotoUrl;
                return (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 block">
                        Shop Front Photograph
                      </span>
                      {shopImgUrl && (
                        <a
                          href={shopImgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                    {shopImgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shopImgUrl}
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
                );
              })()}

              {(() => {
                const logoImgUrl =
                  merchant.logo || merchant.logoUrl || merchant.shopLogo;
                return (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 block">
                        Store Brand Logo
                      </span>
                      {logoImgUrl && (
                        <a
                          href={logoImgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                    {logoImgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoImgUrl}
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
                );
              })()}

              {(() => {
                const bannerImgUrl =
                  merchant.banner || merchant.bannerUrl || merchant.shopBanner;
                return (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 block">
                        Store Banner Image
                      </span>
                      {bannerImgUrl && (
                        <a
                          href={bannerImgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                    {bannerImgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bannerImgUrl}
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
                );
              })()}
            </div>
          </TabsContent>

          {/* ── TAB 4: SUBSCRIPTION & PAYMENT STATUS ─────────────────── */}
          <TabsContent value="subscription" className="space-y-3 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Card 1: Subscription Status & Expiry Overview */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Subscription &amp; Payment Status
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Active Plan &amp; Payment Status
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(() => {
                        const isStarter =
                          (merchant.plan || "starter").toLowerCase().includes("starter") ||
                          (merchant.plan || "").toLowerCase().includes("free");
                        const isPaymentDone =
                          isStarter ||
                          merchant.paymentStatus === "completed" ||
                          merchant.subscriptionStatus === "active";

                        return (
                          <>
                            <Badge className="bg-blue-600 text-white font-medium text-xs uppercase border-0 px-2 py-0.5 rounded-md">
                              Plan: {merchant.plan || "Starter Free"}
                            </Badge>
                            <Badge
                              className={
                                isStarter || isPaymentDone
                                  ? "bg-emerald-600 text-white font-medium text-xs uppercase border-0 px-2 py-0.5 rounded-md"
                                  : "bg-amber-500 text-white font-medium text-xs uppercase border-0 px-2 py-0.5 rounded-md animate-pulse"
                              }
                            >
                              {isStarter ? "FREE PLAN (ACTIVE)" : isPaymentDone ? "Payment Completed" : "Payment Pending"}
                            </Badge>
                          </>
                        );
                      })()}
                      {merchant.commissionRate && (
                        <Badge variant="outline" className="text-xs font-mono text-emerald-800 bg-emerald-50 border-emerald-200/80 font-medium px-2 py-0.5 rounded-md">
                          Commission: {merchant.commissionRate} ({merchant.commissionModel || "CPA"})
                        </Badge>
                      )}
                    </div>
                  </div>

                  {planExpiryDate && (
                    <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg p-2.5 space-y-2 text-xs text-blue-900 font-normal">
                      {/* Row 1: Exact Plan Expiry Date & Time */}
                      <div className="flex items-center gap-1.5 border-b border-blue-100/80 pb-1.5 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-slate-600 font-normal">Plan Expiry Date:</span>
                        <span className="font-semibold text-slate-800">
                          {planExpiryDate.toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>

                      {/* Row 2: Live Countdown Timer */}
                      {countdownStr && (
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                            <Clock className="w-3 h-3 text-blue-600 animate-pulse shrink-0" /> Time Remaining:
                          </span>
                          <span className="font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md text-xs font-mono whitespace-nowrap">
                            {countdownStr}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Super Admin Plan Control Center */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                  ⚡ Super Admin Plan Control Center
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Section 1: Compact Custom Date & Time Picker */}
                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" /> Custom Expiry Date &amp; Time (12h AM/PM):
                    </span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="h-7 text-xs font-normal px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="h-7 text-xs font-normal px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 w-24 shrink-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        disabled={isExtending || !customDate}
                        onClick={handleApplyCustomDate}
                        className="h-7 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 cursor-pointer shrink-0 border-0 shadow-none"
                      >
                        Set Date
                      </Button>
                    </div>
                  </div>

                  {/* Section 2: Quick Extend Days */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quick Extend Expiry:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ extendDays: 7 })}
                        className="h-6 text-xs font-medium text-blue-700 bg-blue-50/80 border-blue-200/80 hover:bg-blue-100 rounded-md cursor-pointer px-2"
                      >
                        +7 Days
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ extendDays: 30 })}
                        className="h-6 text-xs font-medium text-emerald-700 bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100 rounded-md cursor-pointer px-2"
                      >
                        +30 Days
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ extendDays: 90 })}
                        className="h-6 text-xs font-medium text-purple-700 bg-purple-50/80 border-purple-200/80 hover:bg-purple-100 rounded-md cursor-pointer px-2"
                      >
                        +90 Days
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ extendDays: 365 })}
                        className="h-6 text-xs font-medium text-amber-700 bg-amber-50/80 border-amber-200/80 hover:bg-amber-100 rounded-md cursor-pointer px-2"
                      >
                        +1 Year
                      </Button>
                    </div>
                  </div>

                  {/* Section 3: Lifecycle Actions */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Plan Lifecycle Actions:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {merchant.subscriptionStatus === "paused" || merchant.paymentStatus !== "completed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ action: "resume" })}
                          className="h-6 text-xs font-medium text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 rounded-md cursor-pointer px-2.5"
                        >
                          ▶ Resume / Activate Plan
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ action: "pause" })}
                          className="h-6 text-xs font-medium text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100 rounded-md cursor-pointer px-2.5"
                        >
                          ⏸ Pause Plan
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ action: "stop" })}
                        className="h-6 text-xs font-medium text-rose-800 bg-rose-50 border-rose-200 hover:bg-rose-100 rounded-md cursor-pointer px-2.5"
                      >
                        ⏹ Stop / Cancel Plan
                      </Button>
                    </div>
                  </div>

                  {/* Section 4: Switch Plan Tier */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Change Subscription Tier:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ plan: "starter" })}
                        className="h-6 text-xs font-medium text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200 rounded-md cursor-pointer px-2"
                      >
                        Starter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ plan: "growth" })}
                        className="h-6 text-xs font-medium text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100 rounded-md cursor-pointer px-2"
                      >
                        Growth
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ plan: "pro" })}
                        className="h-6 text-xs font-medium text-purple-800 bg-purple-50 border-purple-200 hover:bg-purple-100 rounded-md cursor-pointer px-2"
                      >
                        Pro
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isExtending}
                        onClick={() => handleControlPlan({ plan: "enterprise" })}
                        className="h-6 text-xs font-medium text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100 rounded-md cursor-pointer px-2"
                      >
                        Enterprise
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
