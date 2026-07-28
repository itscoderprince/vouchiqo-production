"use client";

import {
  CheckCircle2,
  Eye,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sliders,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FormInput } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

const DEFAULT_COMMISSION_TABLE = [
  { id: "fashion", category: "Fashion & Clothing", rate: "5%", model: "CPA", notes: "Uniform across apparel" },
  { id: "food", category: "Food & Dining", rate: "3% dine-in / 2% delivery", model: "CPA", notes: "Never charge on Zomato-fulfilled orders" },
  { id: "electronics", category: "Electronics & Gadgets", rate: "2.5% blended", model: "CPA", notes: "Accessories 4%, handsets 1.5%" },
  { id: "beauty", category: "Beauty & Wellness", rate: "6% services / 4% retail", model: "CPA", notes: "Split by service vs product" },
  { id: "travel", category: "Travel & Hospitality", rate: "5% hotels / 4% packages", model: "CPA", notes: "Hotels pay less than MakeMyTrip" },
  { id: "home", category: "Home & Living", rate: "5%", model: "CPA", notes: "Furniture and décor" },
  { id: "home-improvement", category: "Home Improvement", rate: "2% products / 3% services", model: "CPA", notes: "In-store attribution via code" },
  { id: "fitness", category: "Fitness & Healthcare", rate: "6% gyms / 2% pharmacy / ₹200 CPL clinics", model: "CPA + CPL", notes: "Two models in one category" },
  { id: "education", category: "Education & Courses", rate: "₹300 CPL local / 8% online", model: "CPL + CPA", notes: "CPL for offline institutes" },
  { id: "kids-baby", category: "Kids & Baby Products", rate: "5%", model: "CPA", notes: "Clean, simple rate" },
  { id: "jewellery", category: "Jewellery", rate: "1.5% gold / 6% fashion / 3% blended", model: "CPA", notes: "Split by product type" },
  { id: "automotive", category: "Automobile & Auto Services", rate: "4%", model: "CPA", notes: "White space — you set the standard" },
  { id: "entertainment", category: "Gaming & Entertainment", rate: "4–5%", model: "CPA", notes: "Gaming hardware vs passes" },
  { id: "pets", category: "Pet Care & Supplies", rate: "5%", model: "CPA", notes: "Consumables high reorder rate" },
  { id: "grocery", category: "Grocery & Essentials", rate: "1.5% FMCG / 3% specialty", model: "CPA", notes: "Low margin, volume based" },
];

