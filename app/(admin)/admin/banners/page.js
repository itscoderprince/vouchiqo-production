"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpToLine,
  Check,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
  Sliders,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/shared/data/StatusBadge";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { uploadFile } from "@/lib/fetcher";
import { showError, showSuccess } from "@/lib/toast";

const SLOTS = [
  {
    id: "hero",
    label: "Top Hero Section",
    recommendedSize: "1200 × 430 px (~2.8:1)",
    aliases: ["hero", "left-hero", "top-hero"],
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    activeTabBg: "bg-blue-600 text-white shadow-sm shadow-blue-500/30",
    inactiveTabBg: "text-blue-700 hover:bg-blue-100/70 bg-blue-50/40",
    cardBorder: "border-blue-200/90",
    headerBg: "bg-blue-50/70 text-blue-950 border-blue-100",
    submitBtn: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20",
    accentText: "text-blue-600",
    subCardBg: "bg-blue-50/30 border-blue-100/80",
  },
  {
    id: "trending",
    label: "Trending Offers",
    recommendedSize: "1400 × 300 px (~4.6:1)",
    aliases: ["trending", "trending-offer"],
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    activeTabBg: "bg-purple-600 text-white shadow-sm shadow-purple-500/30",
    inactiveTabBg: "text-purple-700 hover:bg-purple-100/70 bg-purple-50/40",
    cardBorder: "border-purple-200/90",
    headerBg: "bg-purple-50/70 text-purple-950 border-purple-100",
    submitBtn: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-purple-500/20",
    accentText: "text-purple-600",
    subCardBg: "bg-purple-50/30 border-purple-100/80",
  },
  {
    id: "popup",
    label: "Popup Banner Modal",
    recommendedSize: "600 × 400 px (3:2)",
    aliases: ["popup", "popup-modal"],
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    activeTabBg: "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30",
    inactiveTabBg: "text-emerald-700 hover:bg-emerald-100/70 bg-emerald-50/40",
    cardBorder: "border-emerald-200/90",
    headerBg: "bg-emerald-50/70 text-emerald-950 border-emerald-100",
    submitBtn: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20",
    accentText: "text-emerald-600",
    subCardBg: "bg-emerald-50/30 border-emerald-100/80",
  },
];

