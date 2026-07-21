"use client";

import { Image, Link2, MapPin, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import {
  INDIAN_CITIES,
  lookupByPincode,
  lookupStateByCity,
} from "@/utils/indianGeoLookup";

export default function Step2Location({
  formData,
  setFormData,
  handleImageUpload,
  uploadingShop,
  uploadingLogo,
  uploadingBanner,
}) {
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  // Handle City Change
  const handleCityChange = (cityName) => {
    const geo = lookupStateByCity(cityName);
    setFormData({
      ...formData,
      city: cityName,
      state: geo ? geo.state : formData.state,
      pincode: geo && !formData.pincode ? geo.pincode : formData.pincode,
    });
  };

  // Handle PIN Code Change
  const handlePincodeChange = async (pin) => {
    setFormData((prev) => ({ ...prev, pincode: pin }));

    if (pin.length === 6) {
      setIsGeoLoading(true);
      const geo = await lookupByPincode(pin);
      setIsGeoLoading(false);

      if (geo) {
        setFormData((prev) => ({
          ...prev,
          city: geo.city || prev.city,
          state: geo.state || prev.state,
        }));
      }
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>2. Visuals, Pan-India Location &amp; Coordination</span>
        </h3>
        <Badge variant="outline" className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200">
          Step 2 of 4
        </Badge>
      </div>

      {/* Media Uploads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Image className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Shop Photograph</span>
            <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional)</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-2 bg-slate-50 hover:bg-slate-100/80 cursor-pointer h-28 overflow-hidden">
            {formData.shopImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.shopImage}
                alt="Shop Front"
                className="max-w-full max-h-full object-contain rounded-md"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                <span className="text-[10px] text-slate-500 font-semibold">
                  {uploadingShop ? "Uploading..." : "Upload Shop Front"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "shopImage")}
              disabled={uploadingShop}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Image className="w-3.5 h-3.5 text-orange-600 mr-0.5" />
            <span>Store Logo</span>
            <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional)</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-2 bg-slate-50 hover:bg-slate-100/80 cursor-pointer h-28 overflow-hidden">
            {formData.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.logo}
                alt="Logo"
                className="max-w-[75%] max-h-[75%] object-contain"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors mb-1" />
                <span className="text-[10px] text-slate-500 font-semibold">
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </span>
              </>
            )}
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
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Image className="w-3.5 h-3.5 text-purple-600 mr-0.5" />
            <span>Cover Banner</span>
            <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional)</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-2 bg-slate-50 hover:bg-slate-100/80 cursor-pointer h-28 overflow-hidden">
            {formData.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.banner}
                alt="Cover Banner"
                className="w-full h-full object-contain rounded-md"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors mb-1" />
                <span className="text-[10px] text-slate-500 font-semibold">
                  {uploadingBanner ? "Uploading..." : "Upload Cover Banner"}
                </span>
              </>
            )}
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

      {/* Address & Pan-India Auto-fill Fields */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-rose-600 mr-0.5" />
            <span>Storefront Physical Address</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Textarea
            rows={2}
            placeholder="Flat/Plot No, Floor, Building Name, Commercial Area"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="bg-white border-slate-200 text-xs rounded-xl font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* PIN Code with Auto-Lookup */}
          <div className="space-y-1.5">
            <Label className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 mr-0.5" /> PIN Code
                <span className="text-rose-500 font-bold ml-0.5">*</span>
              </span>
              {isGeoLoading && (
                <span className="text-[10px] text-blue-600 font-bold animate-pulse">
                  Auto-filling...
                </span>
              )}
            </Label>
            <Input
              type="text"
              maxLength={6}
              placeholder="e.g. 802301 or 834001"
              value={formData.pincode || ""}
              onChange={(e) => handlePincodeChange(e.target.value)}
              className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono font-bold"
              required
            />
          </div>

          {/* Select City / Custom City */}
          <div className="space-y-1.5 font-sans">
            <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-0.5" /> City / District
              <span className="text-rose-500 font-bold ml-0.5">*</span>
            </Label>
            <Select
              value={formData.city || ""}
              onValueChange={handleCityChange}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                <SelectValue placeholder="Select or type City" />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                {INDIAN_CITIES.map((c) => (
                  <SelectItem key={`${c.city}-${c.state}`} value={c.city}>
                    {c.city} ({c.state})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State (Auto-Filled) */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 mr-0.5" /> State (Auto-filled)
              <span className="text-rose-500 font-bold ml-0.5">*</span>
            </Label>
            <Input
              type="text"
              placeholder="State auto-detected"
              value={formData.state || ""}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="bg-slate-50 border-slate-200 text-xs h-10 rounded-xl font-bold text-slate-900"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Link2 className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Google Maps Location Hyperlink</span>
            <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional)</span>
          </Label>
          <Input
            type="url"
            placeholder="https://maps.google.com/?q=..."
            value={formData.gmapsLink}
            onChange={(e) =>
              setFormData({ ...formData, gmapsLink: e.target.value })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
          />
        </div>
      </div>
    </Card>
  );
}
