"use client";

import {
  Building,
  Building2,
  Check,
  ChevronRight,
  FileCheck,
  Globe,
  Hash,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  Map,
  MapPin,
  Phone,
  PhoneCall,
  Store,
  Upload,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { authClient, signUp } from "@/lib/auth-client";
import {
  INDIAN_CITIES,
  lookupByPincode,
  lookupStateByCity,
} from "@/utils/indianGeoLookup";

const CATEGORIES = [
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "food", label: "Food & Dining" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "home", label: "Home & Living" },
  { id: "home-improvement", label: "Home Improvement" },
  { id: "fitness", label: "Fitness & Healthcare" },
  { id: "education", label: "Education & Courses" },
  { id: "kids-baby", label: "Kids & Baby Products" },
  { id: "jewellery", label: "Jewellery & Accessories" },
  { id: "automotive", label: "Automobile & Auto Services" },
  { id: "entertainment", label: "Gaming & Entertainment" },
  { id: "grocery", label: "Grocery & Essentials" },
  { id: "finance", label: "Finance & Insurance" },
  { id: "others", label: "Others / Special Category" },
];

const BUSINESS_CONSTITUTIONS = [
  { id: "proprietorship", label: "Proprietorship" },
  { id: "partnership", label: "Partnership" },
  { id: "llp", label: "Limited Liability Partnership (LLP)" },
  { id: "pvt_ltd", label: "Private Limited Company (Pvt Ltd)" },
  { id: "others", label: "Others" },
];

const DESIGNATIONS = [
  { id: "owner", label: "Owner / Proprietor" },
  { id: "partner", label: "Managing Partner" },
  { id: "manager", label: "General Manager / Operations Head" },
  { id: "others", label: "Others / Authorized Liaison" },
];

const COMMISSION_TABLE = [
  { category: "Fashion & Clothing", rate: "5%" },
  { category: "Food & Dining", rate: "3% dine-in / 2% delivery" },
  { category: "Electronics & Gadgets", rate: "2.5% blended" },
  { category: "Beauty & Wellness", rate: "6% services" },
  { category: "Travel & Hospitality", rate: "5% hotels" },
  { category: "Home & Living / Improvement", rate: "2% – 5%" },
  { category: "Education & Courses", rate: "₹300 / lead" },
  { category: "Finance & Insurance", rate: "₹150 – ₹350 / lead" },
];

