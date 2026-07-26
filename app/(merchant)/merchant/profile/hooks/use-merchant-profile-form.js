"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useZodForm } from "@/hooks/use-zod-form";
import { showError, showSuccess } from "@/lib/toast";
import {
  merchantProfileSchema,
  STEP_FIELDS,
} from "../schemas/merchant-profile-schema";

/**
 * Custom hook managing merchant business profile state, Zod validation,
 * step navigation guards, image uploads, and profile save mutations.
 */
export function useMerchantProfileForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingShop, setUploadingShop] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const form = useZodForm({
    schema: merchantProfileSchema,
    defaultValues: {
      businessName: "",
      slug: "",
      category: "food",
      description: "",
      contactEmail: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      country: "IN",
      lat: "",
      lng: "",
      contactPhone: "",
      constitution: "proprietorship",
      liaisonName: "",
      liaisonDesignation: "owner",
      liaisonPhone: "",
      gmapsLink: "",
      docType: "GST Registration Certificate",
      docImage: "",
      pan: "",
      gstin: "",
      isGstExempt: false,
      bankHolderName: "",
      bankAccountType: "current",
      bankAccountNumber: "",
      bankIfsc: "",
      shopImage: "",
      logo: "",
      banner: "",
    },
  });

  const {
    data: merchant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (res.status === 404) return null; // New merchant user — no profile created yet
      if (!res.ok) throw new Error("Failed to load profile");
      const json = await res.json();
      return json.data || null;
    },
  });

  useEffect(() => {
    if (merchant) {
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const forceEdit = searchParams.get("edit") === "true";
      setIsEditing(forceEdit);
      form.reset({
        businessName: merchant.businessName ?? "",
        slug: merchant.slug ?? "",
        category: merchant.category ?? "food",
        description: merchant.description ?? "",
        contactEmail: merchant.contactEmail ?? "",
        address: merchant.location?.address ?? "",
        pincode: merchant.location?.pincode ?? "",
        city: merchant.location?.city ?? "",
        state: merchant.location?.state ?? "",
        country: merchant.location?.country ?? "IN",
        lat: merchant.location?.coordinates?.lat ?? "",
        lng: merchant.location?.coordinates?.lng ?? "",
        contactPhone: merchant.contactPhone ?? "",
        constitution: merchant.constitution ?? "proprietorship",
        liaisonName: merchant.liaisonName ?? "",
        liaisonDesignation: merchant.liaisonDesignation ?? "owner",
        liaisonPhone: merchant.liaisonPhone ?? "",
        gmapsLink: merchant.gmapsLink ?? "",
        docType: merchant.docType ?? "GST Registration Certificate",
        docImage: merchant.docImage ?? "",
        pan: merchant.pan ?? "",
        gstin: merchant.gstin ?? "",
        isGstExempt: merchant.isGstExempt ?? false,
        bankHolderName: merchant.bankDetails?.holderName ?? "",
        bankAccountType: merchant.bankDetails?.accountType ?? "current",
        bankAccountNumber: merchant.bankDetails?.accountNumber ?? "",
        bankIfsc: merchant.bankDetails?.ifsc ?? "",
        shopImage: merchant.shopImage ?? "",
        logo: merchant.logo ?? "",
        banner: merchant.banner ?? "",
      });
    } else {
      setIsEditing(true);
    }
  }, [merchant, form.reset]);

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step] || [];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const goToStep = async (targetStep) => {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }
    const fieldsToValidate = STEP_FIELDS[step] || [];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(targetStep);
    }
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
    if (field === "docImage") setUploadingDoc(true);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      form.setValue(field, json.data?.url, { shouldValidate: true });
      showSuccess("Image uploaded successfully!");
    } catch (err) {
      showError(err.message || "Failed to upload file.");
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
      setUploadingShop(false);
      setUploadingDoc(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const url = merchant
        ? `/api/merchants/${merchant._id}`
        : "/api/merchants";
      const method = merchant ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Failed to save profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({
        queryKey: ["merchant-application-status"],
      });
      showSuccess("Profile & KYC details submitted successfully!");
      setIsEditing(false);
      router.push("/merchant/application-status");
    },
    onError: (err) => {
      showError(err.message ?? "Failed to save profile.");
    },
  });

  const onSubmit = (formData) => {
    saveMutation.mutate({
      ...formData,
      pan: (formData.pan || "").trim().toUpperCase(),
      gstin: (formData.gstin || "").trim().toUpperCase(),
      bankDetails: {
        holderName: formData.bankHolderName,
        accountType: formData.bankAccountType,
        accountNumber: formData.bankAccountNumber,
        ifsc: (formData.bankIfsc || "").trim().toUpperCase(),
      },
      location: {
        address: formData.address,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        coordinates: {
          lat:
            formData.lat !== "" && formData.lat != null
              ? Number(formData.lat)
              : undefined,
          lng:
            formData.lng !== "" && formData.lng != null
              ? Number(formData.lng)
              : undefined,
        },
      },
    });
  };

  return {
    form,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    formData: form.watch(),
    step,
    setStep: goToStep,
    handleNext,
    handleBack,
    isEditing,
    setIsEditing,
    merchant,
    isLoading,
    error,
    handleImageUpload,
    uploadingLogo,
    uploadingBanner,
    uploadingShop,
    uploadingDoc,
    isPending: saveMutation.isPending,
  };
}
