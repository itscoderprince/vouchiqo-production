"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  UploadCloud,
  Eye,
  ShoppingBag,
  Sparkles,
  Tag,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import AffiliateProductPreviewCard, { CATEGORIES } from "./AffiliateProductPreviewCard";

export default function AffiliateProductModal({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) {
  const isEdit = Boolean(initialData?._id);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Fashion & Clothing",
    originalPrice: initialData?.originalPrice || "",
    discountPrice: initialData?.discountPrice || "",
    affiliateUrl: initialData?.affiliateUrl || "",
    imageUrl: initialData?.imageUrl || "",
    description: initialData?.description || "",
    status: initialData?.status || "active",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!isOpen) return null;

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
      toast.error("Discount price cannot exceed the actual price.");
      return;
    }
    if (!form.affiliateUrl.trim()) {
      toast.error("Please enter destination affiliate link.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/merchant/affiliate-products/${initialData._id}`
        : "/api/merchant/affiliate-products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(
          isEdit
            ? "Affiliate product updated successfully! ✨"
            : "Affiliate product created successfully! 🎉"
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl my-auto overflow-hidden font-sans text-left flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEdit ? "Edit Affiliate Product" : "Add Affiliate Product"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Fill details on the left — live preview card updates in real-time on the right.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Column Split Layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 columns) */}
          <form
            id="affiliate-form"
            onSubmit={handleSubmit}
            className="lg:col-span-7 space-y-4"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                  <span>Category *</span>
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
          </form>

          {/* Right Live Preview Section (5 columns) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-blue-600" /> Live Preview Card
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Real-Time Updates
              </span>
            </div>

            <div className="my-auto">
              <AffiliateProductPreviewCard product={form} isPreview={true} />
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium bg-white p-2 rounded-xl border border-slate-200/80">
              This card is how your affiliate product will appear to shoppers on your brand storefront.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="affiliate-form"
            disabled={loading || uploadingImage}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEdit ? "Update Product" : "Publish Affiliate Product"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
