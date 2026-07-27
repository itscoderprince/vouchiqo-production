"use client";

import {
  CheckSquare,
  Download,
  ExternalLink,
  FileText,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FormInput } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

// Helper function to turn Google Drive links into direct download URLs
export function getDirectDownloadUrl(url) {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  const driveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const DEFAULT_COMMITMENTS = [
  {
    id: "commit1",
    text: "All submitted business information is accurate and real.",
    required: true,
  },
  {
    id: "commit2",
    text: "I will honour every verified offer published on Vouchiqo.",
    required: true,
  },
  {
    id: "commit3",
    text: "I will submit only genuine, working offer codes and deals.",
    required: true,
  },
  {
    id: "commit4",
    text: "I will enter actual transaction values when confirming codes.",
    required: true,
  },
  {
    id: "commit5",
    text: "I understand Vouchiqo earns performance commission.",
    required: true,
  },
  {
    id: "commit6",
    text: "I will keep counter staff informed about active offers.",
    required: true,
  },
  {
    id: "commit7",
    text: "I will pause offers if stock runs out or terms change.",
    required: true,
  },
];

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
  const [commitments, setCommitments] = useState([]);
  const [policies, setPolicies] = useState([]);

  // New Commitment Input State
  const [newCommitmentText, setNewCommitmentText] = useState("");

  // New Policy Input State
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    link: "",
    required: true,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      if (data?.merchant_commitments && Array.isArray(data.merchant_commitments)) {
        setCommitments(data.merchant_commitments);
      } else {
        setCommitments(DEFAULT_COMMITMENTS);
      }

      if (data?.policy_agreements && Array.isArray(data.policy_agreements)) {
        setPolicies(data.policy_agreements);
      } else {
        setPolicies(DEFAULT_POLICIES);
      }
    } catch {
      showError("Failed to load settings.");
      setCommitments(DEFAULT_COMMITMENTS);
      setPolicies(DEFAULT_POLICIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAll = async (updatedCommitments, updatedPolicies) => {
    const commitmentsToSave = updatedCommitments || commitments;
    const policiesToSave = updatedPolicies || policies;
    try {
      setSaving(true);
      await adminUpdateSetting("merchant_commitments", commitmentsToSave);
      await adminUpdateSetting("policy_agreements", policiesToSave);
      showSuccess("Merchant Commitments & Policy Agreements saved successfully!");
    } catch {
      showError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── COMMITMENT HANDLERS ──
  const handleAddCommitment = () => {
    if (!newCommitmentText.trim()) {
      return showError("Please enter commitment statement text.");
    }
    const newItem = {
      id: `commit_${Date.now()}`,
      text: newCommitmentText.trim(),
      required: true,
    };
    const updated = [...commitments, newItem];
    setCommitments(updated);
    setNewCommitmentText("");
    handleSaveAll(updated, policies);
  };

  const handleUpdateCommitment = (index, field, value) => {
    const updated = [...commitments];
    updated[index] = { ...updated[index], [field]: value };
    setCommitments(updated);
  };

  const handleRemoveCommitment = (index) => {
    const updated = commitments.filter((_, i) => i !== index);
    setCommitments(updated);
    handleSaveAll(updated, policies);
  };

  // ── POLICY HANDLERS ──
  const handleAddPolicy = () => {
    if (!newPolicy.title.trim()) {
      return showError("Please enter Policy Agreement Title.");
    }
    const id =
      newPolicy.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `policy_${Date.now()}`;

    const policyItem = {
      id,
      title: newPolicy.title.trim(),
      link: newPolicy.link ? newPolicy.link.trim() : "",
      required: !!newPolicy.required,
    };

    const updated = [...policies, policyItem];
    setPolicies(updated);
    setNewPolicy({ title: "", link: "", required: true });
    handleSaveAll(commitments, updated);
  };

  const handleUpdatePolicy = (index, field, value) => {
    const updated = [...policies];
    updated[index] = { ...updated[index], [field]: value };
    setPolicies(updated);
  };

  const handleRemovePolicy = (index) => {
    const updated = policies.filter((_, i) => i !== index);
    setPolicies(updated);
    handleSaveAll(commitments, updated);
  };

  return (
    <DashboardLayout
      title="Terms & Policy Agreements"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-8 text-left font-sans w-full max-w-5xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Merchant Commitments &amp; Policy PDF Links
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Customize registration checkboxes and direct Google Drive PDF download links live.
            </p>
          </div>
          <Button
            onClick={() => handleSaveAll(commitments, policies)}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer shadow-2xs gap-1.5 shrink-0"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Save All Settings</span>
          </Button>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: MERCHANT COMMITMENTS CHECKBOXES                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" /> Merchant Mandatory Commitments ({commitments.length})
              </h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Add, edit, or remove required commitment checkboxes shown on Section F.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
              Live On Registration
            </Badge>
          </div>

          {/* Add Commitment Row */}
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Enter new commitment text (e.g. I will honour every verified offer...)"
              value={newCommitmentText}
              onChange={(e) => setNewCommitmentText(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg text-xs h-9 px-3 font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none"
            />
            <Button
              onClick={handleAddCommitment}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Commitment
            </Button>
          </div>

          {/* Commitment List */}
          {loading ? (
            <div className="py-6 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading commitments...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {commitments.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all shadow-2xs"
                >
                  <span className="text-[11px] font-bold text-slate-400 w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) =>
                      handleUpdateCommitment(idx, "text", e.target.value)
                    }
                    className="flex-1 bg-white border border-slate-300 rounded-lg text-xs h-9 px-3 font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none shrink-0">
                    <Checkbox
                      checked={c.required !== false}
                      onCheckedChange={(val) =>
                        handleUpdateCommitment(idx, "required", !!val)
                      }
                    />
                    <span className="font-medium text-[11px]">Required</span>
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveCommitment(idx)}
                    className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-8 px-2.5 shadow-none cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: POLICY AGREEMENTS & DIRECT DOWNLOAD PDF LINKS       */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" /> Policy Agreements &amp; Direct PDF Download Links ({policies.length})
              </h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Provide Google Drive PDF URLs. Merchants can download the PDF directly without page redirects.
              </p>
            </div>
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
              Direct PDF Download Supported
            </Badge>
          </div>

          {/* Add Policy Row */}
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

          {/* Policy List */}
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading policy agreements...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((p, idx) => {
                const directDlUrl = getDirectDownloadUrl(p.link);

                return (
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
                            handleUpdatePolicy(idx, "title", e.target.value)
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg text-xs h-9 px-3 font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-5 space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600 uppercase flex items-center justify-between">
                          <span>Google Drive PDF Link</span>
                          {p.link && (
                            <a
                              href={directDlUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                            >
                              <Download className="w-3 h-3" /> Test Direct Download
                            </a>
                          )}
                        </Label>
                        <div className="relative flex items-center">
                          <input
                            type="url"
                            placeholder="https://drive.google.com/file/d/..."
                            value={p.link}
                            onChange={(e) =>
                              handleUpdatePolicy(idx, "link", e.target.value)
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
                              handleUpdatePolicy(idx, "required", !!val)
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
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
