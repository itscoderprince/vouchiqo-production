"use client";

import {
  Baby,
  Car,
  Check,
  ChevronRight,
  Compass,
  Crosshair,
  Dumbbell,
  Film,
  Flame,
  Gamepad2,
  Gem,
  Globe,
  GraduationCap,
  Home as HomeIcon,
  Layers,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Moon,
  Mountain,
  Navigation,
  Plane,
  Search,
  Shirt,
  ShoppingCart,
  Tag,
  Tv,
  UtensilsCrossed,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/navbar";
import { useLocation } from "@/hooks/use-location";

// ─── Constants & Coordinates ──────────────────────────────────────────────────

const CITY_COORDINATES = {
  ranchi: [23.3441, 85.3096],
  jamshedpur: [22.8046, 86.2029],
  patna: [25.5941, 85.1376],
  arrah: [25.5564, 84.6681],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.385, 78.4867],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  chennai: [13.0827, 80.2707],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
};

const CITY_OPTIONS = [
  { name: "Ranchi", state: "Jharkhand", coords: [23.3441, 85.3096] },
  { name: "Jamshedpur", state: "Jharkhand", coords: [22.8046, 86.2029] },
  { name: "Patna", state: "Bihar", coords: [25.5941, 85.1376] },
  { name: "Arrah", state: "Bihar", coords: [25.5564, 84.6681] },
  { name: "Delhi", state: "Delhi", coords: [28.6139, 77.209] },
  { name: "Mumbai", state: "Maharashtra", coords: [19.076, 72.8777] },
  { name: "Bangalore", state: "Karnataka", coords: [12.9716, 77.5946] },
  { name: "Hyderabad", state: "Telangana", coords: [17.385, 78.4867] },
  { name: "Kolkata", state: "West Bengal", coords: [22.5726, 88.3639] },
  { name: "Pune", state: "Maharashtra", coords: [18.5204, 73.8567] },
  { name: "Chennai", state: "Tamil Nadu", coords: [13.0827, 80.2707] },
  { name: "Ahmedabad", state: "Gujarat", coords: [23.0225, 72.5714] },
  { name: "Jaipur", state: "Rajasthan", coords: [26.9124, 75.7873] },
  { name: "Lucknow", state: "Uttar Pradesh", coords: [26.8467, 80.9462] },
];

// ─── Custom Girl / Face Icon for Beauty Category ─────────────────────────────

const GirlFaceIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M7.5 10.5c1.5-2 3-2.5 4.5-2.5s3 .5 4.5 2.5" />
    <path d="M9.5 15c1 .8 2.5 .8 3.5 0" />
    <circle cx="9" cy="11" r="0.75" fill="currentColor" />
    <circle cx="15" cy="11" r="0.75" fill="currentColor" />
  </svg>
);

// ─── 15 Distinct & Meaningful Categories with Unique Icons ────────────────────

const CATEGORIES = [
  { key: "all", label: "All", icon: Flame, color: "#2563eb" },
  { key: "food", label: "Food & Dining", icon: UtensilsCrossed, color: "#ea580c" },
  { key: "fashion", label: "Fashion", icon: Shirt, color: "#7c3aed" },
  { key: "electronics", label: "Electronics", icon: Tv, color: "#0284c7" },
  { key: "fitness", label: "Fitness & Gym", icon: Dumbbell, color: "#059669" },
  { key: "beauty", label: "Beauty & Spa", icon: GirlFaceIcon, color: "#db2777" },
  { key: "travel", label: "Travel & Hotels", icon: Plane, color: "#0891b2" },
  { key: "home", label: "Home & Kitchen", icon: HomeIcon, color: "#d97706" },
  { key: "grocery", label: "Grocery", icon: ShoppingCart, color: "#16a34a" },
  { key: "education", label: "Education", icon: GraduationCap, color: "#4f46e5" },
  { key: "entertainment", label: "Entertainment", icon: Film, color: "#dc2626" },
  { key: "jewellery", label: "Jewellery", icon: Gem, color: "#b45309" },
  { key: "automotive", label: "Automotive", icon: Car, color: "#475569" },
  { key: "finance", label: "Finance", icon: Wallet, color: "#0d9488" },
  { key: "kids-baby", label: "Kids & Baby", icon: Baby, color: "#e11d48" },
  { key: "home-improvement", label: "Home Improvement", icon: Wrench, color: "#ca8a04" },
  { key: "gaming", label: "Gaming", icon: Gamepad2, color: "#6366f1" },
];

const DISTANCE_PRESETS = [
  { value: "2", label: "2 km" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "999", label: "All" },
];

