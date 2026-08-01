"use client";

import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  CreditCard,
  Eye,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FormInput } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

const DEFAULT_MERCHANT_PLANS = [
  {
    id: "starter",
    name: "Starter Free",
    badge: "Free Forever",
    priceMonthly: 0,
    priceYearly: 0,
    priceText: "₹0",
    originalPrice: "",
    priceSuffix: "/ month free forever",
    subCaption: "Start listing. Pay only when a customer visits.",
    features: [
      "Up to 3 active verified listings",
      "Vouchiqo Verified badge standard",
      "Basic CPM views & claims KPI cards",
      "Campaign Manager (Add-on only)",
      "Expired Coupon Revival (Locked)",
      "72-hour email support SLA",
    ],
    footerNote: "Commission charged only on confirmed customer transactions — never on views or clicks.",
    buttonText: "Select Starter Free",
    theme: "blue",
    active: true,
  },
  {
    id: "growth",
    name: "Growth Partner",
    badge: "Most Popular",
    priceMonthly: 1499,
    priceYearly: 14990,
    priceText: "₹1,499",
    originalPrice: "₹1,999",
    priceSuffix: "/ month",
    subCaption: "More listings. Campaigns. Revival included. 14-day free trial.",
    features: [
      "Up to 15 active offer listings",
      "1 Active Campaign at a time",
      "Standard Analytics & CSV performance exports",
      "Campaign Manager 4-step wizard",
      "Community verification credentials",
      "48-hour priority email support",
    ],
    footerNote: "No payment collected today. Trial starts on account activation.",
    buttonText: "Select Growth — ₹1,499/mo",
    theme: "amber",
    active: true,
  },
  {
    id: "pro",
    name: "Pro Partner",
    badge: "Best Value",
    priceMonthly: 3999,
    priceYearly: 39990,
    priceText: "₹3,999",
    originalPrice: "₹4,999",
    priceSuffix: "/ month",
    subCaption: "Unlimited listings, campaigns, and push sends. Full power.",
    features: [
      "Unlimited active offer listings",
      "4 Simultaneous Active Campaigns",
      "50 Expired Offer Revival credits/month included",
      "Homepage Featured Slot (2 days/month included)",
      "Push Notification (1 send/month included)",
      "Deep Advanced Analytics & Heatmaps",
      "24-hour priority support SLA",
    ],
    footerNote: "Instant activation. Cancel or downgrade anytime.",
    buttonText: "Select Pro — ₹3,999/mo",
    theme: "indigo",
    active: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Partner",
    badge: "Custom Scale",
    priceMonthly: 9999,
    priceYearly: 99990,
    priceText: "₹9,999",
    originalPrice: "₹12,999",
    priceSuffix: "/ month",
    subCaption: "Custom multi-location scale with dedicated manager & full API access.",
    features: [
      "Unlimited active offer listings",
      "Unlimited Simultaneous Campaigns",
      "Unlimited Expired Offer Revivals",
      "Unlimited Targeted Push Notifications",
      "Custom Homepage Featured Slot Allocation",
      "Dedicated Account Manager",
      "POS & Webhook API Integration",
    ],
    footerNote: "Custom SLA and guaranteed response times.",
    buttonText: "Contact Enterprise",
    theme: "purple",
    active: true,
  },
];

