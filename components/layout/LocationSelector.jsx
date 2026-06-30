"use client";

import {
  ChevronDown,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/hooks/use-location";
import { INDIAN_CITIES } from "@/utils/cities";

export default function LocationSelector({
  isMobile = false,
  onMobileSelect = null,
}) {
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const locationPanelRef = useRef(null);
  const { city, setCity, status, detect } = useLocation();

  const filteredCities =
    citySearch.length > 0
      ? INDIAN_CITIES.filter((c) =>
          c.toLowerCase().includes(citySearch.toLowerCase()),
        ).slice(0, 8)
      : INDIAN_CITIES.slice(0, 8);

  const isDetecting = status === "detecting";

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        locationPanelRef.current &&
        !locationPanelRef.current.contains(e.target)
      ) {
        setShowLocationPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCitySelect(selectedCity) {
    setCity(selectedCity);
    setShowLocationPanel(false);
    setCitySearch("");
    if (onMobileSelect) onMobileSelect();
  }

  function handleDetect() {
    detect();
    setShowLocationPanel(false);
    if (onMobileSelect) onMobileSelect();
  }

  function clearLocation() {
    setCity(null);
    setShowLocationPanel(false);
  }

  if (isMobile) {
    return (
      <div className="relative" ref={locationPanelRef}>
        {/* Mobile location badge */}
        <button
          type="button"
          onClick={() => setShowLocationPanel((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-brand-text bg-brand-surface border border-brand-border rounded-md px-2 py-1.5 cursor-pointer hover:bg-brand-surface/80 transition-all"
        >
          <MapPin className="w-3.5 h-3.5 text-brand-warning" />
          <span className="max-w-[60px] truncate">{city || "Location"}</span>
        </button>

        {/* Mobile Location Panel Dropdown */}
        {showLocationPanel && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-brand-bg rounded-xl shadow-2xl border border-brand-border z-[100] overflow-hidden text-brand-text p-3 space-y-3">
            <button
              type="button"
              onClick={handleDetect}
              disabled={isDetecting}
              className="w-full flex items-center gap-2.5 px-3 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-xs font-semibold text-brand-blue hover:bg-brand-blue/15 transition-colors disabled:opacity-60"
            >
              {isDetecting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              {isDetecting ? "Detecting..." : "Use My Location"}
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-subtext" />
              <Input
                type="text"
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="pl-8 text-xs h-8 border-brand-border bg-brand-surface text-brand-text"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {filteredCities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`px-2 py-1 text-[11px] rounded-full border font-medium transition-colors ${
                    city === c
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "border-brand-border text-brand-text hover:border-brand-blue hover:text-brand-blue"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {city && (
              <button
                type="button"
                onClick={clearLocation}
                className="w-full text-[10px] text-brand-subtext hover:text-brand-error text-center pt-1 border-t border-brand-border/40"
              >
                ✕ Clear — Show All India
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={locationPanelRef}>
      <button
        type="button"
        onClick={() => setShowLocationPanel((v) => !v)}
        className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-brand-text hover:text-brand-blue bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 hover:bg-brand-surface/80 transition-all"
        aria-label="Set location"
      >
        <MapPin className="w-3.5 h-3.5 text-brand-warning flex-shrink-0" />
        <span className="max-w-[90px] truncate">{city || "Set Location"}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${showLocationPanel ? "rotate-180" : ""}`}
        />
      </button>

      {/* Location Dropdown Panel */}
      {showLocationPanel && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-brand-bg rounded-xl shadow-2xl border border-brand-border z-[100] overflow-hidden animate-fade-in-scale">
          <div className="bg-brand-navy px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              Set Your Location
            </span>
            <button
              type="button"
              onClick={() => setShowLocationPanel(false)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <button
              type="button"
              onClick={handleDetect}
              disabled={isDetecting}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-sm font-semibold text-brand-blue hover:bg-brand-blue/15 transition-colors disabled:opacity-60"
            >
              {isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {isDetecting ? "Detecting..." : "Use My Current Location"}
            </button>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-subtext" />
              <Input
                type="text"
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="pl-8 text-sm h-9 border-brand-border bg-brand-surface text-brand-text"
              />
            </div>

            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {filteredCities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                    city === c
                      ? "bg-brand-blue text-white font-semibold"
                      : "hover:bg-brand-surface text-brand-text"
                  }`}
                >
                  <span>{c}</span>
                  {city === c && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {city && (
              <button
                type="button"
                onClick={clearLocation}
                className="w-full text-xs text-brand-subtext hover:text-brand-error transition-colors text-center"
              >
                Clear location — Show All India deals
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback check badge helper
function CheckCircle2(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-white"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
