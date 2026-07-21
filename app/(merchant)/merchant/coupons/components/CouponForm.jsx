"use client";

import {
  Calendar as CalendarIcon,
  Check,
  Eye,
  FileText,
  FolderOpen,
  IndianRupee,
  Layers,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Percent,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "food", label: "Food & Dining" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "home", label: "Home & Living" },
  { id: "home-improvement", label: "Home Improvement" },
  { id: "fitness", label: "Fitness & Healthcare" },
  { id: "education", label: "Education & Courses" },
  { id: "kids-baby", label: "Kids & Baby Products" },
  { id: "jewellery", label: "Jewellery & Accessories" },
  { id: "automotive", label: "Automobile & Auto Services" },
  { id: "entertainment", label: "Gaming & Entertainment" },
  { id: "grocery", label: "Grocery & Essentials" },
  { id: "finance", label: "Finance & Insurance" },
];

export default function CouponForm({
  formData,
  setFormData,
  listingType,
  setListingType,
  handleSubmit,
  isPending,
  submitText = "Save Offer",
  isEdit = false,
  merchantPlan = "starter",
  merchantName = "Store Name",
}) {
  const selectedCategoryObj = CATEGORIES.find(
    (c) => c.id === formData.category || c.label === formData.category
  ) || CATEGORIES[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start"
    >
      {/* LEFT COLUMN: FORM CARDS (7 COLS) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Listing Format Selector (only if not editing) */}
        {!isEdit && setListingType && (
          <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-3">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5 text-blue-600" /> Choose Listing Format
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "coupon", label: "Promo Code", desc: "Code for checkout / in-store" },
                { id: "deal", label: "Sale / Flat Offer", desc: "Discounted price link" },
                { id: "special", label: "Special / Gift", desc: "BOGO or Freebie package" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setListingType(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    listingType === t.id
                      ? "border-[#e85d04] bg-orange-50/50 shadow-2xs font-bold text-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <span className="block text-xs font-bold">{t.label}</span>
                  <span className="block text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Card 1: Main Offer Details */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Edit Campaign Details
            </h3>
          </div>

          <div className="space-y-4">
            {/* Offer Title */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Offer Title / Headline *
              </Label>
              <Input
                type="text"
                maxLength={70}
                placeholder="e.g. Free Drink with Meal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Layers className="w-3.5 h-3.5 text-purple-600" /> Category *
                </Label>
                <Select
                  value={selectedCategoryObj.id}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Promo Code */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Ticket className="w-3.5 h-3.5 text-orange-600" /> Promo Code *
                </Label>
                <Input
                  type="text"
                  placeholder="FREEDRINK"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase().replace(/\s/g, ""),
                    })
                  }
                  className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discount Type */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Percent className="w-3.5 h-3.5 text-blue-600" /> Discount Type *
                </Label>
                <Select
                  value={formData.discountType || "percentage"}
                  onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                    <SelectValue placeholder="Discount format" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    <SelectItem value="percentage">% Percentage Off</SelectItem>
                    <SelectItem value="fixed">Flat ₹ Amount Off</SelectItem>
                    <SelectItem value="freebie">Free Gift / Freebie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Discount Value (₹ or %)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Description / Terms */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" /> Terms / Description *
              </Label>
              <Textarea
                rows={3}
                placeholder="Enjoy great deals and savings on your order..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white border-slate-200 text-xs leading-relaxed rounded-xl font-medium"
                required
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Limits & Expiry Details */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-rose-600" /> Limits &amp; Expiry Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Expiry Date DatePicker */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> Expiry Date *
              </Label>
              <DatePicker
                value={formData.expiresAt}
                onChange={(val) => setFormData({ ...formData, expiresAt: val })}
                placeholder="Select expiry date"
                iconColor="text-blue-600"
              />
            </div>

            {/* Claims Limit */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Claims Limit
              </Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={formData.maxClaims}
                onChange={(e) => setFormData({ ...formData, maxClaims: e.target.value })}
                className="bg-white border-slate-200 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Campaign Status (if editing) */}
            {isEdit && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Settings className="w-3.5 h-3.5 text-slate-600" /> Campaign Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    <SelectItem value="active" className="text-emerald-700 font-bold">
                      Active / Enabled
                    </SelectItem>
                    <SelectItem value="paused" className="text-amber-700 font-bold">
                      Paused / Suspended
                    </SelectItem>
                    <SelectItem value="expired" className="text-rose-700 font-bold">
                      Expired / Closed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Featured Placement Switch */}
            <div className="sm:col-span-3 border-t border-slate-100 pt-4 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Featured Homepage Placement
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pin this deal to the homepage hero grid for 5x visibility.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {!(merchantPlan === "pro" || merchantPlan === "enterprise") && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                      Pro/Enterprise Only
                    </Badge>
                  )}
                  <Switch
                    disabled={!(merchantPlan === "pro" || merchantPlan === "enterprise")}
                    checked={formData.isFeatured}
                    onCheckedChange={(val) => setFormData({ ...formData, isFeatured: val })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#e85d04] hover:bg-orange-600 text-white text-xs font-bold py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isPending ? "Saving..." : submitText}</span>
          </Button>
        </Card>
      </div>

      {/* RIGHT COLUMN: REAL-TIME CARD PREVIEW (5 COLS) */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-[#e85d04]" /> Real-Time Card Preview
            </span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-bold">
              Live Preview
            </Badge>
          </div>

          {/* Live Preview Item */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div
              className="h-32 bg-slate-900 relative flex items-end p-4 bg-cover bg-center"
              style={{
                backgroundImage: formData.image
                  ? `url(${formData.image})`
                  : "linear-gradient(to right, #0f172a, #1e293b)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <Badge className="bg-blue-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 border-0">
                  {selectedCategoryObj.label}
                </Badge>
                <span className="text-white text-[10px] font-bold bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  {merchantName}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-snug">
                  {formData.title || "Free Drink with Meal"}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                  {formData.description || "Enjoy great deals and savings on Free Drink with Meal."}
                </p>
              </div>

              {/* Monospace Code box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Use Promo Code
                </span>
                <span className="font-mono text-base font-black text-slate-900 uppercase tracking-widest block">
                  {formData.code || "FREEDRINK"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Discount</span>
                  <span className="text-[#e85d04] font-black">
                    {formData.discountType === "percentage"
                      ? `${formData.discountValue || "0"}% OFF`
                      : formData.discountType === "fixed"
                      ? `₹${formData.discountValue || "0"} OFF`
                      : "Free Gift"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Valid Until</span>
                  <span className="text-slate-900 font-bold">
                    {formData.expiresAt
                      ? new Date(formData.expiresAt).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Select Date"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}