export default function MerchantPlansEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [newFeatureText, setNewFeatureText] = useState("");

  const [newPlan, setNewPlan] = useState({
    id: "",
    name: "",
    badge: "",
    priceMonthly: 1999,
    priceYearly: 19990,
    priceText: "₹1,999",
    originalPrice: "",
    priceSuffix: "/ month",
    subCaption: "",
    features: [],
    footerNote: "",
    buttonText: "Select Plan",
    theme: "emerald",
    active: true,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      if (data?.merchant_plans && Array.isArray(data.merchant_plans) && data.merchant_plans.length > 0) {
        setPlans(data.merchant_plans);
      } else {
        setPlans(DEFAULT_MERCHANT_PLANS);
      }
    } catch (err) {
      showError("Error fetching merchant plans from database.");
      setPlans(DEFAULT_MERCHANT_PLANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminUpdateSetting("merchant_plans", plans);
      showSuccess("Merchant Subscription Plans & Pricing saved successfully to database!");
    } catch (err) {
      showError("Failed to save plans to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset merchant plans to default 4-tier launch structure? (Click 'Save' to persist to database)")) {
      setPlans(DEFAULT_MERCHANT_PLANS);
      setSelectedPlanIdx(0);
      showSuccess("Reset plans to default 4 launch tiers.");
    }
  };

  const handleUpdatePlan = (index, field, value) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    setPlans(updated);
  };

  const handleAddFeature = (planIndex) => {
    if (!newFeatureText.trim()) return;
    const updated = [...plans];
    const currentFeatures = updated[planIndex].features || [];
    updated[planIndex].features = [...currentFeatures, newFeatureText.trim()];
    setPlans(updated);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (planIndex, featureIndex) => {
    const updated = [...plans];
    updated[planIndex].features = updated[planIndex].features.filter((_, idx) => idx !== featureIndex);
    setPlans(updated);
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.priceText) {
      showError("Please enter Plan Name and Price.");
      return;
    }
    const generatedId = newPlan.id.trim() || newPlan.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const updated = [
      ...plans,
      {
        ...newPlan,
        id: generatedId,
        features: newPlan.features.length > 0 ? newPlan.features : ["Standard platform access"],
      },
    ];
    setPlans(updated);
    setSelectedPlanIdx(updated.length - 1);
    setNewPlan({
      id: "",
      name: "",
      badge: "",
      priceMonthly: 1999,
      priceYearly: 19990,
      priceText: "₹1,999",
      originalPrice: "",
      priceSuffix: "/ month",
      subCaption: "",
      features: [],
      footerNote: "",
      buttonText: "Select Plan",
      theme: "emerald",
      active: true,
    });
    showSuccess(`Added new subscription plan '${newPlan.name}'`);
  };

  const handleRemovePlan = (index) => {
    if (plans.length <= 1) {
      showError("At least one subscription plan must remain.");
      return;
    }
    const updated = plans.filter((_, idx) => idx !== index);
    setPlans(updated);
    setSelectedPlanIdx(Math.max(0, index - 1));
    showSuccess("Subscription plan removed.");
  };

  const activePlan = plans[selectedPlanIdx] || plans[0] || {};

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-left">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              <span>Merchant Subscription Plans &amp; Pricing Editor</span>
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Manage tier pricing, features, badges, and disclaimers stored in MongoDB for Merchant Billing and Registration.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              className="text-xs font-semibold rounded-xl h-9 px-3 border-slate-200 text-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              variant="outline"
              onClick={fetchPlans}
              disabled={loading}
              className="text-xs font-bold rounded-xl h-9 px-3 border-slate-200 text-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer shadow-sm shadow-indigo-500/20 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Plans &amp; Pricing</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Plans Navigation Tabs & Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-4 space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Subscription Tiers ({plans.length})
            </h3>
            <div className="space-y-1.5">
              {plans.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => setSelectedPlanIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all text-xs font-bold flex items-center justify-between cursor-pointer ${
                    selectedPlanIdx === idx
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{p.name || `Plan #${idx + 1}`}</span>
                    <span className={`text-[10px] font-semibold ${selectedPlanIdx === idx ? "text-indigo-100" : "text-slate-500"}`}>
                      {p.priceText || `₹${p.priceMonthly || 0}`} {p.priceSuffix}
                    </span>
                  </div>
                  {p.active ? (
                    <Badge className={`text-[9px] font-bold ${selectedPlanIdx === idx ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-200 text-slate-600 text-[9px] font-bold">Disabled</Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Add New Plan Button */}
            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setNewPlan({
                    id: `custom_${Date.now()}`,
                    name: "Custom Partner",
                    badge: "Special",
                    priceMonthly: 4999,
                    priceYearly: 49990,
                    priceText: "₹4,999",
                    originalPrice: "₹5,999",
                    priceSuffix: "/ month",
                    subCaption: "Custom plan description",
                    features: ["10 active offer listings", "2 active campaigns"],
                    footerNote: "Standard terms apply",
                    buttonText: "Select Plan",
                    theme: "purple",
                    active: true,
                  });
                }}
                className="w-full text-xs font-bold rounded-xl border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer h-9"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Create New Plan Tier</span>
              </Button>
            </div>
          </Card>

          {/* Main Plan Detail Form */}
          <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 lg:col-span-3">
            {activePlan ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Edit Subscription Tier: {activePlan.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Configure monthly/yearly pricing, features, badges, and button actions.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <span>Plan Active:</span>
                      <Switch
                        checked={activePlan.active !== false}
                        onCheckedChange={(val) => handleUpdatePlan(selectedPlanIdx, "active", val)}
                      />
                    </label>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemovePlan(selectedPlanIdx)}
                      className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-8 px-2.5 shadow-none cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Tier
                    </Button>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput
                    label="Plan Name"
                    value={activePlan.name || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "name", e.target.value)}
                  />
                  <FormInput
                    label="Badge / Tagline (e.g. Most Popular)"
                    value={activePlan.badge || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "badge", e.target.value)}
                  />
                  <FormInput
                    label="Theme Color (blue / amber / indigo / purple)"
                    value={activePlan.theme || "blue"}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "theme", e.target.value)}
                  />
                  <FormInput
                    label="Monthly Display Price (e.g. ₹1,499)"
                    value={activePlan.priceText || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "priceText", e.target.value)}
                  />
                  <FormInput
                    label="Numeric Monthly Price (₹)"
                    type="number"
                    value={activePlan.priceMonthly ?? 0}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "priceMonthly", Number(e.target.value))}
                  />
                  <FormInput
                    label="Numeric Yearly Price (₹)"
                    type="number"
                    value={activePlan.priceYearly ?? 0}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "priceYearly", Number(e.target.value))}
                  />
                  <FormInput
                    label="Original / Strike-through Price (e.g. ₹1,999)"
                    value={activePlan.originalPrice || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "originalPrice", e.target.value)}
                  />
                  <FormInput
                    label="Price Suffix (e.g. / month)"
                    value={activePlan.priceSuffix || "/ month"}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "priceSuffix", e.target.value)}
                  />
                  <FormInput
                    label="Button CTA Text (e.g. Select Growth — ₹999/mo)"
                    value={activePlan.buttonText || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "buttonText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <FormInput
                    label="SubCaption / Short Description"
                    value={activePlan.subCaption || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "subCaption", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <FormInput
                    label="Footer Note / Disclaimer"
                    value={activePlan.footerNote || ""}
                    onChange={(e) => handleUpdatePlan(selectedPlanIdx, "footerNote", e.target.value)}
                  />
                </div>

                {/* Features List Editor */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Plan Included Features ({(activePlan.features || []).length} Points)</span>
                  </h4>

                  {/* Add Feature Line */}
                  <div className="flex gap-2">
                    <FormInput
                      placeholder="Add feature point (e.g. Up to 20 active offer listings)"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      className="text-xs h-9"
                    />
                    <Button
                      onClick={() => handleAddFeature(selectedPlanIdx)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-9 px-4 cursor-pointer shrink-0 gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Line
                    </Button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {(activePlan.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const updated = [...plans];
                              updated[selectedPlanIdx].features[fIdx] = e.target.value;
                              setPlans(updated);
                            }}
                            className="w-full bg-transparent border-0 focus:outline-none text-slate-800 font-medium text-xs"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFeature(selectedPlanIdx, fIdx)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <Button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer shadow-sm shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save All Plans &amp; Pricing</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">Select a plan from the left sidebar to edit details.</div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
