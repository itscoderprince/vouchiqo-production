"use client";

import { FileText, MessageSquare, Tag, Target } from "lucide-react";
import { useWatch } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function StepBasics({
  control,
  register,
  setValue,
  watch,
  errors,
  campaignTypes,
  objectives,
  onCancel,
  onNext,
}) {
  const selectedType = useWatch({ control, name: "type" }) ?? "flash";
  const selectedObjective =
    useWatch({ control, name: "objective" }) ?? "Maximize Sales";
  const headlineValue = useWatch({ control, name: "headline" }) ?? "";

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Step 1: Campaign Basics
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Specify campaign name, objective, format &amp; public headline
        </p>
      </div>

      <div className="space-y-5">
        {/* Campaign Name & Campaign Type in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput
            label="Campaign Name"
            icon={FileText}
            type="text"
            placeholder="e.g. Summer Sale Blast"
            required
            {...register("name")}
            error={errors.name}
          />

          <FormSelect
            label="Campaign Type"
            icon={Tag}
            options={campaignTypes.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.badge})`,
            }))}
            required
            value={selectedType}
            onValueChange={(val) =>
              setValue("type", val, { shouldValidate: true })
            }
            error={errors.type}
          />
        </div>

        {/* Target Objective & Festival Template in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormSelect
            label="Primary Campaign Objective"
            icon={Target}
            options={objectives}
            required
            value={selectedObjective}
            onValueChange={(val) =>
              setValue("objective", val, { shouldValidate: true })
            }
            error={errors.objective}
          />

          {selectedType === "festival" ? (
            <FormSelect
              label="Target Festival Template"
              icon={Tag}
              options={[
                {
                  value: "Diwali Grand Festival",
                  label: "🪔 Diwali Grand Festival (5 Days)",
                },
                {
                  value: "Holi Festive Saver",
                  label: "🎨 Holi Festive Saver (3 Days)",
                },
                {
                  value: "Durga Puja Special",
                  label: "🌺 Durga Puja Special (4 Days)",
                },
                {
                  value: "Eid Special Offers",
                  label: "🌙 Eid Special Offers (3 Days)",
                },
                {
                  value: "New Year Shopping Bash",
                  label: "🎆 New Year Shopping Bash (2 Days)",
                },
              ]}
              required
              value={watch("festivalName") || "Diwali Grand Festival"}
              onValueChange={(val) =>
                setValue("festivalName", val, { shouldValidate: true })
              }
              error={errors.festivalName}
            />
          ) : (
            <FormInput
              label="Campaign Public Headline"
              icon={FileText}
              type="text"
              maxLength={70}
              placeholder="e.g. 🔥 Flat 20% off during Summer Sale Blast"
              {...register("headline")}
              error={errors.headline}
              hint={`${headlineValue.length}/70 chars`}
            />
          )}
        </div>

        {selectedType === "festival" && (
          <FormInput
            label="Campaign Public Headline"
            icon={FileText}
            type="text"
            maxLength={70}
            placeholder="e.g. 🪔 Flat 20% off all orders during Diwali Festival"
            {...register("headline")}
            error={errors.headline}
            hint={`${headlineValue.length}/70 chars`}
          />
        )}

        {/* Description / Scope */}
        <FormTextarea
          label="Internal Campaign Notes / Scope"
          icon={MessageSquare}
          rows={3}
          placeholder="Describe the scope and plan for this promotional campaign..."
          {...register("description")}
          error={errors.description}
        />
      </div>

      {/* Step 1 Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-slate-700 border-slate-200 text-xs font-bold rounded-xl h-9 px-4 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 px-6 rounded-xl cursor-pointer shadow-md shadow-blue-500/20"
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
