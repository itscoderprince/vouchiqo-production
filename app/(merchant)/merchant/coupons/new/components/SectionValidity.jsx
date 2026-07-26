"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  Lock,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PER_CUSTOMER_LIMITS = [
  { value: "1", label: "1 time per customer" },
  { value: "2", label: "2 times per customer" },
  { value: "unlimited", label: "Unlimited per customer" },
];

const TARGET_AUDIENCES = [
  { value: "All Customers (Default)", label: "All Customers (Default)" },
  { value: "New Customers Only", label: "New Customers Only" },
  { value: "Returning Customers Only", label: "Returning Customers Only" },
  { value: "Specific Demographic", label: "Specific Demographic" },
];

const GEOGRAPHIC_RESTRICTIONS = [
  {
    value: "All India (Online Delivery)",
    label: "All India (Online Delivery)",
  },
  {
    value: "Ranchi only — in-store at my listed address",
    label: "Ranchi only (In-Store)",
  },
  { value: "Jharkhand only (Regional)", label: "Jharkhand only (Regional)" },
  { value: "Multiple Cities", label: "Multiple Select Cities" },
];

import { useWatch } from "react-hook-form";

export default function SectionValidity({
  control,
  register,
  setValue,
  watch,
  errors,
  toggleDay,
  onBack,
  onNext,
}) {
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const perCustomerLimit = useWatch({ control, name: "perCustomerLimit" });
  const targetAudience = useWatch({ control, name: "targetAudience" });
  const geographicRestriction = useWatch({
    control,
    name: "geographicRestriction",
  });
  const rawValidDays = useWatch({ control, name: "validDays" });
  const validDays = Array.isArray(rawValidDays) ? rawValidDays : [];

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Section 4: Validity, Limits &amp; Target Restrictions
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Dates, redemption caps, target demographic &amp; location rules
        </p>
      </div>

      <div className="space-y-5">
        {/* Start Date & End Date Pickers in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Start Date
              <span className="text-red-500 font-bold ml-0.5">*</span>
            </Label>
            <DatePicker
              value={startDate}
              onChange={(val) =>
                setValue("startDate", val, { shouldValidate: true })
              }
              placeholder="Select start date"
              iconColor="text-blue-600"
            />
            {errors.startDate && (
              <p className="text-[11px] text-red-500 font-medium pt-0.5">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-rose-500" /> End Date
              <span className="text-red-500 font-bold ml-0.5">*</span>
            </Label>
            <DatePicker
              value={endDate}
              onChange={(val) =>
                setValue("endDate", val, { shouldValidate: true })
              }
              placeholder="Select end date"
              iconColor="text-rose-500"
            />
            {errors.endDate && (
              <p className="text-[11px] text-red-500 font-medium pt-0.5">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Usage Limits in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput
            label="Total Usage Limit"
            icon={Users}
            type="number"
            placeholder="e.g. 100 total redemptions"
            {...register("usageLimit")}
            error={errors.usageLimit}
          />

          <FormSelect
            label="Per Customer Limit"
            icon={Lock}
            options={PER_CUSTOMER_LIMITS}
            value={perCustomerLimit}
            onValueChange={(val) =>
              setValue("perCustomerLimit", val, { shouldValidate: true })
            }
            error={errors.perCustomerLimit}
          />
        </div>

        {/* Target Audience & Geographic Restrictions in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormSelect
            label="Target Audience Selection"
            icon={Target}
            options={TARGET_AUDIENCES}
            value={targetAudience}
            onValueChange={(val) =>
              setValue("targetAudience", val, { shouldValidate: true })
            }
            error={errors.targetAudience}
          />

          <FormSelect
            label="Geographic Restriction"
            icon={MapPin}
            options={GEOGRAPHIC_RESTRICTIONS}
            value={geographicRestriction}
            onValueChange={(val) =>
              setValue("geographicRestriction", val, { shouldValidate: true })
            }
            error={errors.geographicRestriction}
          />
        </div>

        {/* Day Restrictions & Store Operating Hours */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" /> Valid
                Offer Days
                <span className="text-[10px] text-slate-400 font-medium normal-case ml-1">
                  (Optional)
                </span>
              </Label>

              {/* Day Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setValue("validDays", [...DAYS_OF_WEEK], {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer px-1.5 py-0.5 rounded"
                >
                  All 7 Days
                </button>
                <span className="text-slate-300 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "validDays",
                      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                      { shouldValidate: true },
                    )
                  }
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer px-1.5 py-0.5 rounded"
                >
                  Mon–Fri
                </button>
                <span className="text-slate-300 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setValue("validDays", ["Saturday", "Sunday"], {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer px-1.5 py-0.5 rounded"
                >
                  Sat–Sun
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = validDays.includes(day);
                return (
                  <Button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "px-3 py-1.5 h-8 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-none",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    {day.slice(0, 3)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Store Operating Hours */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Store Operating
                / Valid Hours
              </Label>

              {/* Operating Hours Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setValue("validHours", "10:00 AM – 09:00 PM", {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  Regular (10 AM–9 PM)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("validHours", "12:00 PM – 04:00 PM", {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  Lunch (12 PM–4 PM)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("validHours", "05:00 PM – 10:00 PM", {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  Evening (5 PM–10 PM)
                </button>
              </div>
            </div>

            <FormInput
              icon={Clock}
              type="text"
              placeholder="e.g. 10:00 AM – 09:00 PM or Valid all day"
              {...register("validHours")}
              error={errors.validHours}
              className="bg-white"
            />
            <span className="text-[10px] text-slate-400 font-medium block">
              💡 Specify when customers can visit your physical store or claim
              this deal during store operating hours.
            </span>
          </div>
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
          <span>Continue to Terms &amp; Submit</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
