"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Home,
  Loader2,
  Lock,
  Mail,
  PlusCircle,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      // Filter coupons belonging to this merchant (the query returns all if no specific merchant query param is handled, so filter client-side just in case)
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-subtext" />
        </div>
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
      <div className="flex flex-col gap-6 text-left">
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
            ? /* Campaign Creation Wizard */
              <div className="space-y-6">
                {/* Wizard Header */}
                <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreating(false)}
                      className="p-1 h-auto text-brand-navy hover:bg-slate-100"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h3 className="font-heading text-sm font-bold text-brand-navy">
                      Create Promotional Campaign
                    </h3>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            wizardStep === s
                              ? "bg-brand-navy text-white"
                              : wizardStep > s
                                ? "bg-brand-success text-white"
                                : "bg-brand-surface border border-brand-border text-brand-subtext"
                          }`}
                        >
                          {wizardStep > s ? <Check className="w-3 h-3" /> : s}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wizard Content */}
                <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm">
                  {/* Step 1: Details */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 1: Campaign details
                      </h4>
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
                          className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              🍂 Seasonal Clearance
                            </option>
                            <option value="new-user">
                              👥 New Customer Drive
                            </option>
                            <option value="custom">⚙️ Custom Campaign</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-brand-text uppercase">
                            Campaign Goal / Objective
                          </Label>
                          <Input
                            type="text"
                            placeholder="e.g. Drive checkout volume, acquire new Ranchi clients"
                            value={campaignData.objective}
                            onChange={(e) =>
                              setCampaignData({
                                ...campaignData,
                                objective: e.target.value,
                              })
                            }
                            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-brand-text uppercase">
                          Brief Description
                        </Label>
                        <Textarea
                          placeholder="Enter description explaining the deals and discounts offered..."
                          value={campaignData.description}
                          onChange={(e) =>
                            setCampaignData({
                              ...campaignData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Attach Listings */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 2: Attach active coupon listings
                      </h4>
                      <p className="text-xs text-brand-subtext font-semibold">
                        Select one or more active discount listings to group
                        under this campaign.
                      </p>

                      <div className="border border-brand-border rounded-lg overflow-hidden bg-brand-surface">
                        <Table className="w-full text-xs">
                          <TableHeader className="bg-slate-50 border-b border-brand-border">
                            <TableRow>
                              <TableHead className="w-12 p-3 text-center">
                                Select
                              </TableHead>
                              <TableHead className="p-3">Title</TableHead>
                              <TableHead className="p-3">Promo Code</TableHead>
                              <TableHead className="p-3">Expires</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loadingCoupons
                              ? <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="p-8 text-center"
                                  >
                                    <Loader2 className="w-6 h-6 animate-spin text-brand-subtext mx-auto" />
                                  </TableCell>
                                </TableRow>
                              : coupons.length > 0
                                ? coupons.map((c) => (
                                    <TableRow
                                      key={c._id}
                                      className="hover:bg-slate-100/50 border-b border-brand-border"
                                    >
                                      <TableCell className="p-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={campaignData.couponIds.includes(
                                            c._id,
                                          )}
                                          onChange={() =>
                                            toggleCouponAttachment(c._id)
                                          }
                                          className="w-4 h-4 cursor-pointer"
                                        />
                                      </TableCell>
                                      <TableCell className="p-3 font-bold text-brand-navy">
                                        {c.title}
                                      </TableCell>
                                      <TableCell className="p-3 font-mono uppercase">
                                        {c.code}
                                      </TableCell>
                                      <TableCell className="p-3">
                                        {new Date(
                                          c.expiresAt,
                                        ).toLocaleDateString()}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : <TableRow>
                                    <TableCell
                                      colSpan={4}
                                      className="p-8 text-center text-brand-subtext"
                                    >
                                      No active listings found. Please create a
                                      coupon listing first.
                                    </TableCell>
                                  </TableRow>}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Promotion Settings */}
                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 3: Campaign promotions
                      </h4>
                      <p className="text-xs text-brand-subtext font-semibold">
                        Set promotion triggers to maximize reach. Some add-on
                        costs may apply.
                      </p>

                      <div className="space-y-3">
                        {/* Homepage slot */}
                        <div className="flex justify-between items-center p-4 border border-brand-border rounded-xl bg-brand-surface">
                          <div className="flex gap-3">
                            <Home className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-brand-navy block">
                                Pin in Homepage Hot Deals Ticker
                              </span>
                              <span className="text-[10px] text-brand-subtext block font-medium">
                                Elevates your attached offers to priority 1 in
                                the marquee bar.
                              </span>
                            </div>
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

                        {/* Push Notify */}
                        <div className="flex justify-between items-center p-4 border border-brand-border rounded-xl bg-brand-surface">
                          <div className="flex gap-3">
                            <Volume2 className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-brand-navy block">
                                Send Brand Push Notification
                              </span>
                              <span className="text-[10px] text-brand-subtext block font-medium">
                                Broadcast an instant notification alert to all
                                users who follow your store.
                              </span>
                            </div>
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

                        {/* Weekly Newsletter */}
                        <div className="flex justify-between items-center p-4 border border-brand-border rounded-xl bg-brand-surface">
                          <div className="flex gap-3">
                            <Mail className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-brand-navy block">
                                Include in Weekly Newsletter digest
                              </span>
                              <span className="text-[10px] text-brand-subtext block font-medium">
                                Feature this campaign in the weekly digest sent
                                to Ranchi and local regional shoppers.
                              </span>
                            </div>
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

                  {/* Step 4: Review & Schedule */}
                  {wizardStep === 4 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
                        Step 4: Scheduling &amp; final check
                      </h4>

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
                              Campaign Name:
                            </span>
                            <p className="text-brand-text font-bold">
                              {campaignData.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-brand-subtext">
                              Type / Theme:
                            </span>
                            <p className="text-brand-text font-bold capitalize">
                              {campaignData.type} Sale
                            </p>
                          </div>
                          <div>
                            <span className="text-brand-subtext">
                              Attached Coupons:
                            </span>
                            <p className="text-brand-text font-bold">
                              {campaignData.couponIds.length} listings
                            </p>
                          </div>
                          <div>
                            <span className="text-brand-subtext">
                              Active Promotions:
                            </span>
                            <p className="text-brand-text font-bold">
                              {[
                                campaignData.settings.homepageSlot &&
                                  "Homepage Slot",
                                campaignData.settings.pushNotification &&
                                  "Push Notify",
                                campaignData.settings.newsletter &&
                                  "Newsletter digest",
                              ]
                                .filter(Boolean)
                                .join(", ") || "None"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wizard Action Controls */}
                  <div className="flex justify-between border-t border-brand-border pt-4 mt-6">
                    {wizardStep > 1
                      ? <Button
                          type="button"
                          variant="ghost"
                          onClick={handleBack}
                          className="btn-tertiary text-xs py-2 px-4 flex items-center gap-1.5 border border-brand-border rounded-lg h-auto shadow-none font-bold"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </Button>
                      : <div />}

                    {wizardStep < 4
                      ? <Button
                          type="button"
                          onClick={handleNext}
                          className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5 border-0 h-auto shadow-none font-bold"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      : <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleCreateSubmit("draft")}
                            disabled={mutation.isPending}
                            className="btn-tertiary text-xs py-2 px-5 border border-brand-border rounded-lg h-auto font-bold"
                          >
                            Save as Draft
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleCreateSubmit("live")}
                            disabled={mutation.isPending}
                            className="btn-primary text-xs py-2 px-6 border-0 h-auto shadow-none font-bold"
                          >
                            {mutation.isPending
                              ? "Creating..."
                              : "Launch Campaign"}
                          </Button>
                        </div>}
                  </div>
                </div>
              </div>
            : /* Campaigns List Dashboard */
              <div className="space-y-6">
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

                {/* List Table */}
                <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-5 border-b border-brand-border flex items-center justify-between">
                    <h3 className="font-heading text-sm font-bold text-brand-navy tracking-tight uppercase">
                      Active promotional campaigns
                    </h3>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <Table className="w-full text-xs">
                      <TableHeader className="bg-slate-50 border-b border-brand-border hover:bg-transparent">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Campaign Title
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Campaign Type
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Coupons Attached
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                            Schedule Period
                          </TableHead>
                          <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                        {campaigns.length > 0
                          ? campaigns.map((c) => (
                              <TableRow
                                key={c._id}
                                className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                              >
                                <TableCell className="p-4 font-bold text-brand-navy h-auto">
                                  {c.name}
                                </TableCell>
                                <TableCell className="p-4 capitalize">
                                  {c.type} Sale
                                </TableCell>
                                <TableCell className="p-4">
                                  {c.couponIds?.length || 0} coupons
                                </TableCell>
                                <TableCell className="p-4 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                                  <span>
                                    {c.startDate
                                      ? new Date(
                                          c.startDate,
                                        ).toLocaleDateString()
                                      : "Immediate"}{" "}
                                    -{" "}
                                    {c.endDate
                                      ? new Date(c.endDate).toLocaleDateString()
                                      : "Unlimited"}
                                  </span>
                                </TableCell>
                                <TableCell className="p-4 text-right">
                                  <Badge
                                    className={`rounded-full border-0 font-bold text-[10px] py-0.5 px-2 hover:bg-transparent shadow-none ${
                                      c.status === "live"
                                        ? "bg-brand-success/10 text-brand-success"
                                        : c.status === "scheduled"
                                          ? "bg-brand-warning/10 text-brand-warning"
                                          : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {c.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          : <TableRow>
                              <TableCell
                                colSpan={5}
                                className="p-10 text-center text-brand-subtext"
                              >
                                No promotional campaigns configured yet. Click
                                "+ Create Campaign" above.
                              </TableCell>
                            </TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>}
      </div>
    </DashboardLayout>
  );
}
