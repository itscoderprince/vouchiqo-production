"use client";

import { Bell, Clock, Mail, Tag, Users } from "lucide-react";
import { useWatch } from "react-hook-form";
import { FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function StepPromotion({
  control,
  register,
  setValue,
  watch,
  errors,
  targetAudiences,
  onBack,
  onNext,
}) {
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const hasCountdownTimer = useWatch({ control, name: "hasCountdownTimer" });
  const hasPreTeaser = useWatch({ control, name: "hasPreTeaser" });
  const pushNotification = useWatch({ control, name: "pushNotification" });
  const newsletterInclusion = useWatch({
    control,
    name: "newsletterInclusion",
  });
  const featuredSlot = useWatch({ control, name: "featuredSlot" });
  const audience = useWatch({ control, name: "audience" });
  const pushSendTime = useWatch({ control, name: "pushSendTime" });

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6 text-left font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Step 3: Schedule &amp; Promotion Add-Ons
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Define campaign schedule, pre-launch teasers &amp; optional promotion
          boost add-ons
        </p>
      </div>

      <div className="space-y-5">
        {/* Schedule dates using DatePicker in 2-column grid */}
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

        {/* Campaign Toggles in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Countdown Timer
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Show live ticking countdown timer
              </span>
            </div>
            <Switch
              checked={hasCountdownTimer}
              onCheckedChange={(val) =>
                setValue("hasCountdownTimer", !!val, { shouldValidate: true })
              }
            />
          </div>

          <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Pre-Launch
                Teaser
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Show 48hr pre-launch teaser banner
              </span>
            </div>
            <Switch
              checked={hasPreTeaser}
              onCheckedChange={(val) =>
                setValue("hasPreTeaser", !!val, { shouldValidate: true })
              }
            />
          </div>
        </div>

        {/* Paid Add-On Promotions Section */}
        <div className="pt-2 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-sm font-bold text-slate-900">
              Optional Promotion Boost Add-Ons
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Amplify campaign reach with email blasts, push notifications &amp;
              ticker priority
            </p>
          </div>

          {/* Add-on Cards */}
          <div className="space-y-3">
            {/* Targeted Email Blast */}
            <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                    Targeted Email Blast
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[9px]">
                      ₹799 / blast
                    </Badge>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Send dedicated offer email to verified subscribers
                  </span>
                </div>
              </div>
              <Switch
                checked={newsletterInclusion}
                onCheckedChange={(val) =>
                  setValue("newsletterInclusion", !!val, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* Push Notification Alert */}
            <div className="p-4 border border-slate-200/80 rounded-2xl space-y-3 bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                      Push Notification Broadcast
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-[9px]">
                        ₹599 / broadcast
                      </Badge>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Instant mobile &amp; desktop web push alert to active
                      users
                    </span>
                  </div>
                </div>
                <Switch
                  checked={pushNotification}
                  onCheckedChange={(val) =>
                    setValue("pushNotification", !!val, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              {pushNotification && (
                <div className="pt-2 border-t border-slate-100">
                  <FormSelect
                    label="Push Broadcast Time (TRAI Allowed: 9:00 AM – 9:00 PM IST)"
                    options={[
                      {
                        value: "09:30 AM IST",
                        label: "09:30 AM IST (Morning Peak)",
                      },
                      {
                        value: "11:00 AM IST",
                        label: "11:00 AM IST (Late Morning)",
                      },
                      {
                        value: "01:30 PM IST",
                        label: "01:30 PM IST (Lunch Window)",
                      },
                      {
                        value: "05:00 PM IST",
                        label: "05:00 PM IST (Evening Return)",
                      },
                      {
                        value: "07:30 PM IST",
                        label: "07:30 PM IST (Prime Evening)",
                      },
                      {
                        value: "08:30 PM IST",
                        label: "08:30 PM IST (Last Call Before 9 PM)",
                      },
                    ]}
                    value={pushSendTime || "11:00 AM IST"}
                    onValueChange={(val) =>
                      setValue("pushSendTime", val, { shouldValidate: true })
                    }
                  />
                </div>
              )}
            </div>

            {/* Homepage Ticker Priority */}
            <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                    Homepage Ticker Priority
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[9px]">
                      ₹999 / 3-day window
                    </Badge>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Top 3 priority slot on homepage ticker banner for 72 hours
                  </span>
                </div>
              </div>
              <Switch
                checked={featuredSlot}
                onCheckedChange={(val) =>
                  setValue("featuredSlot", !!val, { shouldValidate: true })
                }
              />
            </div>
          </div>
        </div>

        {/* Target Audience Selector */}
        <FormSelect
          label="Target Audience Selection"
          icon={Users}
          options={targetAudiences.map((aud) => ({
            value: aud.id,
            label: aud.label,
          }))}
          required
          value={audience}
          onValueChange={(val) =>
            setValue("audience", val, { shouldValidate: true })
          }
          error={errors.audience}
        />
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer h-9 px-4"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-6 rounded-xl cursor-pointer shadow-md shadow-blue-500/20"
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
