"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import { Button } from "@/components/ui/button";

import Step1Identity from "./components/Step1Identity";
import Step2Location from "./components/Step2Location";
import Step3KYC from "./components/Step3KYC";
import Step4Bank from "./components/Step4Bank";

export default function MerchantBusinessProfile() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    slug: "",
    category: "food",
    description: "",
    shortDescription: "",
    longDescription: "",
    contactEmail: "",
    website: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "IN",
    contactPhone: "",
    whatsappNumber: "",
    businessType: "both",
    operatingHours: {
      Monday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Tuesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Wednesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Thursday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Friday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Saturday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Sunday: { open: "09:00 AM", close: "09:00 PM", closed: true },
    },
    logo: "",
    banner: "",
    autoApproveRevival: false,

    // B2B KYC & Financial particulars
    constitution: "proprietorship",
    liaisonName: "",
    liaisonDesignation: "owner",
    liaisonPhone: "",
    regionalHubCity: "ranchi",
    gmapsLink: "",
    pan: "",
    gstin: "",
    isGstExempt: false,
    bankDetails: {
      holderName: "",
      accountType: "current",
      accountNumber: "",
      ifsc: "",
      bankName: "",
      branchName: "",
      chequeImage: "",
    },
    shopImage: "",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingShop, setUploadingShop] = useState(false);
  const [uploadingCheque, setUploadingCheque] = useState(false);

  // Fetch the current merchant's profile
  const {
    data: merchant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error("Failed to load business profile");
      const json = await res.json();
      return json.data;
    },
  });

  // Populate form fields when profile is fetched
  useEffect(() => {
    if (merchant) {
      setIsEditing(false); // Default to status view if profile already exists
      setFormData({
        businessName: merchant.businessName ?? "",
        slug: merchant.slug ?? "",
        category: merchant.category ?? "food",
        description: merchant.description ?? "",
        shortDescription: merchant.shortDescription ?? merchant.description ?? "",
        longDescription: merchant.longDescription ?? "",
        contactEmail: merchant.contactEmail ?? "",
        website: merchant.website ?? "",
        address: merchant.location?.address ?? "",
        pincode: merchant.location?.pincode ?? "",
        city: merchant.location?.city ?? "",
        state: merchant.location?.state ?? "",
        country: merchant.location?.country ?? "IN",
        contactPhone: merchant.contactPhone ?? "",
        whatsappNumber: merchant.whatsappNumber ?? "",
        businessType: merchant.businessType ?? "both",
        operatingHours: merchant.operatingHours ?? {
          Monday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Tuesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Wednesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Thursday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Friday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Saturday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Sunday: { open: "09:00 AM", close: "09:00 PM", closed: true },
        },
        logo: merchant.logo ?? "",
        banner: merchant.banner ?? "",
        autoApproveRevival: merchant.autoApproveRevival ?? false,

        // KYC particulars
        constitution: merchant.constitution ?? "proprietorship",
        liaisonName: merchant.liaisonName ?? "",
        liaisonDesignation: merchant.liaisonDesignation ?? "owner",
        liaisonPhone: merchant.liaisonPhone ?? "",
        regionalHubCity: merchant.regionalHubCity ?? "ranchi",
        gmapsLink: merchant.gmapsLink ?? "",
        pan: merchant.pan ?? "",
        gstin: merchant.gstin ?? "",
        isGstExempt: merchant.isGstExempt ?? false,
        bankDetails: {
          holderName: merchant.bankDetails?.holderName ?? "",
          accountType: merchant.bankDetails?.accountType ?? "current",
          accountNumber: merchant.bankDetails?.accountNumber ?? "",
          ifsc: merchant.bankDetails?.ifsc ?? "",
          bankName: merchant.bankDetails?.bankName ?? "",
          branchName: merchant.bankDetails?.branchName ?? "",
          chequeImage: merchant.bankDetails?.chequeImage ?? "",
        },
        shopImage: merchant.shopImage ?? "",
      });
    } else {
      setIsEditing(true);
    }
  }, [merchant]);

  const handleBusinessNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const update = { ...prev, businessName: val };
      if (!merchant) {
        update.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return update;
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", field);

    if (field === "logo") setUploadingLogo(true);
    if (field === "banner") setUploadingBanner(true);
    if (field === "shopImage") setUploadingShop(true);
    if (field === "bankDetails.chequeImage") setUploadingCheque(true);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      const imageUrl = json.data?.url;

      if (field.startsWith("bankDetails.")) {
        const key = field.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          bankDetails: { ...prev.bankDetails, [key]: imageUrl }
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: imageUrl }));
      }
      toast.success("Document uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      if (field === "logo") setUploadingLogo(false);
      if (field === "banner") setUploadingBanner(false);
      if (field === "shopImage") setUploadingShop(false);
      if (field === "bankDetails.chequeImage") setUploadingCheque(false);
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.businessName) return "Business name is required.";
      if (!formData.slug) return "Business profile URL slug is required.";
      if (!formData.contactEmail) return "Contact email is required.";
      if (formData.liaisonPhone && !/^\d{10}$/.test(formData.liaisonPhone)) {
        return "Liaison phone number must be exactly 10 digits.";
      }
    }
    if (currentStep === 2) {
      if (!formData.address) return "Complete physical store address is required.";
      if (!formData.city) return "Store city location is required.";
      if (!formData.gmapsLink) return "Google Maps navigation link is required.";
      const gmapsRegex = /^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)\//i;
      if (!gmapsRegex.test(formData.gmapsLink)) {
        return "Google Maps hyperlink must use domain prefix like https://www.google.com/maps/ or https://maps.app.goo.gl/";
      }
    }
    if (currentStep === 3) {
      const panTrimmed = (formData.pan || "").trim().toUpperCase();
      if (panTrimmed && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panTrimmed)) {
        return "Invalid PAN format. Must be a valid 10-character code (e.g. ABCDE1234F).";
      }
      if (!formData.isGstExempt) {
        if (!formData.gstin) return "GSTIN is required unless you declare GST exemption below.";
        const gstinTrimmed = (formData.gstin || "").trim().toUpperCase();
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinTrimmed)) {
          return "Invalid GSTIN format (15 characters e.g. 22AAAAA1111A1Z1).";
        }
      }
    }
    if (currentStep === 4) {
      if (!formData.bankDetails.holderName) return "Bank account holder name is required.";
      if (!formData.bankDetails.accountNumber) return "Account number is required.";
      const accNumTrimmed = (formData.bankDetails.accountNumber || "").trim();
      if (!/^\d{9,18}$/.test(accNumTrimmed)) {
        return "Bank account number must be between 9 to 18 digits.";
      }
      if (!formData.bankDetails.ifsc) return "IFSC code is required.";
      const ifscTrimmed = (formData.bankDetails.ifsc || "").trim().toUpperCase();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscTrimmed)) {
        return "Invalid Bank IFSC format (e.g. HDFC0000123).";
      }
    }
    return null;
  };

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Save profile mutation (POST to create, PUT to update)
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const url = merchant ? `/api/merchants/${merchant._id}` : "/api/merchants";
      const method = merchant ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Failed to save profile details");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      toast.success("Profile onboarding details submitted successfully!");
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to save profile. Try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMsg = validateStep(4);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    const payload = {
      ...formData,
      pan: (formData.pan || "").trim().toUpperCase(),
      gstin: (formData.gstin || "").trim().toUpperCase(),
      bankDetails: {
        ...formData.bankDetails,
        holderName: (formData.bankDetails.holderName || "").trim(),
        accountNumber: (formData.bankDetails.accountNumber || "").trim(),
        ifsc: (formData.bankDetails.ifsc || "").trim().toUpperCase(),
      },
      location: {
        address: formData.address,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      }
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Business Profile" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="settings" />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Business Profile" user={{ role: "merchant" }}>
        <div className="text-center py-20 text-brand-error font-semibold">
          Error loading profile. Please refresh the page.
        </div>
      </DashboardLayout>
    );
  }

  if (!isEditing && merchant) {
    return (
      <DashboardLayout
        title="Business Profile Onboarding"
        user={{
          name: merchant.businessName || "Merchant Partner",
          role: "merchant",
        }}
      >
        <div className="max-w-2xl mx-auto mt-8 text-left font-sans">
          {merchant.status === "pending" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md text-center space-y-6">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-200 shadow-sm">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-black text-slate-800 uppercase tracking-wide">
                  Application Under Review
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Your business profile registration has been successfully submitted and is under review. Our admins are checking your KYC credentials and bank settlement details. You will receive an email notice once approved.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-none"
                >
                  Edit Submitted Details
                </Button>
              </div>
            </div>
          )}

          {merchant.status === "approved" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-black text-slate-800 uppercase tracking-wide">
                  Account Verified &amp; Active
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Congratulations! Your merchant account is fully verified. You can now create new coupons, launch campaigns, and monitor store redemptions.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-none"
                >
                  Modify Profile Details
                </Button>
              </div>
            </div>
          )}

          {merchant.status === "rejected" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md text-center space-y-6">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-200 shadow-sm">
                <X className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-black text-slate-800 uppercase tracking-wide">
                  Application Rejected
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Unfortunately, your onboarding application was rejected by the admin team. Please review the reason below, correct the necessary particulars, and resubmit.
                </p>
              </div>
              {merchant.rejectionReason && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-bold text-rose-700 text-left">
                  <span className="block uppercase tracking-wider text-[10px] text-rose-500 font-black mb-1">
                    Admin Feedback:
                  </span>
                  {merchant.rejectionReason}
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-none"
                >
                  Correct &amp; Resubmit Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Business Profile Onboarding"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-6 text-left font-sans">
        {/* Step Indicator tracker */}
        <div className="bg-brand-bg border border-brand-border p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-base font-bold text-brand-navy">
              KYC &amp; Business Profile Wizard
            </h3>
            <div className="flex items-center gap-3">
              {merchant && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-brand-subtext hover:text-brand-navy cursor-pointer transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <span className="text-xs font-bold text-brand-blue uppercase">
                Step {step} of 4
              </span>
            </div>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step >= s ? "bg-brand-blue" : "bg-brand-surface border border-brand-border"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {saveMutation.isSuccess && (
            <div className="flex gap-2.5 p-3.5 rounded-lg bg-brand-success/5 border border-brand-success/15 text-brand-success text-xs font-semibold items-center">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>KYC Profile Details Saved! Awaiting admin activation.</span>
            </div>
          )}

          {step === 1 && (
            <Step1Identity
              formData={formData}
              setFormData={setFormData}
              handleBusinessNameChange={handleBusinessNameChange}
            />
          )}

          {step === 2 && (
            <Step2Location
              formData={formData}
              setFormData={setFormData}
              handleImageUpload={handleImageUpload}
              uploadingShop={uploadingShop}
              uploadingLogo={uploadingLogo}
              uploadingBanner={uploadingBanner}
            />
          )}

          {step === 3 && (
            <Step3KYC
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {step === 4 && (
            <Step4Bank
              formData={formData}
              setFormData={setFormData}
              handleImageUpload={handleImageUpload}
              uploadingCheque={uploadingCheque}
            />
          )}

          {/* Stepper Wizard Controls */}
          <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-4 rounded-xl shadow-sm">
            <Button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="bg-brand-surface border border-brand-border hover:bg-slate-50 text-brand-navy text-xs h-9 px-4 flex items-center gap-1 font-bold rounded-lg cursor-pointer shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-brand-blue hover:bg-blue-600 text-white text-xs h-9 px-4 flex items-center gap-1 font-bold rounded-lg cursor-pointer border-0 shadow-none ml-auto"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs h-9 px-6 flex items-center gap-1 font-bold rounded-lg cursor-pointer border-0 shadow-none ml-auto"
              >
                <span>{saveMutation.isPending ? "Submitting..." : "Submit Registration"}</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
