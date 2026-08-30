"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FESTIVAL_THEMES = [
  { value: "diwali", label: "Grand Diwali Celebration" },
  { value: "eid", label: "Royal Eid Festive Special" },
  { value: "christmas", label: "Merry Christmas Shopping Carnival" },
  { value: "durga_puja", label: "Durga Puja Sharadotsav" },
  { value: "new_year", label: "Happy New Year Bonanza" },
  { value: "holi", label: "Festival of Colours — Holi Deals" },
];

const WIZARD_STEPS = [
  { step: 1, title: "Festival Theme" },
  { step: 2, title: "3-Day Teaser" },
  { step: 3, title: "Email Blast" },
  { step: 4, title: "Push Notification" },
  { step: 5, title: "Ticker Priority" },
  { step: 6, title: "Confirm Full Package" },
];

export default function FestivalCampaignWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [festivalTheme, setFestivalTheme] = useState("diwali");
  const [teaserDate, setTeaserDate] = useState("2026-10-25");
  const [emailSubject, setEmailSubject] = useState(
    "Exclusive Festival Offer — Flat 20% OFF!",
  );
  const [pushText, setPushText] = useState(
    "Festival Special: Flat 20% OFF deals active now on Vouchiqo!",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const nextStep = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, 6)),
    [],
  );
  const prevStep = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 1)),
    [],
  );

  const handleConfirmFullActivation = useCallback(async () => {
    try {
      setIsSubmitting(true);
      // Simulating API deployment
      await new Promise((res) => setTimeout(res, 1000));
      setIsActivated(true);
      toast.success(
        "Festival Package (₹2,999) Activated! Email + Push + Ticker Priority + 3-Day Teaser deployed!",
      );
    } catch (err) {
      toast.error(err.message || "Failed to deploy festival package.");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const selectedThemeLabel = useMemo(() => {
    const found = FESTIVAL_THEMES.find((t) => t.value === festivalTheme);
    return found ? found.label : festivalTheme;
  }, [festivalTheme]);

  return (
    <DashboardLayout
      title="Festival Campaign Package Wizard (₹2,999)"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-4 text-left font-sans w-full pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" asChild className="p-1 h-8 w-8 rounded-lg">
              <Link href="/admin/campaigns/queue">
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Activate
                  Festival Package Wizard (₹2,999)
                </h1>
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium px-2 py-0.5">
                  Simultaneous Multi-Channel
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Email Blast + Push + Ticker Priority + Festival Theme + 3-Day
                Teaser + 7-Day Duration
              </p>
            </div>
          </div>
        </div>

        {/* 6-Step Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
          {WIZARD_STEPS.map((s) => (
            <div
              key={s.step}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                currentStep === s.step
                  ? "bg-blue-600 text-white border-blue-600 font-medium shadow-xs"
                  : currentStep > s.step
                    ? "bg-blue-50/80 border-blue-200 text-blue-900 font-normal"
                    : "bg-white border-slate-200 text-slate-500 font-normal"
              }`}
            >
              <span className="text-[10px] block uppercase font-medium opacity-80">
                Step {s.step}
              </span>
              <span className="text-xs font-normal truncate block">
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* WIZARD CONTENT CARD */}
        <Card className="border-slate-200/80 shadow-2xs rounded-xl bg-white p-5 space-y-4 text-left">
          {/* Step 1: Festival Theme */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step 1: Confirm Festival Theme
              </h3>
              <FormSelect
                value={festivalTheme}
                onValueChange={setFestivalTheme}
                options={FESTIVAL_THEMES}
                triggerClassName="w-full bg-white border-slate-200 rounded-lg text-xs h-10 font-normal"
              />
            </div>
          )}

          {/* Step 2: 3-Day Teaser */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step 2: Set Pre-Launch Teaser Date
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Configures 3-day pre-launch teaser banner on homepage
              </p>
              <Input
                type="date"
                value={teaserDate}
                onChange={(e) => setTeaserDate(e.target.value)}
                className="w-full sm:w-60 bg-white border-slate-200 rounded-lg text-xs h-10 font-normal"
              />
            </div>
          )}

          {/* Step 3: Build Email Blast */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step 3: Build Email Blast (Template E-9)
              </h3>
              <Input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-white border-slate-200 rounded-lg text-xs h-10 font-normal"
              />
            </div>
          )}

          {/* Step 4: Schedule Push Notification */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step 4: Schedule Push Notification (MSG91 Template 8)
              </h3>
              <Input
                type="text"
                maxLength={100}
                value={pushText}
                onChange={(e) => setPushText(e.target.value)}
                className="w-full bg-white border-slate-200 rounded-lg text-xs h-10 font-normal"
              />
            </div>
          )}

          {/* Step 5: Activate Ticker Priority */}
          {currentStep === 5 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step 5: Activate Ticker Priority Slot (3 Days)
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Pin campaign headline to Homepage Ticker Slot #1 for 3 days
              </p>
            </div>
          )}

          {/* Step 6: Confirm Full Activation */}
          {currentStep === 6 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step 6: Confirm Simultaneous Full Package Activation
              </h3>
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs font-normal text-blue-950 space-y-2">
                <div className="flex items-center gap-2 font-medium text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Simultaneous Multi-Channel Package Ready</span>
                </div>
                <ul className="space-y-1 list-disc pl-4 text-slate-700 font-normal">
                  <li>
                    Email Blast + Push Notification + Ticker Priority
                    simultaneously deployed
                  </li>
                  <li>
                    Festival-themed card design activated:{" "}
                    <span className="font-medium text-slate-900">
                      {selectedThemeLabel}
                    </span>
                  </li>
                  <li>
                    3-Day Pre-Launch Teaser starting{" "}
                    <span className="font-medium text-slate-900">
                      {teaserDate}
                    </span>
                  </li>
                  <li>
                    Campaign duration extended to minimum{" "}
                    <span className="font-medium text-slate-900">7 Days</span>
                  </li>
                </ul>
              </div>

              {!isActivated
                ? <Button
                    disabled={isSubmitting}
                    onClick={handleConfirmFullActivation}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 px-5 rounded-lg cursor-pointer w-full shadow-2xs"
                  >
                    {isSubmitting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      : null}
                    <span>
                      Confirm &amp; Deploy Festival Package (₹2,999) Now →
                    </span>
                  </Button>
                : <div className="p-3 bg-blue-100/70 text-blue-900 font-medium text-xs rounded-lg text-center border border-blue-200">
                    ✅ Festival Campaign Package Fully Activated &amp; Deployed!
                  </div>}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="text-xs font-normal rounded-lg border-slate-200 h-8 px-3 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>
            {currentStep < 6 && (
              <Button
                onClick={nextStep}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg h-8 px-4 cursor-pointer"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
