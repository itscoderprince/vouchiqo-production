"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Gift,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Link2,
  Lock,
  MapPin,
  MessageSquare,
  Percent,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  Ticket,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const OFFER_TYPES = [
  {
    id: "code",
    name: "Offer with Code",
    icon: Ticket,
    desc: "Customer copies code for online checkout or presents a Smart Code at counter in-store.",
    bestFor: "Best for: Restaurants, salons, retail stores, or online checkouts.",
    color: "border-blue-500 bg-blue-50/40 text-blue-900",
  },
  {
    id: "deal",
    name: "Deal / Direct Link",
    icon: Link2,
    desc: "No code required. Clicking the deal opens your pre-discounted page directly.",
    bestFor: "Best for: E-commerce sites, product sales pages, online bookings.",
    color: "border-[#e85d04] bg-orange-50/40 text-orange-900",
  },
  {
    id: "special",
    name: "Special Offer / Gift",
    icon: Gift,
    desc: "Non-standard format: BOGO, free gift with purchase, free service upgrade, bundle deals.",
    bestFor: "Best for: BOGO meals, free treatments, gym trials, package deals.",
    color: "border-purple-500 bg-purple-50/40 text-purple-900",
  },
];

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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CreateCoupon() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("A");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Full 5-Section State matching Claude_Merchant Offer Form.pdf
  const [formData, setFormData] = useState({
    // Section A
    offerType: "code", // "code" | "deal" | "special"

    // Section B
    headline: "",
    shortDescription: "",
    category: "home-improvement",
    image: "",

    // Section C-1: Code
    code: "",
    discountType: "% Off",
    discountValue: "",
    maxCap: "",
    minOrderValue: "",

    // Section C-2: Deal Link
    dealUrl: "",
    originalPrice: "",
    salePrice: "",

    // Section C-3: Special Gift
    specialOfferType: "Buy One Get One (BOGO)",
    offerDetails: "",
    redemptionMethod: "Show Vouchiqo Smart Code at counter",

    // Section D: Validity & Restrictions
    startDate: "",
    endDate: "",
    usageLimit: "",
    perCustomerLimit: "1",
    targetAudience: "All Customers (Default)",
    geographicRestriction: "Ranchi only — in-store at my listed address",
    validDays: [],
    validHours: "",

    // Section E: Terms & Submission
    termsAndConditions: "",
    combinability: "No — cannot be combined with any other offer",
    honouredAllDays: "Yes — every day during the validity period",
    internalNote: "",
    agreed1: false,
    agreed2: false,
    agreed3: false,
    agreed4: false,
  });

  // Fetch merchant profile
  const { data: merchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "SAVE";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", "coupons");

    setUploadingImage(true);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      const imageUrl = json.data?.url;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Offer image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.validDays.includes(day);
      const updated = exists
        ? prev.validDays.filter((d) => d !== day)
        : [...prev.validDays, day];
      return { ...prev, validDays: updated };
    });
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to submit offer.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
      toast.success("Offer submitted for verification! 4-hour SLA active.");
      window.location.href = "/merchant/coupons";
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  const handleSubmitOffer = () => {
    // Validation checks
    if (!formData.headline) {
      toast.error("Offer Headline is required");
      setActiveSection("B");
      return;
    }
    if (!formData.shortDescription) {
      toast.error("Short Description is required");
      setActiveSection("B");
      return;
    }

    if (formData.offerType === "code") {
      if (!formData.code) {
        toast.error("Offer Code is required");
        setActiveSection("C");
        return;
      }
      if (!formData.discountValue && formData.discountType !== "Free Shipping") {
        toast.error("Discount Value is required");
        setActiveSection("C");
        return;
      }
    } else if (formData.offerType === "deal") {
      if (!formData.dealUrl) {
        toast.error("Direct Deal URL is required");
        setActiveSection("C");
        return;
      }
    } else if (formData.offerType === "special") {
      if (!formData.offerDetails) {
        toast.error("Offer Details text is required");
        setActiveSection("C");
        return;
      }
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Start Date and End Date are required");
      setActiveSection("D");
      return;
    }

    if (!formData.termsAndConditions) {
      toast.error("Terms & Conditions are required");
      setActiveSection("E");
      return;
    }

    if (!formData.agreed1 || !formData.agreed2 || !formData.agreed3 || !formData.agreed4) {
      toast.error("Please confirm all 4 mandatory checkboxes before submitting");
      setActiveSection("E");
      return;
    }

    // Map discount type enum to backend schema
    let backendDiscountType = "percentage";
    if (formData.offerType === "code") {
      if (formData.discountType.includes("Flat")) backendDiscountType = "fixed";
      else if (formData.discountType.includes("Free")) backendDiscountType = "freebie";
    } else if (formData.offerType === "special") {
      backendDiscountType = "freebie";
    }

    // Prepare full payload matching exact backend schema
    const payload = {
      title: formData.headline,
      description: formData.shortDescription,
      code: formData.code || "DEALOFFER",
      discountType: backendDiscountType,
      discountValue: Number(formData.discountValue) || 0,
      originalPrice: Number(formData.originalPrice) || undefined,
      salePrice: Number(formData.salePrice) || undefined,
      category: formData.category, // Validated slug: "home-improvement", "fashion", "food", etc.
      image: formData.image,
      expiresAt: new Date(formData.endDate).toISOString(),
      maxClaims: Number(formData.usageLimit) || undefined,

      // Rich Section Metadata
      offerType: formData.offerType,
      headline: formData.headline,
      shortDescription: formData.shortDescription,
      maxCap: Number(formData.maxCap) || undefined,
      minOrderValue: Number(formData.minOrderValue) || undefined,
      dealUrl: formData.dealUrl,
      specialOfferType: formData.specialOfferType,
      offerDetails: formData.offerDetails,
      redemptionMethod: formData.redemptionMethod,
      startDate: formData.startDate,
      endDate: formData.endDate,
      perCustomerLimit: formData.perCustomerLimit,
      targetAudience: formData.targetAudience,
      geographicRestriction: formData.geographicRestriction,
      validDays: formData.validDays,
      validHours: formData.validHours,
      termsAndConditions: formData.termsAndConditions,
      combinability: formData.combinability,
      honouredAllDays: formData.honouredAllDays,
      internalNote: formData.internalNote,
      status: "active",
      location: {
        city: merchant?.address?.city || "Ranchi",
        state: merchant?.address?.state || "Jharkhand",
        isOnline: formData.geographicRestriction.includes("All India"),
      },
    };

    mutation.mutate(payload);
  };

  const SECTIONS = [
    { number: 1, key: "A", name: "Offer Type", icon: Tag },
    { number: 2, key: "B", name: "Basic Details", icon: FileText },
    { number: 3, key: "C", name: "Discount & Code", icon: Ticket },
    { number: 4, key: "D", name: "Validity & Limits", icon: CalendarIcon },
    { number: 5, key: "E", name: "Terms & Submit", icon: ShieldCheck },
  ];

  const currentSectionObj = SECTIONS.find((s) => s.key === activeSection) || SECTIONS[0];
  const selectedCategoryLabel = CATEGORIES.find((c) => c.id === formData.category)?.label || "Home Improvement";

  return (
    <DashboardLayout
      title="Create New Coupon / Deal"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-6 text-left font-sans w-full max-w-[1300px] mx-auto">
        {/* FULL WIDTH STEPPER BAR AT TOP (No Card background) */}
        <div className="w-full flex items-center gap-4 py-2">
          <Button
            variant="ghost"
            asChild
            className="p-1.5 h-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl cursor-pointer shrink-0"
          >
            <Link href="/merchant/coupons">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center flex-1 w-full gap-3 sm:gap-6">
            {SECTIONS.map((sec, idx) => {
              const isActive = activeSection === sec.key;
              const isPast = currentSectionObj.number > sec.number;
              const isLast = idx === SECTIONS.length - 1;
              return (
                <div
                  key={sec.key}
                  className={`flex items-center gap-3 ${!isLast ? "flex-1" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection(sec.key)}
                    className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "text-slate-900 font-extrabold"
                        : isPast
                        ? "text-emerald-600 font-bold"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isActive
                          ? "bg-[#e85d04] text-white shadow-xs"
                          : isPast
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200/80 text-slate-500"
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : sec.number}
                    </span>
                    <span>{sec.name}</span>
                  </button>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-colors ${
                        isPast ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: FORM ON LEFT (7 COLS), LIVE CARD PREVIEW ON RIGHT (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: FORM STEPS */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION A: Offer Type */}
            {activeSection === "A" && (
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Offer Type</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Choose how customers redeem this offer.
                  </p>
                </div>

                <div className="space-y-3">
                  {OFFER_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.offerType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData({ ...formData, offerType: type.id })}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          isSelected
                            ? `${type.color} border-slate-900 shadow-xs`
                            : "border-slate-200/80 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Icon className="w-5 h-5 text-slate-800 shrink-0" />
                          <span className="text-sm font-bold text-slate-900">{type.name}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed pl-8">
                          {type.desc}
                        </p>
                        <span className="text-[11px] text-slate-400 font-semibold block pt-2 pl-8">
                          {type.bestFor}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setActiveSection("B")}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Basic Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* SECTION B: Basic Details */}
            {activeSection === "B" && (
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Basic Offer Details</h3>
                </div>

                <div className="space-y-4">
                  {/* Headline */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-blue-600" /> Offer Headline / Title *
                    </Label>
                    <Input
                      type="text"
                      maxLength={70}
                      placeholder="e.g. Flat 20% off on all Italian Marble Tiles"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
                    />
                    <span className="text-[10px] text-slate-400 block text-right font-medium">
                      {formData.headline.length}/70 chars
                    </span>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Short Description *
                    </Label>
                    <Textarea
                      maxLength={160}
                      rows={3}
                      placeholder="e.g. Get 20% discount on total invoice amount for all premium tiles."
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="bg-white border-slate-200 text-xs leading-relaxed rounded-xl"
                    />
                  </div>

                  {/* Category Select using Shadcn Select */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <Layers className="w-3.5 h-3.5 text-purple-600" /> Primary Category *
                    </Label>
                    <Select
                      value={formData.category}
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

                  {/* Offer Image URL */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <ImageIcon className="w-3.5 h-3.5 text-orange-600" /> Offer Image URL (Optional)
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/marble-tile-deal.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection("A")}
                    className="text-xs font-bold rounded-xl border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    onClick={() => setActiveSection("C")}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Discount &amp; Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* SECTION C: Discount & Code */}
            {activeSection === "C" && (
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Discount &amp; Code Mechanics</h3>
                </div>

                {formData.offerType === "code" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <Ticket className="w-3.5 h-3.5 text-orange-600" /> Offer Code *
                        </Label>
                        <button
                          type="button"
                          onClick={generateRandomCode}
                          className="text-[11px] font-bold text-[#e85d04] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Auto-generate Code
                        </button>
                      </div>
                      <Input
                        type="text"
                        placeholder="e.g. MARBLE20"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                        className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <Percent className="w-3.5 h-3.5 text-blue-600" /> Discount Format *
                        </Label>
                        <Select
                          value={formData.discountType}
                          onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                        >
                          <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                            <SelectValue placeholder="Discount format" />
                          </SelectTrigger>
                          <SelectContent className="z-[300]">
                            <SelectItem value="% Off">% Off (Percentage Discount)</SelectItem>
                            <SelectItem value="Flat ₹ Off">Flat ₹ Off (Fixed Amount)</SelectItem>
                            <SelectItem value="Free Shipping">Free Shipping / Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Discount Value *
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 20 (for 20%)"
                          value={formData.discountValue}
                          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                          className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Max Discount Cap (₹)
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 2000"
                          value={formData.maxCap}
                          onChange={(e) => setFormData({ ...formData, maxCap: e.target.value })}
                          className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <Tag className="w-3.5 h-3.5 text-amber-600" /> Min Order Value (₹)
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 5000"
                          value={formData.minOrderValue}
                          onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                          className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.offerType === "deal" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Link2 className="w-3.5 h-3.5 text-orange-600" /> Direct Deal URL *
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://yourstore.com/sale-page"
                        value={formData.dealUrl}
                        onChange={(e) => setFormData({ ...formData, dealUrl: e.target.value })}
                        className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <DollarSign className="w-3.5 h-3.5 text-slate-600" /> Original Price (₹)
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 2000"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                          className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <Tag className="w-3.5 h-3.5 text-[#e85d04]" /> Sale Price (₹)
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 1499"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          className="bg-white border-slate-200 text-xs h-10 rounded-xl font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.offerType === "special" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Gift className="w-3.5 h-3.5 text-purple-600" /> Special Offer Format *
                      </Label>
                      <Select
                        value={formData.specialOfferType}
                        onValueChange={(val) => setFormData({ ...formData, specialOfferType: val })}
                      >
                        <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                          <SelectValue placeholder="Select special format" />
                        </SelectTrigger>
                        <SelectContent className="z-[300]">
                          <SelectItem value="Buy One Get One (BOGO)">Buy One Get One (BOGO)</SelectItem>
                          <SelectItem value="Free Gift with Purchase">Free Gift with Purchase</SelectItem>
                          <SelectItem value="Free Upgrade / Treatment">Free Upgrade / Service</SelectItem>
                          <SelectItem value="Bundle / Combo Price">Bundle / Combo Package</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <FileText className="w-3.5 h-3.5 text-slate-700" /> Offer Details Text *
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. Buy any 2 Marble Slabs and get 1 Grout Sealer packet completely FREE."
                        value={formData.offerDetails}
                        onChange={(e) => setFormData({ ...formData, offerDetails: e.target.value })}
                        className="bg-white border-slate-200 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection("B")}
                    className="text-xs font-bold rounded-xl border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    onClick={() => setActiveSection("D")}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Validity &amp; Limits</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* SECTION D: Validity & Limits */}
            {activeSection === "D" && (
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Validity &amp; Restrictions</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-blue-600" /> Start Date *
                      </Label>
                      <DatePicker
                        value={formData.startDate}
                        onChange={(val) => setFormData({ ...formData, startDate: val })}
                        placeholder="Select start date"
                        iconColor="text-blue-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-rose-600" /> End Date *
                      </Label>
                      <DatePicker
                        value={formData.endDate}
                        onChange={(val) => setFormData({ ...formData, endDate: val })}
                        placeholder="Select end date"
                        iconColor="text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Users className="w-3.5 h-3.5 text-purple-600" /> Total Usage Limit (Optional)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 100 total redemptions"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Per Customer Limit
                      </Label>
                      <Select
                        value={formData.perCustomerLimit}
                        onValueChange={(val) => setFormData({ ...formData, perCustomerLimit: val })}
                      >
                        <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                          <SelectValue placeholder="Limit per user" />
                        </SelectTrigger>
                        <SelectContent className="z-[300]">
                          <SelectItem value="1">1 time per user</SelectItem>
                          <SelectItem value="2">2 times per user</SelectItem>
                          <SelectItem value="unlimited">Unlimited per user</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Valid Days */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" /> Valid Days of Week (Optional)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = formData.validDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection("C")}
                    className="text-xs font-bold rounded-xl border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    onClick={() => setActiveSection("E")}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Terms &amp; Submit</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* SECTION E: Terms & Submission */}
            {activeSection === "E" && (
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Terms &amp; Compliance</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-slate-700" /> Terms &amp; Conditions (Numbered) *
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="1. Valid on bill ₹5,000+. 2. Max discount ₹2,000. 3. Cannot be combined with other offers."
                      value={formData.termsAndConditions}
                      onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                      className="bg-white border-slate-200 text-xs leading-relaxed rounded-xl"
                    />
                  </div>

                  {/* Mandatory Compliance Checkboxes */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-900 uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mandatory Merchant Agreements
                    </Label>
                    <div className="space-y-2">
                      {[
                        { key: "agreed1", text: "My offer is genuine, tested, and will be honored at counter." },
                        { key: "agreed2", text: "All terms including minimum order and max cap are accurately disclosed." },
                        { key: "agreed3", text: "My counter billing staff is briefed and ready to process Smart Codes." },
                        { key: "agreed4", text: "I understand Vouchiqo compliance checks and honor all customer redemptions." },
                      ].map((chk) => {
                        const isChecked = formData[chk.key];
                        return (
                          <label
                            key={chk.key}
                            className={cn(
                              "flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all",
                              isChecked
                                ? "bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold"
                                : "bg-slate-50/50 border-slate-200/80 text-slate-700 hover:border-slate-300 font-medium"
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(val) => setFormData({ ...formData, [chk.key]: !!val })}
                              className="mt-0.5 shrink-0"
                            />
                            <span className="leading-relaxed select-none">{chk.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection("D")}
                    className="text-xs font-bold rounded-xl border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmitOffer}
                    disabled={mutation.isPending}
                    className="bg-[#e85d04] hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-8 rounded-xl cursor-pointer shadow-xs"
                  >
                    {mutation.isPending ? "Submitting..." : "Submit Offer for Review"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: LIVE COUPON CARD PREVIEW (5 COLS) */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-[#e85d04]" /> Live Offer Preview
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-bold">
                  Live Preview
                </Badge>
              </div>

              {/* Live Coupon Preview Item */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                {/* Banner or image header */}
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
                    <Badge className="bg-[#e85d04] text-white font-bold text-[9px] uppercase px-2 py-0.5 border-0">
                      {formData.offerType.toUpperCase()}
                    </Badge>
                    <span className="text-white text-[10px] font-bold bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                      {merchant?.businessName || "Store Name"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3.5">
                  {/* Headline & Short description */}
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {formData.headline || "Flat 20% off on all Italian Marble Tiles"}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                      {formData.shortDescription || "Get 20% discount on total invoice amount for all premium tiles."}
                    </p>
                  </div>

                  {/* Promo Code & Discount Pill */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-slate-500 font-semibold">
                      Code: <span className="font-mono text-slate-900 font-bold uppercase">{formData.code || "SAVE20"}</span>
                    </span>
                    <span className="text-[#e85d04] font-black">
                      {formData.discountValue ? `${formData.discountValue}% OFF` : "SPECIAL OFFER"}
                    </span>
                  </div>

                  {/* Location & Category snippet */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {merchant?.address?.city || "Ranchi"}
                    </span>
                    <span className="text-slate-600 font-bold">{selectedCategoryLabel}</span>
                  </div>

                  {/* Action button preview */}
                  <Button className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs cursor-default">
                    Get In-Store Claim Code
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