export function MerchantOnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState({});

  // File Uploading States
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingShopPhoto, setUploadingShopPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Location Geolocation State
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Sub-category tags
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoryTags, setSubCategoryTags] = useState([
    "Dine-in Offers",
    "Special Combos",
  ]);

  const [formData, setFormData] = useState({
    // Section A: Business Identity & Location
    registeredName: "",
    tradingName: "",
    constitution: "proprietorship",
    category: "food",
    customCategoryNotes: "",
    businessType: "Physical Store / Retail Shop",
    address: "",
    city: "Ranchi",
    state: "Jharkhand",
    pincode: "834001",
    latitude: "",
    longitude: "",

    // Section B: Contact & Account Setup
    contactName: "",
    designation: "owner",
    mobile: "",
    whatsapp: "",
    email: "",
    password: "",
    websiteUrl: "",
    instagramHandle: "",
    facebookUrl: "",
    googleUrl: "",

    // Section C: Documents & Uploads
    docType: "GST Registration Certificate",
    docFileUrl: "",
    shopPhotoUrl: "",
    logoUrl: "",
    bannerUrl: "",
    signatureUrl: "",

    // Section D: Plan
    selectedPlan: "starter",
    referralCode: "",

    // Section E: Commission & Hours
    commissionAgreed: false,
    openingTime: "10:00 AM",
    closingTime: "08:00 PM",

    // Section F: Declarations
    commit1: false,
    commit2: false,
    commit3: false,
    commit4: false,
    commit5: false,
    commit6: false,
    commit7: false,
    policy1: false,
    policy2: false,
    policy3: false,
    policy4: false,
    policy5: false,
    signatoryName: "",
    digitalInitials: "",
  });

  const MASTER_STEPS = [
    { stepNum: 1, title: "Business & Location", label: "Sections A & B" },
    { stepNum: 2, title: "Documents & Plan", label: "Sections C & D" },
    { stepNum: 3, title: "Hours & Submit", label: "Sections E & F" },
  ];

  const handleFileUpload = async (file, targetField, setUploadingState) => {
    if (!file) return;
    setUploadingState(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "merchants");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Upload failed");
      }

      const json = await res.json();
      const fileUrl = json.data?.url;
      setFormData((prev) => ({ ...prev, [targetField]: fileUrl }));
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "File upload failed.");
    } finally {
      setUploadingState(false);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setIsFetchingLocation(false);
        toast.success(
          `Location captured: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
        );
      },
      (err) => {
        setIsFetchingLocation(false);
        toast.error(
          "Could not fetch location. Please allow browser permissions.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && subCategoryInput.trim()) {
      e.preventDefault();
      if (!subCategoryTags.includes(subCategoryInput.trim())) {
        setSubCategoryTags([...subCategoryTags, subCategoryInput.trim()]);
      }
      setSubCategoryInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSubCategoryTags(subCategoryTags.filter((t) => t !== tagToRemove));
  };

  const notesWordCount = (formData.customCategoryNotes || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const checkDuplicateField = async (field, value) => {
    if (!value || !value.trim()) {
      setDuplicateErrors((prev) => ({ ...prev, [field]: null }));
      return true;
    }
    try {
      const res = await fetch("/api/merchants/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
      const json = await res.json();
      if (json.data && !json.data.available) {
        setDuplicateErrors((prev) => ({ ...prev, [field]: json.data.message }));
        toast.error(json.data.message);
        return false;
      } else {
        setDuplicateErrors((prev) => ({ ...prev, [field]: null }));
        return true;
      }
    } catch {
      return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.registeredName.trim())
        return toast.error("Please enter Registered Business Name");
      if (!formData.tradingName.trim())
        return toast.error("Please enter Brand / Trading Name");
      if (!formData.pincode || formData.pincode.length < 6)
        return toast.error("Please enter valid 6-digit Pincode");
      if (!formData.city.trim()) return toast.error("Please enter City");
      if (!formData.state.trim()) return toast.error("Please enter State");
      if (!formData.address.trim())
        return toast.error("Please enter Business Address");
    } else if (currentStep === 2) {
      if (!formData.contactName.trim())
        return toast.error("Please enter Contact Liaison Name");
      if (!formData.mobile.trim() || formData.mobile.length < 10)
        return toast.error("Please enter 10-digit Mobile Number");
      if (!formData.email.trim() || !formData.email.includes("@"))
        return toast.error("Please enter valid Business Email");
      if (!formData.password || formData.password.length < 6)
        return toast.error("Password must be at least 6 characters");

      const emailOk = await checkDuplicateField("email", formData.email);
      const phoneOk = await checkDuplicateField("phone", formData.mobile);
      if (!emailOk || !phoneOk) return;
    } else if (currentStep === 3) {
      if (!formData.docFileUrl) {
        return toast.error(
          `Please upload your ${formData.docType || "Primary Identity Document"} before proceeding to the next step.`,
        );
      }
      if (formData.gstin && !formData.isGstExempt) {
        const gstOk = await checkDuplicateField("gstin", formData.gstin);
        if (!gstOk) return;
      }
      if (formData.pan) {
        const panOk = await checkDuplicateField("pan", formData.pan);
        if (!panOk) return;
      }
    } else if (currentStep === 4) {
      if (!formData.selectedPlan) return toast.error("Please select a Plan");
    } else if (currentStep === 5) {
      if (!formData.commissionAgreed)
        return toast.error("Please confirm acceptance of category commission");
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.commit1 ||
      !formData.commit2 ||
      !formData.commit3 ||
      !formData.commit4 ||
      !formData.commit5 ||
      !formData.commit6 ||
      !formData.commit7
    ) {
      toast.error("Please accept all 7 Merchant Commitments");
      return;
    }
    if (
      !formData.policy1 ||
      !formData.policy2 ||
      !formData.policy3 ||
      !formData.policy4 ||
      !formData.policy5
    ) {
      toast.error("Please accept all Policy Agreements");
      return;
    }
    const effectiveSignatoryName = (
      formData.contactName ||
      formData.signatoryName ||
      ""
    ).trim();
    if (!effectiveSignatoryName) {
      toast.error("Please enter Authorized Liaison Name in Section B first");
      return;
    }
    if (!formData.signatureUrl) {
      toast.error("Please upload Authorised Digital Signature Image");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create User via Auth if not already logged in
      if (!authUser) {
        const { data, error } = await signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.tradingName || formData.registeredName,
          data: {
            role: "merchant",
            phoneNumber: formData.mobile,
          },
        });

        if (
          error &&
          !error.message?.includes("already registered") &&
          !error.message?.includes("already exists")
        ) {
          throw new Error(error.message || "Registration failed.");
        }
      }

      const cleanPhone = (p) => (p || "").replace(/\D/g, "").slice(-10);
      const cleanUrl = (u) => {
        if (!u || !u.trim()) return "";
        const trimmed = u.trim();
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      };

      // 2. Create In-Depth Merchant DB Record for Admin Panel
      const merchantPayload = {
        businessName: formData.tradingName || formData.registeredName,
        slug:
          (formData.tradingName || formData.registeredName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || `merchant-${Date.now()}`,
        category: formData.category,
        customCategoryNotes: formData.customCategoryNotes,
        constitution: formData.constitution,
        location: {
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
          country: "IN",
          coordinates: {
            lat: formData.latitude ? Number(formData.latitude) : undefined,
            lng: formData.longitude ? Number(formData.longitude) : undefined,
          },
        },
        contactEmail: (formData.email || authUser?.email || "").toLowerCase().trim(),
        contactPhone: cleanPhone(formData.mobile || authUser?.phoneNumber),
        whatsappNumber: cleanPhone(formData.whatsapp || formData.mobile),
        website: cleanUrl(formData.websiteUrl),
        liaisonName: effectiveSignatoryName,
        signatoryName: effectiveSignatoryName,
        liaisonDesignation: formData.designation,
        liaisonPhone: cleanPhone(formData.mobile),
        docType: formData.docType,
        docImage: formData.docFileUrl,
        shopImage: formData.shopPhotoUrl,
        logo: formData.logoUrl,
        banner: formData.bannerUrl,
        signatureImage: formData.signatureUrl,
        plan: formData.selectedPlan,
        gmapsLink: cleanUrl(formData.googleUrl),
      };

      const merchantRes = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merchantPayload),
      });

      if (!merchantRes.ok) {
        const errJson = await merchantRes.json().catch(() => ({}));
        throw new Error(
          errJson.message ||
            errJson.error ||
            "Failed to submit merchant application.",
        );
      }

      // Force-refresh session & invalidate query keys
      try {
        await authClient.getSession({ query: { disableCookieCache: true } });
      } catch (_) {}

      await queryClient.invalidateQueries({
        queryKey: ["merchant-application-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });

      toast.success(
        "Application submitted! Welcome to Vouchiqo for Merchants.",
      );

      router.push("/merchant/application-status");
    } catch (err) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMasterStep = currentStep <= 2 ? 1 : currentStep <= 4 ? 2 : 3;

  return (
    <div className="w-full max-w-5xl mx-auto pt-0 pb-4 px-2 sm:px-4 space-y-4 text-left font-sans text-slate-900">
      {/* Top Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center space-y-1">
        <Badge
          variant="outline"
          className="bg-blue-600 text-white border-0 text-[10px] font-semibold px-2.5 py-0.5 rounded"
        >
          Founding Merchant Program Active
        </Badge>
        <p className="text-xs font-medium text-blue-900">
          Rates locked for 6 months • 24–48 hrs approval • ₹0 Starter plan
          available
        </p>
      </div>

      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Merchant Onboarding Application
        </h1>
        <p className="text-xs text-slate-500 font-normal">
          Fill in your store details to list offers and reach Ranchi shoppers
        </p>
      </div>

      {/* 3-Step Header Bar */}
      <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MASTER_STEPS.map((m) => {
            const isActive = activeMasterStep === m.stepNum;
            const isCompleted = activeMasterStep > m.stepNum;
            return (
              <div
                key={m.stepNum}
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                  isActive
                    ? "border-blue-600 bg-blue-50/60 shadow-2xs"
                    : isCompleted
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-100 bg-slate-50/40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    m.stepNum
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-semibold uppercase text-slate-400 block leading-tight">
                    Step {m.stepNum}: {m.label}
                  </span>
                  <span
                    className={`text-xs font-semibold block leading-tight ${
                      isActive ? "text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {m.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* SECTION 1: BUSINESS IDENTITY & LOCATION */}
      {currentStep === 1 && (
        <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section A: Business Identity &amp; Location
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Enter legal registered name and store operating address
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 1 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Registered Business Name{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Marbella Tiles & Sanitary Pvt Ltd"
                    value={formData.registeredName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredName: e.target.value,
                      })
                    }
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Brand / Store Display Name{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Marbella"
                    value={formData.tradingName}
                    onChange={(e) =>
                      setFormData({ ...formData, tradingName: e.target.value })
                    }
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Business Constitution <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.constitution}
                  onValueChange={(val) =>
                    setFormData({ ...formData, constitution: val })
                  }
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs">
                    <SelectValue placeholder="Select constitution" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {BUSINESS_CONSTITUTIONS.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Primary Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Category Custom Field & Explanation */}
            {formData.category === "others" && (
              <div className="space-y-3 p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-blue-950">
                    Custom Category Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Handmade Crafts, Event Management, Niche Services..."
                    value={formData.customCategoryName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customCategoryName: e.target.value,
                      })
                    }
                    className="bg-white border-slate-300 text-xs rounded-lg h-9 px-3 font-normal text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-blue-950">
                      Explain your business &amp; products in detail{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <span
                      className={`text-[11px] font-mono ${
                        notesWordCount >= 20
                          ? "text-emerald-700 font-bold"
                          : "text-amber-700 font-semibold"
                      }`}
                    >
                      Word count: {notesWordCount} / 20 min
                    </span>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Describe your special business offerings, unique products, services, target customers, and store operational setup in detail (minimum 20 words required for manual admin verification)..."
                    value={formData.customCategoryNotes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customCategoryNotes: e.target.value,
                      })
                    }
                    className="bg-white border-slate-200 text-xs rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all"
                  />
                  {notesWordCount < 20 && (
                    <p className="text-[10px] text-amber-700 font-medium">
                      ⚠️ Please write at least {20 - notesWordCount} more word(s)
                      explaining your business for admin verification.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Category Chips */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">
                Sub-Category Tags Chips (Press Enter)
              </Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg min-h-[38px] items-center shadow-2xs">
                {subCategoryTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-white text-slate-800 border-slate-300 text-xs font-medium py-0.5 px-2 flex items-center gap-1 shadow-2xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  type="text"
                  placeholder="Type tag & press Enter..."
                  value={subCategoryInput}
                  onChange={(e) => setSubCategoryInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-xs outline-none flex-1 min-w-[140px] font-normal text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Operating Store Address & Google Maps Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Operating Store Address{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Shop No. 14, Lalpur Chowk, Main Road, Ranchi, Jharkhand – 834001"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="bg-white border-slate-300 text-xs rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Google Maps / GMB Profile Location Link{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  rows={2}
                  placeholder="https://maps.google.com/?q=... or GMB Profile Link"
                  value={formData.googleUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleUrl: e.target.value })
                  }
                  className="bg-white border-slate-300 text-xs rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  PIN Code <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="834001"
                    value={formData.pincode}
                    onChange={async (e) => {
                      const pin = e.target.value;
                      setFormData((prev) => ({ ...prev, pincode: pin }));
                      if (pin.length === 6) {
                        const geo = await lookupByPincode(pin);
                        if (geo) {
                          setFormData((prev) => ({
                            ...prev,
                            city: geo.city || prev.city,
                            state: geo.state || prev.state,
                          }));
                        }
                      }
                    }}
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-mono font-medium focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  City / District <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => {
                    const geo = lookupStateByCity(val);
                    setFormData((prev) => ({
                      ...prev,
                      city: val,
                      state: geo ? geo.state : prev.state,
                      pincode:
                        geo && !prev.pincode ? geo.pincode : prev.pincode,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {INDIAN_CITIES.map((c) => (
                      <SelectItem
                        key={`${c.city}-${c.state}`}
                        value={c.city}
                        className="text-xs"
                      >
                        {c.city} ({c.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  State
                </Label>
                <div className="relative">
                  <Map className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="pl-8 bg-slate-50 border-slate-300 text-xs h-9 rounded-lg font-medium text-slate-900 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* GPS Geolocation Fetching */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-semibold text-blue-900 block">
                  Store GPS Coordinates
                </span>
                {formData.latitude && formData.longitude ? (
                  <span className="text-[11px] font-mono text-emerald-700 font-medium block">
                    ✓ Captured: {formData.latitude}° N, {formData.longitude}° E
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 block font-normal">
                    Fetch exact store latitude &amp; longitude for Google Maps
                    navigation
                  </span>
                )}
              </div>
              <Button
                type="button"
                onClick={handleFetchLocation}
                disabled={isFetchingLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 px-3 rounded-md border-0 shrink-0 cursor-pointer shadow-2xs"
              >
                {isFetchingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                <span>Fetch GPS Coordinates</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION 2: CONTACT & ACCOUNT SETUP */}
      {currentStep === 2 && (
        <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section B: Contact Details &amp; Account Setup
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Management liaison contact and account login password
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 2 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Authorized Liaison Name{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Rajan Kumar Singh"
                    value={formData.contactName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        contactName: val,
                        signatoryName: val,
                      }));
                    }}
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Designation <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.designation}
                  onValueChange={(val) =>
                    setFormData({ ...formData, designation: val })
                  }
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs">
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {DESIGNATIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile & WhatsApp Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Primary Mobile Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-700">
                    WhatsApp Number{" "}
                    <span className="text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.mobile) {
                        toast.error(
                          "Please enter Primary Mobile Number first.",
                        );
                        return;
                      }
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: prev.mobile,
                      }));
                      toast.success("Copied Primary Mobile to WhatsApp!");
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer flex items-center gap-1"
                  >
                    ✓ Same as Primary Mobile
                  </button>
                </div>
                <div className="relative">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Business Email (Login ID){" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="info@marbella.in"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Create Password <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Social Web Links */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                Web Presence &amp; Social Links (Optional)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Website URL
                  </Label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://www.marbella.in"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                      className="pl-8 bg-white border-slate-300 text-xs h-8.5 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Instagram Handle
                  </Label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="@marbellatiles"
                      value={formData.instagramHandle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagramHandle: e.target.value,
                        })
                      }
                      className="pl-8 bg-white border-slate-300 text-xs h-8.5 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Facebook URL
                  </Label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://facebook.com/marbellatiles"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facebookUrl: e.target.value,
                        })
                      }
                      className="pl-8 bg-white border-slate-300 text-xs h-8.5 rounded-lg font-normal placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="text-slate-700 text-xs font-medium rounded-lg h-9 px-4 cursor-pointer"
            >
              &lt; Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION 3: BUSINESS VERIFICATION DOCUMENTS (Cloudinary Uploads) */}
      {currentStep === 3 && (
        <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section C: Business Verification Documents
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Upload image or document proof for Verified Merchant Badge
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 3 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Primary Document Type */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">
                Primary Identity Document Type{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.docType}
                onValueChange={(val) =>
                  setFormData({ ...formData, docType: val })
                }
              >
                <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  <SelectItem
                    value="GST Registration Certificate"
                    className="text-xs"
                  >
                    GST Registration Certificate (Preferred)
                  </SelectItem>
                  <SelectItem
                    value="Udyam / MSME Certificate"
                    className="text-xs"
                  >
                    Udyam / MSME Registration Certificate
                  </SelectItem>
                  <SelectItem value="Trade Licence" className="text-xs">
                    Trade Licence (Municipal Corporation)
                  </SelectItem>
                  <SelectItem
                    value="Shop & Establishment Act"
                    className="text-xs"
                  >
                    Shop &amp; Establishment Act Certificate
                  </SelectItem>
                  <SelectItem value="Owner PAN Card" className="text-xs">
                    Owner PAN Card
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cloudinary Document Upload */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">
                Upload {formData.docType || "Primary Identity Document"}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center gap-2 text-xs">
                {formData.docFileUrl ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a
                      href={formData.docFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline font-medium truncate block max-w-[320px]"
                    >
                      View Uploaded Document
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-500 font-normal">
                    Select document image (JPG, PNG, WebP) up to 5 MB
                  </span>
                )}
                <div className="relative w-full max-w-xs">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(
                        e.target.files[0],
                        "docFileUrl",
                        setUploadingDoc,
                      )
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    disabled={uploadingDoc}
                  />
                  <Button
                    type="button"
                    disabled={uploadingDoc}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-4 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-2 mx-auto"
                  >
                    {uploadingDoc ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {formData.docFileUrl
                        ? `Change ${formData.docType || "Document"}`
                        : `Upload ${formData.docType || "Document"}`}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 3 Store Visual Images Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* 1. Shop Photograph */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Shop Photograph
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    1200x800px
                  </span>
                </div>
                <div className="border border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2 h-32 overflow-hidden transition-all">
                  {formData.shopPhotoUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.shopPhotoUrl}
                        alt="Shop Photograph"
                        className="max-h-16 max-w-full object-contain rounded-md border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Shop Photo Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Shop Photo
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "shopPhotoUrl",
                          setUploadingShopPhoto,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingShopPhoto}
                    />
                    <Button
                      type="button"
                      disabled={uploadingShopPhoto}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7.5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingShopPhoto ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.shopPhotoUrl
                          ? "Change Photo"
                          : "Upload Shop Photo"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. Store Logo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Store Logo
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    400x400px (PNG)
                  </span>
                </div>
                <div className="border border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2 h-32 overflow-hidden transition-all">
                  {formData.logoUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.logoUrl}
                        alt="Store Logo"
                        className="max-h-16 max-w-full object-contain rounded-md border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Logo Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Store Logo
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "logoUrl",
                          setUploadingLogo,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      disabled={uploadingLogo}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7.5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.logoUrl ? "Change Logo" : "Upload Store Logo"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 3. Banner Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Banner Image
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    1200x400px
                  </span>
                </div>
                <div className="border border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2 h-32 overflow-hidden transition-all">
                  {formData.bannerUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.bannerUrl}
                        alt="Banner Image"
                        className="max-h-16 max-w-full object-contain rounded-md border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Banner Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Banner Image
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "bannerUrl",
                          setUploadingBanner,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingBanner}
                    />
                    <Button
                      type="button"
                      disabled={uploadingBanner}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7.5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingBanner ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.bannerUrl
                          ? "Change Banner"
                          : "Upload Banner Image"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="text-slate-700 text-xs font-medium rounded-lg h-9 px-4 cursor-pointer"
            >
              &lt; Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION 4: PLAN SELECTION */}
      {currentStep === 4 && (
        <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section D: Select Subscription Plan
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Choose a plan matching your scale (14-day free trial on paid
                tiers)
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 4 of 6
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: "starter",
                name: "STARTER FREE",
                price: "₹0 / Free",
                desc: "Up to 3 active listings, performance commission applies from Day 1",
                badge: "Popular",
              },
              {
                id: "growth",
                name: "GROWTH PARTNER",
                price: "₹999/mo",
                desc: "Up to 15 active listings, 4 campaigns/yr, 14-day free trial",
                badge: "Founding Rate (-33%)",
              },
              {
                id: "pro",
                name: "PRO PARTNER",
                price: "₹2,999/mo",
                desc: "Unlimited listings, 50 revivals/mo, push sends included",
                badge: "Best Value",
              },
              {
                id: "enterprise",
                name: "ENTERPRISE",
                price: "Custom Pricing",
                desc: "Unlimited listings + dedicated account manager &amp; API access",
                badge: "Scale",
              },
            ].map((plan) => {
              const isSelected = formData.selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() =>
                    setFormData({ ...formData, selectedPlan: plan.id })
                  }
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-900">
                      {plan.name}
                    </span>
                    <Badge className="text-[9px] bg-slate-100 text-slate-700 font-medium border-0">
                      {plan.badge}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-blue-600 block">
                    {plan.price}
                  </span>
                  <p className="text-[11px] text-slate-500 font-normal mt-1">
                    {plan.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-1 pt-1">
            <Label className="text-xs font-medium text-slate-700">
              Referral Code (Optional)
            </Label>
            <div className="relative">
              <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="FOUNDING100"
                value={formData.referralCode}
                onChange={(e) =>
                  setFormData({ ...formData, referralCode: e.target.value })
                }
                className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-mono uppercase font-normal focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
              className="text-slate-700 text-xs font-medium rounded-lg h-9 px-4 cursor-pointer"
            >
              &lt; Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION 5: COMMISSION & HOURS */}
      {currentStep === 5 && (
        <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section E: Category Commission &amp; Store Hours
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Category commission structure and store opening timings
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 5 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
                Performance Commission Rates (Day 1 Applicable)
              </Label>
              <div className="text-[11px] text-slate-600 space-y-1">
                {COMMISSION_TABLE.map((c) => (
                  <div
                    key={c.category}
                    className="flex justify-between border-b border-slate-200/60 pb-0.5"
                  >
                    <span className="font-normal">{c.category}:</span>
                    <span className="font-mono text-blue-700 font-semibold">
                      {c.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 bg-blue-50/50 border border-blue-200 rounded-lg cursor-pointer">
              <Checkbox
                checked={formData.commissionAgreed}
                onCheckedChange={(val) =>
                  setFormData({ ...formData, commissionAgreed: !!val })
                }
              />
              <span className="text-xs font-medium text-slate-900">
                I acknowledge and accept the Vouchiqo performance commission
                structure for my primary category.
              </span>
            </label>

            <div className="space-y-2 pt-1 border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
                Store Operating Hours
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">
                    Opening Time
                  </Label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="10:00 AM"
                      value={formData.openingTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openingTime: e.target.value,
                        })
                      }
                      className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">
                    Closing Time
                  </Label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="08:00 PM"
                      value={formData.closingTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          closingTime: e.target.value,
                        })
                      }
                      className="pl-8 bg-white border-slate-300 text-xs h-9 rounded-lg font-normal focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(4)}
              className="text-slate-700 text-xs font-medium rounded-lg h-9 px-4 cursor-pointer"
            >
              &lt; Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-5 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION 6: DECLARATIONS & SUBMIT */}
      {currentStep === 6 && (
        <Card className="border border-slate-200 shadow-2xs rounded-lg bg-white p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section F: Declarations, Agreements &amp; Submission
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Final merchant commitments, policy agreements &amp; digital
                signature
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 6 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              7 Merchant Commitments (Mandatory)
            </Label>
            {[
              {
                key: "commit1",
                text: "All submitted business information is accurate and real.",
              },
              {
                key: "commit2",
                text: "I will honour every verified offer published on Vouchiqo.",
              },
              {
                key: "commit3",
                text: "I will submit only genuine, working offer codes and deals.",
              },
              {
                key: "commit4",
                text: "I will enter actual transaction values when confirming codes.",
              },
              {
                key: "commit5",
                text: "I understand Vouchiqo earns performance commission.",
              },
              {
                key: "commit6",
                text: "I will keep counter staff informed about active offers.",
              },
              {
                key: "commit7",
                text: "I will pause offers if stock runs out or terms change.",
              },
            ].map((c) => (
              <label
                key={c.key}
                className="flex items-start gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
              >
                <Checkbox
                  checked={formData[c.key]}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, [c.key]: !!val })
                  }
                  className="mt-0.5"
                />
                <span className="font-normal text-slate-800">{c.text}</span>
              </label>
            ))}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
                Policy Agreements
              </Label>
              {[
                { key: "policy1", text: "Agree to Merchant Agreement" },
                { key: "policy2", text: "Agree to Terms of Service" },
                { key: "policy3", text: "Agree to Privacy Policy" },
                { key: "policy4", text: "Agree to Verification Policy" },
                {
                  key: "policy5",
                  text: "Agree to Refund & Cancellation Policy",
                },
              ].map((p) => (
                <label
                  key={p.key}
                  className="flex items-center gap-2 text-xs font-normal text-slate-700 cursor-pointer"
                >
                  <Checkbox
                    checked={formData[p.key]}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, [p.key]: !!val })
                    }
                  />
                  <span>{p.text}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-700">
                    Authorised Signatory Full Name{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                    ✓ Auto-synced from Authorized Liaison Name (Section B)
                  </span>
                </div>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    readOnly
                    value={
                      formData.contactName ||
                      formData.signatoryName ||
                      "Fill Authorized Liaison Name in Section B"
                    }
                    className="pl-8 bg-slate-100 border-slate-300 text-xs h-9 rounded-lg font-medium text-slate-800 cursor-not-allowed shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Cloudinary Signature Image Upload */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-slate-700">
                  Authorised Digital Signature Image{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] text-slate-400 font-normal">
                  Clear signature photo on paper (Max 5MB)
                </span>
              </div>
              <div className="border border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 transition-all">
                {formData.signatureUrl ? (
                  <div className="space-y-1.5 w-full flex flex-col items-center">
                    <img
                      src={formData.signatureUrl}
                      alt="Uploaded Signature"
                      className="h-20 max-w-full object-contain border border-slate-200 rounded-lg bg-white p-1.5 shadow-2xs"
                    />
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Signature Image Uploaded
                      Successfully
                    </span>
                  </div>
                ) : (
                  <div className="py-2 flex flex-col items-center space-y-1">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      Upload photo or scanned image of authorized signature
                      (JPG, PNG)
                    </span>
                  </div>
                )}
                <div className="relative w-full max-w-xs">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(
                        e.target.files[0],
                        "signatureUrl",
                        setUploadingSignature,
                      )
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    disabled={uploadingSignature}
                  />
                  <Button
                    type="button"
                    disabled={uploadingSignature}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {uploadingSignature ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {formData.signatureUrl
                        ? "Change Signature Image"
                        : "Upload Signature Image"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(5)}
              className="text-slate-700 text-xs font-medium rounded-lg h-9 px-4 cursor-pointer"
            >
              &lt; Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-6 rounded-lg shadow-2xs border-0 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
