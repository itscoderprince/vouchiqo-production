"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  UploadCloud,
  Eye,
  IndianRupee,
  Link as LinkIcon,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AffiliateProductPreviewCard, {
  CATEGORIES,
} from "../components/AffiliateProductPreviewCard";

export default function EditAffiliateProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [merchantCategory, setMerchantCategory] = useState(null);
  const [pricingMode, setPricingMode] = useState("percent");

  const [form, setForm] = useState({
    title: "",
    category: "Fashion & Clothing",
    originalPrice: "",
    discountPrice: "",
    discountPercentage: "",
    discountText: "",
    affiliateUrl: "",
    imageUrl: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    async function fetchMerchant() {
      try {
        const res = await fetch("/api/merchants/me");
        if (res.ok) {
          const json = await res.json();
          const cat = json.data?.category || json.category;
          if (cat) {
            setMerchantCategory(cat);
          }
        }
      } catch (err) {
        console.error("Failed to fetch merchant profile:", err);
      }
    }
    fetchMerchant();
  }, []);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setFetching(true);
    try {
      const res = await fetch(`/api/merchant/affiliate-products/${id}`);
      if (res.ok) {
        const data = await res.json();
        const p = data.data || data;

        const orig = Number(p.originalPrice) || 0;
        const disc = Number(p.discountPrice) || 0;
        if (orig > 0 && disc > 0) {
          setPricingMode("exact");
        } else if (disc > 0 && orig === 0) {
          setPricingMode("fixed");
        } else {
          setPricingMode("percent");
        }

        setForm({
          title: p.title || "",
          category: p.category || merchantCategory || "Fashion & Clothing",
          originalPrice: p.originalPrice || "",
          discountPrice: p.discountPrice || "",
          discountPercentage: p.discountPercentage || "",
          discountText: p.discountText || "",
          affiliateUrl: p.affiliateUrl || "",
          imageUrl: p.imageUrl || "",
          description: p.description || "",
          status: p.status || "active",
        });
      } else {
        toast.error("Failed to load product details.");
        router.push("/merchant/affiliate-products");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching product.");
    } finally {
      setFetching(false);
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const resData = await res.json();
        const uploadedUrl = resData.data?.url || resData.url || "";
        if (uploadedUrl) {
          setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
          toast.success("Product image uploaded successfully!");
        } else {
          toast.error("Upload response missing URL.");
        }
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter the product title.");
      return;
    }

    if (pricingMode === "exact") {
      if (!form.originalPrice || !form.discountPrice) {
        toast.error("Please enter both actual price and discount price.");
        return;
      }
      if (Number(form.discountPrice) > Number(form.originalPrice)) {
        toast.error("Discount price cannot exceed actual price.");
        return;
      }
    } else if (pricingMode === "fixed") {
      if (!form.discountPrice && !form.discountText.trim()) {
        toast.error("Please enter deal price (e.g. 200) or deal tagline.");
        return;
      }
    } else {
      if (!form.discountPercentage && !form.discountText.trim()) {
        toast.error("Please enter discount percentage or discount tag text (e.g. 20% OFF).");
        return;
      }
    }

    if (!form.affiliateUrl.trim()) {
      toast.error("Please enter destination affiliate link.");
      return;
    }

    const payload = {
      ...form,
      originalPrice: pricingMode === "exact" ? Number(form.originalPrice) : 0,
      discountPrice: pricingMode === "exact" || pricingMode === "fixed" ? Number(form.discountPrice) : 0,
      discountPercentage: Number(form.discountPercentage) || 0,
      discountText: form.discountText || (pricingMode === "fixed" && form.discountPrice ? `Get Deal @ ₹${form.discountPrice}` : form.discountPercentage ? `${form.discountPercentage}% OFF` : ""),
    };

    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/affiliate-products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Affiliate product updated successfully!");
        router.push("/merchant/affiliate-products");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout title="Edit Affiliate Product" user={{ role: "merchant" }}>
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading product details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const activeCategoryDisplay = form.category || merchantCategory || "General Offers";

  return (
    <DashboardLayout title="Edit Affiliate Product" user={{ role: "merchant" }}>
      <div className="w-full max-w-full space-y-4 font-sans text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/merchant/affiliate-products"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Edit Affiliate Product / Deal
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Update product pricing, affiliate link, or image with real-time preview on the right.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split View Layout - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Form (7 columns) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4"
          >
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Product / Deal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Space & Meal Deal or Nike Sneakers"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal"
                  required
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                  <span>Category *</span>
                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </label>

                <div className="h-9 px-3 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 text-slate-900 font-semibold text-xs shadow-2xs">
                  <span className="truncate">{activeCategoryDisplay}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                    <Lock className="w-3 h-3 text-blue-600" /> Locked to Profile
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Offer Mode Tabs (% Off, Deal @ Price, MRP & Sale) */}
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                  Pricing & Deal Type
                </span>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPricingMode("percent")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      pricingMode === "percent"
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    % Off Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("fixed")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      pricingMode === "fixed"
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Deal @ Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("exact")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      pricingMode === "exact"
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    MRP & Sale Price
                  </button>
                </div>
              </div>

              {pricingMode === "percent" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 block">
                      Discount Percentage (%) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      value={form.discountPercentage || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({
                          ...form,
                          discountPercentage: val,
                          discountText: val ? `${val}% OFF` : "",
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 block">
                      Discount Tag Display
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20% OFF or FLAT ₹500 OFF"
                      value={form.discountText || ""}
                      onChange={(e) =>
                        setForm({ ...form, discountText: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              ) : pricingMode === "fixed" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 block">
                      Offer / Deal Price (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={form.discountPrice || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({
                          ...form,
                          discountPrice: val,
                          discountText: val ? `Get Deal @ ₹${val}` : form.discountText,
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 block">
                      Deal Tagline / Promotion Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Office Space + Meal @ ₹200"
                      value={form.discountText || ""}
                      onChange={(e) =>
                        setForm({ ...form, discountText: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 block">
                      Actual MRP (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 39999"
                      value={form.originalPrice}
                      onChange={(e) =>
                        setForm({ ...form, originalPrice: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 block">
                      Offer Sale Price (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2999"
                      value={form.discountPrice}
                      onChange={(e) =>
                        setForm({ ...form, discountPrice: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Destination URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                Destination Affiliate Link URL *
              </label>
              <input
                type="url"
                placeholder="https://webitya.com"
                value={form.affiliateUrl}
                onChange={(e) =>
                  setForm({ ...form, affiliateUrl: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal"
                required
              />
            </div>

            {/* Product Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Product / Offer Image
              </label>

              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0">
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-normal"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Description / Key Specs (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Key features, service inclusions or offer details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal"
              />
            </div>

            {/* Status Select */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-slate-700">
                Product Status
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "active" })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    form.status === "active"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "paused" })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    form.status === "paused"
                      ? "bg-amber-500 border-amber-500 text-slate-950"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Paused
                </button>
              </div>
            </div>

            {/* Form Submit */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Link
                href="/merchant/affiliate-products"
                className="px-4 py-2 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Affiliate Product</span>
                )}
              </button>
            </div>
          </form>

          {/* Right Live Preview Card Section (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Eye className="w-4 h-4 text-blue-600" /> Live Product Preview
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Interactive Preview
              </span>
            </div>

            <AffiliateProductPreviewCard product={form} isPreview={true} />

            <p className="text-xs text-slate-500 text-center font-normal bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
              This is an exact preview of how your offer appears on brand pages &amp; homepage.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
