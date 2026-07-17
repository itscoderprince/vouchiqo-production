"use client";

import {
  CheckCircle2,
  DollarSign,
  Eye,
  FolderOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";

export default function PlatformContentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Revival Stats local states
  const [statsForm, setStatsForm] = useState({
    totalRequests: 5240,
    thisMonthRequests: 142,
    recoveredAmount: 1250000,
    successRate: 94.2,
  });

  // Social Proof local states
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({
    user: "",
    brand: "",
    offer: "",
    date: "Just now",
    text: "",
  });

  // Categories local states
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      setSettings(data);

      if (data.revival_stats) setStatsForm(data.revival_stats);
      if (data.social_proof) setTestimonials(data.social_proof);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const triggerSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleSaveSetting = async (key, value) => {
    try {
      setSavingKey(key);
      await adminUpdateSetting(key, value);
      triggerSuccess(`Setting '${key}' saved successfully!`);
    } catch (err) {
      console.error("Error saving setting:", err);
      alert(`Failed to save setting '${key}'`);
    } finally {
      setSavingKey("");
    }
  };

  // ─────────────────────────────────────────────
  // Testimonial Handlers
  // ─────────────────────────────────────────────
  const handleAddTestimonial = () => {
    if (!newTestimonial.user || !newTestimonial.brand || !newTestimonial.text) {
      alert("Please fill in User, Brand, and Testimonial Text.");
      return;
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

  // ─────────────────────────────────────────────
  // Category Handlers
  // ─────────────────────────────────────────────
  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.slug) {
      alert("Please fill in Category Name and Slug.");
      return;
    }
    const slug = newCategory.slug.trim().toLowerCase();

    // Check if category slug already exists
    if (categories.some((c) => c.slug === slug)) {
      alert("Category slug already exists.");
      return;
    }

    const updated = [
      ...categories,
      {
        id: slug,
        name: newCategory.name.trim(),
        slug,
        active: true,
      },
    ];
    setCategories(updated);
    setNewCategory({ name: "", slug: "" });
    handleSaveSetting("categories", updated);
  };

  const handleToggleCategoryActive = (slug) => {
    const updated = categories.map((c) =>
      c.slug === slug ? { ...c, active: !c.active } : c,
    );
    setCategories(updated);
    handleSaveSetting("categories", updated);
  };

  const handleRemoveCategory = (slug) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const updated = categories.filter((c) => c.slug !== slug);
      setCategories(updated);
      handleSaveSetting("categories", updated);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Platform Settings"
        user={{ name: "Platform Admin", role: "admin" }}
      >
        <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
          <span>Loading platform content configurations...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Platform Settings"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6">
        {/* Title */}
        <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-blue" />
          <span>Platform Content Settings</span>
        </h2>

        {successMessage && (
          <div className="flex gap-2.5 p-3.5 rounded-lg bg-brand-success/5 border border-brand-success/15 text-brand-success text-xs font-semibold items-center animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. REVIVAL STATISTICS EDITOR */}
        <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm">
          <CardHeader className="border-b border-brand-border pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-brand-blue" />
              <span>Revival Page Statistics</span>
            </CardTitle>
            <Button
              onClick={() => handleSaveSetting("revival_stats", statsForm)}
              disabled={savingKey === "revival_stats"}
              className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs h-8 px-4 font-bold rounded-lg cursor-pointer border-0 shadow-none"
            >
              {savingKey === "revival_stats" ? "Saving..." : "Save Stats"}
            </Button>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Total requests */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Total Requests (Processed)
              </label>
              <Input
                type="number"
                value={statsForm.totalRequests}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    totalRequests: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none"
              />
            </div>

            {/* This month requests */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Processed This Month
              </label>
              <Input
                type="number"
                value={statsForm.thisMonthRequests}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    thisMonthRequests: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none"
              />
            </div>

            {/* Recovered amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Recovered Savings Amount (₹)
              </label>
              <Input
                type="number"
                value={statsForm.recoveredAmount}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    recoveredAmount: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none"
              />
            </div>

            {/* Success rate */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Revival Success Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={statsForm.successRate}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    successRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. CATEGORIES EDITOR */}
        <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm">
          <CardHeader className="border-b border-brand-border pb-3">
            <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-brand-blue" />
              <span>Coupon Category Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Add new Category inline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-brand-surface p-3 rounded-lg border border-brand-border/40">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Category Name
                </label>
                <Input
                  placeholder="e.g. Health & Pharmacy"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="bg-white text-xs border-brand-border h-9 shadow-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Category Slug (Unique)
                </label>
                <Input
                  placeholder="e.g. health-pharmacy"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  className="bg-white text-xs border-brand-border h-9 shadow-none lowercase"
                />
              </div>

              <Button
                onClick={handleAddCategory}
                className="bg-brand-blue hover:bg-brand-blue/95 text-white text-xs font-bold h-9 px-4 border-0 rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-none"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>

            {/* List */}
            <div className="overflow-x-auto border border-brand-border rounded-lg bg-white">
              <Table className="w-full text-xs">
                <TableHeader className="bg-brand-surface hover:bg-transparent">
                  <TableRow className="hover:bg-transparent border-b border-brand-border">
                    <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Name
                    </TableHead>
                    <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Slug Code
                    </TableHead>
                    <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Visibility Status
                    </TableHead>
                    <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                  {categories.map((cat) => (
                    <TableRow
                      key={cat.slug}
                      className="hover:bg-brand-surface/20 transition-colors border-b border-brand-border last:border-b-0"
                    >
                      <TableCell className="p-3 font-bold text-brand-navy h-auto">
                        {cat.name}
                      </TableCell>
                      <TableCell className="p-3 font-mono text-brand-subtext">
                        {cat.slug}
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge
                          variant={cat.active ? "success" : "secondary"}
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                            cat.active
                              ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/10 border-0"
                              : "bg-slate-500/10 text-slate-500 hover:bg-slate-500/10 border-0"
                          } shadow-none`}
                        >
                          {cat.active ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleCategoryActive(cat.slug)}
                            className="text-[10px] font-bold h-7 py-1 px-2.5 border-brand-border text-brand-text hover:bg-brand-surface cursor-pointer shadow-none"
                          >
                            {cat.active ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCategory(cat.slug)}
                            className="text-brand-subtext hover:text-brand-error w-7 h-7 rounded hover:bg-brand-surface cursor-pointer shadow-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 3. SOCIAL PROOF (TESTIMONIALS) EDITOR */}
        <Card className="bg-brand-bg border border-brand-border rounded-xl shadow-sm">
          <CardHeader className="border-b border-brand-border pb-3">
            <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-blue" />
              <span>Social Proof Success Stories</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Add new Testimonial Panel */}
            <div className="bg-brand-surface p-4 rounded-lg border border-brand-border/40 space-y-3">
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Create New Testimonial Story
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    User (Name & City)
                  </label>
                  <Input
                    placeholder="e.g. Riya K. from Patna"
                    value={newTestimonial.user}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        user: e.target.value,
                      })
                    }
                    className="bg-white text-xs border-brand-border h-9 shadow-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Brand Name
                  </label>
                  <Input
                    placeholder="e.g. Starbucks, Zomato"
                    value={newTestimonial.brand}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        brand: e.target.value,
                      })
                    }
                    className="bg-white text-xs border-brand-border h-9 shadow-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Savings Offer / Accomplishment
                  </label>
                  <Input
                    placeholder="e.g. Saved ₹1,200 on corporate order"
                    value={newTestimonial.offer}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        offer: e.target.value,
                      })
                    }
                    className="bg-white text-xs border-brand-border h-9 shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Testimonial Quote
                </label>
                <Textarea
                  placeholder="Tell the story of how they revived their coupon..."
                  value={newTestimonial.text}
                  onChange={(e) =>
                    setNewTestimonial({
                      ...newTestimonial,
                      text: e.target.value,
                    })
                  }
                  rows={2}
                  className="bg-white text-xs border-brand-border shadow-none"
                />
              </div>

              <Button
                onClick={handleAddTestimonial}
                className="bg-brand-blue hover:bg-brand-blue/95 text-white text-xs font-bold h-9 px-5 border-0 rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-none"
              >
                <Plus className="w-4 h-4" />
                <span>Save Testimonial</span>
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-brand-border rounded-lg p-3 flex justify-between gap-4 items-start text-xs shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-brand-navy">
                        {t.brand}
                      </span>
                      <span className="text-[10px] text-brand-success font-bold bg-brand-success/5 border border-brand-success/15 px-1.5 py-0.5 rounded">
                        {t.offer}
                      </span>
                    </div>
                    <p className="text-brand-subtext font-semibold italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="text-[10px] font-bold text-slate-500">
                      — {t.user} | {t.date || "Just now"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTestimonial(idx)}
                    className="text-brand-subtext hover:text-brand-error w-8 h-8 rounded hover:bg-brand-surface flex-shrink-0 cursor-pointer shadow-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
