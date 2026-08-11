"use client";

import {
  ImageIcon,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Sliders,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
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
  const filteredBanners = banners.filter((b) => {
    if (!currentSlotConfig) return true;
    const bSlot = b.slot || "hero";
    return (
      currentSlotConfig.aliases.includes(bSlot) ||
      (activeTab === "hero" && (bSlot === "left-hero" || bSlot === "hero"))
    );
  });

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

  const rawColumns = [
    {
      key: "title",
      header: "Banner Preview & Details",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-2.5 py-0.5">
          {r.image ? (
            <img
              src={r.image}
              alt={r.title || "Banner"}
              className="w-12 h-7.5 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-12 h-7.5 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-[10px] shrink-0 border border-slate-200">
              No Image
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-800 text-xs truncate block leading-tight">
              {r.title || (
                <span className="text-slate-400 font-normal italic">
                  Pure Image Banner (No Text Overlay)
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate block leading-tight">
              {r.subtitle || (r.link && r.link !== "#" ? r.link : "No Destination Link")}
            </span>
          </div>
        </div>
      ),
    },
    ...(activeTab === "hero"
      ? [
          {
            key: "logo",
            header: "Brand Logo",
            align: "center",
            cell: (r) => (
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
            ),
          },
        ]
      : []),
    ...(activeTab !== "popup"
      ? [
          {
            key: "styling",
            header: "Custom Colors",
            align: "center",
            cell: (r) => (
              <div className="flex items-center justify-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: r.buttonBgColor || "#f59e0b" }}
                  title={`Button BG: ${r.buttonBgColor || "#f59e0b"}`}
                />
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: r.subtitleColor || "#fbbf24" }}
                  title={`Subtitle Color: ${r.subtitleColor || "#fbbf24"}`}
                />
                <span className="text-[9px] font-bold uppercase text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                  {r.textPosition || "left"}
                </span>
              </div>
            ),
          },
          {
            key: "buttonText",
            header: "Button CTA",
            align: "center",
            cell: (r) => (
              <div className="flex justify-center">
                {r.buttonText ? (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs"
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
            ),
          },
        ]
      : []),
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      align: "center",
      cell: (r) => (
        <span className="inline-flex items-center justify-center text-[11px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {r.priority ?? 0}
        </span>
      ),
    },
    {
      key: "isPaid",
      header: "Type",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center">
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
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center items-center gap-1.5">
          <StatusBadge status={r.status} size="sm" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (r) => (
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
      ),
    },
  ];

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

        {/* Data Table Card */}
        <Card className={`border ${currentSlotConfig.cardBorder} shadow-2xs rounded-xl bg-white p-3 text-left`}>
          <DataTable
            columns={rawColumns}
            data={filteredBanners}
            loading={loading}
            searchable={true}
            searchPlaceholder={`Search ${currentSlotConfig?.label} banners...`}
            searchKeys={["title", "subtitle", "link", "buttonText"]}
            defaultPageSize={10}
            emptyState={`No promotional banners configured for ${currentSlotConfig?.label}.`}
          />
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
