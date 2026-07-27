"use client";

import {
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Link as LinkIcon,
  MousePointerClick,
  Plus,
  RefreshCw,
  Sliders,
  Trash2,
  Type,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { FormInput, FormSelect } from "@/components/shared/form";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { showError, showSuccess } from "@/lib/toast";

const SLOT_OPTIONS = [
  { value: "left-hero", label: "Left Primary Hero Card" },
  { value: "top-right", label: "Top-Right Hero Banner" },
  { value: "bottom-right", label: "Bottom-Right Hero Banner" },
];

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "Explore",
    image: "",
    logo: "",
    link: "",
    slot: "left-hero",
    priority: 0,
    isPaid: false,
    status: "active",
  });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.success && json.data) setBanners(json.data);
    } catch (err) {
      showError("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image || !form.link || !form.slot) {
      return showError("Please fill in all required fields.");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priority: Number(form.priority) }),
      });

      if (res.ok) {
        showSuccess("Promo banner added successfully!");
        setForm({
          title: "",
          subtitle: "",
          buttonText: "Explore",
          image: "",
          logo: "",
          link: "",
          slot: "left-hero",
          priority: 0,
          isPaid: false,
          status: "active",
        });
        fetchBanners();
      } else {
        showError("Failed to create banner.");
      }
    } catch (err) {
      showError("An error occurred while creating the banner.");
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
      if (res.ok) {
        showSuccess(`Banner set to ${nextStatus}`);
        setBanners((prev) =>
          prev.map((b) =>
            String(b._id) === String(bannerId)
              ? { ...b, status: nextStatus }
              : b,
          ),
        );
      } else {
        showError("Failed to toggle banner status.");
      }
    } catch (err) {
      showError("Failed to toggle banner status.");
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const handleDeleteBanner = async (banner) => {
    setDeleteTarget(banner);
  };

  const confirmDeleteBanner = async () => {
    if (!deleteTarget) return;
    try {
      setDeletePending(true);
      const res = await fetch(`/api/admin/banners?id=${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showSuccess("Banner deleted successfully!");
        setBanners((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      }
    } catch (err) {
      showError("Failed to delete banner.");
    } finally {
      setDeletePending(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Banner & Preview",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.image
            ? 
              <img
                src={r.image}
                alt={r.title}
                className="w-12 h-8 object-cover rounded-lg border border-slate-200"
              />
            : <div className="w-12 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <ImageIcon className="w-4 h-4" />
              </div>}
          <div>
            <span className="font-bold text-slate-900 block">{r.title}</span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {r.subtitle || "No Subtitle"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "slot",
      header: "Display Placement",
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
          {r.slot}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority Weight",
      sortable: true,
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {r.priority || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (r) => (
        <div className="flex justify-center">
          <StatusBadge status={r.status} size="sm" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (r) => (
        <div className="flex items-center justify-center gap-2">
          <Switch
            size="sm"
            checked={r.status === "active"}
            onCheckedChange={() => handleToggleStatus(r._id, r.status)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteBanner(r)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 h-7 w-7 p-0 shadow-none cursor-pointer rounded-lg flex items-center justify-center shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
      <div className="space-y-6 text-left font-sans w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#e85d04]" /> Hero Banner
              Management (/admin/banners)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure home page hero slot slides, subtitles &amp; direct routing
              links.
            </p>
          </div>
        </div>

        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 text-left">
          <form onSubmit={handleCreateBanner} className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#e85d04]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Create New Banner Slide
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Banner Title"
                icon={Type}
                placeholder="e.g. Pre-Diwali Grand Festival Sale"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <FormInput
                label="Sub-headline / Tagline"
                icon={FileText}
                placeholder="e.g. Extra 20% OFF on Jewellers across Ranchi"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormSelect
                label="Display Slot Position"
                icon={LayoutGrid}
                options={SLOT_OPTIONS}
                value={form.slot}
                onValueChange={(val) => setForm({ ...form, slot: val })}
              />
              <FormInput
                label="Button CTA Text"
                icon={MousePointerClick}
                placeholder="e.g. Claim Now"
                value={form.buttonText}
                onChange={(e) =>
                  setForm({ ...form, buttonText: e.target.value })
                }
              />
              <FormInput
                label="Destination Route Link"
                icon={LinkIcon}
                placeholder="e.g. /deals?category=jewelry"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>

            <FormInput
              label="Banner Image URL (Unsplash or Cloudinary)"
              icon={ImageIcon}
              placeholder="https://images.unsplash.com/photo-1515562141207..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-10 px-6 cursor-pointer gap-1.5"
              >
                {saving
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Plus className="w-4 h-4" />}
                <span>Add Banner Slot</span>
              </Button>
            </div>
          </form>
        </Card>

        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left">
          <DataTable
            columns={columns}
            data={banners}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search promo banners..."
            defaultPageSize={10}
            emptyState="No promotional banners configured."
          />
        </Card>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Promotional Banner"
        itemName={deleteTarget?.title}
        onConfirm={confirmDeleteBanner}
        isPending={deletePending}
      />
    </DashboardLayout>
  );
}
