"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  Upload,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import { FormInput, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
  { id: "others", label: "Others / Custom Category" },
];

export default function SectionBasic({
  control,
  register,
  setValue,
  watch,
  errors,
  merchant,
  uploadingImage,
  handleImageUpload,
  onBack,
  onNext,
}) {
  const headlineValue = useWatch({ control, name: "headline" }) ?? "";
  const shortDescriptionValue =
    useWatch({ control, name: "shortDescription" }) ?? "";
  const selectedCategory = useWatch({ control, name: "category" });

  const registeredCategoryId = merchant?.category || selectedCategory || "food";
  const categoryObj = CATEGORIES.find((c) => c.id === registeredCategoryId);
  const categoryLabel = categoryObj?.label || registeredCategoryId;

  return (
    <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

      {/* Section Header */}
      <div className="border-b border-slate-100 pb-2.5 pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Section 2: Basic Offer Details
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Specify headline, short description, merchant category &amp; banner image
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Headline & Fixed Merchant Category in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Offer Headline / Title"
            icon={FileText}
            type="text"
            maxLength={80}
            placeholder="e.g. Flat 20% off on all Italian Marble Tiles"
            required
            {...register("headline")}
            error={errors.headline}
            hint={`${headlineValue.length}/80 chars`}
          />

          {/* Locked / Fixed Merchant Category Display */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Offer Category</span>
              <span className="text-red-500 font-bold ml-0.5">*</span>
            </Label>
            <div className="h-9 px-3 flex items-center justify-between rounded-xl border border-blue-200/90 bg-blue-50/50 text-slate-900 font-bold text-xs shadow-2xs">
              <span className="flex items-center gap-2 truncate">
                <span className="text-blue-600 font-extrabold">★</span>
                <span>{categoryLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
                <Lock className="w-3 h-3 text-blue-600" /> Locked to Merchant Industry
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Offers are automatically fixed to your registered business category.
            </p>
          </div>
        </div>

        {/* Short Description */}
        <FormTextarea
          label="Short Description"
          icon={MessageSquare}
          maxLength={200}
          rows={3}
          placeholder="e.g. Get 20% discount on total invoice amount for all premium tiles."
          required
          {...register("shortDescription")}
          error={errors.shortDescription}
          hint={`${shortDescriptionValue.length}/200 chars`}
        />

        {/* Offer Banner Image Upload Card */}
        <div className="space-y-2.5 p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-900 uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-blue-600" /> Banner Image Upload
              <span className="text-[10px] text-slate-400 font-normal normal-case">
                (Optional)
              </span>
            </Label>

            {/* Prominent Image Ratio Callout Badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200/90 px-2.5 py-1 rounded-lg shadow-2xs">
              <span className="text-blue-600 font-black">📷 Aspect Ratio: 2:1</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-slate-800 font-bold">800×400px Landscape</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <FormInput
              type="text"
              placeholder="Paste image URL (https://...) or upload below"
              {...register("image")}
              error={errors.image}
              className="flex-1 bg-white h-10 text-xs"
            />

            {/* Upload Button with prominent ratio text */}
            <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 h-10 rounded-xl cursor-pointer shrink-0 transition-all shadow-md shadow-slate-900/10">
              <Upload className="w-4 h-4 text-white" />
              <span>
                {uploadingImage ? "Uploading..." : "Upload 800×400 Banner (2:1)"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-2 bg-white rounded-lg border border-slate-200/70 text-[11px] text-slate-600 font-medium flex items-center justify-between flex-wrap gap-1">
            <span>💡 <strong>Banner Tip:</strong> 2:1 Horizontal ratio (800px width × 400px height, PNG/JPG max 5MB) renders perfectly on all devices.</span>
            <span className="text-blue-600 font-bold text-[10px] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">2:1 Ratio</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer h-8 px-3.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Continue to Discount &amp; Code</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
