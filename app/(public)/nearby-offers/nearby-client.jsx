"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DirectoryLayout from "@/components/layout/DirectoryLayout";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { useLocation } from "@/hooks/use-location";
import {
  ALPHA_LETTERS,
  POPULAR_MERCHANTS_SIDEBAR,
} from "@/utils/shared-navigation";

// ─── Constants ───────────────────────────────────────────────────────────────

const CITY_COORDINATES = {
  ranchi: [23.3441, 85.3096],
  jamshedpur: [22.8046, 86.2029],
  arrah: [25.5564, 84.6681],
  patna: [25.6112, 85.1384],
  delhi: [28.5494, 77.2515],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
};

const CITY_TO_STATE = {
  ranchi: "Jharkhand",
  jamshedpur: "Jharkhand",
  patna: "Bihar",
  arrah: "Bihar",
  delhi: "Delhi",
  mumbai: "Maharashtra",
  bangalore: "Karnataka",
};

const TABS = [
  { key: "nearest", label: "Near Me" },
  { key: "city", label: "In My City" },
  { key: "state", label: "In My State" },
  { key: "all", label: "All Deals" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "Food & Dining" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Living" },
  { value: "travel", label: "Travel" },
  { value: "electronics", label: "Electronics" },
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness" },
];

// ─── Distance helper ──────────────────────────────────────────────────────────

function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return parseFloat(
    (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1),
  );
}

// ─── SVG Icons (inline, no dependencies) ─────────────────────────────────────

