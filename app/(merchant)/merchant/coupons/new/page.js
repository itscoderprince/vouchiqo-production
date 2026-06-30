"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Info, Lock, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
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
import { COUPON_CATEGORIES } from "@/utils/constants";

export default function CreateCoupon() {
  const [listingType, setListingType] = useState("coupon"); // "coupon" | "deal" | "special"
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    category: COUPON_CATEGORIES[0], // "food"
    discountType: "percentage",
    discountValue: "",
    originalPrice: "",
    salePrice: "",
    dealUrl: "",
    expiresAt: "",
    usageLimit: "",
    integrationType: "static",
    apiEndpoint: "",
    image: "",
    specialOfferType: "gift", // "gift" | "bogo" | "points" | "referral" | "bundle"
    redemptionMethod: "online", // "online" | "instore" | "whatsapp" | "email"
    isFeatured: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const queryClient = useQueryClient();

  // Fetch merchant profile
  const { data: merchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const isProOrEnterprise =
    merchant?.plan === "pro" || merchant?.plan === "enterprise";

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", "coupons");

    setUploadingImage(true);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      const imageUrl = json.data?.url;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Listing image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (newCoupon) => {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to create listing.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setSuccess(true);
    },
    onError: (err) => {
      setFormError(err.message || "An unexpected error occurred.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const expiresDate = new Date(formData.expiresAt);
    if (Number.isNaN(expiresDate.getTime())) {
      setFormError("Please enter a valid expiry date.");
      return;
    }

    if (expiresDate <= new Date()) {
      setFormError("Expiry date must be in the future.");
      return;
    }

    // Prepare payload depending on Listing Type
    let payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      expiresAt: expiresDate.toISOString(),
      maxClaims: formData.usageLimit
        ? parseInt(formData.usageLimit, 10)
        : undefined,
      image: formData.image || undefined,
      isFeatured: isProOrEnterprise ? formData.isFeatured : false,
    };

    if (listingType === "coupon") {
      payload = {
        ...payload,
        code:
          formData.code.toUpperCase() ||
          `SAVE-${Math.floor(1000 + Math.random() * 9000)}`,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue) || 0,
      };
    } else if (listingType === "deal") {
      payload = {
        ...payload,
        code: `DEAL-${Math.floor(1000 + Math.random() * 9000)}`,
        discountType: "fixed",
        discountValue:
          (parseFloat(formData.originalPrice) || 0) -
          (parseFloat(formData.salePrice) || 0),
        originalPrice: parseFloat(formData.originalPrice) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        dealUrl: formData.dealUrl || undefined,
      };
    } else if (listingType === "special") {
      payload = {
        ...payload,
        code: `GIFT-${Math.floor(1000 + Math.random() * 9000)}`,
        discountType: "freebie",
        discountValue: 0,
        tags: [formData.specialOfferType, formData.redemptionMethod],
      };
    }

    mutation.mutate(payload);
  };

  return (
    <DashboardLayout
      title="Create Offer Listing"
      user={{ name: merchant?.businessName || "Merchant", role: "merchant" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Listing type selector */}
          <div className="bg-brand-bg border border-brand-border p-4 rounded-xl shadow-sm space-y-3">
            <Label className="text-xs font-bold text-brand-text uppercase block">
              Choose Listing Format
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "coupon",
                  label: "Promo Code",
                  desc: "Monospace promo code",
                },
                {
                  id: "deal",
                  label: "Sale/Flat Offer",
                  desc: "Discounted price list",
                },
                {
                  id: "special",
                  label: "Special/Gift",
                  desc: "Loyalty, BOGO, or Freebie",
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setListingType(t.id);
                    setStep(1);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    listingType === t.id
                      ? "border-brand-navy bg-brand-surface shadow-sm ring-1 ring-brand-navy"
                      : "border-brand-border hover:bg-brand-surface/40"
                  }`}
                >
                  <span className="block text-xs font-bold text-brand-navy">
                    {t.label}
                  </span>
                  <span className="block text-[9px] text-brand-subtext font-medium mt-0.5 leading-snug">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between bg-brand-bg border border-brand-border p-4 rounded-xl shadow-sm">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    step === s
                      ? "bg-brand-navy text-white"
                      : step > s
                        ? "bg-brand-success text-white"
                        : "bg-brand-surface border border-brand-border text-brand-subtext"
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span
                  className={`text-xs font-bold ${step === s ? "text-brand-navy" : "text-brand-subtext"}`}
                >
                  {s === 1 ? "Details" : s === 2 ? "Rules" : "Publish"}
                </span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm">
            {success
              ? <div className="text-center py-8 space-y-5">
                  <div className="mx-auto w-12 h-12 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center border border-brand-success/20">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-heading text-lg font-bold text-brand-text">
                      Listing Created Successfully!
                    </h3>
                    <p className="text-xs text-brand-subtext max-w-xs mx-auto leading-relaxed">
                      Your campaign has been submitted to the platform. It is
                      now active and ready for customers.
                    </p>
                  </div>
                  <Link
                    href="/merchant/coupons"
                    className="btn-primary text-xs py-2 px-6 rounded-lg inline-flex items-center justify-center font-bold border-0 cursor-pointer shadow-none h-auto"
                  >
                    Return to Listings
                  </Link>
                </div>
              : <form onSubmit={handleSubmit} className="space-y-5">
                  {formError && (
                    <div className="p-3.5 rounded-lg bg-brand-error/5 border border-brand-error/15 text-brand-error text-xs font-semibold text-center">
                      {formError}
                    </div>
                  )}

                  {/* Step 1: Details */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 1: Campaign Details
                      </h3>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-brand-text uppercase">
                          Offer Title / Headline
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. 50% Off your next dinner"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-brand-text uppercase">
                          Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              category: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-full bg-brand-surface border border-brand-border text-xs rounded-lg h-10 px-3 shadow-none focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-brand-bg border border-brand-border">
                            {COUPON_CATEGORIES.map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="text-xs font-semibold capitalize"
                              >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-brand-text uppercase">
                          Terms / Description
                        </Label>
                        <Textarea
                          placeholder="Detail maximum discount caps, eligibility, and validation rules..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full min-h-[80px] p-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Rules */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 2: Campaign Rules
                      </h3>

                      {listingType === "coupon" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-brand-text uppercase">
                                Discount Type
                              </Label>
                              <Select
                                value={formData.discountType}
                                onValueChange={(val) =>
                                  setFormData({
                                    ...formData,
                                    discountType: val,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full bg-brand-surface border border-brand-border text-xs rounded-lg h-10 px-3 shadow-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-brand-bg border border-brand-border">
                                  <SelectItem
                                    value="percentage"
                                    className="text-xs font-semibold"
                                  >
                                    Percentage OFF (%)
                                  </SelectItem>
                                  <SelectItem
                                    value="fixed"
                                    className="text-xs font-semibold"
                                  >
                                    Fixed Cash OFF (₹)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-brand-text uppercase">
                                Value
                              </Label>
                              <Input
                                type="number"
                                placeholder="e.g. 50"
                                value={formData.discountValue}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    discountValue: e.target.value,
                                  })
                                }
                                className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Monospace Promo Code
                            </Label>
                            <Input
                              type="text"
                              placeholder="e.g. BURGER50"
                              value={formData.code}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  code: e.target.value.toUpperCase(),
                                })
                              }
                              className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none font-mono uppercase"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {listingType === "deal" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-brand-text uppercase">
                                Original Price (₹)
                              </Label>
                              <Input
                                type="number"
                                placeholder="e.g. 1500"
                                value={formData.originalPrice}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    originalPrice: e.target.value,
                                  })
                                }
                                className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-brand-text uppercase">
                                Sale Price (₹)
                              </Label>
                              <Input
                                type="number"
                                placeholder="e.g. 999"
                                value={formData.salePrice}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    salePrice: e.target.value,
                                  })
                                }
                                className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Direct Deal Link / URL
                            </Label>
                            <Input
                              type="url"
                              placeholder="https://myshop.com/product/deal"
                              value={formData.dealUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dealUrl: e.target.value,
                                })
                              }
                              className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                            />
                          </div>
                        </div>
                      )}

                      {listingType === "special" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Offer Style / Type
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { id: "gift", label: "Free Gift" },
                                { id: "bogo", label: "Buy 1 Get 1" },
                                { id: "points", label: "Loyalty Points" },
                                { id: "referral", label: "Referral Bonus" },
                                { id: "bundle", label: "Bundle Deal" },
                              ].map((o) => (
                                <label
                                  key={o.id}
                                  className="border border-brand-border p-2 rounded-lg flex items-center gap-2 cursor-pointer text-xs font-bold bg-brand-surface hover:bg-slate-100 select-none"
                                >
                                  <input
                                    type="radio"
                                    name="specialOfferType"
                                    value={o.id}
                                    checked={formData.specialOfferType === o.id}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        specialOfferType: e.target.value,
                                      })
                                    }
                                    className="w-4 h-4 text-brand-blue"
                                  />
                                  <span>{o.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Redemption Channel
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { id: "online", label: "Online Code" },
                                { id: "instore", label: "In-Store Scan" },
                                { id: "whatsapp", label: "WhatsApp Chat" },
                                { id: "email", label: "Email Coupon" },
                              ].map((rc) => (
                                <label
                                  key={rc.id}
                                  className="border border-brand-border p-2 rounded-lg flex items-center gap-2 cursor-pointer text-[10px] font-bold bg-brand-surface hover:bg-slate-100 select-none"
                                >
                                  <input
                                    type="radio"
                                    name="redemptionMethod"
                                    value={rc.id}
                                    checked={
                                      formData.redemptionMethod === rc.id
                                    }
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        redemptionMethod: e.target.value,
                                      })
                                    }
                                    className="w-3 h-3 text-brand-blue"
                                  />
                                  <span>{rc.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-brand-text uppercase">
                            Expiry Date
                          </Label>
                          <Input
                            type="date"
                            value={formData.expiresAt}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expiresAt: e.target.value,
                              })
                            }
                            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-brand-text uppercase">
                            Usage Limit (Optional)
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g. 500"
                            value={formData.usageLimit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                usageLimit: e.target.value,
                              })
                            }
                            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                          />
                        </div>
                      </div>

                      {/* Image Uploader for Deals and Special Offers */}
                      {listingType !== "coupon" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-brand-text uppercase">
                            Upload Promotional Graphic / Image
                          </Label>
                          <div className="relative border border-dashed border-brand-border rounded-lg p-5 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-28 flex flex-col items-center justify-center overflow-hidden">
                            {formData.image
                              ? // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={formData.image}
                                  alt="Upload"
                                  className="w-full h-full object-contain"
                                />
                              : <>
                                  <Upload className="w-5 h-5 text-brand-subtext mb-2" />
                                  <span className="text-[10px] text-brand-subtext font-semibold">
                                    {uploadingImage
                                      ? "Uploading..."
                                      : "Click to select a file"}
                                  </span>
                                </>}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Publish Settings */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 3: Publish settings
                      </h3>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-brand-text uppercase">
                          Verification mode
                        </Label>
                        <Select
                          value={formData.integrationType}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              integrationType: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-full bg-brand-surface border border-brand-border text-xs rounded-lg h-10 px-3 shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-brand-bg border border-brand-border">
                            <SelectItem
                              value="static"
                              className="text-xs font-semibold"
                            >
                              Static Codes (No Webhook API)
                            </SelectItem>
                            <SelectItem
                              value="api"
                              className="text-xs font-semibold"
                            >
                              Dynamic Webhook verification
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.integrationType === "api" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-brand-text uppercase">
                            Webhook API Verification Endpoint
                          </Label>
                          <Input
                            type="url"
                            placeholder="https://mystore.com/api/vouchers/verify"
                            value={formData.apiEndpoint}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                apiEndpoint: e.target.value,
                              })
                            }
                            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                            required
                          />
                        </div>
                      )}

                      {/* Featured Placement toggle (plan gated) */}
                      <div
                        className={`p-4 rounded-xl border flex justify-between items-center ${
                          isProOrEnterprise
                            ? "border-brand-navy/20 bg-brand-surface"
                            : "border-slate-200 bg-slate-50 opacity-75"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-brand-navy">
                              Pin to Homepage Featured Deals
                            </span>
                            {!isProOrEnterprise && (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                          <p className="text-[10px] text-brand-subtext font-semibold">
                            Starter and Growth plans are locked out. Elevation
                            requires Pro plan.
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          disabled={!isProOrEnterprise}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isFeatured: e.target.checked,
                            })
                          }
                          className={`w-4 h-4 cursor-pointer ${
                            !isProOrEnterprise
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="flex gap-2.5 p-3.5 rounded-lg bg-brand-surface border border-brand-border text-xs text-brand-subtext leading-relaxed">
                        <Info className="w-4 h-4 text-brand-blue flex-shrink-0" />
                        <span>
                          By submitting this campaign, you authorize Vouchiqo to
                          list it immediately. Expired campaigns can be revived
                          manually.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex justify-between border-t border-brand-border pt-4 mt-6">
                    {step > 1
                      ? <Button
                          type="button"
                          variant="ghost"
                          onClick={handleBack}
                          className="btn-tertiary text-xs py-2 px-4 flex items-center gap-1.5 border border-brand-border rounded-lg cursor-pointer h-auto shadow-none hover:bg-brand-surface font-semibold"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </Button>
                      : <div></div>}

                    {step < 3
                      ? <Button
                          type="button"
                          onClick={handleNext}
                          className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5 border-0 h-auto cursor-pointer shadow-none"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      : <Button
                          type="submit"
                          disabled={mutation.isPending}
                          className="btn-primary text-xs py-2 px-6 border-0 h-auto cursor-pointer shadow-none"
                        >
                          {mutation.isPending
                            ? "Creating..."
                            : "Publish Campaign"}
                        </Button>}
                  </div>
                </form>}
          </div>
        </div>

        {/* Right Column: Live Preview Panel (5 cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
              Live Listing Preview
            </h3>

            {/* Simulated Coupon Card */}
            <div className="border border-brand-border rounded-2xl bg-white shadow-sm overflow-hidden text-left relative transition-all duration-300 hover:shadow-md">
              <div className="absolute top-3 right-3 bg-brand-success/10 text-brand-success border border-brand-success/20 text-[8px] font-bold py-0.5 px-2 rounded-full flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" />
                <span>Verified</span>
              </div>

              {listingType !== "coupon" && formData.image
                ? <div className="h-32 bg-slate-100 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image}
                      alt="Promo Graphic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                : <div className="h-3 bg-gradient-to-r from-brand-navy to-brand-blue" />}

              <div className="p-5 space-y-4 font-semibold text-brand-text text-xs">
                {/* Brand Header */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {merchant?.logo
                      ? // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={merchant.logo}
                          alt="Logo"
                          className="w-full h-full object-cover rounded-full"
                        />
                      : merchant?.businessName?.[0] || "M"}
                  </div>
                  <div>
                    <h5 className="font-bold text-brand-navy leading-none">
                      {merchant?.businessName || "Your Store"}
                    </h5>
                    <span className="text-[9px] text-brand-subtext font-bold uppercase tracking-wider block mt-0.5">
                      {formData.category}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-brand-navy text-sm leading-tight">
                    {formData.title || "Enter Listing Title"}
                  </h4>
                  <p className="text-[10px] text-brand-subtext leading-snug font-medium line-clamp-2">
                    {formData.description ||
                      "Enter detailed instructions or coupon details."}
                  </p>
                </div>

                {/* Code Box / Price tag */}
                {listingType === "coupon"
                  ? <div className="border border-dashed border-brand-navy/30 bg-brand-surface rounded-xl p-3 flex justify-between items-center">
                      <span className="font-mono font-bold text-brand-navy text-sm uppercase">
                        {formData.code || "PROMOCODE"}
                      </span>
                      <span className="bg-brand-warning text-white text-[9px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">
                        {formData.discountType === "percentage"
                          ? `${formData.discountValue || "0"}% OFF`
                          : `₹${formData.discountValue || "0"} OFF`}
                      </span>
                    </div>
                  : listingType === "deal"
                    ? <div className="flex justify-between items-center py-2 border-y border-slate-100">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 line-through text-[10px] block">
                            Was ₹{formData.originalPrice || "0"}
                          </span>
                          <span className="text-brand-success font-black text-sm block">
                            Now ₹{formData.salePrice || "0"}
                          </span>
                        </div>
                        <span className="bg-brand-warning text-white text-[9px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                          Save ₹
                          {(parseFloat(formData.originalPrice) || 0) -
                            (parseFloat(formData.salePrice) || 0)}
                        </span>
                      </div>
                    : <div className="border border-dashed border-brand-blue/30 bg-blue-50/50 rounded-xl p-3 flex justify-between items-center">
                        <span className="font-bold text-brand-blue uppercase text-[10px]">
                          {formData.specialOfferType === "gift"
                            ? "🎁 Free Gift"
                            : formData.specialOfferType === "bogo"
                              ? "🏷️ Buy 1 Get 1"
                              : formData.specialOfferType === "points"
                                ? "⭐ Loyalty Points"
                                : formData.specialOfferType === "referral"
                                  ? "👥 Referral Reward"
                                  : "📦 Special Bundle"}
                        </span>
                        <span className="bg-brand-navy text-white text-[8px] font-bold py-0.5 px-1.5 rounded uppercase tracking-wider">
                          {formData.redemptionMethod}
                        </span>
                      </div>}

                {/* Expiry display */}
                <div className="flex justify-between items-center text-[10px] text-brand-subtext font-bold">
                  <span>Expires:</span>
                  <span>
                    {formData.expiresAt
                      ? new Date(formData.expiresAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "DD MMM YYYY"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
