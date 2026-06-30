"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Save,
  Store,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUPON_CATEGORIES } from "@/utils/constants";

export default function MerchantBusinessProfile() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    businessName: "",
    slug: "",
    category: "food",
    description: "",
    shortDescription: "",
    longDescription: "",
    contactEmail: "",
    website: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "IN",
    contactPhone: "",
    whatsappNumber: "",
    businessType: "both",
    operatingHours: {
      Monday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Tuesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Wednesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Thursday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Friday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Saturday: { open: "09:00 AM", close: "09:00 PM", closed: false },
      Sunday: { open: "09:00 AM", close: "09:00 PM", closed: true },
    },
    logo: "",
    banner: "",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Fetch the current merchant's profile
  const {
    data: merchant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error("Failed to load business profile");
      const json = await res.json();
      return json.data;
    },
  });

  // Populate form fields when profile is fetched
  useEffect(() => {
    if (merchant) {
      setFormData({
        businessName: merchant.businessName ?? "",
        slug: merchant.slug ?? "",
        category: merchant.category ?? "food",
        description: merchant.description ?? "",
        shortDescription:
          merchant.shortDescription ?? merchant.description ?? "",
        longDescription: merchant.longDescription ?? "",
        contactEmail: merchant.contactEmail ?? "",
        website: merchant.website ?? "",
        address: merchant.location?.address ?? "",
        pincode: merchant.location?.pincode ?? "",
        city: merchant.location?.city ?? "",
        state: merchant.location?.state ?? "",
        country: merchant.location?.country ?? "IN",
        contactPhone: merchant.contactPhone ?? "",
        whatsappNumber: merchant.whatsappNumber ?? "",
        businessType: merchant.businessType ?? "both",
        operatingHours: merchant.operatingHours ?? {
          Monday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Tuesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Wednesday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Thursday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Friday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Saturday: { open: "09:00 AM", close: "09:00 PM", closed: false },
          Sunday: { open: "09:00 AM", close: "09:00 PM", closed: true },
        },
        logo: merchant.logo ?? "",
        banner: merchant.banner ?? "",
      });
    }
  }, [merchant]);

  const handleBusinessNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const update = { ...prev, businessName: val };
      if (!merchant) {
        update.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return update;
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", field);

    if (field === "logo") setUploadingLogo(true);
    if (field === "banner") setUploadingBanner(true);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      const imageUrl = json.data?.url;

      setFormData((prev) => ({ ...prev, [field]: imageUrl }));
      toast.success(`${field === "logo" ? "Logo" : "Cover banner"} uploaded!`);
    } catch (err) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      if (field === "logo") setUploadingLogo(false);
      if (field === "banner") setUploadingBanner(false);
    }
  };

  const handleHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  // Save profile mutation (POST to create, PUT to update)
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const url = merchant
        ? `/api/merchants/${merchant._id}`
        : "/api/merchants";
      const method = merchant ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Failed to save profile details");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-analytics"] });
      toast.success("Business profile updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to save profile. Try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName) {
      toast.error("Business name is required.");
      return;
    }

    const payload = {
      businessName: formData.businessName,
      slug: formData.slug,
      description: formData.description || undefined,
      shortDescription: formData.shortDescription || undefined,
      longDescription: formData.longDescription || undefined,
      category: formData.category,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      whatsappNumber: formData.whatsappNumber || undefined,
      website: formData.website || undefined,
      businessType: formData.businessType,
      operatingHours: formData.operatingHours,
      logo: formData.logo || undefined,
      banner: formData.banner || undefined,
      location: {
        address: formData.address || undefined,
        pincode: formData.pincode || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || "IN",
      },
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Business Profile" user={{ role: "merchant" }}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-subtext" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Business Profile" user={{ role: "merchant" }}>
        <div className="text-center py-20 text-brand-error font-semibold">
          Error loading profile. Please refresh the page.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Business Profile"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Banner with Preview link */}
        <div className="bg-brand-bg border border-brand-border p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full border border-brand-blue/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-brand-navy">
                Manage Brand Storefront
              </h3>
              <p className="text-xs text-brand-subtext mt-0.5 font-semibold">
                Setup your online profile, cover banner, business address, and
                operational schedules.
              </p>
            </div>
          </div>
          {formData.slug && (
            <a
              href={`/brand/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tertiary text-xs py-2 px-5 border-brand-border rounded-lg cursor-pointer h-auto shadow-none hover:bg-brand-surface font-bold flex items-center gap-1.5"
            >
              <span>Preview My Brand Page</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {saveMutation.isSuccess && (
            <div className="flex gap-2.5 p-3.5 rounded-lg bg-brand-success/5 border border-brand-success/15 text-brand-success text-xs font-semibold items-center">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Business profile details saved successfully!</span>
            </div>
          )}

          {/* Profile Image Uploaders */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
              Profile Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 text-center md:text-left">
                <Label className="text-xs font-bold text-brand-text uppercase block">
                  Store Logo
                </Label>
                <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-5 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-28 overflow-hidden">
                  {formData.logo
                    ? // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logo}
                        alt="Store Logo"
                        className="w-full h-full object-contain"
                      />
                    : <>
                        <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-2" />
                        <span className="text-[10px] text-brand-subtext font-semibold">
                          {uploadingLogo ? "Uploading..." : "Upload 1:1 Image"}
                        </span>
                      </>}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                    disabled={uploadingLogo}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-brand-text uppercase block">
                  Cover Banner
                </Label>
                <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-5 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-28 overflow-hidden">
                  {formData.banner
                    ? // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.banner}
                        alt="Cover Banner"
                        className="w-full h-full object-cover"
                      />
                    : <>
                        <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-1" />
                        <span className="text-[10px] text-brand-subtext font-semibold">
                          {uploadingBanner
                            ? "Uploading..."
                            : "Upload high-res banner (1200x300px)"}
                        </span>
                      </>}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "banner")}
                    disabled={uploadingBanner}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Details Form Grid */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-blue" />
              <span>Business Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Company/Brand Name
                </Label>
                <Input
                  type="text"
                  value={formData.businessName}
                  onChange={handleBusinessNameChange}
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Slug (Read-Only)
                </Label>
                <Input
                  type="text"
                  value={formData.slug}
                  className="bg-brand-surface/50 border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none opacity-70 cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Market Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border text-xs rounded-lg h-10 px-3 shadow-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border border-brand-border">
                    {COUPON_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-xs font-semibold capitalize"
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Business Type
                </Label>
                <div className="flex gap-4 items-center h-10 px-1">
                  {["online", "physical", "both"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-xs font-semibold cursor-pointer capitalize"
                    >
                      <input
                        type="radio"
                        name="businessType"
                        value={type}
                        checked={formData.businessType === type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessType: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-brand-blue"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Short Store Description (For card snippets, max 300
                  characters)
                </Label>
                <Input
                  type="text"
                  maxLength={300}
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Detailed Store Bio / Description (Max 1000 characters)
                </Label>
                <Textarea
                  value={formData.longDescription}
                  maxLength={1000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longDescription: e.target.value,
                    })
                  }
                  rows={4}
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full min-h-[100px] p-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-blue" />
              <span>Contact &amp; Location Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Official Website
                </Label>
                <Input
                  type="url"
                  placeholder="https://mysite.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Contact Email
                </Label>
                <Input
                  type="email"
                  placeholder="partner@mystore.com"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Business Phone (Click-to-Call)
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-subtext absolute left-3 top-3" />
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 pl-9 pr-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  WhatsApp Business Number
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-subtext absolute left-3 top-3" />
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.whatsappNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 pl-9 pr-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Street Address
                </Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-brand-subtext absolute left-3 top-3" />
                  <Input
                    type="text"
                    placeholder="e.g. 1st Floor, Lalpur Road"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 pl-9 pr-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Pincode
                </Label>
                <Input
                  type="text"
                  placeholder="834001"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  City
                </Label>
                <Input
                  type="text"
                  placeholder="Ranchi"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  State
                </Label>
                <Input
                  type="text"
                  placeholder="Jharkhand"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-text uppercase">
                  Country
                </Label>
                <Input
                  type="text"
                  value={formData.country}
                  disabled
                  className="bg-brand-surface/50 border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours Card */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>Weekly Operating Hours</span>
            </h3>

            <div className="space-y-3">
              {Object.keys(formData.operatingHours).map((day) => {
                const hr = formData.operatingHours[day];
                return (
                  <div
                    key={day}
                    className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 py-2 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-xs font-bold text-brand-navy">
                      {day}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hr.closed}
                        onChange={(e) =>
                          handleHoursChange(day, "closed", e.target.checked)
                        }
                        className="w-4 h-4 text-brand-blue cursor-pointer"
                        id={`closed-${day}`}
                      />
                      <label
                        htmlFor={`closed-${day}`}
                        className="text-xs font-semibold text-brand-subtext cursor-pointer select-none"
                      >
                        Closed All Day
                      </label>
                    </div>

                    {!hr.closed && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-brand-subtext uppercase">
                            Open Time
                          </Label>
                          <Input
                            type="text"
                            placeholder="e.g. 09:00 AM"
                            value={hr.open || ""}
                            onChange={(e) =>
                              handleHoursChange(day, "open", e.target.value)
                            }
                            className="bg-brand-surface border border-brand-border rounded-lg text-xs h-8 shadow-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-brand-subtext uppercase">
                            Close Time
                          </Label>
                          <Input
                            type="text"
                            placeholder="e.g. 09:00 PM"
                            value={hr.close || ""}
                            onChange={(e) =>
                              handleHoursChange(day, "close", e.target.value)
                            }
                            className="bg-brand-surface border border-brand-border rounded-lg text-xs h-8 shadow-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-none"
          >
            {saveMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />}
            <span>
              {saveMutation.isPending
                ? "Saving changes..."
                : "Save Business Profile"}
            </span>
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
