"use client";

import {
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/hooks/use-location";
import { INDIAN_CITIES } from "@/utils/cities";

export default function LocationSelector({
  isMobile = false,
  onMobileSelect = null,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const { city, setCity, status, detect } = useLocation();

  const isDetecting = status === "detecting";

  // Auto-detect current location on first mount if no saved city
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only auto-detect on initial mount
  useEffect(() => {
    if (!city && !isDetecting) {
      detect();
    }
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Click-outside to close
  useEffect(() => {
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered =
    query.length > 0
      ? INDIAN_CITIES.filter((c) =>
          c.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 10)
      : INDIAN_CITIES.slice(0, 10);

  function handleSelect(selectedCity) {
    setCity(selectedCity);
    setOpen(false);
    setQuery("");
    if (onMobileSelect) onMobileSelect();
  }

  function handleDetect() {
    detect();
    setOpen(false);
    setQuery("");
    if (onMobileSelect) onMobileSelect();
  }

  const displayLabel = isDetecting
    ? "Detecting…"
    : city
      ? city.length > 12
        ? `${city.slice(0, 12)}…`
        : city
      : "Set Location";

  /* ─── Trigger Button ─── */
  const trigger = (
    <button
      id="location-selector-trigger"
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-label="Select location"
      aria-expanded={open}
      className={`
        flex items-center gap-1 font-medium transition-all cursor-pointer select-none
        ${
          isMobile
            ? "text-[11px] text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 hover:bg-blue-100"
            : "text-[12px] text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1 hover:bg-blue-100 hover:border-blue-300"
        }
      `}
    >
      {isDetecting ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-500 shrink-0" />
      ) : (
        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
      )}
      <span className="max-w-[100px] truncate leading-none">{displayLabel}</span>
      <ChevronDown
        className={`w-3 h-3 text-blue-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
      />
    </button>
  );

  /* ─── Dropdown Panel ─── */
  const dropdown = open && (
    <div
      className="
        absolute top-full mt-2 w-[240px] bg-white rounded-md
        shadow-lg border border-blue-100 z-[200] overflow-hidden
        animate-[fadeInScale_0.15s_ease-out]
      "
      style={{
        right: isMobile ? 0 : "auto",
        left: isMobile ? "auto" : 0,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-2">
        <MapPin className="w-3 h-3 text-blue-100 shrink-0" />
        <span className="text-[11px] font-semibold text-white tracking-wide">
          Select Location
        </span>
      </div>

      <div className="p-2 space-y-1.5">
        {/* GPS Detect Button */}
        <button
          type="button"
          onClick={handleDetect}
          disabled={isDetecting}
          className="
            w-full flex items-center gap-2 px-2 py-1.5 rounded-md
            bg-blue-50 border border-blue-200 text-blue-700
            text-[12px] font-semibold
            hover:bg-blue-100 hover:border-blue-300 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isDetecting ? (
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          ) : (
            <Navigation className="w-3 h-3 shrink-0" />
          )}
          <span>{isDetecting ? "Detecting…" : "Use Current Location"}</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-300 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full pl-6 pr-2 py-1 text-[12px] rounded-md
              bg-blue-50/60 border border-blue-100 text-gray-700
              placeholder:text-blue-300 outline-none
              focus:border-blue-400 focus:bg-white transition-all
            "
          />
        </div>

        {/* City List */}
        <div className="max-h-[160px] overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
          {filtered.length === 0 ? (
            <p className="text-center text-[11px] text-blue-300 py-2">
              No cities found
            </p>
          ) : (
            filtered.map((c) => {
              const isActive = city === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`
                    w-full flex items-center justify-between px-2 py-1 rounded-md text-[12px] transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }
                  `}
                >
                  <span>{c}</span>
                  {isActive && <Check className="w-3 h-3 text-white shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Clear option */}
        {city && (
          <button
            type="button"
            onClick={() => {
              setCity(null);
              setOpen(false);
            }}
            className="w-full text-[11px] text-blue-400 hover:text-red-500 text-center transition-colors border-t border-blue-50 pt-1"
          >
            Clear location
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={panelRef}>
      {trigger}
      {dropdown}
    </div>
  );
}
