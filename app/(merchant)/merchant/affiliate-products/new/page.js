"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";

const CATEGORIES = [
  "Fashion & Clothing",
  "Electronics & Gadgets",
  "Food & Dining",
  "Beauty & Wellness",
  "Travel & Hospitality",
  "Home & Living",
  "Fitness & Healthcare",
  "Education & Courses",
  "General Offers",
];

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

  // Calculate savings preview
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
          toast.success("Product image uploaded to Cloudinary successfully! ☁️");
        } else {
          toast.error("Cloudinary response missing URL.");
        }
      } else {
        toast.error("Failed to upload product image.");
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
      toast.error("Please enter the destination affiliate link.");
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
        toast.error(data.message || "Failed to create affiliate product.");
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
      <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-4xl mx-auto font-sans text-left">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link
          href="/merchant/affiliate-products"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Add New Affiliate Product
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Upload product details, pricing, and your custom affiliate link (CashKaro, Bitly, EarnKaro, etc.).
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs"
      >
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Product Title / Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Nike Air Max 270 Sneakers"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Inputs & Live Savings Preview */}
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
            Pricing & Discount Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Actual Price (MRP ₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 2999"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Discount Sale Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 1499"
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all font-bold"
                required
              />
            </div>

            {/* Calculated Discount Preview */}
            <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Calculated Savings
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-black text-emerald-600">
                  {savingsPercent}% OFF
                </span>
                <span className="text-xs font-bold text-slate-600">
                  (Save ₹{savings.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Affiliate Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Destination Affiliate Link (CashKaro, Bitly, EarnKaro, etc.) *
          </label>
          <input
            type="url"
            placeholder="https://cashkaro.com/refer/link or https://bit.ly/yourdeal"
            value={form.affiliateUrl}
            onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
            required
          />
          <p className="text-[11px] text-slate-500 font-medium">
            Shoppers clicking &quot;Shop via Affiliate&quot; on your brand page will be redirected to this link.
          </p>
        </div>

        {/* Product Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Product Image
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 flex-1 w-full">
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors inline-flex items-center gap-2">
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                  )}
                  <span>Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)"
                value={form.imageUrl || ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Product Description / Key Features
          </label>
          <textarea
            rows={3}
            placeholder="Key features, specs, terms or offer highlights..."
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            href="/merchant/affiliate-products"
            className="px-5 py-2.5 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Product...</span>
              </>
            ) : (
              <span>Publish Affiliate Product</span>
            )}
          </button>
        </div>
      </form>
    </div>
    </DashboardLayout>
  );
}
