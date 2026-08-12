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
import { Controller, useWatch } from "react-hook-form";
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
  const discountType = useWatch({ control, name: "discountType" }) || "% Off";
  const specialOfferType = useWatch({ control, name: "specialOfferType" });
  const redemptionMethod = useWatch({ control, name: "redemptionMethod" });

  const isFlatDiscount = discountType === "Flat ₹ Off";
  const isPercentageDiscount = discountType === "% Off";
  const isCustomDeal = !isFlatDiscount && !isPercentageDiscount;

  return (
    <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

      <div className="border-b border-slate-100 pb-2.5 pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <Ticket className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Section 3: Discount &amp; In-Store Mechanics
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Configure codes, discount values, caps &amp; in-store pricing structure
            </p>
          </div>
        </div>
      </div>

      {offerType === "code" && (
        <div className="space-y-4">
          {/* Offer Code Input Card */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
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
              className="font-mono uppercase font-bold text-sm bg-white h-9"
            />
          </div>

          {/* Discount Type & Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Discount Type"
                  icon={Percent}
                  options={DISCOUNT_TYPES}
                  required
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("discountType", val, { shouldValidate: true });
                  }}
                  error={errors.discountType}
                />
              )}
            />

            {isPercentageDiscount && (
              <FormInput
                label="Discount Percentage (%)"
                icon={Percent}
                type="number"
                placeholder="e.g. 20 (for 20% off)"
                required
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}

            {isFlatDiscount && (
              <FormInput
                label="Flat Discount Amount (₹)"
                icon={DollarSign}
                type="number"
                placeholder="e.g. 200 (for ₹200 off)"
                required
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}

            {isCustomDeal && (
              <FormInput
                label="Deal / Offer Detail"
                icon={Gift}
                type="text"
                placeholder="e.g. Buy 1 Get 1 or Free Gift on bill"
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}
          </div>

          {/* Max Cap & Min Order Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Maximum Discount Cap (₹)"
              icon={ShieldCheck}
              type="number"
              placeholder="e.g. 2000 (Optional limit)"
              {...register("maxCap")}
              error={errors.maxCap}
            />

            <FormInput
              label="Minimum In-Store Purchase Value (₹)"
              icon={Tag}
              type="number"
              placeholder="e.g. 5000 (Optional minimum bill)"
              {...register("minOrderValue")}
              error={errors.minOrderValue}
            />
          </div>
        </div>
      )}

      {/* In-Store Price Drop / Deal Mode */}
      {offerType === "deal" && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium flex items-center gap-2">
            <span>💡</span>
            <span>
              <strong>In-Store Deal:</strong> Set your original store MRP and discounted offer price for customers visiting your store.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="specialOfferType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Special Offer Format"
                  icon={Gift}
                  options={SPECIAL_OFFER_TYPES}
                  required
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("specialOfferType", val, { shouldValidate: true });
                  }}
                  error={errors.specialOfferType}
                />
              )}
            />

            <Controller
              name="redemptionMethod"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Redemption Method"
                  icon={Ticket}
                  options={REDEMPTION_METHODS}
                  required
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("redemptionMethod", val, { shouldValidate: true });
                  }}
                  error={errors.redemptionMethod}
                />
              )}
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
          <span>Continue to Validity &amp; Limits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