const SkeletonCard = () => (
  <div
    style={{
      background: "white",
      border: "1px solid #eaecf0",
      borderRadius: "10px",
      padding: "13px 14px",
      display: "flex",
      gap: "12px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
      animation: "pulse 1.5s infinite ease-in-out",
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "8px",
        background: "#e5e7eb",
        flexShrink: 0,
      }}
    />
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "10px",
            background: "#e5e7eb",
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            width: "50px",
            height: "14px",
            background: "#eff6ff",
            borderRadius: "10px",
          }}
        />
      </div>
      <div
        style={{
          width: "100px",
          height: "16px",
          background: "#e5e7eb",
          borderRadius: "4px",
          margin: "2px 0",
        }}
      />
      <div
        style={{
          width: "160px",
          height: "11px",
          background: "#e5e7eb",
          borderRadius: "4px",
        }}
      />
      <div
        style={{
          width: "120px",
          height: "10px",
          background: "#e5e7eb",
          borderRadius: "4px",
          marginTop: "2px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "7px",
          borderTop: "1px solid #f3f4f6",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "12px",
            background: "#e5e7eb",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  </div>
);

const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconPin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconGPS = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="2" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="12" y1="15" x2="12" y2="22" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);
const IconMap = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const IconFilter = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const IconArrow = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const IconLoader = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NearbyOffers() {
  const { city: savedCity, setCity: setSavedCity } = useLocation();
  const [savedState, setSavedState] = useState("Jharkhand");
  const [savedPincode, setSavedPincode] = useState("");
  const [mapCenter, setMapCenter] = useState([23.3441, 85.3096]);
  const [distance, setDistance] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("distance");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("nearest");
  const [rawCoupons, setRawCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [manualForm, setManualForm] = useState({
    state: "Jharkhand",
    city: "Ranchi",
    area: "",
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Hydrate saved location
  useEffect(() => {
    try {
      const pin = localStorage.getItem("vouchiqo_pincode") || "";
      setSavedPincode(pin);
      const st = localStorage.getItem("vouchiqo_state") || "";
      if (st) setSavedState(st);
      else if (savedCity) {
        const ds = CITY_TO_STATE[savedCity.toLowerCase()];
        if (ds) setSavedState(ds);
      }
      if (savedCity) {
        const c = CITY_COORDINATES[savedCity.toLowerCase()];
        if (c) setMapCenter(c);
      }
    } catch {}
  }, [savedCity]);

  // Load Leaflet
  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(
    () => () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    },
    [],
  );

  // Fetch coupons
  useEffect(() => {
    async function fetch_() {
      setLoading(true);
      try {
        const q = new URLSearchParams({ limit: "60" });
        if (savedCity) q.set("city", savedCity);
        const res = await fetch(`/api/coupons?${q}`);
        if (res.ok) {
          const d = await res.json();
          setRawCoupons(d.data?.coupons || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [savedCity]);

  // Enrich coupons with distance
  const coupons = useMemo(
    () =>
      rawCoupons.map((c) => {
        const mLoc = c.merchantId?.location;
        const hasCoords =
          mLoc?.coordinates?.lat != null && mLoc?.coordinates?.lng != null;
        let lat = hasCoords ? mLoc.coordinates.lat : null;
        let lng = hasCoords ? mLoc.coordinates.lng : null;
        if (lat == null) {
          const center =
            CITY_COORDINATES[savedCity?.toLowerCase()] ||
            CITY_COORDINATES.ranchi;
          const hash = c._id
            ? c._id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0)
            : 0;
          lat = center[0] + ((hash % 100) / 100 - 0.5) * 0.03;
          lng = center[1] + (((hash * 13) % 100) / 100 - 0.5) * 0.03;
        }
        return {
          ...c,
          coords: [lat, lng],
          distance: haversine(mapCenter[0], mapCenter[1], lat, lng),
          address: mLoc?.address
            ? `${mLoc.address}, ${mLoc.city || ""}`
            : `${c.merchantId?.businessName || "Store"}, ${savedCity || "Ranchi"}`,
          city: mLoc?.city || savedCity || "Ranchi",
          state: mLoc?.state || savedState || "Jharkhand",
        };
      }),
    [rawCoupons, mapCenter, savedCity, savedState],
  );

  // Filter & group
  const grouped = useMemo(() => {
    let list = coupons.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !c.title?.toLowerCase().includes(q) &&
          !c.merchantId?.businessName?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    list =
      sortOrder === "distance"
        ? [...list].sort((a, b) => a.distance - b.distance)
        : [...list].sort(
            (a, b) => (b.discountValue || 0) - (a.discountValue || 0),
          );
    return {
      nearest: list.filter((c) => c.distance <= parseFloat(distance)),
      city: list.filter(
        (c) => c.city?.toLowerCase() === savedCity?.toLowerCase(),
      ),
      state: list.filter(
        (c) => c.state?.toLowerCase() === savedState?.toLowerCase(),
      ),
      all: list,
    };
  }, [
    coupons,
    distance,
    categoryFilter,
    sortOrder,
    searchQuery,
    savedCity,
    savedState,
  ]);

  const activeList = grouped[activeTab] || [];

  // Leaflet map rendering
  useEffect(() => {
    if (
      !leafletLoaded ||
      !mapRef.current ||
      typeof window === "undefined" ||
      !window.L
    )
      return;
    const L = window.L;
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        zoomControl: false,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    } else {
      mapInstanceRef.current.setView(mapCenter, 13);
    }
    markersGroupRef.current.clearLayers();
    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.4);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:white;border-radius:50%;"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker(mapCenter, { icon: pinIcon }).addTo(markersGroupRef.current);
    const dealIcon = L.divIcon({
      className: "",
      html: `<div style="width:32px;height:32px;background:#2563eb;border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:13px;">🏷️</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -10],
    });
    activeList.forEach((c) => {
      const name = c.merchantId?.businessName || "Store";
      const disc =
        c.discountType === "percentage"
          ? `${c.discountValue}% OFF`
          : `₹${c.discountValue} OFF`;
      const m = L.marker(c.coords, { icon: dealIcon }).addTo(
        markersGroupRef.current,
      );
      m.bindPopup(
        `<div style="font-family:sans-serif;width:180px;padding:8px;"><strong style="font-size:12px;color:#1e3a5f;">${name}</strong><br/><span style="font-size:14px;font-weight:800;color:#2563eb;">${disc}</span><br/><span style="font-size:11px;color:#6b7280;">${c.distance} km away</span><br/><a href="/deals/${c._id}" style="display:block;margin-top:6px;text-align:center;background:#2563eb;color:white;border-radius:6px;padding:4px;font-size:11px;font-weight:700;text-decoration:none;">View Deal</a></div>`,
      );
    });
  }, [leafletLoaded, mapCenter, activeList]);

  useEffect(() => {
    if (leafletLoaded && mapInstanceRef.current)
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
  }, [leafletLoaded]);

  // GPS detect
  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported by your browser");
      return;
    }
    setGpsLoading(true);
    toast.loading("Detecting your location...", { id: "gps" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        mapInstanceRef.current?.setView(coords, 14);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (r.ok) {
            const d = await r.json();
            const city =
              d.address?.city || d.address?.town || d.address?.village || null;
            const state = d.address?.state || null;
            if (city) {
              setSavedCity(city);
              if (state) {
                setSavedState(state);
                localStorage.setItem("vouchiqo_state", state);
              }
              toast.success(`Location: ${city}`, { id: "gps" });
            } else toast.success("Location updated!", { id: "gps" });
          }
        } catch {
          toast.success("Location synced!", { id: "gps" });
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        toast.dismiss("gps");
        if (err.code === err.PERMISSION_DENIED)
          toast.error("GPS access denied. Set location manually.");
        else toast.error("Could not get your location.");
        setShowLocationModal(true);
      },
      { timeout: 10000 },
    );
  };

  // Manual location submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.city) return;
    setSavedCity(manualForm.city);
    setSavedState(manualForm.state);
    setSavedPincode(manualForm.area);
    try {
      localStorage.setItem("vouchiqo_pincode", manualForm.area);
      localStorage.setItem("vouchiqo_state", manualForm.state);
    } catch {}
    const c = CITY_COORDINATES[manualForm.city.toLowerCase()];
    if (c) {
      setMapCenter(c);
      mapInstanceRef.current?.setView(c, 14);
    }
    setShowLocationModal(false);
    toast.success(`Location set to ${manualForm.city}`);
  };

  const activeFiltersCount = [
    distance !== "10",
    categoryFilter !== "all",
    sortOrder !== "distance",
  ].filter(Boolean).length;

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f4f6f9",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
      fontWeight: 400,
      color: "#374151",
    },
    main: {
      width: "100%",
      padding: "16px 20px 40px",
      flex: 1,
      boxSizing: "border-box",
    },

    // Header
    header: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      marginBottom: "16px",
      paddingBottom: "14px",
      borderBottom: "1px solid #e5e7eb",
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "12px",
      color: "#9ca3af",
      marginBottom: "5px",
      fontWeight: 400,
    },
    h1: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
      margin: "0 0 3px",
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: "12.5px",
      color: "#6b7280",
      margin: 0,
      fontWeight: 400,
      lineHeight: 1.4,
    },
    locationBar: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
    },
    locationPill: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: 500,
      color: "#1f2937",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    changeBtn: {
      background: "none",
      border: "none",
      color: "#2563eb",
      fontSize: "12px",
      fontWeight: 500,
      cursor: "pointer",
      padding: "0 0 0 8px",
      borderLeft: "1px solid #e5e7eb",
    },
    gpsBtn: (loading) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: loading ? "#f0f4ff" : "#2563eb",
      color: loading ? "#2563eb" : "white",
      border: loading ? "1px solid #c7d7fd" : "none",
      borderRadius: "8px",
      padding: "7px 13px",
      fontSize: "13px",
      fontWeight: 500,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.75 : 1,
      boxShadow: loading ? "none" : "0 2px 8px rgba(37,99,235,0.28)",
    }),
    mapToggle: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: active ? "#2563eb" : "white",
      color: active ? "white" : "#4b5563",
      border: `1px solid ${active ? "#2563eb" : "#e5e7eb"}`,
      borderRadius: "8px",
      padding: "7px 13px",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }),

    // Search & Filter bar
    searchRow: {
      display: "flex",
      gap: "8px",
      alignItems: "stretch",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    searchWrap: { position: "relative", flex: 1, minWidth: "180px" },
    searchInput: {
      width: "100%",
      paddingLeft: "36px",
      paddingRight: "12px",
      height: "38px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: 400,
      background: "white",
      color: "#111827",
      outline: "none",
      boxSizing: "border-box",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    },
    searchIcon: {
      position: "absolute",
      left: "11px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      pointerEvents: "none",
    },
    filterBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: active ? "#eff6ff" : "white",
      color: active ? "#2563eb" : "#4b5563",
      border: `1px solid ${active ? "#bfdbfe" : "#e5e7eb"}`,
      borderRadius: "8px",
      padding: "0 13px",
      height: "38px",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }),
    badge: {
      background: "#2563eb",
      color: "white",
      borderRadius: "50%",
      width: "17px",
      height: "17px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 600,
    },

    // Filter panel
    filterPanel: {
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "14px 16px",
      marginBottom: "10px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
      gap: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    },
    filterGroup: { display: "flex", flexDirection: "column", gap: "5px" },
    filterLabel: {
      fontSize: "10.5px",
      fontWeight: 500,
      color: "#9ca3af",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    filterSelect: {
      height: "34px",
      border: "1px solid #e5e7eb",
      borderRadius: "7px",
      padding: "0 8px",
      fontSize: "13px",
      fontWeight: 400,
      background: "white",
      color: "#374151",
      cursor: "pointer",
      outline: "none",
    },
    resetBtn: {
      background: "none",
      border: "none",
      color: "#9ca3af",
      fontSize: "12px",
      fontWeight: 400,
      cursor: "pointer",
      textDecoration: "underline",
      alignSelf: "flex-end",
    },

    // Tabs
    tabsRow: {
      display: "flex",
      gap: "3px",
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "4px",
      marginBottom: "16px",
      overflowX: "auto",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
    },
    tab: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "7px 16px",
      borderRadius: "7px",
      border: "none",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: active ? 600 : 400,
      whiteSpace: "nowrap",
      background: active ? "#2563eb" : "transparent",
      color: active ? "white" : "#6b7280",
      transition: "all 0.15s",
      flexShrink: 0,
    }),
    tabCount: (active) => ({
      background: active ? "rgba(255,255,255,0.22)" : "#f3f4f6",
      color: active ? "white" : "#9ca3af",
      borderRadius: "20px",
      padding: "1px 7px",
      fontSize: "11px",
      fontWeight: 500,
    }),

    // Cards grid
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "12px",
    },
    card: {
      background: "white",
      border: "1px solid #eaecf0",
      borderRadius: "10px",
      padding: "13px 14px",
      display: "flex",
      gap: "12px",
      cursor: "pointer",
      transition: "box-shadow 0.18s, border-color 0.18s, transform 0.18s",
      position: "relative",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    },
    logoBox: {
      width: "44px",
      height: "44px",
      borderRadius: "8px",
      background: "#f8f9fb",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    logoText: {
      width: "100%",
      height: "100%",
      background: "#1e3a5f",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: 600,
    },
    cardBody: { flex: 1, minWidth: 0 },
    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "6px",
      marginBottom: "3px",
    },
    brandName: {
      fontSize: "11px",
      fontWeight: 500,
      color: "#9ca3af",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    distancePill: {
      background: "#eff6ff",
      color: "#2563eb",
      fontSize: "11px",
      fontWeight: 500,
      borderRadius: "20px",
      padding: "2px 8px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    discount: {
      fontSize: "17px",
      fontWeight: 700,
      color: "#111827",
      lineHeight: 1.15,
      marginBottom: "2px",
    },
    dealTitle: {
      fontSize: "12px",
      color: "#6b7280",
      fontWeight: 400,
      marginBottom: "5px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      lineHeight: 1.4,
    },
    addressRow: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "11px",
      color: "#9ca3af",
      fontWeight: 400,
      marginBottom: "7px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cardFooter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: "7px",
      borderTop: "1px solid #f3f4f6",
    },
    categoryTag: {
      background: "#f3f4f6",
      color: "#9ca3af",
      fontSize: "11px",
      fontWeight: 400,
      borderRadius: "5px",
      padding: "2px 8px",
      textTransform: "capitalize",
    },
    claimBtn: {
      display: "flex",
      alignItems: "center",
      gap: "3px",
      color: "#2563eb",
      fontSize: "12px",
      fontWeight: 500,
      textDecoration: "none",
    },

    // Empty state
    empty: {
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "48px 24px",
      textAlign: "center",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    },
    emptyTitle: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#374151",
      marginBottom: "7px",
    },
    emptyText: {
      fontSize: "13px",
      color: "#6b7280",
      fontWeight: 400,
      marginBottom: "14px",
      lineHeight: 1.5,
    },
    clearBtn: {
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 22px",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
    },

    // Loading
    loading: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      gap: "10px",
    },
    loadingText: { fontSize: "13px", color: "#9ca3af", fontWeight: 400 },

    // Modal
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backdropFilter: "blur(2px)",
    },
    modal: {
      background: "white",
      borderRadius: "14px",
      maxWidth: "380px",
      width: "100%",
      padding: "22px 24px",
      boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "18px",
      paddingBottom: "14px",
      borderBottom: "1px solid #f3f4f6",
    },
    modalTitle: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#111827",
      display: "flex",
      alignItems: "center",
      gap: "7px",
    },
    modalField: { marginBottom: "13px" },
    modalLabel: {
      display: "block",
      fontSize: "12px",
      fontWeight: 500,
      color: "#4b5563",
      marginBottom: "5px",
    },
    modalSelect: {
      width: "100%",
      height: "39px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "0 10px",
      fontSize: "13px",
      fontWeight: 400,
      background: "white",
      color: "#374151",
      outline: "none",
      cursor: "pointer",
      boxSizing: "border-box",
    },
    modalInput: {
      width: "100%",
      height: "39px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "0 12px",
      fontSize: "13px",
      fontWeight: 400,
      color: "#374151",
      outline: "none",
      boxSizing: "border-box",
    },
    modalSubmit: {
      width: "100%",
      height: "40px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "9px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      marginTop: "6px",
      boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
    },
    iconBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#9ca3af",
      display: "flex",
      padding: "3px",
    },

    // Map layout — fills exactly screen height below navbar, no global scroll
    mapLayout: {
      display: "flex",
      flexDirection: "row",
      height: "calc(100vh - 64px)",
      overflow: "hidden",
      background: "#f4f6f9",
    },
    mapSidebar: {
      width: "400px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "white",
      borderRight: "1px solid #e5e7eb",
      overflow: "hidden",
      boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
    },
    mapSidebarHeader: {
      padding: "13px 14px",
      borderBottom: "1px solid #f3f4f6",
      flexShrink: 0,
    },
    mapSidebarList: {
      flex: 1,
      overflowY: "auto",
      padding: "10px",
      scrollbarWidth: "thin",
    },
    mapPanel: {
      flex: 1,
      position: "relative",
      padding: "12px",
      boxSizing: "border-box",
    },
  };

  // ─── Coupon Card ──────────────────────────────────────────────────────────────
  const renderCard = (coupon) => {
    const name = coupon.merchantId?.businessName || "Local Store";
    const disc =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;
    return (
      <div
        key={coupon._id}
        style={s.card}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.13)";
          e.currentTarget.style.borderColor = "#c7d7fd";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.07)";
          e.currentTarget.style.borderColor = "#eaecf0";
          e.currentTarget.style.transform = "none";
        }}
        onClick={() => {
          setMapCenter(coupon.coords);
          mapInstanceRef.current?.setView(coupon.coords, 16);
        }}
      >
        {/* Logo */}
        <div style={s.logoBox}>
          {coupon.merchantId?.logo ? (
            <img
              src={coupon.merchantId.logo}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={s.logoText}>{name[0]?.toUpperCase()}</div>
          )}
        </div>

        {/* Body */}
        <div style={s.cardBody}>
          <div style={s.cardTop}>
            <span style={s.brandName}>{name}</span>
            <span style={s.distancePill}>{coupon.distance} km away</span>
          </div>
          <div style={s.discount}>{disc}</div>
          <div style={s.dealTitle}>{coupon.title}</div>
          <div style={s.addressRow}>
            <IconPin />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {coupon.address}
            </span>
          </div>
          <div style={{ ...s.cardFooter, justifyContent: "flex-end" }}>
            <Link href={`/deals/${coupon._id}`} style={s.claimBtn}>
              Get Deal <IconArrow />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // ─── Location Modal ───────────────────────────────────────────────────────────
  const locationModal = (
    <div
      style={s.overlay}
      onClick={(e) =>
        e.target === e.currentTarget && setShowLocationModal(false)
      }
    >
      <form onSubmit={handleManualSubmit} style={s.modal}>
        <div style={s.modalHeader}>
          <div style={s.modalTitle}>
            <IconPin /> Set Your Location
          </div>
          <button
            type="button"
            style={s.iconBtn}
            onClick={() => setShowLocationModal(false)}
          >
            <IconClose />
          </button>
        </div>

        <div style={s.modalField}>
          <label style={s.modalLabel}>State</label>
          <select
            style={s.modalSelect}
            value={manualForm.state}
            onChange={(e) =>
              setManualForm({ ...manualForm, state: e.target.value })
            }
          >
            <option value="Jharkhand">Jharkhand</option>
            <option value="Bihar">Bihar</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>

        <div style={s.modalField}>
          <label style={s.modalLabel}>City *</label>
          <select
            style={s.modalSelect}
            value={manualForm.city}
            onChange={(e) =>
              setManualForm({ ...manualForm, city: e.target.value })
            }
            required
          >
            <option value="Ranchi">Ranchi</option>
            <option value="Jamshedpur">Jamshedpur</option>
            <option value="Patna">Patna</option>
            <option value="Arrah">Arrah</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
          </select>
        </div>

        <div style={s.modalField}>
          <label style={s.modalLabel}>
            Area or Pincode{" "}
            <span style={{ fontWeight: 400, color: "#9ca3af" }}>
              (optional)
            </span>
          </label>
          <input
            style={s.modalInput}
            placeholder="e.g. Lalpur or 834001"
            value={manualForm.area}
            onChange={(e) =>
              setManualForm({ ...manualForm, area: e.target.value })
            }
          />
        </div>

        <button type="submit" style={s.modalSubmit}>
          Find Deals Near Me
        </button>
      </form>
    </div>
  );

  // ─── Filter panel ─────────────────────────────────────────────────────────────
  const filterPanel = showFilters && (
    <div style={{ ...s.filterPanel, marginBottom: "12px" }}>
      <div style={s.filterGroup}>
        <label style={s.filterLabel}>Distance</label>
        <select
          style={s.filterSelect}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        >
          <option value="2">Within 2 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
        </select>
      </div>
      <div style={s.filterGroup}>
        <label style={s.filterLabel}>Category</label>
        <select
          style={s.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div style={s.filterGroup}>
        <label style={s.filterLabel}>Sort By</label>
        <select
          style={s.filterSelect}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="distance">Nearest First</option>
          <option value="discount">Highest Discount</option>
        </select>
      </div>
      <div style={{ ...s.filterGroup, justifyContent: "flex-end" }}>
        <button
          type="button"
          style={s.resetBtn}
          onClick={() => {
            setCategoryFilter("all");
            setDistance("10");
            setSortOrder("distance");
            setSearchQuery("");
            setShowFilters(false);
          }}
        >
          Reset all
        </button>
      </div>
    </div>
  );

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  const tabsRow = (
    <div style={s.tabsRow}>
      {TABS.map((t) => (
        <button
          key={t.key}
          style={s.tab(activeTab === t.key)}
          onClick={() => setActiveTab(t.key)}
        >
          {t.label}
          <span style={s.tabCount(activeTab === t.key)}>
            {grouped[t.key]?.length || 0}
          </span>
        </button>
      ))}
    </div>
  );

  // ─── Content area ─────────────────────────────────────────────────────────────
  const contentArea = loading ? (
    <div style={s.loading}>
      <IconLoader />
      <span style={s.loadingText}>Looking for deals near you…</span>
    </div>
  ) : activeList.length === 0 ? (
    <div style={s.empty}>
      <div style={s.emptyTitle}>No deals found here</div>
      <div style={s.emptyText}>
        Try widening your distance or removing category filters to see more
        offers.
      </div>
      <button
        style={s.clearBtn}
        onClick={() => {
          setCategoryFilter("all");
          setDistance("25");
          setSortOrder("distance");
          setSearchQuery("");
        }}
      >
        Show all nearby deals
      </button>
    </div>
  ) : (
    <div style={s.grid}>{activeList.map(renderCard)}</div>
  );

  const [viewMode, setViewMode] = useState("directory"); // 'directory' or 'map'
  const [citySearch, setCitySearch] = useState("");
  const [activeCityLetter, setActiveCityLetter] = useState("all");
  const [cityGridCols, setCityGridCols] = useState(4);
  const [showMoreAboutCities, setShowMoreAboutCities] = useState(false);
  const [showAllSidebarMerchants, setShowAllSidebarMerchants] = useState(false);

  const CITIES_LIST = [
    {
      name: "Delhi",
      slug: "delhi",
      coupons: 51,
      offers: 90,
      svg: `<path d="M12 2L4 7v10l8 5 8-5V7l-8-5z M12 6v6 M8 9h8" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Hyderabad",
      slug: "hyderabad",
      coupons: 111,
      offers: 107,
      svg: `<path d="M6 22V8l6-4 6 4v14 M10 14h4 M10 18h4" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Bangalore",
      slug: "bangalore",
      coupons: 85,
      offers: 104,
      svg: `<path d="M3 21h18 M6 18V6l6-3 6 3v12" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Mumbai",
      slug: "mumbai",
      coupons: 56,
      offers: 102,
      svg: `<path d="M4 21h16 M7 17V4l5-2 5 2v13" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Ranchi",
      slug: "ranchi",
      coupons: 42,
      offers: 88,
      svg: `<path d="M5 20h14 M8 16V9l4-3 4 3v7" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Jamshedpur",
      slug: "jamshedpur",
      coupons: 38,
      offers: 74,
      svg: `<path d="M4 19h16 M7 15V8l5-3 5 3v7" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Patna",
      slug: "patna",
      coupons: 64,
      offers: 92,
      svg: `<path d="M6 20h12 M9 16V7l3-2 3 2v9" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Arrah",
      slug: "arrah",
      coupons: 22,
      offers: 45,
      svg: `<path d="M5 19h14 M8 15V9l4-3 4 3v6" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Pune",
      slug: "pune",
      coupons: 78,
      offers: 112,
      svg: `<path d="M4 20h16 M7 16V6l5-2 5 2v10" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Chennai",
      slug: "chennai",
      coupons: 69,
      offers: 98,
      svg: `<path d="M5 21h14 M8 17V7l4-3 4 3v10" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Kolkata",
      slug: "kolkata",
      coupons: 92,
      offers: 130,
      svg: `<path d="M4 20h16 M7 16V5l5-2 5 2v11" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Ahmedabad",
      slug: "ahmedabad",
      coupons: 54,
      offers: 86,
      svg: `<path d="M6 19h12 M9 15V8l3-3 3 3v7" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Jaipur",
      slug: "jaipur",
      coupons: 47,
      offers: 79,
      svg: `<path d="M5 20h14 M8 16V7l4-2 4 2v9" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Chandigarh",
      slug: "chandigarh",
      coupons: 33,
      offers: 61,
      svg: `<path d="M6 19h12 M9 15V9l3-2 3 2v6" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Lucknow",
      slug: "lucknow",
      coupons: 58,
      offers: 94,
      svg: `<path d="M4 21h16 M7 17V6l5-3 5 3v11" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Surat",
      slug: "surat",
      coupons: 41,
      offers: 73,
      svg: `<path d="M5 20h14 M8 16V8l4-2 4 2v8" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Kochi",
      slug: "kochi",
      coupons: 36,
      offers: 68,
      svg: `<path d="M6 19h12 M9 15V9l3-3 3 3v6" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Indore",
      slug: "indore",
      coupons: 44,
      offers: 81,
      svg: `<path d="M5 20h14 M8 16V8l4-3 4 3v8" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Bhopal",
      slug: "bhopal",
      coupons: 29,
      offers: 53,
      svg: `<path d="M6 19h12 M9 15V9l3-2 3 2v6" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Nagpur",
      slug: "nagpur",
      coupons: 31,
      offers: 57,
      svg: `<path d="M5 20h14 M8 16V8l4-2 4 2v8" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "Visakhapatnam",
      slug: "visakhapatnam",
      coupons: 27,
      offers: 49,
      svg: `<path d="M6 19h12 M9 15V9l3-2 3 2v6" stroke="#2563eb" stroke-width="1.5" fill="none"/>`,
    },
  ];

  const POPULAR_CITIES_FOUR = CITIES_LIST.slice(0, 4);

  const filteredCities = useMemo(() => {
    let list = CITIES_LIST;
    if (activeCityLetter !== "all") {
      list = list.filter((c) =>
        c.name.toUpperCase().startsWith(activeCityLetter),
      );
    }
    if (citySearch.trim()) {
      list = list.filter((c) =>
        c.name.toLowerCase().includes(citySearch.toLowerCase()),
      );
    }
    return list;
  }, [activeCityLetter, citySearch]);

  const visibleSidebarMerchants = showAllSidebarMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .sidebar-item-hover:hover { background: #f8fafc !important; color: #2563eb !important; }
        .sidebar-link-item:hover { color: #2563eb !important; }
        .brand-card-hover:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important; border-color: #2563eb !important; transform: translateY(-1px); }
        .grid-btn-hover:hover { background: #f8fafc !important; color: #2563eb !important; border-color: #2563eb !important; }
        @media (max-width: 900px) {
          .stores-grid-layout { grid-template-columns: 1fr !important; padding: 12px !important; gap: 16px !important; }
        }
        @media (max-width: 640px) {
          .all-stores-responsive-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
        }
      `}</style>
      <Navbar />

      {viewMode === "directory" ? (
        <DirectoryLayout
          activeKey="Cities Deals"
          title="Cities"
          icon={IconPin}
          stat1={{ count: 21, label: "Total Cities", shortLabel: "Cities" }}
          stat2={{ count: "2,157", label: "Total Verified Offers" }}
          aboutTitle="About Cities"
          aboutText="Every city has its own vibe, and so do its deals. Vouchiqo brings you exclusive offers that cater to your city's tastes and needs."
          actionElement={
            <button
              onClick={() => setViewMode("map")}
              className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <IconMap /> Interactive Map
            </button>
          }
        >
          {/* Popular Cities */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px 20px 20px",
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#000000",
                marginBottom: 16,
                letterSpacing: "-0.2px",
              }}
            >
              Popular Cities
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {POPULAR_CITIES_FOUR.map((c) => (
                <div
                  key={c.name}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    background: "#ffffff",
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                  className="brand-card-hover"
                  onClick={() => {
                    setSavedCity(c.name);
                    setViewMode("map");
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "#eff6ff",
                      border: "1px solid #dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyCenter: "center",
                      padding: 12,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="36"
                      height="36"
                      dangerouslySetInnerHTML={{ __html: c.svg }}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#000000",
                        margin: "0 0 3px 0",
                      }}
                    >
                      {c.name}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {c.coupons + c.offers} Active Offers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Cities */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px 20px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#000000",
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                All Cities
              </h2>
              <div style={{ display: "flex", gap: 4 }}>
                {[3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setCityGridCols(cols)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      background: cityGridCols === cols ? "#2563eb" : "#ffffff",
                      color: cityGridCols === cols ? "#ffffff" : "#4b5563",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            </div>

            {/* Alpha + Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <button
                  onClick={() => setActiveCityLetter("all")}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor:
                      activeCityLetter === "all" ? "#2563eb" : "#e5e7eb",
                    background:
                      activeCityLetter === "all" ? "#2563eb" : "transparent",
                    color: activeCityLetter === "all" ? "#ffffff" : "#4b5563",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                {ALPHA_LETTERS.map((letter) => (
                  <button
                    key={letter}
                    onClick={() =>
                      setActiveCityLetter(
                        activeCityLetter === letter ? "all" : letter,
                      )
                    }
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor:
                        activeCityLetter === letter ? "#2563eb" : "#e5e7eb",
                      background:
                        activeCityLetter === letter ? "#2563eb" : "transparent",
                      color:
                        activeCityLetter === letter ? "#ffffff" : "#1f2937",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  padding: "5px 10px",
                  background: "#ffffff",
                  minWidth: 200,
                }}
              >
                <IconSearch />
                <input
                  placeholder="Search by cities name"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#000000",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            {/* City Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cityGridCols}, 1fr)`,
                gap: 12,
              }}
              className="all-stores-responsive-grid"
            >
              {filteredCities.map((c) => (
                <div
                  key={c.name}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    background: "#ffffff",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    items: "center",
                    textAlign: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                  className="brand-card-hover"
                  onClick={() => {
                    setSavedCity(c.name);
                    setViewMode("map");
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      padding: 8,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      dangerouslySetInnerHTML={{ __html: c.svg }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#000000",
                      margin: 0,
                    }}
                  >
                    {c.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#2563eb",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {c.coupons + c.offers} Active Offers
                  </p>
                </div>
              ))}
            </div>
          </section>
        </DirectoryLayout>
      ) : (
        /* ── INTERACTIVE MAP VIEW ── */
        <>
          <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center px-6">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconPin /> Interactive Deals Map — {savedCity || "All Cities"}
            </span>
            <button
              onClick={() => setViewMode("directory")}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Back to Cities Directory
            </button>
          </div>
          <div style={s.mapLayout}>
            <div style={s.mapSidebar}>
              <div style={s.mapSidebarHeader}>
                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#111827",
                    }}
                  >
                    Deals Near You
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginTop: "2px",
                    }}
                  >
                    Browse offers on the map
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  >
                    <IconSearch />
                  </span>
                  <input
                    style={{ ...s.searchInput, paddingLeft: "34px" }}
                    placeholder="Search stores or deals…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div style={s.mapSidebarList}>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : grouped.all.length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    No deals match your filters
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {grouped.all.map(renderCard)}
                  </div>
                )}
              </div>
            </div>

            <div style={s.mapPanel}>
              <div
                ref={mapRef}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
            </div>
          </div>
          <Footer />
        </>
      )}

      {/* Location Modal */}
      {showLocationModal && locationModal}
    </div>
  );
}
