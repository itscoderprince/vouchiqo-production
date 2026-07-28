"use client";

import {
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Sliders,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FormInput } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

export default function CommissionRatesEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cpaRates, setCpaRates] = useState([]);
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
      if (data.master_cpa_rates) {
        setCpaRates(data.master_cpa_rates);
      }
    } catch (err) {
      showError("Error loading master CPA rates.");
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
      showSuccess("Master Performance Commission Rates saved successfully!");
    } catch (err) {
      showError("Failed to save commission rates.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCpaRate = () => {
    if (!newCpaRate.category || !newCpaRate.rate) {
      showError("Please enter Category Name and Rate.");
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

  const handleRemoveCpaRate = (index) => {
    const updated = cpaRates.filter((_, idx) => idx !== index);
    setCpaRates(updated);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Percent className="w-6 h-6 text-emerald-600" />
              <span>Performance Commission Rates Editor</span>
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Configure master category commission rate cards (CPA/CPL rates, models &amp; rules) displayed across merchant registration and category offer pages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchCpaRates}
              disabled={loading}
              className="text-xs font-bold rounded-xl h-9 px-3 border-slate-200 text-slate-700 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Save Commission Rates Table"
              )}
            </Button>
          </div>
        </div>

        {/* Master CPA Rates Card */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Master Category CPA / CPL Rate Card ({cpaRates.length} Categories)</span>
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                These rates dictate the official commission structure shown to merchants during onboarding.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold">
              15 Standard Categories Configured
            </Badge>
          </div>

          {/* Add New Category Entry */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Add New Category Commission Rate
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <FormInput
                placeholder="Category Name (e.g. Solar & Clean Energy)"
                value={newCpaRate.category}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, category: e.target.value })}
              />
              <FormInput
                placeholder="Base Rate (e.g. 4% / ₹500 CPL)"
                value={newCpaRate.rate}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, rate: e.target.value })}
              />
              <FormInput
                placeholder="Model (CPA / CPL)"
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
                <Plus className="w-4 h-4" /> Add Rate Entry
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">#</th>
                  <th className="px-3 py-2.5 w-52">Category Name</th>
                  <th className="px-3 py-2.5 w-56">Base CPA / CPL Rate</th>
                  <th className="px-3 py-2.5 w-32">Model</th>
                  <th className="px-3 py-2.5">Notes &amp; Rules</th>
                  <th className="px-3 py-2.5 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {cpaRates.map((rate, rIdx) => (
                  <tr key={rate.id || rIdx} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2 text-center font-bold text-slate-500">
                      {rIdx + 1}
                    </td>
                    <td className="px-3 py-2">
                      <FormInput
                        value={rate.category}
                        onChange={(e) => {
                          const updated = [...cpaRates];
                          updated[rIdx].category = e.target.value;
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
                          updated[rIdx].rate = e.target.value;
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
                          updated[rIdx].model = e.target.value;
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
                          updated[rIdx].notes = e.target.value;
                          setCpaRates(updated);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveCpaRate(rIdx)}
                        className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 shadow-none cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Save Commission Rates Table"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