const QUICK_COLORS = [
  { label: "Amber", hex: "#f59e0b" },
  { label: "Orange", hex: "#e85d04" },
  { label: "Blue", hex: "#2563eb" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Purple", hex: "#8b5cf6" },
  { label: "Dark Slate", hex: "#0f172a" },
  { label: "White", hex: "#ffffff" },
];

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  buttonText: "",
  image: "",
  logo: "",
  link: "",
  slot: "hero",
  priority: 0,
  isPaid: false,
  status: "active",
  textColor: "#ffffff",
  subtitleColor: "#fbbf24",
  buttonBgColor: "#f59e0b",
  buttonTextColor: "#0f172a",
  textPosition: "left",
};

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...INITIAL_FORM, slot: "hero" });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const imageInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.success && json.data) {
        setBanners(json.data);
      }
    } catch (err) {
      showError("Failed to load promo banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (!editingId) {
      setForm((prev) => ({ ...prev, slot: tabId }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await uploadFile(file, "banners");
      setForm((prev) => ({ ...prev, image: url }));
      showSuccess("Banner image uploaded successfully!");
    } catch (err) {
      showError("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const url = await uploadFile(file, "logos");
      setForm((prev) => ({ ...prev, logo: url }));
      showSuccess("Brand logo uploaded successfully!");
    } catch (err) {
      showError("Logo upload failed: " + err.message);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleStartEdit = (banner) => {
    setEditingId(banner._id);
    let resolvedSlot = banner.slot || "hero";
    if (resolvedSlot === "left-hero") resolvedSlot = "hero";
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      image: banner.image || "",
      logo: banner.logo || "",
      link: banner.link || "",
      slot: resolvedSlot,
      priority: banner.priority ?? 0,
      isPaid: Boolean(banner.isPaid),
      status: banner.status || "active",
      textColor: banner.textColor || "#ffffff",
      subtitleColor: banner.subtitleColor || "#fbbf24",
      buttonBgColor: banner.buttonBgColor || "#f59e0b",
      buttonTextColor: banner.buttonTextColor || "#0f172a",
      textPosition: banner.textPosition || "left",
    });
    setActiveTab(resolvedSlot);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ ...INITIAL_FORM, slot: activeTab });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.image) {
      return showError(
        "Banner Image is required. Please upload or provide an Image URL.",
      );
    }

    setSaving(true);
    try {
      const endpoint = "/api/admin/banners";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...form,
        slot: form.slot || activeTab,
        priority: Number(form.priority),
        link: form.link ? form.link.trim() : "#",
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(
          editingId ? "Promo banner updated!" : "Promo banner added!",
        );
        handleCancelEdit();
        fetchBanners();
      } else {
        showError(json.error || "Failed to save banner.");
      }
    } catch (err) {
      showError("An error occurred while saving the banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSponsored = async (bannerId, currentIsPaid) => {
    const nextIsPaid = !currentIsPaid;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerId, isPaid: nextIsPaid }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(
          `Placement updated to ${nextIsPaid ? "Sponsored" : "Standard"}.`,
        );
        setBanners((prev) =>
          prev.map((b) =>
            b._id === bannerId ? { ...b, isPaid: nextIsPaid } : b,
          ),
        );
      } else {
        showError(json.error || "Failed to update placement type.");
      }
    } catch (err) {
      showError("Failed to update placement type.");
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerId, status: nextStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(`Banner status updated to ${nextStatus}.`);
        setBanners((prev) =>
          prev.map((b) => (b._id === bannerId ? { ...b, status: nextStatus } : b)),
        );
      } else {
        showError(json.error || "Failed to toggle status.");
      }
    } catch (err) {
      showError("Failed to update status.");
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const handleDeleteBanner = (banner) => {
    setDeleteTarget(banner);
  };

  const confirmDeleteBanner = async () => {
    if (!deleteTarget?._id) return;
    try {
      setDeletePending(true);
      const res = await fetch(`/api/admin/banners?id=${deleteTarget._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess("Banner deleted.");
        setBanners((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      } else {
        showError(json.error || "Failed to delete banner.");
      }
    } catch (err) {
      showError("Failed to delete banner.");
    } finally {
      setDeletePending(false);
      setDeleteTarget(null);
    }
  };

  const currentSlotConfig = SLOTS.find((s) => s.id === activeTab) || SLOTS[0];
  
  // Filter by slot and sort by priority descending
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        if (!currentSlotConfig) return true;
        const bSlot = b.slot || "hero";
        return (
          currentSlotConfig.aliases.includes(bSlot) ||
          (activeTab === "hero" && (bSlot === "left-hero" || bSlot === "hero"))
        );
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [banners, currentSlotConfig, activeTab]);

  const [draggedBannerId, setDraggedBannerId] = useState(null);
  const [dragOverBannerId, setDragOverBannerId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [editingPriorityId, setEditingPriorityId] = useState(null);
  const [priorityInputVal, setPriorityInputVal] = useState("");

  const syncReorderedList = async (reorderedSubset) => {
    try {
      setReordering(true);
      const total = reorderedSubset.length;
      const updatedSubset = reorderedSubset.map((b, idx) => ({
        ...b,
        priority: (total - idx) * 10,
      }));

      // Optimistic update
      setBanners((prev) => {
        const otherBanners = prev.filter(
          (b) => !reorderedSubset.some((r) => r._id === b._id),
        );
        return [...updatedSubset, ...otherBanners];
      });

      const bannerIds = reorderedSubset.map((b) => b._id);
      const res = await fetch("/api/admin/banners/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerIds }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess("Banner order updated & synced to homepage!");
      } else {
        showError(json.error || "Failed to update banner order.");
        fetchBanners();
      }
    } catch (err) {
      showError("Error saving banner order.");
      fetchBanners();
    } finally {
      setReordering(false);
    }
  };

  const handleMoveToTop = async (bannerId) => {
    const list = [...filteredBanners];
    const index = list.findIndex((b) => b._id === bannerId);
    if (index <= 0) return;
    const [moved] = list.splice(index, 1);
    list.unshift(moved);
    await syncReorderedList(list);
  };

  const handleMoveStep = async (bannerId, delta) => {
    const list = [...filteredBanners];
    const index = list.findIndex((b) => b._id === bannerId);
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    await syncReorderedList(list);
  };

  const handleDragStart = (e, id) => {
    setDraggedBannerId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverBannerId !== id) {
      setDragOverBannerId(id);
    }
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    const sourceId = draggedBannerId || e.dataTransfer.getData("text/plain");
    setDraggedBannerId(null);
    setDragOverBannerId(null);
    if (!sourceId || sourceId === targetId) return;

    const list = [...filteredBanners];
    const fromIndex = list.findIndex((b) => b._id === sourceId);
    const toIndex = list.findIndex((b) => b._id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    await syncReorderedList(list);
  };

  const handleSavePriority = async (bannerId) => {
    const num = Number(priorityInputVal);
    if (Number.isNaN(num)) {
      setEditingPriorityId(null);
      return;
    }
    setEditingPriorityId(null);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerId, priority: num }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess("Priority updated!");
        setBanners((prev) =>
          prev.map((b) => (b._id === bannerId ? { ...b, priority: num } : b)),
        );
      } else {
        showError(json.error || "Failed to update priority.");
      }
    } catch (err) {
      showError("Failed to update priority.");
    }
  };

  const getSlotCount = (slotId) => {
    const cfg = SLOTS.find((s) => s.id === slotId);
    if (!cfg) return 0;
    return banners.filter((b) => {
      const bSlot = b.slot || "hero";
      return (
        cfg.aliases.includes(bSlot) ||
        (slotId === "hero" && (bSlot === "left-hero" || bSlot === "hero"))
      );
    }).length;
  };

  const displayedBanners = useMemo(() => {
    if (!searchTableQuery.trim()) return filteredBanners;
    const q = searchTableQuery.toLowerCase();
    return filteredBanners.filter(
      (b) =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.link && b.link.toLowerCase().includes(q)) ||
        (b.buttonText && b.buttonText.toLowerCase().includes(q)),
    );
  }, [filteredBanners, searchTableQuery]);



  return (
    <DashboardLayout
      title="Promo Banner Management"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-3.5 text-left font-[family-name:var(--font-inter),sans-serif] w-full max-w-7xl mx-auto pb-6">
        {/* Compact Tab Switchers with Color Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 overflow-x-auto w-full sm:w-auto shadow-2xs">
            {SLOTS.map((slot) => {
              const count = getSlotCount(slot.id);
              const isActive = activeTab === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleTabChange(slot.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? slot.activeTabBg
                      : slot.inactiveTabBg
                  }`}
                >
                  <span>{slot.label}</span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/70 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <Badge className={`${currentSlotConfig.badgeColor} text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1 border`}>
            <span>Upload Size:</span>
            <span className="font-extrabold">{currentSlotConfig.recommendedSize}</span>
          </Badge>
        </div>

        {/* Ultra-Compact Form Card - Color Dynamic Theme per Active Tab */}
        <Card className={`border ${currentSlotConfig.cardBorder} shadow-sm rounded-xl bg-white p-3.5 text-left space-y-3`}>
          <form onSubmit={handleSubmitForm} className="space-y-2.5">
            {/* Header */}
            <div className={`flex items-center justify-between p-2 rounded-lg ${currentSlotConfig.headerBg} border`}>
              <div className="flex items-center gap-2">
                <Sliders className={`w-4 h-4 ${currentSlotConfig.accentText}`} />
                <h2 className="text-xs font-extrabold tracking-tight">
                  {editingId
                    ? `Edit Banner — ${currentSlotConfig.label}`
                    : `Add Banner to ${currentSlotConfig.label}`}
                </h2>
                {editingId && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold px-2 py-0.2 rounded">
                    Editing
                  </Badge>
                )}
              </div>

              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-6 text-xs font-bold text-slate-600 hover:bg-white/80 px-2 rounded gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </Button>
              )}
            </div>

            {/* Media Uploads Row */}
            <div className={`grid grid-cols-1 ${activeTab === "hero" ? "md:grid-cols-2" : ""} gap-2.5`}>
              {/* Banner Image */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Banner Image <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                    className="h-5.5 text-[10px] font-medium text-indigo-600 bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100 cursor-pointer gap-1 px-1.5 rounded"
                  >
                    {uploadingImage ? (
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Upload className="w-2.5 h-2.5" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload Cloudinary"}</span>
                  </Button>
                </div>
                <Input
                  placeholder="https://images.unsplash.com/photo-... or upload"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  required
                  className="h-7.5 text-xs border-slate-200 bg-white"
                />
              </div>

              {/* Brand Logo (Hero Only) */}
              {activeTab === "hero" && (
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Brand Logo <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="h-5.5 text-[10px] font-medium text-indigo-600 bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100 cursor-pointer gap-1 px-1.5 rounded"
                    >
                      {uploadingLogo ? (
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Upload className="w-2.5 h-2.5" />
                      )}
                      <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                    </Button>
                  </div>
                  <Input
                    placeholder="https://... logo thumbnail URL"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    className="h-7.5 text-xs border-slate-200 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Inputs & Customization */}
            {activeTab === "popup" ? (
              <div className="space-y-0.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  Destination Link <span className="text-slate-400 font-normal">(Redirects user on popup click)</span>
                </label>
                <Input
                  placeholder="e.g. /deals or https://..."
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="h-7.5 text-xs border-slate-200 bg-white"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Headline / Title
                    </label>
                    <Input
                      placeholder="Overlay Title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="h-7.5 text-xs border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Tagline / Subtitle
                    </label>
                    <Input
                      placeholder="Overlay Subtitle"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      className="h-7.5 text-xs border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Button CTA Text
                    </label>
                    <Input
                      placeholder="e.g. Explore Offer"
                      value={form.buttonText}
                      onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                      className="h-7.5 text-xs border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Destination Link
                    </label>
                    <Input
                      placeholder="e.g. /deals or https://..."
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="h-7.5 text-xs border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Compact Color Controls Bar */}
                <div className={`${currentSlotConfig.subCardBg} p-2 rounded-lg space-y-1.5 border`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Inline Color Pickers */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-600">Button BG:</span>
                        <input
                          type="color"
                          value={form.buttonBgColor}
                          onChange={(e) =>
                            setForm({ ...form, buttonBgColor: e.target.value })
                          }
                          className="w-5.5 h-5.5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                        />
                        <Input
                          value={form.buttonBgColor}
                          onChange={(e) =>
                            setForm({ ...form, buttonBgColor: e.target.value })
                          }
                          className="h-6.5 w-18 text-[11px] font-mono border-slate-200 bg-white px-1.5"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-600">Button Text:</span>
                        <input
                          type="color"
                          value={form.buttonTextColor}
                          onChange={(e) =>
                            setForm({ ...form, buttonTextColor: e.target.value })
                          }
                          className="w-5.5 h-5.5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                        />
                        <Input
                          value={form.buttonTextColor}
                          onChange={(e) =>
                            setForm({ ...form, buttonTextColor: e.target.value })
                          }
                          className="h-6.5 w-18 text-[11px] font-mono border-slate-200 bg-white px-1.5"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-600">Headline:</span>
                        <input
                          type="color"
                          value={form.textColor}
                          onChange={(e) =>
                            setForm({ ...form, textColor: e.target.value })
                          }
                          className="w-5.5 h-5.5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                        />
                        <Input
                          value={form.textColor}
                          onChange={(e) =>
                            setForm({ ...form, textColor: e.target.value })
                          }
                          className="h-6.5 w-18 text-[11px] font-mono border-slate-200 bg-white px-1.5"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-600">Tagline:</span>
                        <input
                          type="color"
                          value={form.subtitleColor}
                          onChange={(e) =>
                            setForm({ ...form, subtitleColor: e.target.value })
                          }
                          className="w-5.5 h-5.5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                        />
                        <Input
                          value={form.subtitleColor}
                          onChange={(e) =>
                            setForm({ ...form, subtitleColor: e.target.value })
                          }
                          className="h-6.5 w-18 text-[11px] font-mono border-slate-200 bg-white px-1.5"
                        />
                      </div>
                    </div>

                    {/* Text Alignment Selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-slate-600">Align:</span>
                      <div className="flex items-center p-0.5 bg-white rounded border border-slate-200">
                        {["left", "center", "right"].map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setForm({ ...form, textPosition: pos })}
                            className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded cursor-pointer transition-all ${
                              form.textPosition === pos
                                ? `${currentSlotConfig.activeTabBg}`
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Presets & Live Preview */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-slate-200/50">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-500">Presets:</span>
                      {QUICK_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              buttonBgColor: c.hex,
                              buttonTextColor: c.hex === "#ffffff" ? "#0f172a" : "#ffffff",
                            })
                          }
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>

                    {(form.image || form.title || form.buttonText) && (
                      <div className="relative w-full sm:w-60 h-12 rounded-md overflow-hidden border border-slate-300 bg-slate-950 shrink-0">
                        {form.image ? (
                          <img
                            src={form.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-[9px]">
                            No image
                          </div>
                        )}
                        <div
                          className={`absolute inset-0 flex flex-col justify-center px-2.5 gap-0.2 pointer-events-none ${
                            form.textPosition === "center"
                              ? "items-center text-center bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"
                              : form.textPosition === "right"
                                ? "items-end text-right bg-gradient-to-l from-slate-950/80 via-slate-950/40 to-transparent"
                                : "items-start text-left bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"
                          }`}
                        >
                          {form.subtitle && (
                            <span
                              className="text-[8px] font-semibold uppercase tracking-wider truncate max-w-full"
                              style={{ color: form.subtitleColor }}
                            >
                              {form.subtitle}
                            </span>
                          )}
                          {form.title && (
                            <h4
                              className="text-[9px] font-extrabold leading-tight truncate max-w-full"
                              style={{ color: form.textColor }}
                            >
                              {form.title}
                            </h4>
                          )}
                          {form.buttonText && (
                            <span
                              className="inline-flex items-center px-1 py-0.2 rounded text-[7px] font-bold shadow-2xs mt-0.5"
                              style={{
                                backgroundColor: form.buttonBgColor,
                                color: form.buttonTextColor,
                              }}
                            >
                              {form.buttonText}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Publishing & Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 shrink-0">
                    Priority:
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="h-7 w-16 text-xs border-slate-200 bg-white px-1.5 text-center font-semibold"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-700">Sponsored:</span>
                  <Switch
                    checked={form.isPaid}
                    onCheckedChange={(val) => setForm({ ...form, isPaid: val })}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-700">Active:</span>
                  <Switch
                    checked={form.status === "active"}
                    onCheckedChange={(val) =>
                      setForm({ ...form, status: val ? "active" : "inactive" })
                    }
                  />
                </div>
              </div>

              {/* Action Submit Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-7 px-2.5 text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving}
                  className={`${currentSlotConfig.submitBtn} text-white text-xs font-semibold rounded h-7 px-3.5 cursor-pointer gap-1 shadow-2xs transition-all`}
                >
                  {saving ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : editingId ? (
                    <Pencil className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  <span>
                    {editingId
                      ? `Update Banner`
                      : `Add Banner (${currentSlotConfig?.label})`}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Data Table Card with Drag-and-Drop & Quick Move Reordering */}
        <Card className={`border ${currentSlotConfig.cardBorder} shadow-2xs rounded-xl bg-white p-3.5 text-left`}>
          {/* Table Header Controls: Search & Reorder Tip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${currentSlotConfig?.label} banners...`}
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              {searchTableQuery && (
                <button
                  onClick={() => setSearchTableQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {displayedBanners.length} results
              </span>
              <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 hidden md:inline-flex items-center gap-1">
                <GripVertical className="w-3 h-3 text-blue-500" />
                <span>Drag rows or use 1-Click Top to reorder</span>
              </span>
              {reordering && (
                <span className="text-[10.5px] text-amber-600 font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing order...</span>
                </span>
              )}
            </div>
          </div>

          {/* Drag & Drop Table Container */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center w-28">Order & Move</th>
                  <th className="py-2.5 px-3">Banner Preview & Details</th>
                  {activeTab === "hero" && (
                    <th className="py-2.5 px-2 text-center w-16">Brand Logo</th>
                  )}
                  {activeTab !== "popup" && (
                    <>
                      <th className="py-2.5 px-2 text-center w-28">Custom Colors</th>
                      <th className="py-2.5 px-2 text-center w-24">Button CTA</th>
                    </>
                  )}
                  <th className="py-2.5 px-2 text-center w-20">Priority</th>
                  <th className="py-2.5 px-2 text-center w-24">Type</th>
                  <th className="py-2.5 px-2 text-center w-20">Status</th>
                  <th className="py-2.5 px-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400 text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                      Loading promotional banners...
                    </td>
                  </tr>
                ) : displayedBanners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400 text-xs">
                      No promotional banners found for {currentSlotConfig?.label}.
                    </td>
                  </tr>
                ) : (
                  displayedBanners.map((r, index) => {
                    const isDragging = draggedBannerId === r._id;
                    const isOver = dragOverBannerId === r._id;
                    const isTop = index === 0;
                    const isBottom = index === displayedBanners.length - 1;

                    return (
                      <tr
                        key={r._id}
                        draggable={!searchTableQuery}
                        onDragStart={(e) => handleDragStart(e, r._id)}
                        onDragOver={(e) => handleDragOver(e, r._id)}
                        onDrop={(e) => handleDrop(e, r._id)}
                        onDragEnd={() => {
                          setDraggedBannerId(null);
                          setDragOverBannerId(null);
                        }}
                        className={`transition-all duration-150 ${
                          isDragging
                            ? "opacity-30 bg-blue-50"
                            : isOver
                              ? "bg-blue-50/80 ring-2 ring-blue-500 ring-inset"
                              : index % 2 === 0
                                ? "bg-white hover:bg-slate-50/80"
                                : "bg-slate-50/30 hover:bg-slate-50/80"
                        }`}
                      >
                        {/* 1. Order & Reorder Controls */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Drag Handle */}
                            <span
                              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors"
                              title="Drag to reorder slide position"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>

                            {/* Rank Badge */}
                            <span
                              className={`text-[10.5px] font-extrabold px-1.5 py-0.2 rounded-md border shrink-0 ${
                                isTop
                                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-black"
                                  : index === 1
                                    ? "bg-blue-100 text-blue-900 border-blue-300"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                              title={`Display Rank #${index + 1}`}
                            >
                              #{index + 1}
                            </span>

                            {/* 1-Click Move to Top Button */}
                            {!isTop && (
                              <button
                                onClick={() => handleMoveToTop(r._id)}
                                type="button"
                                className="p-1 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                                title="Move to Top (#1 Position)"
                              >
                                <ArrowUpToLine className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Step Move Up/Down Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => handleMoveStep(r._id, -1)}
                                disabled={isTop}
                                type="button"
                                className={`p-0.5 rounded transition-colors ${
                                  isTop
                                    ? "text-slate-200 cursor-not-allowed"
                                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                }`}
                                title="Move Up 1 slot"
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleMoveStep(r._id, 1)}
                                disabled={isBottom}
                                type="button"
                                className={`p-0.5 rounded transition-colors ${
                                  isBottom
                                    ? "text-slate-200 cursor-not-allowed"
                                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                }`}
                                title="Move Down 1 slot"
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 2. Banner Preview & Details */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {r.image ? (
                              <img
                                src={r.image}
                                alt={r.title || "Banner"}
                                className="w-14 h-8 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-[10px] shrink-0 border border-slate-200">
                                No Image
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-800 text-xs truncate block leading-tight">
                                {r.title || (
                                  <span className="text-slate-400 font-normal italic">
                                    Pure Image Banner (No Text Overlay)
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium truncate block leading-tight mt-0.5">
                                {r.subtitle || (r.link && r.link !== "#" ? r.link : "No Destination Link")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Brand Logo */}
                        {activeTab === "hero" && (
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex justify-center">
                              {r.logo ? (
                                <img
                                  src={r.logo}
                                  alt="Logo"
                                  className="w-5 h-5 object-contain rounded border border-slate-200 p-0.5 bg-white shadow-2xs"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-400">—</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* 4. Custom Colors */}
                        {activeTab !== "popup" && (
                          <>
                            <td className="py-2.5 px-2 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div
                                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                                  style={{ backgroundColor: r.buttonBgColor || "#f59e0b" }}
                                  title={`Button BG: ${r.buttonBgColor || "#f59e0b"}`}
                                />
                                <div
                                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                                  style={{ backgroundColor: r.subtitleColor || "#fbbf24" }}
                                  title={`Subtitle: ${r.subtitleColor || "#fbbf24"}`}
                                />
                                <span className="text-[9px] font-bold uppercase text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                  {r.textPosition || "left"}
                                </span>
                              </div>
                            </td>

                            {/* 5. Button CTA */}
                            <td className="py-2.5 px-2 text-center">
                              <div className="flex justify-center">
                                {r.buttonText ? (
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs max-w-[90px] truncate block"
                                    style={{
                                      backgroundColor: r.buttonBgColor || "#f59e0b",
                                      color: r.buttonTextColor || "#0f172a",
                                    }}
                                  >
                                    {r.buttonText}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">—</span>
                                )}
                              </div>
                            </td>
                          </>
                        )}

                        {/* 6. Priority with Inline Quick-Edit */}
                        <td className="py-2.5 px-2 text-center">
                          {editingPriorityId === r._id ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                autoFocus
                                value={priorityInputVal}
                                onChange={(e) => setPriorityInputVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSavePriority(r._id);
                                  if (e.key === "Escape") setEditingPriorityId(null);
                                }}
                                onBlur={() => handleSavePriority(r._id)}
                                className="w-12 text-center text-xs font-bold border border-blue-500 rounded py-0.5 outline-none bg-white shadow-2xs"
                              />
                              <button
                                onClick={() => handleSavePriority(r._id)}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPriorityId(r._id);
                                setPriorityInputVal(String(r.priority ?? 0));
                              }}
                              className="inline-flex items-center justify-center text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                              title="Click to edit priority number"
                            >
                              {r.priority ?? 0}
                            </button>
                          )}
                        </td>

                        {/* 7. Placement Type Toggle */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <Switch
                              size="sm"
                              checked={Boolean(r.isPaid)}
                              onCheckedChange={() => handleToggleSponsored(r._id, r.isPaid)}
                              aria-label="Toggle Sponsored placement"
                            />
                            {r.isPaid ? (
                              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full">
                                Sponsored
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-full">
                                Standard
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 8. Status */}
                        <td className="py-2.5 px-2 text-center">
                          <StatusBadge status={r.status} size="sm" />
                        </td>

                        {/* 9. Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Switch
                              size="sm"
                              checked={r.status === "active"}
                              onCheckedChange={() => handleToggleStatus(r._id, r.status)}
                              aria-label="Toggle active status"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(r)}
                              className="h-6 w-6 p-0 text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 rounded cursor-pointer flex items-center justify-center shrink-0 transition-all shadow-2xs"
                              title="Edit Banner"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBanner(r)}
                              className="h-6 w-6 p-0 text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 rounded cursor-pointer flex items-center justify-center shrink-0 transition-all shadow-2xs"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Promotional Banner"
        itemName={deleteTarget?.title || deleteTarget?.slot}
        onConfirm={confirmDeleteBanner}
        isPending={deletePending}
      />
    </DashboardLayout>
  );
}