export default function CommissionRatesEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cpaRates, setCpaRates] = useState([]);
  const [previewCategoryIdx, setPreviewCategoryIdx] = useState(0);

  const [newCpaRate, setNewCpaRate] = useState({
    category: "",
    rate: "",
    model: "CPA",
    notes: "",
  });

  const fetchCpaRates = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      if (data?.master_cpa_rates && Array.isArray(data.master_cpa_rates) && data.master_cpa_rates.length > 0) {
        setCpaRates(data.master_cpa_rates);
      } else {
        setCpaRates(DEFAULT_COMMISSION_TABLE);
      }
    } catch (err) {
      showError("Error loading master CPA rates from database.");
      setCpaRates(DEFAULT_COMMISSION_TABLE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCpaRates();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminUpdateSetting("master_cpa_rates", cpaRates);
      showSuccess("Master Performance Commission Rates saved successfully to database!");
    } catch (err) {
      showError("Failed to save commission rates to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm("Reset commission rate table to standard defaults? (Remember to click 'Save Commission Rates' to persist to database)")) {
      setCpaRates(DEFAULT_COMMISSION_TABLE);
      showSuccess("Reset rate card to 15 standard category defaults.");
    }
  };

  const handleAddCpaRate = () => {
    if (!newCpaRate.category || !newCpaRate.rate) {
      showError("Please enter Category Name and Base Rate.");
      return;
    }
    const updated = [
      ...cpaRates,
      {
        id: `cpa_${Date.now()}`,
        category: newCpaRate.category,
        rate: newCpaRate.rate,
        model: newCpaRate.model || "CPA",
        notes: newCpaRate.notes || "",
      },
    ];
    setCpaRates(updated);
    setNewCpaRate({ category: "", rate: "", model: "CPA", notes: "" });
    showSuccess(`Added new rate entry for '${newCpaRate.category}'`);
  };

  const handleRemoveCpaRate = (indexInFiltered) => {
    const targetItem = filteredRates[indexInFiltered];
    const updated = cpaRates.filter((item) => item !== targetItem);
    setCpaRates(updated);
    showSuccess("Category rate entry removed.");
  };

  const filteredRates = useMemo(() => {
    if (!searchQuery.trim()) return cpaRates;
    const q = searchQuery.toLowerCase().trim();
    return cpaRates.filter(
      (r) =>
        r.category?.toLowerCase().includes(q) ||
        r.rate?.toLowerCase().includes(q) ||
        r.model?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
    );
  }, [cpaRates, searchQuery]);

  const activePreviewRate = filteredRates[previewCategoryIdx] || cpaRates[0] || {};

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-left">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Percent className="w-6 h-6 text-emerald-600" />
              <span>Performance Commission Rates Editor</span>
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Manage category commission rate cards (CPA/CPL rates, models &amp; rules) stored in MongoDB and rendered in real time on merchant onboarding.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="text-xs font-semibold rounded-xl h-9 px-3 border-slate-200 text-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              variant="outline"
              onClick={fetchCpaRates}
              disabled={loading}
              className="text-xs font-bold rounded-xl h-9 px-3 border-slate-200 text-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer shadow-sm shadow-emerald-500/20 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Commission Rates</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Onboarding Preview Card */}
        {activePreviewRate?.category && (
          <Card className="border-blue-200/80 bg-blue-50/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Live Merchant View Preview (Onboarding Step 5)
              </span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-bold">
                {activePreviewRate.category}
              </Badge>
            </div>
            <div className="bg-white border border-blue-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-slate-900">
                <span>{activePreviewRate.category}:</span>
                <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {activePreviewRate.rate}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong className="text-slate-800">Model:</strong> {activePreviewRate.model || "CPA"}
                {activePreviewRate.notes && (
                  <span className="ml-3 italic text-slate-500">
                    — Notes: {activePreviewRate.notes}
                  </span>
                )}
              </p>
            </div>
          </Card>
        )}

        {/* Master CPA Rates Table & Actions */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Master Category CPA / CPL Rate Card ({cpaRates.length} Categories)</span>
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Configure rate, performance model (CPA / CPL), and legal terms for each category.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <FormInput
                placeholder="Search category or rate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Add New Category Entry Form */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Add New Category Commission Rate
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <FormInput
                placeholder="Category Name (e.g. Clean Energy)"
                value={newCpaRate.category}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, category: e.target.value })}
              />
              <FormInput
                placeholder="Base Rate (e.g. 4% / ₹500 CPL)"
                value={newCpaRate.rate}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, rate: e.target.value })}
              />
              <FormInput
                placeholder="Model (CPA / CPL / CPA + CPL)"
                value={newCpaRate.model}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, model: e.target.value })}
              />
              <FormInput
                placeholder="Notes & Rules"
                value={newCpaRate.notes}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, notes: e.target.value })}
              />
              <Button
                onClick={handleAddCpaRate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Entry
              </Button>
            </div>
          </div>

          {/* Rates Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">#</th>
                  <th className="px-3 py-2.5 w-52">Category Name</th>
                  <th className="px-3 py-2.5 w-56">Base CPA / CPL Rate</th>
                  <th className="px-3 py-2.5 w-36">Model</th>
                  <th className="px-3 py-2.5">Notes &amp; Special Rules</th>
                  <th className="px-3 py-2.5 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-medium text-xs">
                      No category commission rates match &quot;{searchQuery}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredRates.map((rate, rIdx) => {
                    const actualIdxInCpaRates = cpaRates.indexOf(rate);
                    return (
                      <tr
                        key={rate.id || rIdx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          previewCategoryIdx === rIdx ? "bg-blue-50/30" : ""
                        }`}
                        onClick={() => setPreviewCategoryIdx(rIdx)}
                      >
                        <td className="px-3 py-2 text-center font-bold text-slate-500">
                          {rIdx + 1}
                        </td>
                        <td className="px-3 py-2">
                          <FormInput
                            value={rate.category}
                            onChange={(e) => {
                              const updated = [...cpaRates];
                              updated[actualIdxInCpaRates].category = e.target.value;
                              setCpaRates(updated);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <FormInput
                            value={rate.rate}
                            placeholder="e.g. 5%"
                            onChange={(e) => {
                              const updated = [...cpaRates];
                              updated[actualIdxInCpaRates].rate = e.target.value;
                              setCpaRates(updated);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <FormInput
                            value={rate.model}
                            placeholder="CPA / CPL"
                            onChange={(e) => {
                              const updated = [...cpaRates];
                              updated[actualIdxInCpaRates].model = e.target.value;
                              setCpaRates(updated);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <FormInput
                            value={rate.notes || ""}
                            placeholder="e.g. Uniform across apparel"
                            onChange={(e) => {
                              const updated = [...cpaRates];
                              updated[actualIdxInCpaRates].notes = e.target.value;
                              setCpaRates(updated);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCpaRate(rIdx);
                            }}
                            className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 shadow-none cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredRates.length} of {cpaRates.length} total categories configured
            </span>

            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer shadow-sm shadow-emerald-500/20 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Commission Rates Table</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
