"use client";

import {
  ExternalLink,
  FileText,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { FormInput } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

const DEFAULT_POLICIES = [
  {
    id: "merchant_agreement",
    title: "Agree to Merchant Agreement",
    link: "https://drive.google.com/file/d/1_sample_merchant_agreement/view?usp=sharing",
    required: true,
  },
  {
    id: "terms_of_service",
    title: "Agree to Terms of Service",
    link: "https://drive.google.com/file/d/1_sample_terms_of_service/view?usp=sharing",
    required: true,
  },
  {
    id: "privacy_policy",
    title: "Agree to Privacy Policy",
    link: "https://drive.google.com/file/d/1_sample_privacy_policy/view?usp=sharing",
    required: true,
  },
  {
    id: "verification_policy",
    title: "Agree to Verification Policy",
    link: "https://drive.google.com/file/d/1_sample_verification_policy/view?usp=sharing",
    required: true,
  },
  {
    id: "refund_cancellation",
    title: "Agree to Refund & Cancellation Policy",
    link: "https://drive.google.com/file/d/1_sample_refund_policy/view?usp=sharing",
    required: true,
  },
];

export default function PolicyAgreementsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState([]);

  const [newPolicy, setNewPolicy] = useState({
    title: "",
    link: "",
    required: true,
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      if (data?.policy_agreements && Array.isArray(data.policy_agreements)) {
        setPolicies(data.policy_agreements);
      } else {
        setPolicies(DEFAULT_POLICIES);
      }
    } catch {
      showError("Failed to load policy agreements settings.");
      setPolicies(DEFAULT_POLICIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSaveAll = async (updatedPolicies) => {
    const listToSave = updatedPolicies || policies;
    try {
      setSaving(true);
      await adminUpdateSetting("policy_agreements", listToSave);
      showSuccess("Policy agreements and PDF links updated successfully!");
    } catch {
      showError("Failed to save policy agreements.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPolicy = () => {
    if (!newPolicy.title.trim()) {
      return showError("Please enter Policy Agreement Title.");
    }
    const id =
      newPolicy.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `policy_${Date.now()}`;

    const cleanLink = (u) => {
      if (!u || !u.trim()) return "";
      const trimmed = u.trim();
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    };

    const policyItem = {
      id,
      title: newPolicy.title.trim(),
      link: cleanLink(newPolicy.link),
      required: !!newPolicy.required,
    };

    const updated = [...policies, policyItem];
    setPolicies(updated);
    setNewPolicy({ title: "", link: "", required: true });
    handleSaveAll(updated);
  };

  const handleUpdateField = (index, field, value) => {
    const updated = [...policies];
    updated[index] = { ...updated[index], [field]: value };
    setPolicies(updated);
  };

  const handleRemovePolicy = (index) => {
    const updated = policies.filter((_, i) => i !== index);
    setPolicies(updated);
    handleSaveAll(updated);
  };

  return (
    <DashboardLayout
      title="Terms & Policy Agreements"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Merchant Policy &amp; Agreement Checkboxes
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Manage registration policy checkboxes and attach Google Drive PDF document links.
            </p>
          </div>
          <Button
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer shadow-2xs gap-1.5 shrink-0"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Save All Policy Links</span>
          </Button>
        </div>

        {/* ── 1. ADD NEW POLICY FORM ── */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Add New Policy Agreement Item
            </h3>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
              Google Drive PDF Supported
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="sm:col-span-5">
              <FormInput
                label="Agreement Label Text"
                placeholder="e.g. Agree to Merchant Agreement"
                value={newPolicy.title}
                onChange={(e) =>
                  setNewPolicy({ ...newPolicy, title: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-5">
              <FormInput
                label="Google Drive PDF Document Link"
                placeholder="https://drive.google.com/file/d/.../view"
                value={newPolicy.link}
                onChange={(e) =>
                  setNewPolicy({ ...newPolicy, link: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2 flex flex-col justify-end">
              <Button
                onClick={handleAddPolicy}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-10 px-4 cursor-pointer gap-1.5 w-full"
              >
                <Plus className="w-4 h-4" /> Add Policy
              </Button>
            </div>
          </div>
        </Card>

        {/* ── 2. POLICY LIST ── */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" /> Active Policy Checkboxes ({policies.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-normal">
              Changes reflect live on Section F of Merchant Registration
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading policy agreements...</span>
            </div>
          ) : policies.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No custom policy agreements configured yet. Default policies are active.
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3 shadow-2xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-[11px] font-semibold text-slate-600 uppercase">
                        Agreement Checkbox Label
                      </Label>
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) =>
                          handleUpdateField(idx, "title", e.target.value)
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg text-xs h-9 px-3 font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-[11px] font-semibold text-slate-600 uppercase flex items-center justify-between">
                        <span>Google Drive PDF Link</span>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        )}
                      </Label>
                      <div className="relative flex items-center">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/file/d/..."
                          value={p.link}
                          onChange={(e) =>
                            handleUpdateField(idx, "link", e.target.value)
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg text-xs h-9 px-3 font-mono text-slate-800 focus:ring-1 focus:ring-blue-600 outline-none pr-8"
                        />
                        {p.link && (
                          <FileText className="w-4 h-4 text-red-500 absolute right-2.5 pointer-events-none" />
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-4 sm:pt-0">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                        <Checkbox
                          checked={p.required !== false}
                          onCheckedChange={(val) =>
                            handleUpdateField(idx, "required", !!val)
                          }
                        />
                        <span className="font-medium text-[11px]">Required</span>
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemovePolicy(idx)}
                        className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-8 px-2.5 shadow-none cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
