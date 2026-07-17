"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Eye,
  FileText,
  Lock,
  Percent,
  PlusCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MerchantCampaigns() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard state
  const [campaignData, setCampaignData] = useState({
    name: "",
    type: "flash", // flash, festival, seasonal, new-user, clearance, custom
    objective: "",
    description: "",
    couponIds: [],
    settings: {
      homepageSlot: false,
      pushNotification: false,
      newsletter: false,
    },
    startDate: "",
    endDate: "",
  });

  // Fetch merchant profile
  const { data: merchant, isLoading: loadingProfile } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["merchant-campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data || [];
    },
    enabled: merchant?.plan !== "starter",
  });

  // Fetch merchant's coupons to attach
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["merchant-coupons-for-campaign"],
    queryFn: async () => {
      if (!merchant) return [];
      const res = await fetch(`/api/coupons?limit=50`);
      if (!res.ok) return [];
      const json = await res.json();
      const list = json.data?.coupons || [];
      return list.filter(
        (c) =>
          c.merchantId?._id === merchant._id || c.merchantId === merchant._id,
      );
    },
    enabled: !!merchant && merchant?.plan !== "starter" && isCreating,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to create campaign.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
      toast.success("Campaign created and launched!");
      setIsCreating(false);
      setWizardStep(1);
      // Reset wizard
      setCampaignData({
        name: "",
        type: "flash",
        objective: "",
        description: "",
        couponIds: [],
        settings: {
          homepageSlot: false,
          pushNotification: false,
          newsletter: false,
        },
        startDate: "",
        endDate: "",
      });
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  if (loadingProfile || (loadingCampaigns && merchant?.plan !== "starter")) {
    return (
      <DashboardLayout title="Campaign Manager" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const isStarter = merchant?.plan === "starter";

  const handleNext = () => setWizardStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setWizardStep((prev) => Math.max(prev - 1, 1));

  const toggleCouponAttachment = (couponId) => {
    setCampaignData((prev) => {
      const exists = prev.couponIds.includes(couponId);
      const update = exists
        ? prev.couponIds.filter((id) => id !== couponId)
        : [...prev.couponIds, couponId];
      return { ...prev, couponIds: update };
    });
  };

  const handleCreateSubmit = (status = "live") => {
    if (!campaignData.name) {
      toast.error("Campaign name is required");
      return;
    }
    mutation.mutate({ ...campaignData, status });
  };

  return (
    <DashboardLayout
      title="Campaign Manager"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-6 text-left font-sans">
        {/* Plan Gate for Starter */}
        {isStarter
          ? <div className="bg-white border border-brand-border rounded-[16px] p-8 text-center max-w-2xl mx-auto py-16">
              <div className="w-14 h-14 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-md mb-4 border border-white/20 mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-black text-brand-navy">
                Unlock Campaign Manager
              </h3>
              <p className="text-xs text-brand-subtext max-w-sm mt-2 leading-relaxed font-semibold mx-auto">
                Create marketing campaigns, broadcast notifications to users who
                follow your brand, and unlock featured placements in the Weekly
                Newsletter digest.
              </p>
              <Link
                href="/merchant/billing"
                className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold mt-5 shadow-none border-0 h-auto cursor-pointer flex items-center gap-1.5 inline-flex"
              >
                <span>Upgrade to Growth Plan</span>
              </Link>
            </div>
          : isCreating
            ? <div className="space-y-6">
                {/* Header Title with Back Button */}
                <div className="flex flex-col gap-4 bg-brand-bg border border-brand-border p-5 rounded-xl shadow-sm">
                  <div
                    onClick={() => {
                      setIsCreating(false);
                      setWizardStep(1);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-blue cursor-pointer self-start"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Campaigns</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-brand-navy">
                      Create Promotional Campaign
                    </h3>
                    <p className="text-xs text-brand-subtext mt-0.5 font-semibold">
                      Configure campaign parameters and attach existing coupons
                      to aggregate views.
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3 pt-2">
                    {[
                      { num: 1, name: "Details" },
                      { num: 2, name: "Coupons" },
                      { num: 3, name: "Channels" },
                      { num: 4, name: "Schedule" },
                    ].map((s) => (
                      <div key={s.num} className="flex-1 space-y-1.5">
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              wizardStep >= s.num
                                ? "bg-brand-navy"
                                : "bg-transparent"
                            }`}
                          />
                        </div>
                        <span
                          className={`block text-[9px] font-bold uppercase tracking-wider ${
                            wizardStep === s.num
                              ? "text-[#2563eb]"
                              : "text-brand-subtext"
                          }`}
                        >
                          Step {s.num}: {s.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign Wizard Main Body */}
                <Card className="border-brand-border shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      {/* Step 1: Details */}
                      {wizardStep === 1 && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Campaign Name / Title
                            </Label>
                            <Input
                              type="text"
                              placeholder="e.g. Ranchi Diwali Mega Blast"
                              value={campaignData.name}
                              onChange={(e) =>
                                setCampaignData({
                                  ...campaignData,
                                  name: e.target.value,
                                })
                              }
                              className="bg-brand-surface border border-brand-border rounded-lg text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Campaign Theme/Type
                            </Label>
                            <select
                              value={campaignData.type}
                              onChange={(e) =>
                                setCampaignData({
                                  ...campaignData,
                                  type: e.target.value,
                                })
                              }
                              className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none text-brand-text font-bold"
                            >
                              <option value="flash">
                                ⚡ Flash Sale Campaign
                              </option>
                              <option value="festival">
                                🎉 Festival / Holiday Event
                              </option>
                              <option value="seasonal">
                                🍂 Seasonal Promotion
                              </option>
                              <option value="new-user">
                                🎁 New User Welcoming Slot
                              </option>
                              <option value="clearance">
                                🏷️ End of Stock Clearance
                              </option>
                              <option value="custom">
                                ⚙️ Custom Branding Campaign
                              </option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Brief Campaign Objective
                            </Label>
                            <Input
                              type="text"
                              placeholder="e.g. Boost redemptions during festive rush"
                              value={campaignData.objective}
                              onChange={(e) =>
                                setCampaignData({
                                  ...campaignData,
                                  objective: e.target.value,
                                })
                              }
                              className="bg-brand-surface border border-brand-border rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-brand-text uppercase">
                              Campaign Description
                            </Label>
                            <Textarea
                              placeholder="Provide details about the promotional banners..."
                              value={campaignData.description}
                              onChange={(e) =>
                                setCampaignData({
                                  ...campaignData,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                              className="bg-brand-surface border border-brand-border text-xs leading-relaxed min-h-16"
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 2: Select Coupons */}
                      {wizardStep === 2 && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-brand-navy uppercase">
                              Select Coupons to Attach
                            </h4>
                            <p className="text-[10px] text-brand-subtext font-semibold">
                              Choose active discounts to associate with this
                              campaign:
                            </p>
                          </div>

                          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                            {loadingCoupons
                              ? <div className="text-center py-6 text-brand-subtext font-bold">
                                  Loading listings...
                                </div>
                              : coupons.length > 0
                                ? coupons.map((coupon) => {
                                    const isAttached =
                                      campaignData.couponIds.includes(
                                        coupon._id,
                                      );
                                    return (
                                      <div
                                        key={coupon._id}
                                        onClick={() =>
                                          toggleCouponAttachment(coupon._id)
                                        }
                                        className={`border rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all ${
                                          isAttached
                                            ? "bg-[#2563eb]/5 border-[#2563eb]"
                                            : "bg-brand-surface hover:bg-slate-50 border-brand-border"
                                        }`}
                                      >
                                        <div className="space-y-0.5 text-left">
                                          <span className="font-bold text-brand-navy block text-xs">
                                            {coupon.title}
                                          </span>
                                          <span className="text-[10px] text-brand-subtext uppercase font-mono">
                                            {coupon.code}
                                          </span>
                                        </div>
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                                            isAttached
                                              ? "bg-[#2563eb] border-[#2563eb] text-white"
                                              : "border-brand-border text-transparent"
                                          }`}
                                        >
                                          <Check className="w-3 h-3" />
                                        </div>
                                      </div>
                                    );
                                  })
                                : <p className="text-slate-400 font-bold italic py-4 text-center">
                                    No coupons found. Create a coupon first to
                                    attach.
                                  </p>}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Broadcast Settings */}
                      {wizardStep === 3 && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-brand-navy uppercase">
                              Promotion Broadcasters
                            </h4>
                            <p className="text-[10px] text-brand-subtext font-semibold">
                              Choose promotional channels (requires Growth/Pro
                              plan):
                            </p>
                          </div>

                          <div className="space-y-3.5 pt-2">
                            {/* Setting 1 */}
                            <div className="flex items-center justify-between p-3 border border-brand-border rounded-xl bg-brand-surface">
                              <div>
                                <span className="text-xs font-bold text-brand-navy block">
                                  Promoted Homepage Slot
                                </span>
                                <span className="text-[10px] text-brand-subtext font-semibold">
                                  Featured in slider feed for high visibility.
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={campaignData.settings.homepageSlot}
                                onChange={(e) =>
                                  setCampaignData({
                                    ...campaignData,
                                    settings: {
                                      ...campaignData.settings,
                                      homepageSlot: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 cursor-pointer text-brand-blue"
                              />
                            </div>

                            {/* Setting 2 */}
                            <div className="flex items-center justify-between p-3 border border-brand-border rounded-xl bg-brand-surface">
                              <div>
                                <span className="text-xs font-bold text-brand-navy block">
                                  Instant Push Broadcast
                                </span>
                                <span className="text-[10px] text-brand-subtext font-semibold">
                                  Notify active users who follow your store.
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={campaignData.settings.pushNotification}
                                onChange={(e) =>
                                  setCampaignData({
                                    ...campaignData,
                                    settings: {
                                      ...campaignData.settings,
                                      pushNotification: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 cursor-pointer text-brand-blue"
                              />
                            </div>

                            {/* Setting 3 */}
                            <div className="flex items-center justify-between p-3 border border-brand-border rounded-xl bg-brand-surface">
                              <div>
                                <span className="text-xs font-bold text-brand-navy block">
                                  Weekly Digest Placement
                                </span>
                                <span className="text-[10px] text-brand-subtext font-semibold">
                                  Highlight in weekly email digests.
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={campaignData.settings.newsletter}
                                onChange={(e) =>
                                  setCampaignData({
                                    ...campaignData,
                                    settings: {
                                      ...campaignData.settings,
                                      newsletter: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 cursor-pointer text-brand-blue"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Schedule */}
                      {wizardStep === 4 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-brand-text uppercase">
                                Start Date
                              </Label>
                              <Input
                                type="date"
                                value={campaignData.startDate}
                                onChange={(e) =>
                                  setCampaignData({
                                    ...campaignData,
                                    startDate: e.target.value,
                                  })
                                }
                                className="bg-brand-surface border border-brand-border rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-brand-text uppercase">
                                End Date
                              </Label>
                              <Input
                                type="date"
                                value={campaignData.endDate}
                                onChange={(e) =>
                                  setCampaignData({
                                    ...campaignData,
                                    endDate: e.target.value,
                                  })
                                }
                                className="bg-brand-surface border border-brand-border rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="bg-brand-surface p-4 border border-brand-border rounded-xl space-y-3 mt-4">
                            <span className="text-xs font-bold text-brand-navy block uppercase">
                              Campaign Summary
                            </span>
                            <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed font-semibold">
                              <div>
                                <span className="text-brand-subtext">
                                  Name:
                                </span>
                                <p className="text-brand-navy font-bold mt-0.5">
                                  {campaignData.name}
                                </p>
                              </div>
                              <div>
                                <span className="text-brand-subtext">
                                  Theme:
                                </span>
                                <p className="text-brand-navy font-bold mt-0.5 capitalize">
                                  {campaignData.type} Sale
                                </p>
                              </div>
                              <div>
                                <span className="text-brand-subtext">
                                  Attached:
                                </span>
                                <p className="text-brand-navy font-bold mt-0.5">
                                  {campaignData.couponIds.length} Coupons
                                </p>
                              </div>
                              <div>
                                <span className="text-brand-subtext">
                                  Channels:
                                </span>
                                <p className="text-brand-navy font-bold mt-0.5">
                                  {[
                                    campaignData.settings.homepageSlot &&
                                      "Homepage",
                                    campaignData.settings.pushNotification &&
                                      "Push Notify",
                                    campaignData.settings.newsletter &&
                                      "Newsletter",
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "None"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer buttons */}
                    <div className="border-t border-brand-border pt-5 flex justify-between">
                      {wizardStep > 1
                        ? <Button
                            type="button"
                            variant="ghost"
                            onClick={handleBack}
                            className="btn-tertiary text-xs py-2 px-4 flex items-center gap-1.5 border border-brand-border rounded-lg h-10 font-bold cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </Button>
                        : <div />}

                      {wizardStep < 4
                        ? <Button
                            type="button"
                            onClick={handleNext}
                            className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5 border-0 h-10 shadow-none font-bold cursor-pointer"
                          >
                            <span>Next Step</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        : <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => handleCreateSubmit("draft")}
                              disabled={mutation.isPending}
                              className="btn-tertiary text-xs py-2 px-5 border border-brand-border rounded-lg h-10 font-bold cursor-pointer"
                            >
                              Save Draft
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleCreateSubmit("live")}
                              disabled={mutation.isPending}
                              className="btn-primary text-xs py-2 px-6 border-0 h-10 shadow-none font-bold cursor-pointer"
                            >
                              {mutation.isPending ? "Creating..." : "Launch"}
                            </Button>
                          </div>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            : <div className="space-y-6">
                {/* Header Title with Button */}
                <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-5 rounded-xl shadow-sm">
                  <div>
                    <h3 className="font-heading text-base font-bold text-brand-navy">
                      Campaign Management
                    </h3>
                    <p className="text-xs text-brand-subtext mt-0.5 font-semibold">
                      Launch flash events, Diwali festivals, or clearance sales.
                      Attach existing coupons to aggregate views.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 border-0 h-auto cursor-pointer shadow-none font-bold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Campaign</span>
                  </Button>
                </div>

                {/* Campaign Cards Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {campaigns.length > 0
                    ? campaigns.map((c) => (
                        <Card
                          key={c._id}
                          className="border-brand-border shadow-sm"
                        >
                          <CardHeader className="flex flex-row justify-between items-start pb-2">
                            <div className="space-y-1">
                              <CardTitle className="text-base font-bold text-brand-navy">
                                {c.name}
                              </CardTitle>
                              <CardDescription className="text-xs font-medium">
                                Type:{" "}
                                <span className="capitalize text-brand-text font-bold">
                                  {c.type} Sale
                                </span>
                              </CardDescription>
                            </div>
                            <Badge
                              className={`rounded-full border-0 font-bold text-[10px] py-0.5 px-2.5 shadow-none ${
                                c.status === "live"
                                  ? "bg-brand-success/10 text-brand-success"
                                  : c.status === "scheduled"
                                    ? "bg-brand-warning/10 text-brand-warning"
                                    : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {c.status}
                            </Badge>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-2">
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-subtext">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-brand-blue" />
                                <span>
                                  {c.startDate
                                    ? new Date(c.startDate).toLocaleDateString(
                                        "en-IN",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        },
                                      )
                                    : "Immediate"}{" "}
                                  -{" "}
                                  {c.endDate
                                    ? new Date(c.endDate).toLocaleDateString(
                                        "en-IN",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        },
                                      )
                                    : "Unlimited"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Percent className="w-4 h-4 text-brand-blue" />
                                <span>
                                  {c.couponIds?.length || 0} Coupons Attached
                                </span>
                              </div>
                            </div>

                            {/* Accordion Stats for Premium Insights */}
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full border-t border-slate-100 pt-2"
                            >
                              <AccordionItem
                                value="stats"
                                className="border-b-0"
                              >
                                <AccordionTrigger className="text-xs font-bold text-[#3e80dd] hover:no-underline py-2">
                                  Show campaign performance stats
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-center">
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Est. Reach
                                      </span>
                                      <span className="text-lg font-black text-brand-navy flex items-center justify-center gap-1 mt-1">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                          {(
                                            (merchant?.followerCount || 20) *
                                            1.5
                                          ).toLocaleString()}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Impressions
                                      </span>
                                      <span className="text-lg font-black text-brand-navy flex items-center justify-center gap-1 mt-1">
                                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                          {(
                                            (c.couponIds?.length || 1) * 32
                                          ).toLocaleString()}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Claims
                                      </span>
                                      <span className="text-lg font-black text-[#2563eb] flex items-center justify-center gap-1 mt-1">
                                        <TrendingUp className="w-3.5 h-3.5 text-[#2563eb]" />
                                        <span>
                                          {Math.round(
                                            (c.couponIds?.length || 1) * 8.5,
                                          )}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Revenue
                                      </span>
                                      <span className="text-lg font-black text-emerald-600 mt-1 block">
                                        ₹
                                        {Math.round(
                                          (c.couponIds?.length || 1) * 450,
                                        ).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      ))
                    : <div className="bg-brand-bg border border-brand-border rounded-xl p-12 text-center text-brand-subtext font-semibold shadow-sm">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <h4 className="text-brand-navy">
                          No promotional campaigns configured yet
                        </h4>
                        <p className="text-xs text-brand-subtext leading-relaxed max-w-xs mx-auto mt-1 font-semibold">
                          Click "+ Create Campaign" above to launch your first
                          promotional slot.
                        </p>
                      </div>}
                </div>
              </div>}
      </div>
    </DashboardLayout>
  );
}
