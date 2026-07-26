"use client";

import {
  Compass,
  Crosshair,
  Image as ImageIcon,
  Link2,
  Loader2,
  MapPin,
  Navigation,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showError, showSuccess } from "@/lib/toast";
import {
  INDIAN_CITIES,
  lookupByPincode,
  lookupStateByCity,
} from "@/utils/indianGeoLookup";

export default function Step2Location({
  register,
  setValue,
  watch,
  errors,
  handleImageUpload,
  uploadingShop,
  uploadingLogo,
  uploadingBanner,
}) {
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const shopImage = watch("shopImage");
  const logo = watch("logo");
  const banner = watch("banner");
  const selectedCity = watch("city");
  const pincodeVal = watch("pincode") || "";

  const handleDetectGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setValue("lat", lat, { shouldValidate: true });
        setValue("lng", lng, { shouldValidate: true });
        setIsDetectingGps(false);
        showSuccess(`Exact GPS location detected: ${lat}, ${lng}`);
      },
      (err) => {
        setIsDetectingGps(false);
        showError(
          `GPS Detection: ${err.message || "Failed to fetch position"}. Please enter manually or check location permissions.`,
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const parseGmapsCoordinates = (url) => {
    if (!url) return null;
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return { lat: atMatch[1], lng: atMatch[2] };
    }
    const queryMatch = url.match(/[?&](q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (queryMatch) {
      return { lat: queryMatch[2], lng: queryMatch[3] };
    }
    return null;
  };

  const handleGmapsLinkChange = (e) => {
    const url = e.target.value;
    setValue("gmapsLink", url, { shouldValidate: true });
    const parsed = parseGmapsCoordinates(url);
    if (parsed) {
      setValue("lat", parsed.lat, { shouldValidate: true });
      setValue("lng", parsed.lng, { shouldValidate: true });
      showSuccess(
        `Extracted GPS coordinates from Google Maps: ${parsed.lat}, ${parsed.lng}`,
      );
    }
  };

  const handleCityChange = (cityName) => {
    setValue("city", cityName, { shouldValidate: true });
    const geo = lookupStateByCity(cityName);
    if (geo) {
      setValue("state", geo.state, { shouldValidate: true });
      if (!pincodeVal) {
        setValue("pincode", geo.pincode, { shouldValidate: true });
      }
    }
  };

  const handlePincodeChange = async (e) => {
    const pin = e.target.value;
    setValue("pincode", pin, { shouldValidate: true });

    if (pin.length === 6) {
      setIsGeoLoading(true);
      const geo = await lookupByPincode(pin);
      setIsGeoLoading(false);

      if (geo) {
        if (geo.city) setValue("city", geo.city, { shouldValidate: true });
        if (geo.state) setValue("state", geo.state, { shouldValidate: true });
      }
    }
  };

  const cityOptions = INDIAN_CITIES.map((c) => ({
    value: typeof c === "string" ? c : c.city,
    label: typeof c === "string" ? c : `${c.city} (${c.state})`,
  }));

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left font-sans">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>2. Visuals, Location &amp; Coordination</span>
        </h3>
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200"
        >
          Step 2 of 4
        </Badge>
      </div>

      {/* Media Uploads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Shop Photograph",
            field: "shopImage",
            state: shopImage,
            loading: uploadingShop,
          },
          {
            label: "Store Logo",
            field: "logo",
            state: logo,
            loading: uploadingLogo,
          },
          {
            label: "Banner Image",
            field: "banner",
            state: banner,
            loading: uploadingBanner,
          },
        ].map((item, idx) => (
          <div key={idx} className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              {item.label}
            </span>
            <div className="relative group flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-2 bg-slate-50 hover:bg-slate-100/80 cursor-pointer h-28 overflow-hidden">
              {item.state ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.state}
                  alt={item.label}
                  className="max-w-full max-h-full object-contain rounded-md"
                />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {item.loading ? "Uploading..." : `Upload ${item.label}`}
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, item.field)}
                disabled={item.loading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FormTextarea
            label="Complete Physical Store Address"
            icon={MapPin}
            rows={2}
            placeholder="Shop No, Building Name, Street, Landmark"
            required
            {...register("address")}
            error={errors.address}
          />
        </div>

        <FormInput
          label="Postal PIN Code"
          icon={MapPin}
          placeholder="e.g. 834001"
          maxLength={6}
          required
          {...register("pincode")}
          onChange={handlePincodeChange}
          error={errors.pincode}
          hint={isGeoLoading ? "Auto-detecting City & State..." : undefined}
        />

        <FormSelect
          label="Store City Location"
          icon={MapPin}
          options={cityOptions}
          required
          value={selectedCity || "Ranchi"}
          onValueChange={handleCityChange}
          error={errors.city}
        />

        <FormInput
          label="State / Region"
          icon={MapPin}
          placeholder="State Name"
          required
          {...register("state")}
          error={errors.state}
        />

        <FormInput
          label="Google Maps Business Location Link (GMB)"
          icon={Link2}
          placeholder="https://maps.app.goo.gl/... or paste GMB link"
          {...register("gmapsLink")}
          onChange={handleGmapsLinkChange}
          error={errors.gmapsLink}
          hint="Pasting a Google Maps link will auto-extract latitude & longitude"
        />
      </div>

      {/* GPS & MAP COORDINATES SECTION */}
      <div className="border border-blue-100 bg-blue-50/40 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-blue-600" />
              Exact Store GPS Coordinates (Latitude &amp; Longitude)
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Powers 100% accurate pin positioning and distance calculation on
              Nearby Offers map
            </p>
          </div>

          <Button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isDetectingGps ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>
              {isDetectingGps
                ? "Detecting GPS..."
                : "Detect Current GPS Location"}
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <FormInput
            label="Latitude (GPS)"
            icon={Compass}
            placeholder="e.g. 23.344102"
            {...register("lat")}
            error={errors.lat}
          />
          <FormInput
            label="Longitude (GPS)"
            icon={Compass}
            placeholder="e.g. 85.309615"
            {...register("lng")}
            error={errors.lng}
          />
        </div>
      </div>
    </Card>
  );
}