const MAP_TILES = {
  osm: {
    id: "osm",
    name: "Street Map",
    icon: Navigation,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  voyager: {
    id: "voyager",
    name: "Clean Light",
    icon: MapIcon,
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
  satellite: {
    id: "satellite",
    name: "Satellite",
    icon: Globe,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
  },
  dark: {
    id: "dark",
    name: "Dark Night",
    icon: Moon,
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
  terrain: {
    id: "terrain",
    name: "Terrain",
    icon: Mountain,
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

// ─── Meaningful Inline Vector SVGs for Leaflet Markers & Popups ───────────────

const CATEGORY_SVGS = {
  food: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>`,
  fashion: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
  electronics: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
  fitness: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
  beauty: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M7.5 10.5c1.5-2 3-2.5 4.5-2.5s3 .5 4.5 2.5"/><path d="M9.5 15c1 .8 2.5 .8 3.5 0"/><circle cx="9" cy="11" r="0.75" fill="currentColor"/><circle cx="15" cy="11" r="0.75" fill="currentColor"/></svg>`,
  travel: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  home: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  grocery: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  education: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 2.18a2 2 0 0 0-1.66 0L2.6 10.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
  entertainment: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/><line x1="7" x2="7" y1="2" y2="22"/><line x1="17" x2="17" y1="2" y2="22"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="2" x2="7" y1="7" y2="7"/><line x1="2" x2="7" y1="17" y2="17"/><line x1="17" x2="22" y1="17" y2="17"/><line x1="17" x2="22" y1="7" y2="7"/></svg>`,
  jewellery: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`,
  automotive: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  finance: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  "kids-baby": `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>`,
  "home-improvement": `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  gaming: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>`,
  default: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
};

// ─── High-Fidelity Realistic Skeleton Components ──────────────────────────

const DealCardSkeleton = () => (
  <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs animate-pulse">
    <div className="flex gap-2.5 items-start">
      {/* Avatar skeleton */}
      <div className="w-9 h-9 rounded-lg bg-slate-200 shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Top row: Brand & distance */}
        <div className="flex items-center justify-between gap-1">
          <div className="h-2.5 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-blue-100/70 rounded-full w-14" />
        </div>
        {/* Discount banner */}
        <div className="h-3.5 bg-slate-200 rounded w-20" />
        {/* Title */}
        <div className="h-2.5 bg-slate-100 rounded w-4/5" />
        {/* Address */}
        <div className="h-2 bg-slate-100 rounded w-3/5" />
        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="h-2 bg-slate-100 rounded w-12" />
          <div className="h-2.5 bg-blue-100/80 rounded w-14" />
        </div>
      </div>
    </div>
  </div>
);

const MapSkeleton = () => (
  <div className="absolute inset-0 z-10 overflow-hidden bg-slate-100 animate-pulse flex items-center justify-center pointer-events-none">
    {/* Subtle street-like grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.18]"
      style={{
        backgroundImage:
          "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />

    {/* Central Pulsing Radar & Beacon */}
    <div className="relative flex items-center justify-center z-10">
      <div className="w-20 h-20 rounded-full bg-blue-400/20 animate-ping absolute" />
      <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center shadow-md">
        <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
      </div>
    </div>

    {/* Floating Action Dock Skeleton (Top-Right) */}
    <div className="absolute top-3 right-3 flex flex-col items-center gap-1 bg-white/90 p-1 rounded-xl shadow-md border border-slate-200/90 pointer-events-none">
      <div className="w-7 h-7 rounded-lg bg-blue-100/70" />
      <div className="h-[1px] w-3.5 bg-slate-200" />
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
    </div>

    {/* Bottom Watermark Badge */}
    <div className="absolute bottom-3 left-3 bg-white/85 px-2 py-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1.5 pointer-events-none">
      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
      <span className="text-[10px] font-semibold text-slate-500">
        Loading Map & Deals…
      </span>
    </div>
  </div>
);

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

function getCategoryTheme(category) {
  const cat = (category || "").toLowerCase();
  if (
    cat.includes("food") ||
    cat.includes("dining") ||
    cat.includes("restaurant") ||
    cat.includes("cafe")
  ) {
    return {
      iconComp: UtensilsCrossed,
      svg: CATEGORY_SVGS.food,
      color: "#ea580c",
      bg: "#fff7ed",
      border: "#ffedd5",
    };
  }
  if (
    cat.includes("fashion") ||
    cat.includes("cloth") ||
    cat.includes("apparel") ||
    cat.includes("wear")
  ) {
    return {
      iconComp: Shirt,
      svg: CATEGORY_SVGS.fashion,
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ede9fe",
    };
  }
  if (
    cat.includes("elect") ||
    cat.includes("tech") ||
    cat.includes("gadget") ||
    cat.includes("tv") ||
    cat.includes("mobile") ||
    cat.includes("appl")
  ) {
    return {
      iconComp: Tv,
      svg: CATEGORY_SVGS.electronics,
      color: "#0284c7",
      bg: "#f0f9ff",
      border: "#e0f2fe",
    };
  }
  if (
    cat.includes("fit") ||
    cat.includes("gym") ||
    cat.includes("workout") ||
    cat.includes("health")
  ) {
    return {
      iconComp: Dumbbell,
      svg: CATEGORY_SVGS.fitness,
      color: "#059669",
      bg: "#ecfdf5",
      border: "#d1fae5",
    };
  }
  if (
    cat.includes("beauty") ||
    cat.includes("salon") ||
    cat.includes("spa") ||
    cat.includes("cosmetic")
  ) {
    return {
      iconComp: GirlFaceIcon,
      svg: CATEGORY_SVGS.beauty,
      color: "#db2777",
      bg: "#fdf2f8",
      border: "#fce7f3",
    };
  }
  if (
    cat.includes("travel") ||
    cat.includes("hotel") ||
    cat.includes("flight") ||
    cat.includes("trip")
  ) {
    return {
      iconComp: Plane,
      svg: CATEGORY_SVGS.travel,
      color: "#0891b2",
      bg: "#ecfeff",
      border: "#cffafe",
    };
  }
  if (
    cat.includes("grocer") ||
    cat.includes("supermarket") ||
    cat.includes("mart")
  ) {
    return {
      iconComp: ShoppingCart,
      svg: CATEGORY_SVGS.grocery,
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "#dcfce7",
    };
  }
  if (
    cat.includes("educat") ||
    cat.includes("course") ||
    cat.includes("learn") ||
    cat.includes("book")
  ) {
    return {
      iconComp: GraduationCap,
      svg: CATEGORY_SVGS.education,
      color: "#4f46e5",
      bg: "#eef2ff",
      border: "#e0e7ff",
    };
  }
  if (
    cat.includes("entertain") ||
    cat.includes("movie") ||
    cat.includes("cinema") ||
    cat.includes("show")
  ) {
    return {
      iconComp: Film,
      svg: CATEGORY_SVGS.entertainment,
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fee2e2",
    };
  }
  if (
    cat.includes("jewel") ||
    cat.includes("gold") ||
    cat.includes("diamond") ||
    cat.includes("silver")
  ) {
    return {
      iconComp: Gem,
      svg: CATEGORY_SVGS.jewellery,
      color: "#b45309",
      bg: "#fffbeb",
      border: "#fef3c7",
    };
  }
  if (
    cat.includes("auto") ||
    cat.includes("car") ||
    cat.includes("bike") ||
    cat.includes("vehicle")
  ) {
    return {
      iconComp: Car,
      svg: CATEGORY_SVGS.automotive,
      color: "#475569",
      bg: "#f8fafc",
      border: "#f1f5f9",
    };
  }
  if (
    cat.includes("finan") ||
    cat.includes("bank") ||
    cat.includes("card") ||
    cat.includes("insur")
  ) {
    return {
      iconComp: Wallet,
      svg: CATEGORY_SVGS.finance,
      color: "#0d9488",
      bg: "#f0fdfa",
      border: "#ccfbf1",
    };
  }
  if (
    cat.includes("kid") ||
    cat.includes("baby") ||
    cat.includes("toy") ||
    cat.includes("child")
  ) {
    return {
      iconComp: Baby,
      svg: CATEGORY_SVGS["kids-baby"],
      color: "#e11d48",
      bg: "#fff1f2",
      border: "#ffe4e6",
    };
  }
  if (
    cat.includes("improvement") ||
    cat.includes("repair") ||
    cat.includes("tool")
  ) {
    return {
      iconComp: Wrench,
      svg: CATEGORY_SVGS["home-improvement"],
      color: "#ca8a04",
      bg: "#fefce8",
      border: "#fef9c3",
    };
  }
  if (
    cat.includes("game") ||
    cat.includes("gaming") ||
    cat.includes("esport")
  ) {
    return {
      iconComp: Gamepad2,
      svg: CATEGORY_SVGS.gaming,
      color: "#6366f1",
      bg: "#eef2ff",
      border: "#e0e7ff",
    };
  }
  if (
    cat.includes("home") ||
    cat.includes("furn") ||
    cat.includes("living") ||
    cat.includes("kitchen")
  ) {
    return {
      iconComp: HomeIcon,
      svg: CATEGORY_SVGS.home,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fef3c7",
    };
  }
  return {
    iconComp: Tag,
    svg: CATEGORY_SVGS.default,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#dbeafe",
  };
}

// ─── Main Map Component ────────────────────────────────────────────────────────

export default function NearbyOffers() {
  const { city: savedCity, setCity: setSavedCity } = useLocation();
  const [mapCenter, setMapCenter] = useState([23.3441, 85.3096]);
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [distance, setDistance] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tileLayerType, setTileLayerType] = useState("osm");
  const [rawCoupons, setRawCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [showRadiusCircle, setShowRadiusCircle] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const markersMapRef = useRef({});
  const cardRefs = useRef({});
  const categoryScrollRef = useRef(null);
  const layerMenuRef = useRef(null);

  // Close layer menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        layerMenuRef.current &&
        !layerMenuRef.current.contains(event.target)
      ) {
        setShowLayerMenu(false);
      }
    }
    if (showLayerMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLayerMenu]);

  // Smoothly scroll and center clicked category button
  const handleCategoryClick = useCallback((catKey, e) => {
    setCategoryFilter(catKey);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, []);

  // Sync city to coordinates
  useEffect(() => {
    if (savedCity) {
      const match = CITY_COORDINATES[savedCity.toLowerCase()];
      if (match) {
        setMapCenter(match);
      }
    }
  }, [savedCity]);

  // Invalidate map size on window resize/orientation change
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load Leaflet CSS & JS
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

  // Cleanup map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch verified local coupons from API
  useEffect(() => {
    let isCancelled = false;
    async function fetchOffers() {
      setLoading(true);
      try {
        const q = new URLSearchParams({ limit: "100" });
        if (savedCity) q.set("city", savedCity);
        const res = await fetch(`/api/coupons?${q}`);
        if (res.ok) {
          const d = await res.json();
          if (!isCancelled) {
            setRawCoupons(d.data?.coupons || []);
          }
        }
      } catch (err) {
        console.error("Failed to load map offers:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchOffers();
    return () => {
      isCancelled = true;
    };
  }, [savedCity]);

  // Enrich coupons with realistic coordinates around current center & distance calculations
  const enrichedCoupons = useMemo(() => {
    const center = userGpsCoords || mapCenter;
    return rawCoupons.map((c) => {
      const mLoc = c.merchantId?.location;
      const hasCoords =
        mLoc?.coordinates?.lat != null && mLoc?.coordinates?.lng != null;
      let lat = hasCoords ? mLoc.coordinates.lat : null;
      let lng = hasCoords ? mLoc.coordinates.lng : null;

      // Realistic deterministic spread based on unique brand identity so all offers of same brand share exact coordinates
      if (lat == null || lng == null) {
        const brandKey = (
          c.merchantId?._id ||
          c.merchantId?.businessName ||
          c.brandName ||
          "vouchiqo"
        ).toString();
        const hash = brandKey
          .split("")
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const angle = ((hash * 47) % 360) * (Math.PI / 180);
        const radiusOffset = (((hash * 13) % 45) + 5) / 1000; // 0.5 to 5 km offset
        lat = center[0] + Math.cos(angle) * radiusOffset * 1.1;
        lng = center[1] + Math.sin(angle) * radiusOffset * 1.3;
      }

      const dist = haversine(center[0], center[1], lat, lng);
      const businessName =
        c.merchantId?.businessName || c.brandName || "Verified Partner";
      const logo = c.merchantId?.logo || null;
      const theme = getCategoryTheme(c.category);

      return {
        ...c,
        coords: [lat, lng],
        distance: dist,
        businessName,
        logo,
        theme,
        address:
          mLoc?.address ||
          `${businessName} Store, Main Road, ${savedCity || "Ranchi"}`,
        city: mLoc?.city || savedCity || "Ranchi",
      };
    });
  }, [rawCoupons, mapCenter, userGpsCoords, savedCity]);

  // Filter deals based on search, category, and radius distance, then deduplicate by UNIQUE BRAND (showing latest recent offer)
  const filteredDeals = useMemo(() => {
    const maxDist = parseFloat(distance);
    const list = enrichedCoupons.filter((c) => {
      // Category filter
      if (categoryFilter !== "all") {
        const cCat = (c.category || "").toLowerCase();
        if (!cCat.includes(categoryFilter.toLowerCase())) return false;
      }

      // Distance filter
      if (maxDist < 900 && c.distance > maxDist) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(q);
        const nameMatch = c.businessName?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        const catMatch = c.category?.toLowerCase().includes(q);
        if (!titleMatch && !nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });

    // Group by unique brand/merchant and select the latest recent offer
    const brandMap = new Map();

    list.forEach((deal) => {
      const brandKey = (
        deal.merchantId?._id ||
        deal.businessName ||
        deal._id
      )
        .toString()
        .trim()
        .toLowerCase();

      if (!brandMap.has(brandKey)) {
        brandMap.set(brandKey, {
          latestDeal: deal,
          allDeals: [deal],
        });
      } else {
        const existing = brandMap.get(brandKey);
        existing.allDeals.push(deal);

        const existingTime = new Date(
          existing.latestDeal.createdAt || existing.latestDeal.updatedAt || 0,
        ).getTime();
        const currentTime = new Date(
          deal.createdAt || deal.updatedAt || 0,
        ).getTime();

        // Keep the most recent offer
        if (
          currentTime > existingTime ||
          (currentTime === existingTime && deal._id > existing.latestDeal._id)
        ) {
          existing.latestDeal = deal;
        }
      }
    });

    const uniqueDeals = Array.from(brandMap.values()).map(
      ({ latestDeal, allDeals }) => ({
        ...latestDeal,
        offersCount: allDeals.length,
        allDeals,
      }),
    );

    // Sort by distance nearest first
    return uniqueDeals.sort((a, b) => a.distance - b.distance);
  }, [enrichedCoupons, categoryFilter, distance, searchQuery]);

  // Handle deal card selection
  const handleSelectDeal = useCallback((deal, shouldFly = true) => {
    setSelectedDealId(deal._id);
    if (shouldFly && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        deal.coords,
        Math.max(mapInstanceRef.current.getZoom(), 14),
        {
          duration: 0.8,
        },
      );
      const marker = markersMapRef.current[deal._id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (
      !leafletLoaded ||
      !mapRef.current ||
      typeof window === "undefined" ||
      !window.L
    ) {
      return;
    }

    const L = window.L;

    // Create map if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const activeTileConfig = MAP_TILES[tileLayerType] || MAP_TILES.voyager;
      const tileLayer = L.tileLayer(activeTileConfig.url, {
        attribution: activeTileConfig.attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(userGpsCoords || mapCenter, 13);
    }

    const map = mapInstanceRef.current;

    // Switch Tile Layer if changed
    if (tileLayerRef.current) {
      const activeTileConfig = MAP_TILES[tileLayerType] || MAP_TILES.voyager;
      tileLayerRef.current.setUrl(activeTileConfig.url);
    }

    // Clear existing markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }
    markersMapRef.current = {};

    const centerPoint = userGpsCoords || mapCenter;

    // 1. Draw Radius Circle
    const distNum = parseFloat(distance);
    if (showRadiusCircle && distNum < 900) {
      const radiusMeters = distNum * 1000;
      L.circle(centerPoint, {
        radius: radiusMeters,
        color: "#2563eb",
        weight: 1.5,
        opacity: 0.65,
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
        dashArray: "6, 6",
      }).addTo(markersGroupRef.current);
    }

    // 2. Draw User Center Marker (Pulsing radar)
    const userIconHtml = `
      <div class="user-pulse-marker">
        <div class="pulse-ring"></div>
        <div class="center-dot">
          <div class="inner-dot"></div>
        </div>
      </div>
    `;
    const userDivIcon = L.divIcon({
      className: "custom-user-marker",
      html: userIconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker(centerPoint, { icon: userDivIcon })
      .bindPopup(
        `<div style="font-family:var(--font-inter),sans-serif;font-size:12px;font-weight:700;color:#1e293b;padding:4px 6px;">
          📍 ${userGpsCoords ? "Your Live GPS Location" : `Center: ${savedCity || "Selected City"}`}
        </div>`,
      )
      .addTo(markersGroupRef.current);

    // 3. Draw Store / Deal Markers with Rich Interactive Cards
    filteredDeals.forEach((deal) => {
      const discountText =
        deal.discountType === "percentage"
          ? `${deal.discountValue}% OFF`
          : `₹${deal.discountValue} OFF`;

      const isSelected = selectedDealId === deal._id;

      const markerHtml = `
        <div class="deal-map-marker ${isSelected ? "marker-selected" : ""}">
          <div class="marker-pill" style="border-color:${deal.theme.color};">
            <span class="marker-icon" style="color:${deal.theme.color};">${deal.theme.svg}</span>
            <span class="marker-label">${discountText}</span>
          </div>
          <div class="marker-pin-tip" style="background:${deal.theme.color};"></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: "custom-deal-marker",
        html: markerHtml,
        iconSize: [96, 38],
        iconAnchor: [48, 34],
        popupAnchor: [0, -36],
      });

      const pinSvg = `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:2px;flex-shrink:0;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
      const checkCircleSvg = `<svg viewBox="0 0 20 20" width="13" height="13" fill="#16a34a" style="display:inline-block;vertical-align:-1px;flex-shrink:0;"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`;

      const popupContent = `
        <div class="map-popup-card">
          <div class="popup-header">
            <div class="popup-avatar" style="background:${deal.theme.bg};border-color:${deal.theme.border};color:${deal.theme.color};">
              ${deal.theme.svg}
            </div>
            <div class="popup-title-box">
              <div class="popup-brand">
                <span class="brand-text">${deal.businessName}</span>
                <span class="verified-check-circle" title="Verified Merchant">${checkCircleSvg}</span>
                ${
                  deal.offersCount > 1
                    ? `<span style="font-size:8px;font-weight:700;color:#2563eb;background:#eff6ff;padding:0.5px 4px;border-radius:3px;border:1px solid #dbeafe;flex-shrink:0;">${deal.offersCount} Deals</span>`
                    : ""
                }
              </div>
              <div class="popup-dist">${pinSvg}${deal.distance} km away • ${deal.city}</div>
            </div>
          </div>

          <div class="popup-body">
            <div class="popup-discount" style="color:${deal.theme.color};">${discountText}</div>
            <div class="popup-deal-title">${deal.title}</div>
            <div class="popup-address">${deal.address}</div>
          </div>

          <div class="popup-footer">
            <a href="/deals/${deal._id}" class="popup-btn-claim">
              Claim Deal →
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${deal.coords[0]},${deal.coords[1]}" target="_blank" rel="noopener noreferrer" class="popup-btn-directions" title="Directions">
              ↗ Directions
            </a>
          </div>
        </div>
      `;

      const marker = L.marker(deal.coords, { icon: markerIcon }).addTo(
        markersGroupRef.current,
      );

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        minWidth: 220,
        className: "vouchiqo-custom-leaflet-popup",
      });

      marker.on("click", () => {
        handleSelectDeal(deal, false);
        const el = cardRefs.current[deal._id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      markersMapRef.current[deal._id] = marker;
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [
    leafletLoaded,
    mapCenter,
    userGpsCoords,
    filteredDeals,
    tileLayerType,
    distance,
    showRadiusCircle,
    selectedDealId,
    savedCity,
    handleSelectDeal,
  ]);

  // Fit all deals in viewport
  const handleFitBounds = useCallback(() => {
    if (!mapInstanceRef.current || filteredDeals.length === 0 || !window.L)
      return;
    const L = window.L;
    const bounds = L.latLngBounds(filteredDeals.map((d) => d.coords));
    if (userGpsCoords) bounds.extend(userGpsCoords);
    else bounds.extend(mapCenter);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [filteredDeals, userGpsCoords, mapCenter]);

  // GPS Locate me action
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    const toastId = toast.loading("Detecting your exact GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserGpsCoords(coords);
        setMapCenter(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (res.ok) {
            const data = await res.json();
            const detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              null;
            if (detectedCity) {
              setSavedCity(detectedCity);
              toast.success(`Location set to ${detectedCity}!`, {
                id: toastId,
              });
            } else {
              toast.success("Live GPS coordinates detected!", { id: toastId });
            }
          }
        } catch {
          toast.success("Live location centered!", { id: toastId });
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error(
            "Location permission denied. Select city from dropdown.",
            {
              id: toastId,
            },
          );
        } else {
          toast.error("Could not fetch GPS location.", { id: toastId });
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // City change handler
  const handleCitySelect = (cityName) => {
    setSavedCity(cityName);
    setUserGpsCoords(null);
    const found = CITY_OPTIONS.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase(),
    );
    if (found) {
      setMapCenter(found.coords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(found.coords, 13, { duration: 1 });
      }
      toast.success(`Map centered to ${found.name}`);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden bg-slate-100 select-none"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {/* Global & Leaflet Font & Marker Styling */}
      <style>{`
        * {
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        /* Pulsing GPS user marker */
        .user-pulse-marker {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-ring {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.35);
          animation: mapPulse 2s infinite ease-out;
        }
        .center-dot {
          width: 18px;
          height: 18px;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .inner-dot {
          width: 6px;
          height: 6px;
          background: #ffffff;
          border-radius: 50%;
        }
        @keyframes mapPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Deal Marker */
        .deal-map-marker {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .deal-map-marker:hover, .deal-map-marker.marker-selected {
          transform: scale(1.12) translateY(-4px);
          z-index: 1000 !important;
        }
        .marker-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 2px solid #2563eb;
          border-radius: 999px;
          padding: 3px 6.5px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          font-weight: 700;
          font-size: 11px;
          color: #0f172a;
          white-space: nowrap;
        }
        .marker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .marker-label {
          letter-spacing: -0.2px;
          color: #0f172a;
        }
        .marker-pin-tip {
          width: 6px;
          height: 6px;
          background: #2563eb;
          transform: rotate(45deg) translateY(-2.5px);
          border-radius: 1px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Custom Leaflet Popup Card */
        .vouchiqo-custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }
        .vouchiqo-custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.35;
          font-family: var(--font-inter), sans-serif !important;
        }
        .vouchiqo-custom-leaflet-popup .leaflet-popup-close-button {
          top: 6px !important;
          right: 6px !important;
          color: #94a3b8 !important;
          font-size: 15px !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 6px !important;
          transition: all 0.15s !important;
          padding: 0 !important;
        }
        .vouchiqo-custom-leaflet-popup .leaflet-popup-close-button:hover {
          color: #0f172a !important;
          background: #f1f5f9 !important;
        }
        .vouchiqo-custom-leaflet-popup .leaflet-popup-tip {
          background: #ffffff;
        }
        .map-popup-card {
          width: 232px;
          padding: 10px 12px;
          box-sizing: border-box;
          color: #0f172a;
          font-family: var(--font-inter), sans-serif !important;
        }
        .popup-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          padding-right: 14px;
        }
        .popup-avatar {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .popup-title-box {
          flex: 1;
          min-width: 0;
        }
        .popup-brand {
          display: flex;
          align-items: center;
          gap: 3.5px;
          flex-wrap: wrap;
        }
        .popup-brand .brand-text {
          font-size: 11.5px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.25;
        }
        .verified-check-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .popup-dist {
          font-size: 9.5px;
          color: #64748b;
          font-weight: 400;
          display: flex;
          align-items: center;
          margin-top: 1px;
        }
        .popup-discount {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.2px;
          margin: 2px 0 1px 0;
          line-height: 1.2;
        }
        .popup-deal-title {
          font-size: 10.5px;
          font-weight: 500;
          color: #334155;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .popup-address {
          font-size: 9.5px;
          font-weight: 400;
          color: #64748b;
          margin-bottom: 6px;
          line-height: 1.35;
          word-break: break-word;
        }
        .popup-footer {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .popup-btn-claim {
          flex: 1;
          background: #2563eb;
          color: #ffffff !important;
          text-align: center;
          padding: 5.5px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .popup-btn-claim:hover {
          background: #1d4ed8;
        }
        .popup-btn-directions {
          background: #f1f5f9;
          color: #475569 !important;
          padding: 5.5px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .popup-btn-directions:hover {
          background: #e2e8f0;
          color: #0f172a !important;
        }

        /* Compact Leaflet Zoom Controls */
        .leaflet-control-zoom {
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08) !important;
          margin-right: 10px !important;
          margin-bottom: 10px !important;
        }
        .leaflet-control-zoom a {
          width: 22px !important;
          height: 22px !important;
          line-height: 22px !important;
          font-size: 12px !important;
          color: #334155 !important;
          background-color: rgba(255, 255, 255, 0.95) !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f1f5f9 !important;
          color: #2563eb !important;
        }
      `}</style>

      {/* Main Global Navbar */}
      <Navbar />

      {/* Main Container: Left Sidebar + Right Map */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-y-auto md:overflow-hidden relative scroll-smooth">
        {/* ─── LEFT SIDEBAR (Deals Near You Cards List) ─── */}
        <div className="w-full md:w-[340px] lg:w-[360px] md:h-full flex flex-col bg-white md:border-r border-slate-200 shrink-0 sticky top-0 md:static z-30 shadow-xs md:shadow-none">
          {/* Sidebar Top Header (Sticky on Mobile, Static on Desktop) */}
          <div className="p-3 border-b border-slate-100 shrink-0 space-y-2 bg-white">
            {/* Title & Near Me GPS Button Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-[13px] font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                  <span>Deals Near You</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-100">
                    {filteredDeals.length}
                  </span>
                </h1>
                <p className="text-[10px] text-gray-500 font-normal">
                  Find and claim verified offers near you
                </p>
              </div>

              {/* Near Me GPS Button */}
              <button
                onClick={handleLocateMe}
                disabled={gpsLoading}
                className={`flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                  userGpsCoords
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                }`}
                title="Locate with browser GPS"
              >
                <Crosshair
                  className={`w-3 h-3 ${gpsLoading ? "animate-spin text-blue-600" : ""}`}
                />
                <span>
                  {gpsLoading
                    ? "Locating..."
                    : userGpsCoords
                      ? "GPS Active"
                      : "Near Me"}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stores or deals…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-[11.5px] font-medium text-gray-800 placeholder-gray-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Radius Distance Presets (Full Width) */}
            <div className="flex items-center justify-between bg-slate-100 p-0.5 rounded-md border border-slate-200 overflow-x-auto w-full">
              {DISTANCE_PRESETS.slice(0, 5).map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDistance(d.value)}
                  className={`flex-1 text-center py-0.5 text-[9.5px] font-semibold rounded transition-all cursor-pointer ${
                    distance === d.value
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Category Filter Pills with Auto-Centering Shift */}
            <div
              ref={categoryScrollRef}
              className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none pt-0.5 scroll-smooth w-full px-0.5"
            >
              {CATEGORIES.map((cat) => {
                const active = categoryFilter === cat.key;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={(e) => handleCategoryClick(cat.key, e)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                      active
                        ? "bg-gray-900 text-white border-gray-900 font-bold shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-gray-700 border-slate-200"
                    }`}
                  >
                    <IconComponent
                      className={`w-3 h-3 shrink-0 ${active ? "text-white" : ""}`}
                      style={{ color: active ? "#ffffff" : cat.color }}
                    />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deals Cards List for Desktop */}
          <div className="hidden md:flex flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin bg-slate-50/50 flex-col">
            {loading ? (
              <div className="space-y-2 p-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <DealCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="p-6 text-center space-y-1.5 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto text-lg">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs font-bold text-gray-700">
                  No deals match your search
                </p>
                <p className="text-[10.5px] text-gray-500">
                  Expand your radius or clear active filters.
                </p>
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setDistance("50");
                    setSearchQuery("");
                  }}
                  className="mt-1.5 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredDeals.map((deal) => {
                const isSelected = selectedDealId === deal._id;
                const discountText =
                  deal.discountType === "percentage"
                    ? `${deal.discountValue}% OFF`
                    : `₹${deal.discountValue} OFF`;

                const CategoryIcon = deal.theme.iconComp;

                return (
                  <div
                    key={deal._id}
                    ref={(el) => {
                      cardRefs.current[deal._id] = el;
                    }}
                    onClick={() => handleSelectDeal(deal, true)}
                    className={`bg-white rounded-lg p-2.5 border transition-all cursor-pointer shadow-xs hover:shadow-sm relative group ${
                      isSelected
                        ? "border-blue-600 ring-1.5 ring-blue-100 bg-blue-50/15"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex gap-2.5 items-start">
                      {/* Store Avatar / Icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden"
                        style={{
                          background: deal.logo ? "#ffffff" : deal.theme.bg,
                          borderColor: deal.theme.border,
                        }}
                      >
                        {deal.logo ? (
                          <img
                            src={deal.logo}
                            alt={deal.businessName}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <CategoryIcon
                            className="w-4 h-4"
                            style={{ color: deal.theme.color }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top Line: Brand & Distance */}
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h2 className="text-[10.5px] font-bold text-gray-900 uppercase tracking-wider truncate">
                              {deal.businessName}
                            </h2>
                            {deal.offersCount > 1 && (
                              <span className="text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.2 rounded-full shrink-0">
                                {deal.offersCount} Deals
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-full shrink-0">
                            {deal.distance} km away
                          </span>
                        </div>

                        {/* Discount Banner */}
                        <div
                          className="text-[13px] font-bold tracking-tight leading-none my-0.5"
                          style={{ color: deal.theme.color }}
                        >
                          {discountText}
                        </div>

                        {/* Title */}
                        <p className="text-[11px] font-medium text-gray-700 line-clamp-1">
                          {deal.title}
                        </p>

                        {/* Address */}
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-normal mt-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                          <span className="truncate">{deal.address}</span>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                          <span className="text-[8.5px] font-medium text-gray-400 uppercase tracking-wider">
                            {deal.category || "Verified Deal"}
                          </span>
                          <Link
                            href={`/deals/${deal._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>Get Deal</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── INTERACTIVE MAP CANVAS (On mobile: 260px right after categories; on desktop: full height right column) ─── */}
        <div className="w-full md:flex-1 h-[250px] sm:h-[290px] md:h-full relative overflow-hidden bg-slate-200 shrink-0 border-b md:border-b-0 border-slate-200">
          {/* Leaflet DOM element */}
          <div
            ref={mapRef}
            className={`w-full h-full z-0 ${!leafletLoaded ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
          />

          {/* Map Skeleton Placeholder while Leaflet / tiles load */}
          {!leafletLoaded && <MapSkeleton />}

          {/* Map Top-Right Floating Controls (Google Maps-Style Vertical Icon Dock) */}
          {leafletLoaded && (
            <div
              ref={layerMenuRef}
              className="absolute top-3 right-3 z-[400] flex items-start gap-2 pointer-events-auto"
            >
              {/* Google Maps-Style Layer Selector Card Popup */}
              {showLayerMenu && (
                <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-200 p-1.5 w-36 animate-in fade-in zoom-in-95 duration-150 space-y-0.5 font-sans">
                  <div className="flex items-center border-b border-slate-100 pb-1 px-0.5">
                    <span className="text-[10.5px] font-semibold text-gray-900 tracking-tight flex items-center gap-1">
                      <Layers className="w-3 h-3 text-blue-600" />
                      <span>Map View</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-0.5 pt-0.5">
                    {Object.values(MAP_TILES).map((tile) => {
                      const isSelected = tileLayerType === tile.id;
                      const TileIcon = tile.icon;
                      return (
                        <button
                          key={tile.id}
                          onClick={() => {
                            setTileLayerType(tile.id);
                            setShowLayerMenu(false);
                            toast.success(`Switched to ${tile.name} view`);
                          }}
                          className={`w-full flex items-center justify-between px-1.5 py-1 rounded-md transition-colors cursor-pointer border text-left font-sans ${
                            isSelected
                              ? "bg-blue-50/90 border-blue-500 shadow-xs text-blue-600 font-semibold"
                              : "bg-slate-50/60 hover:bg-slate-100/90 hover:text-blue-600 border-slate-200/60 text-gray-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-600 shadow-xs border border-slate-200"
                              }`}
                            >
                              <TileIcon className="w-3 h-3" />
                            </div>
                            <span className="text-[10.5px] tracking-tight">
                              {tile.name}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-1.5 h-1.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ultra-Compact Vertical Icon-Only Action Buttons Dock */}
              <div className="flex flex-col items-center gap-0.5 bg-white/95 backdrop-blur-md p-0.5 rounded-lg shadow-md border border-slate-200">
                {/* Layers Button */}
                <button
                  onClick={() => setShowLayerMenu((prev) => !prev)}
                  className={`w-6.5 h-6.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    showLayerMenu
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                  title="Map Views & Layers"
                  aria-label="Map Views"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>

                <div className="h-[1px] w-3 bg-slate-200 my-0.2" />

                {/* Fit Bounds Button */}
                <button
                  onClick={handleFitBounds}
                  className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all cursor-pointer"
                  title="Fit All Deals on Screen"
                  aria-label="Fit All Deals"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* GPS Locate Me Button */}
                <button
                  onClick={handleLocateMe}
                  disabled={gpsLoading}
                  className={`w-6.5 h-6.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    userGpsCoords
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                  title="Locate with Live GPS"
                  aria-label="Live GPS"
                >
                  <Crosshair
                    className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin text-blue-600" : ""}`}
                  />
                </button>

                {/* Toggle Distance Radius Circle */}
                <button
                  onClick={() => setShowRadiusCircle((prev) => !prev)}
                  className={`w-6.5 h-6.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    showRadiusCircle
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  title={
                    showRadiusCircle
                      ? "Hide Search Radius Circle"
                      : "Show Search Radius Circle"
                  }
                  aria-label="Radius Circle"
                >
                  <Compass className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Deals Cards List for Mobile (rendered in natural scroll flow below map) ─── */}
        <div className="flex md:hidden flex-col p-2.5 space-y-2 bg-slate-50/50 min-h-0">
          {loading ? (
            <div className="space-y-2 p-1">
              {[1, 2, 3, 4].map((i) => (
                <DealCardSkeleton key={`m-skel-${i}`} />
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="p-6 text-center space-y-1.5 text-gray-400">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto text-lg">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs font-bold text-gray-700">
                No deals match your search
              </p>
              <p className="text-[10.5px] text-gray-500">
                Expand your radius or clear active filters.
              </p>
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setDistance("50");
                  setSearchQuery("");
                }}
                className="mt-1.5 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredDeals.map((deal) => {
              const isSelected = selectedDealId === deal._id;
              const discountText =
                deal.discountType === "percentage"
                  ? `${deal.discountValue}% OFF`
                  : `₹${deal.discountValue} OFF`;

              const CategoryIcon = deal.theme.iconComp;

              return (
                <div
                  key={`m-${deal._id}`}
                  onClick={() => handleSelectDeal(deal, true)}
                  className={`bg-white rounded-lg p-2.5 border transition-all cursor-pointer shadow-xs hover:shadow-sm relative group ${
                    isSelected
                      ? "border-blue-600 ring-1.5 ring-blue-100 bg-blue-50/15"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    {/* Store Avatar / Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden"
                      style={{
                        background: deal.logo ? "#ffffff" : deal.theme.bg,
                        borderColor: deal.theme.border,
                      }}
                    >
                      {deal.logo ? (
                        <img
                          src={deal.logo}
                          alt={deal.businessName}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <CategoryIcon
                          className="w-4 h-4"
                          style={{ color: deal.theme.color }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top Line: Brand & Distance */}
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h2 className="text-[10.5px] font-bold text-gray-900 uppercase tracking-wider truncate">
                            {deal.businessName}
                          </h2>
                          {deal.offersCount > 1 && (
                            <span className="text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.2 rounded-full shrink-0">
                              {deal.offersCount} Deals
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-full shrink-0">
                          {deal.distance} km away
                        </span>
                      </div>

                      {/* Discount Banner */}
                      <div
                        className="text-[13px] font-bold tracking-tight leading-none my-0.5"
                        style={{ color: deal.theme.color }}
                      >
                        {discountText}
                      </div>

                      {/* Title */}
                      <p className="text-[11px] font-medium text-gray-700 line-clamp-1">
                        {deal.title}
                      </p>

                      {/* Address */}
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-normal mt-0.5 truncate">
                        <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                        <span className="truncate">{deal.address}</span>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                        <span className="text-[8.5px] font-medium text-gray-400 uppercase tracking-wider">
                          {deal.category || "Verified Deal"}
                        </span>
                        <Link
                          href={`/deals/${deal._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Get Deal</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
