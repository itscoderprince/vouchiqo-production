"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Upload,
} from "lucide-react";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
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

import { useWatch } from "react-hook-form";

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

  const registeredCategory = merchant?.category;

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.id,
    label:
      registeredCategory && registeredCategory === c.id
        ? `★ ${c.label} (Your Registered Industry)`
        : c.label,
  }));

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Section 2: Basic Offer Details
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Specify headline, short description, category &amp; banner image
        </p>
      </div>

      <div className="space-y-5">
        {/* Headline & Category in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

          <FormSelect
            label="Offer Category"
            icon={Layers}
            options={categoryOptions}
            required
            value={selectedCategory}
            onValueChange={(val) =>
              setValue("category", val, { shouldValidate: true })
            }
            error={errors.category}
            hint={
              registeredCategory
                ? `Auto-selected your registered category: ${CATEGORIES.find((c) => c.id === registeredCategory)?.label || registeredCategory}`
                : "Select 1 of 15 platform categories"
            }
          />
        </div>

        {selectedCategory === "others" && (
          <FormInput
            label="Custom Category Name"
            icon={Layers}
            type="text"
            placeholder="Specify custom offer category"
            required
            {...register("customCategory")}
            error={errors.customCategory}
          />
        )}

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
        <div className="space-y-2 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
          <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4 text-blue-600" /> Banner Image Upload
            <span className="text-[10px] text-slate-400 font-medium normal-case ml-1">
              (Optional)
            </span>
          </Label>
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <FormInput
              type="text"
              placeholder="Paste image URL (https://...) or upload below"
              {...register("image")}
              error={errors.image}
              className="flex-1 bg-white"
            />
            <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 h-10 rounded-xl cursor-pointer shrink-0 transition-colors shadow-2xs">
              <Upload className="w-4 h-4 text-white" />
              <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block pt-1">
            📷 Preferred resolution: 800×400px horizontal landscape image
            (PNG/JPG, max 5MB).
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer h-9 px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Continue to Discount &amp; Code</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
