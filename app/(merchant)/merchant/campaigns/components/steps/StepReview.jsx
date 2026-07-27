"use client";

import {
  Check,
  CheckCircle2,
  MessageSquare,
  Package,
  Users,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import { FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function StepReview({
  control,
  register,
  setValue,
  watch,
  errors,
  formData,
  calculateAddOnTotal,
  onSubmit,
  isPending,
  onBack,
}) {
  const staffReady = useWatch({ control, name: "staffReady" }) ?? "yes";
  const stockConfirmation =
    useWatch({ control, name: "stockConfirmation" }) ?? "yes";

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Step 4: Review &amp; Submit Campaign for Review
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review staff readiness, stock confirmation &amp; mandatory compliance
          agreements
        </p>
      </div>

      <div className="space-y-5">
        {/* Summary Box */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Campaign Name:</span>
            <span className="font-bold text-slate-900">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Campaign Type:</span>
            <span className="font-bold text-slate-900 capitalize">
              {formData.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Promo Code:</span>
            <span className="font-mono font-bold text-blue-600">
              {formData.code || "SAVE20"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">
              Target Audience:
            </span>
            <span className="font-bold text-slate-900 capitalize">
              {formData.audience}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200/80 pt-2 font-bold text-slate-900">
            <span>Total Channel Add-Ons:</span>
            <span className="text-blue-600">₹{calculateAddOnTotal()}</span>
          </div>
        </div>

        {/* Staff Readiness & Stock Confirmation in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormSelect
            label="Staff Readiness Check"
            icon={Users}
            options={[
              {
                value: "yes",
                label: "Yes — team is briefed and knows code",
              },
              {
                value: "partially",
                label: "Partially — will brief before launch",
              },
              { value: "no", label: "No — need to brief them first" },
            ]}
            required
            value={staffReady}
            onValueChange={(val) =>
              setValue("staffReady", val, { shouldValidate: true })
            }
            error={errors.staffReady}
          />

          <FormSelect
            label="Stock / Capacity Confirmation"
            icon={Package}
            options={[
              {
                value: "yes",
                label: "Yes — sufficient stock & capacity",
              },
              {
                value: "limited",
                label: "Limited stock — usage cap applied",
              },
            ]}
            required
            value={stockConfirmation}
            onValueChange={(val) =>
              setValue("stockConfirmation", val, { shouldValidate: true })
            }
            error={errors.stockConfirmation}
          />
        </div>

        {/* Internal Note to Campaign Team */}
        <FormTextarea
          label="Internal Note to Verification Team"
          icon={MessageSquare}
          rows={2}
          placeholder="e.g. Please approve before Thursday 5 PM for pre-Diwali push broadcast."
          {...register("internalNote")}
          error={errors.internalNote}
        />

        {/* Mandatory Checkbox Agreements */}
        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-900 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mandatory
            Compliance Confirmations
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </Label>
          <div className="space-y-2.5">
            {[
              {
                key: "agreed1",
                text: "My campaign offer is genuine, tested, and will work from the Start Date.",
              },
              {
                key: "agreed2",
                text: "All terms including minimum order, cap, and exclusions are fully disclosed.",
              },
              {
                key: "agreed3",
                text: "My counter team is briefed and ready to process campaign redemptions.",
              },
              {
                key: "agreed4",
                text: "I understand this campaign is actively promoted across Vouchiqo and will honor all redemptions.",
              },
              {
                key: "agreed5",
                text: "I understand selected add-ons are billed separately upon scheduling confirmation.",
              },
            ].map((chk) => {
              const isChecked = watch(chk.key);
              const hasErr = errors[chk.key];
              return (
                <div key={chk.key} className="space-y-1">
                  <div
                    onClick={() =>
                      setValue(chk.key, !isChecked, { shouldValidate: true })
                    }
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                      isChecked
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                        : hasErr
                          ? "bg-red-50/50 border-red-300 text-red-900 font-medium"
                          : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 font-medium",
                    )}
                  >
                    {/* Plain CSS checkbox indicator — no Radix internal setState */}
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                        isChecked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : hasErr
                            ? "border-red-400 bg-white"
                            : "border-slate-300 bg-white",
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <span className="leading-relaxed">{chk.text}</span>
                  </div>
                  {hasErr && (
                    <p className="text-[11px] text-red-500 font-medium pl-2">
                      {hasErr.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 4 Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-slate-700 border-slate-200 text-xs font-bold rounded-xl h-9 px-4 cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 px-8 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
        >
          {isPending ? "Submitting..." : "Submit Campaign for Review"}
        </Button>
      </div>
    </Card>
  );
}
