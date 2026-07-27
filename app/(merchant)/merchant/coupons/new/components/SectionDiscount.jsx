"use client";

import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  FileText,
  Gift,
  Percent,
  RefreshCw,
  ShieldCheck,
  Tag,
  Ticket,
} from "lucide-react";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DISCOUNT_TYPES = [
  { value: "% Off", label: "% Off (Percentage Discount)" },
  { value: "Flat ₹ Off", label: "Flat ₹ Off (Fixed Amount)" },
  { value: "BOGO", label: "BOGO (Buy 1 Get 1)" },
  { value: "Free Gift", label: "Free Gift with In-Store Purchase" },
  { value: "Other", label: "Other Custom In-Store Deal" },
];

const SPECIAL_OFFER_TYPES = [
  { value: "BOGO (Buy 1 Get 1)", label: "BOGO (Buy 1 Get 1)" },
  {
    value: "Free Gift with Purchase",
    label: "Free Gift with In-Store Purchase",
  },
  { value: "Free Service Upgrade", label: "Free In-Store Service Upgrade" },
  { value: "Bundle / Combo Price", label: "In-Store Combo Price" },
  { value: "Loyalty Reward", label: "Store Loyalty Reward" },
  { value: "Other Special Deal", label: "Other In-Store Special Deal" },
];

const REDEMPTION_METHODS = [
  {
    value: "Show Vouchiqo Smart Code at counter",
    label: "Show Vouchiqo Smart Code at store counter",
  },
  {
    value: "Show digital voucher on phone to cashier",
    label: "Show digital voucher on phone to cashier",
  },
  {
    value: "In-store QR code scan at billing counter",
    label: "In-store QR code scan at billing counter",
  },
];

import { useWatch } from "react-hook-form";

export default function SectionDiscount({
  control,
  register,
  setValue,
  watch,
  errors,
  generateRandomCode,
  onBack,
  onNext,
}) {
  const offerType = useWatch({ control, name: "offerType" });
  const discountType = useWatch({ control, name: "discountType" });
  const specialOfferType = useWatch({ control, name: "specialOfferType" });
  const redemptionMethod = useWatch({ control, name: "redemptionMethod" });

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Section 3: Discount &amp; In-Store Mechanics
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure codes, discount values, caps &amp; in-store pricing
          structure
        </p>
      </div>

      {offerType === "code" && (
        <div className="space-y-5">
          {/* Offer Code Input Card */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Offer Code Configuration
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={generateRandomCode}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer h-auto p-0 border-0 bg-transparent shadow-none"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Auto-generate Code
              </Button>
            </div>
            <FormInput
              label="Offer Code (Uppercase, No Spaces)"
              icon={Ticket}
              type="text"
              placeholder="e.g. MARBLE20"
              required
              {...register("code")}
              onChange={(e) =>
                setValue(
                  "code",
                  e.target.value.toUpperCase().replace(/\s/g, ""),
                  { shouldValidate: true },
                )
              }
              error={errors.code}
              className="font-mono uppercase font-bold text-base bg-white"
            />
          </div>

          {/* Discount Type & Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormSelect
              label="Discount Type"
              icon={Percent}
              options={DISCOUNT_TYPES}
              required
              value={discountType}
              onValueChange={(val) =>
                setValue("discountType", val, { shouldValidate: true })
              }
              error={errors.discountType}
            />

            <FormInput
              label="Discount Value"
              icon={DollarSign}
              type="number"
              placeholder="e.g. 20 (for 20% or ₹200)"
              required
              {...register("discountValue")}
              error={errors.discountValue}
            />
          </div>

          {/* Max Cap & Min Order Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Maximum Discount Cap (₹)"
              icon={ShieldCheck}
              type="number"
              placeholder="e.g. 2000"
              {...register("maxCap")}
              error={errors.maxCap}
            />

            <FormInput
              label="Minimum In-Store Purchase Value (₹)"
              icon={Tag}
              type="number"
              placeholder="e.g. 5000"
              {...register("minOrderValue")}
              error={errors.minOrderValue}
            />
          </div>
        </div>
      )}

      {/* In-Store Price Drop / Deal Mode (No URL - Offline Local Businesses Only) */}
      {offerType === "deal" && (
        <div className="space-y-5">
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium">
            💡 <strong>In-Store Deal:</strong> Set your original store MRP and
            discounted offer price for customers visiting your shop in Ranchi.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Original Price (MRP ₹)"
              icon={DollarSign}
              type="number"
              placeholder="e.g. 2000"
              {...register("originalPrice")}
              error={errors.originalPrice}
            />

            <FormInput
              label="Special Store Offer Price (Deal ₹)"
              icon={Tag}
              type="number"
              placeholder="e.g. 1499"
              {...register("salePrice")}
              error={errors.salePrice}
              className="font-bold text-emerald-700"
            />
          </div>
        </div>
      )}

      {/* Special Offer / Gift Mode */}
      {offerType === "special" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormSelect
              label="Special Offer Format"
              icon={Gift}
              options={SPECIAL_OFFER_TYPES}
              required
              value={specialOfferType}
              onValueChange={(val) =>
                setValue("specialOfferType", val, { shouldValidate: true })
              }
              error={errors.specialOfferType}
            />

            <FormSelect
              label="Redemption Method"
              icon={Ticket}
              options={REDEMPTION_METHODS}
              required
              value={redemptionMethod}
              onValueChange={(val) =>
                setValue("redemptionMethod", val, { shouldValidate: true })
              }
              error={errors.redemptionMethod}
            />
          </div>

          <FormTextarea
            label="Full Special Offer Details"
            icon={FileText}
            rows={3}
            placeholder="e.g. Buy any 2 Marble Slabs and get 1 Grout Sealer packet completely FREE."
            required
            {...register("offerDetails")}
            error={errors.offerDetails}
          />
        </div>
      )}

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
          <span>Continue to Validity &amp; Limits</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
