"use client";

import {
  FolderOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Sliders,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { FormInput } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";

export default function PlatformContentSettings() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");

  const [statsForm, setStatsForm] = useState({
    totalRequests: 5240,
    thisMonthRequests: 142,
    recoveredAmount: 1250000,
    successRate: 94.2,
  });

  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({
    user: "",
    brand: "",
    offer: "",
    date: "Just now",
    text: "",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      if (data.revival_stats) setStatsForm(data.revival_stats);
      if (data.social_proof) setTestimonials(data.social_proof);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      showError("Error loading settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSetting = async (key, value) => {
    try {
      setSavingKey(key);
      await adminUpdateSetting(key, value);
      showSuccess(`Setting '${key}' saved!`);
    } catch (err) {
      showError(`Failed to save setting '${key}'`);
    } finally {
      setSavingKey("");
    }
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.user || !newTestimonial.brand || !newTestimonial.text) {
      return showError("Please fill in User, Brand, and Testimonial text.");
    }
    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);
    setNewTestimonial({
      user: "",
      brand: "",
      offer: "",
      date: "Just now",
      text: "",
    });
    handleSaveSetting("social_proof", updated);
  };

  const handleRemoveTestimonial = (index) => {
    const updated = testimonials.filter((_, idx) => idx !== index);
    setTestimonials(updated);
    handleSaveSetting("social_proof", updated);
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.slug) {
      return showError("Please fill in Category Name and Slug.");
    }
    const slug = newCategory.slug.trim().toLowerCase();
    if (categories.some((c) => c.slug === slug)) {
      return showError("Category slug already exists.");
    }
    const updated = [
      ...categories,
      { id: slug, name: newCategory.name.trim(), slug, active: true },
    ];
    setCategories(updated);
    setNewCategory({ name: "", slug: "" });
    handleSaveSetting("categories", updated);
  };

  const handleToggleCategory = (slug) => {
    const updated = categories.map((c) =>
      c.slug === slug ? { ...c, active: !c.active } : c,
    );
    setCategories(updated);
    handleSaveSetting("categories", updated);
  };

  const handleRemoveCategory = (slug) => {
    const updated = categories.filter((c) => c.slug !== slug);
    setCategories(updated);
    handleSaveSetting("categories", updated);
  };

  const categoryColumns = [
    {
      key: "name",
      header: "Category Name",
      sortable: true,
      cell: (r) => <span className="font-bold text-slate-900">{r.name}</span>,
    },
    {
      key: "slug",
      header: "Slug Identifier",
      cell: (r) => (
        <span className="font-mono text-xs text-slate-500">{r.slug}</span>
      ),
    },
    {
      key: "active",
      header: "Status",
      cell: (r) => (
        <StatusBadge status={r.active ? "active" : "inactive"} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleCategory(r.slug)}
            className="text-[10px] font-bold h-7 px-2.5 rounded-lg cursor-pointer"
          >
            {r.active ? "Disable" : "Enable"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRemoveCategory(r.slug)}
            className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 shadow-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Content & CMS Config"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Dynamic CMS &amp;
            Content Controls
          </h2>
        </div>

        {/* 1. Category Management */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-600" /> Vertical
              Category Taxonomy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <FormInput
              name="catName"
              placeholder="e.g. Health & Fitness"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-"),
                })
              }
            />
            <FormInput
              name="catSlug"
              placeholder="e.g. health-fitness"
              value={newCategory.slug}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-"),
                })
              }
            />
            <Button
              onClick={handleAddCategory}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer gap-1 mt-auto"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>

          <DataTable
            columns={categoryColumns}
            data={categories}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search categories..."
            defaultPageSize={5}
          />
        </Card>

        {/* 2. Revival Statistics */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600" /> Revival Counter
              Global Stats
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormInput
              name="totalReq"
              label="Total Requests"
              type="number"
              value={statsForm.totalRequests}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  totalRequests: Number(e.target.value),
                })
              }
            />
            <FormInput
              name="monthReq"
              label="This Month Requests"
              type="number"
              value={statsForm.thisMonthRequests}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  thisMonthRequests: Number(e.target.value),
                })
              }
            />
            <FormInput
              name="recAmt"
              label="Recovered Value (₹)"
              type="number"
              value={statsForm.recoveredAmount}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  recoveredAmount: Number(e.target.value),
                })
              }
            />
            <FormInput
              name="succRate"
              label="Success Rate (%)"
              type="number"
              step="0.1"
              value={statsForm.successRate}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  successRate: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSaveSetting("revival_stats", statsForm)}
              disabled={savingKey === "revival_stats"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer"
            >
              {savingKey === "revival_stats"
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : "Save Revival Metrics"}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
