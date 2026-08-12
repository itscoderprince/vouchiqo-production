"use client";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  FileText,
  ShieldCheck,
  Tag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

import LivePreviewCard from "./components/LivePreviewCard";
import SectionBasic from "./components/SectionBasic";
import SectionDiscount from "./components/SectionDiscount";
import SectionTerms from "./components/SectionTerms";
import SectionType from "./components/SectionType";
import SectionValidity from "./components/SectionValidity";
import { useCreateCouponForm } from "./hooks/use-create-coupon-form";

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

const SECTIONS = [
  { number: 1, key: "A", name: "Offer Type", icon: Tag },
  { number: 2, key: "B", name: "Basic Details", icon: FileText },
  { number: 3, key: "C", name: "Discount & Code", icon: Ticket },
  { number: 4, key: "D", name: "Validity & Limits", icon: CalendarIcon },
  { number: 5, key: "E", name: "Terms & Submit", icon: ShieldCheck },
];

export default function CreateCoupon() {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    formData,
    activeSection,
    goToSection,
    goToNextSection,
    goToPrevSection,
    generateRandomCode,
    handleImageUpload,
    uploadingImage,
    toggleDay,
    merchant,
    isPending,
  } = useCreateCouponForm();

  const currentSectionObj =
    SECTIONS.find((s) => s.key === activeSection) || SECTIONS[0];

  const resolvedCategoryId = merchant?.category || formData.category || "food";
  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.id === resolvedCategoryId)?.label ||
    merchant?.category ||
    "Food & Dining";

  return (
    <DashboardLayout
      title="Create New Offer"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-3.5 text-left font-sans w-full">
        {/* COMPACT STEPPER BAR */}
        <div className="w-full flex items-center gap-2 py-2 px-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-x-auto">
          <Button
            variant="ghost"
            asChild
            className="p-1 h-7 w-7 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
          >
            <Link href="/merchant/coupons">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <div className="flex items-center flex-1 min-w-0 gap-1.5 sm:gap-3">
            {SECTIONS.map((sec, idx) => {
              const isActive = activeSection === sec.key;
              const isPast = currentSectionObj.number > sec.number;
              const isLast = idx === SECTIONS.length - 1;
              return (
                <div
                  key={sec.key}
                  className={`flex items-center gap-1.5 ${!isLast ? "flex-1" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => goToSection(sec.key)}
                    className={`flex items-center gap-1.5 text-[11px] transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "text-slate-900 font-extrabold"
                        : isPast
                          ? "text-emerald-700 font-bold"
                          : "text-slate-400 font-medium"
                    }`}
                  >
                    <span
                      className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-2xs"
                          : isPast
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : (
                        sec.number
                      )}
                    </span>
                    <span className="hidden sm:inline whitespace-nowrap">
                      S{sec.number}: {sec.name}
                    </span>
                    <span className="sm:hidden whitespace-nowrap">
                      S{sec.number}
                    </span>
                  </button>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-colors min-w-[8px] ${
                        isPast ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 space-y-3.5"
            noValidate
          >
            {activeSection === "A" && (
              <SectionType
                control={control}
                setValue={setValue}
                watch={watch}
                onNext={goToNextSection}
              />
            )}
            {activeSection === "B" && (
              <SectionBasic
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                merchant={merchant}
                uploadingImage={uploadingImage}
                handleImageUpload={handleImageUpload}
                onBack={goToPrevSection}
                onNext={goToNextSection}
              />
            )}
            {activeSection === "C" && (
              <SectionDiscount
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                generateRandomCode={generateRandomCode}
                onBack={goToPrevSection}
                onNext={goToNextSection}
              />
            )}
            {activeSection === "D" && (
              <SectionValidity
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                toggleDay={toggleDay}
                onBack={goToPrevSection}
                onNext={goToNextSection}
              />
            )}
            {activeSection === "E" && (
              <SectionTerms
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onSubmit={handleSubmit}
                isPending={isPending}
                onBack={goToPrevSection}
              />
            )}
          </form>

          <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-3">
            <LivePreviewCard
              formData={formData}
              merchant={merchant}
              selectedCategoryLabel={selectedCategoryLabel}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
