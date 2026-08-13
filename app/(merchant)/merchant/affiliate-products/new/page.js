"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  UploadCloud,
  Eye,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AffiliateProductPreviewCard, {
  CATEGORIES,
} from "../components/AffiliateProductPreviewCard";

export default function NewAffiliateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Fashion & Clothing",
    originalPrice: "",
    discountPrice: "",
    affiliateUrl: "",
    imageUrl: "",
    description: "",
    status: "active",
  });

  const original = Number(form.originalPrice) || 0;
  const discount = Number(form.discountPrice) || 0;
  const savings = Math.max(0, original - discount);
  const savingsPercent =
    original > 0 ? Math.round((savings / original) * 100) : 0;

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
          toast.success("Product image uploaded successfully! ☁️");
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
    if (!form.originalPrice || !form.discountPrice) {
      toast.error("Please enter both actual price and discount price.");
      return;
    }
    if (Number(form.discountPrice) > Number(form.originalPrice)) {
      toast.error("Discount price cannot exceed actual price.");
      return;
    }
    if (!form.affiliateUrl.trim()) {
      toast.error("Please enter destination affiliate link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/merchant/affiliate-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Affiliate product created successfully! 🎉");
        router.push("/merchant/affiliate-products");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add Affiliate Product" user={{ role: "merchant" }}>
      <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-6xl mx-auto font-sans text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/merchant/affiliate-products"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Add New Affiliate Product
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Upload product details and affiliate URL — live preview updates on the right.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form (7 columns) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Product Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Max 270 Sneakers"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  Pricing & Discount
                </span>
                {savingsPercent > 0 && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {savingsPercent}% DISCOUNT
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Actual MRP (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2999"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm({ ...form, originalPrice: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-black focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Offer Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1499"
                    value={form.discountPrice}
                    onChange={(e) =>
                      setForm({ ...form, discountPrice: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-black focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Destination URL */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                Destination Affiliate Link URL *
              </label>
              <input
                type="url"
                placeholder="https://cashkaro.com/refer/link or https://bit.ly/deal"
                value={form.affiliateUrl}
                onChange={(e) =>
                  setForm({ ...form, affiliateUrl: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
                required
              />
            </div>

            {/* Product Image */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Product Image
              </label>

              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Description / Key Specs (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Product specs, features, or offer details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Status Select */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Product Status
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "active" })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    form.status === "active"
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "paused" })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    form.status === "paused"
                      ? "bg-amber-500 border-amber-500 text-slate-950 shadow-2xs"
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
                className="px-4 py-2 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Affiliate Product</span>
                )}
              </button>
            </div>
          </form>

          {/* Right Live Preview Card Section (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-blue-600" /> Live Product Preview
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Interactive Preview
              </span>
            </div>

            <AffiliateProductPreviewCard product={form} isPreview={true} />

            <p className="text-[11px] text-slate-500 text-center font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
              This is an exact preview of how your affiliate card appears to buyers on your brand page.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
