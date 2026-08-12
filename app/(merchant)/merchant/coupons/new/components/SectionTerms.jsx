"use client";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  FileText,
  Lock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const COMBINABILITY_OPTIONS = [
  {
    value: "No — cannot be combined with any other offer",
    label: "No — cannot be combined",
  },
  {
    value: "Yes — stackable with store promotions",
    label: "Yes — stackable with store promotions",
  },
];

const HONOURED_DAYS_OPTIONS = [
  {
    value: "Yes — every day during the validity period",
    label: "Yes — every day during validity",
  },
  {
    value: "No — excluding public holidays/festivals",
    label: "No — excluding public holidays/festivals",
  },
];

export default function SectionTerms({
  control,
  register,
  setValue,
  watch,
  errors,
  onSubmit,
  isPending,
  onBack,
}) {
  const combinabilityValue = useWatch({ control, name: "combinability" });
  const honouredAllDaysValue = useWatch({ control, name: "honouredAllDays" });

  return (
    <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

      <div className="border-b border-slate-100 pb-2.5 pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Section 5: Terms, Rules &amp; Verification Submission
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Disclose terms, stackability rules &amp; complete merchant confirmation
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Terms & Conditions Textarea */}
        <FormTextarea
          label="Full Terms & Conditions (Numbered)"
          icon={FileText}
          rows={3}
          placeholder="1. Valid on bill ₹5,000+. 2. Max discount ₹2,000. 3. Cannot be combined with other offers."
          required
          {...register("termsAndConditions")}
          error={errors.termsAndConditions}
        />

        {/* Combinability & Honoured All Days in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="combinability"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Combinability Rule"
                icon={Lock}
                options={COMBINABILITY_OPTIONS}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("combinability", val, { shouldValidate: true });
                }}
                error={errors.combinability}
              />
            )}
          />

          <Controller
            name="honouredAllDays"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Honoured All Days"
                icon={CalendarIcon}
                options={HONOURED_DAYS_OPTIONS}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("honouredAllDays", val, { shouldValidate: true });
                }}
                error={errors.honouredAllDays}
              />
            )}
          />
        </div>

        {/* Internal Note to Verification Team */}
        <FormTextarea
          label="Internal Note to Verification Team"
          icon={MessageSquare}
          rows={2}
          placeholder="e.g. Please approve urgently before Friday 10 AM for weekend festival sale launch."
          {...register("internalNote")}
          error={errors.internalNote}
        />

        {/* Mandatory Compliance Checkboxes */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
          <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-900 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mandatory Merchant Declaration
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </Label>
          <div className="space-y-2">
            {[
              {
                key: "agreed1",
                text: "My offer is genuine, tested, and will be honored at counter.",
              },
              {
                key: "agreed2",
                text: "All terms including minimum order and max cap are accurately disclosed.",
              },
              {
                key: "agreed3",
                text: "My counter billing staff is briefed and ready to process Smart Codes.",
              },
              {
                key: "agreed4",
                text: "I understand Vouchiqo compliance checks and honor all customer redemptions.",
              },
            ].map((chk) => {
              const isChecked = watch(chk.key);
              const hasErr = errors[chk.key];
              return (
                <div key={chk.key} className="space-y-0.5">
                  <div
                    onClick={() =>
                      setValue(chk.key, !isChecked, { shouldValidate: true })
                    }
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all select-none",
                      isChecked
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                        : hasErr
                          ? "bg-red-50/50 border-red-300 text-red-900 font-medium"
                          : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 font-medium",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        isChecked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : hasErr
                            ? "border-red-400 bg-white"
                            : "border-slate-300 bg-white",
                      )}
                    >
                      {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </span>
                    <span className="leading-snug text-[11px]">{chk.text}</span>
                  </div>
                  {hasErr && (
                    <p className="text-[10px] text-red-500 font-medium pl-2">
                      {hasErr.message}
                    </p>
                  )}
                </div>
              );
            })}
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
          onClick={onSubmit}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-6 rounded-xl cursor-pointer shadow-md shadow-blue-500/20"
        >
          {isPending
            ? "Submitting for Verification..."
            : "Submit for Verification"}
        </Button>
      </div>
    </Card>
  );
}
