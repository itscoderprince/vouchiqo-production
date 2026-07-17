"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Type,
  Heading,
  Image as ImageIcon,
  Link as LinkIcon,
  PlaySquare,
  LayoutGrid,
  SortAsc,
  DollarSign,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/shared/EmptyState";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
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

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.success && json.data) {
        setBanners(json.data);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      toast.error("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image || !form.link || !form.slot) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priority: Number(form.priority),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success("Promo banner added successfully!");
          // Reset form fields
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
          toast.error(json.message || "Failed to create banner.");
        }
      } else {
        toast.error("Network response was not ok.");
      }
    } catch (err) {
      console.error("Error creating banner:", err);
      toast.error("An error occurred while creating the banner.");
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
        body: JSON.stringify({
          id: bannerId,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) =>
            b._id === bannerId ? { ...b, status: nextStatus } : b
          )
        );
        toast.success(`Banner is now ${nextStatus}`);
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating banner status:", err);
      toast.error("An error occurred while updating status.");
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this promotional banner?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b._id !== bannerId));
        toast.success("Banner deleted successfully.");
      } else {
        toast.error("Failed to delete banner.");
      }
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast.error("An error occurred while deleting the banner.");
    }
  };

  return (
    <DashboardLayout
      title="Homepage Banners"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="flex flex-col lg:flex-row gap-6 text-left items-start">
        {/* Form panel (1/3 width) */}
        <div className="w-full lg:w-1/3">
          <Card className="border border-brand-border bg-brand-bg shadow-sm">
            <CardHeader className="border-b border-brand-border pb-4">
              <CardTitle className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-brand-blue" />
                <span>Create Promo Banner</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleCreateBanner} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <Type className="w-3.5 h-3.5 text-brand-blue" />
                    Title / Headline *
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Amazon Prime Day"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="bg-brand-surface border-brand-border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <Heading className="w-3.5 h-3.5 text-brand-blue" />
                    Subtitle / Description
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Up to 80% OFF"
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                    className="bg-brand-surface border-brand-border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <PlaySquare className="w-3.5 h-3.5 text-brand-blue" />
                    CTA Button Text
                  </Label>
                  <Input
                    type="text"
                    placeholder="Explore"
                    value={form.buttonText}
                    onChange={(e) =>
                      setForm({ ...form, buttonText: e.target.value })
                    }
                    className="bg-brand-surface border-brand-border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
                    Banner Image URL *
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. /herobanners/Offer.jpg"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="bg-brand-surface border-brand-border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
                    Brand Logo URL (Optional)
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. /brandlogos/10015.jpg"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    className="bg-brand-surface border-brand-border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <LinkIcon className="w-3.5 h-3.5 text-brand-blue" />
                    Redirection Link *
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. /brand/amazon"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="bg-brand-surface border-brand-border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <LayoutGrid className="w-3.5 h-3.5 text-brand-blue" />
                    Carousel Slot Position *
                  </Label>
                  <select
                    value={form.slot}
                    onChange={(e) => setForm({ ...form, slot: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="left-hero">Left Column Carousel (75% width)</option>
                    <option value="right-promo">Right Column Promo Card (25% width)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <SortAsc className="w-3.5 h-3.5 text-brand-blue" />
                    Priority sorting weight
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="bg-brand-surface border-brand-border text-xs"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-brand-border/60 pt-3">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <DollarSign className="w-3.5 h-3.5 text-brand-blue" />
                    Paid Placement (Sponsored)
                  </Label>
                  <Switch
                    checked={form.isPaid}
                    onCheckedChange={(c) => setForm({ ...form, isPaid: c })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
                    <Eye className="w-3.5 h-3.5 text-brand-blue" />
                    Active visibility status
                  </Label>
                  <Switch
                    checked={form.status === "active"}
                    onCheckedChange={(c) =>
                      setForm({ ...form, status: c ? "active" : "inactive" })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold py-2 border-0 h-auto cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {saving ? "Saving..." : "Add Banner"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List table panel (2/3 width) */}
        <div className="w-full lg:w-2/3 bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-surface">
            <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand-blue" />
              <span>Configured Banners ({banners.length})</span>
            </h3>
            <Button
              onClick={fetchBanners}
              variant="outline"
              size="sm"
              className="h-8 px-2 py-1 text-xs flex items-center gap-1 bg-white hover:bg-slate-50 border-brand-border text-brand-navy"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reload</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            {loading && banners.length === 0 ? (
              <div className="p-12 text-center text-xs text-brand-subtext">
                Loading banners...
              </div>
            ) : banners.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Dynamic Banners Found"
                  description="All carousels currently fall back to hardcoded default brand slides. Add your first dynamic banner now!"
                />
              </div>
            ) : (
              <Table className="w-full text-xs">
                <TableHeader className="bg-brand-surface border-b border-brand-border">
                  <TableRow className="hover:bg-transparent border-b border-brand-border">
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider w-[100px]">
                      Preview
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider">
                      Title / Details
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider w-[120px]">
                      Position Slot
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider w-[80px] text-center">
                      Priority
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider w-[100px] text-center">
                      Type
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider w-[80px] text-center">
                      Visible
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider w-[60px] text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((b) => (
                    <TableRow
                      key={b._id}
                      className="border-b border-brand-border/60 hover:bg-slate-50/40"
                    >
                      <TableCell className="p-3">
                        <div className="w-[80px] h-[40px] rounded bg-slate-900 border border-brand-border overflow-hidden relative group">
                          <img
                            src={b.image}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="p-3 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-brand-navy">
                            {b.title}
                          </span>
                          {b.subtitle && (
                            <span className="text-[10px] text-brand-subtext">
                              {b.subtitle}
                            </span>
                          )}
                          <span className="text-[9px] text-brand-blue truncate max-w-[200px] mt-0.5">
                            {b.link}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        {b.slot === "left-hero" ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0.5 font-bold shadow-none">
                            Left Hero Slider
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0.5 font-bold shadow-none">
                            Right Promo Card
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-center font-bold text-brand-navy">
                        {b.priority}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        {b.isPaid ? (
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-[9px] font-bold shadow-none uppercase">
                            Sponsored
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] font-bold shadow-none uppercase">
                            Organic
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Switch
                          checked={b.status === "active"}
                          onCheckedChange={() =>
                            handleToggleStatus(b._id, b.status)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Button
                          onClick={() => handleDeleteBanner(b._id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-0 bg-transparent cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
