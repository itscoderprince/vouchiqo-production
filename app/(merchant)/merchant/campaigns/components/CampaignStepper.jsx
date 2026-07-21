"use client";

import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CampaignStepper({
  steps,
  currentStep,
  setCurrentStep,
  onCancel,
}) {
  return (
    <div className="w-full flex items-center gap-4 py-2">
      <Button
        variant="ghost"
        onClick={onCancel}
        className="p-1.5 h-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl cursor-pointer shrink-0"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center flex-1 w-full gap-3 sm:gap-6">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLast = idx === steps.length - 1;
          return (
            <div
              key={step.number}
              className={`flex items-center gap-3 ${!isLast ? "flex-1" : ""}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (step.number < currentStep) setCurrentStep(step.number);
                }}
                className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "text-slate-900 font-extrabold"
                    : isCompleted
                    ? "text-emerald-600 font-bold"
                    : "text-slate-400 font-medium"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isActive
                      ? "bg-[#e85d04] text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200/80 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                </span>
                <span>{step.label}</span>
              </button>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
