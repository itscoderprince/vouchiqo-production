"use client";

import { MapPin, Search, Sliders, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CITIES = [
  { id: "ranchi", name: "Ranchi", x: 120, y: 140 },
  { id: "patna", name: "Patna", x: 260, y: 110 },
  { id: "delhi", name: "Delhi", x: 180, y: 220 },
  { id: "mumbai", name: "Mumbai", x: 80, y: 290 },
];

export default function NearbyOffersTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("ranchi");
  const [radius, setRadius] = useState("3"); // 1km, 3km, 5km
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load real coupons from database API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const json = await res.json();
          const items =
            json.data?.coupons || (Array.isArray(json.data) ? json.data : []);

          // Enrich coupons with realistic nearby metadata
          const enriched = items.map((c, idx) => {
            const distance = parseFloat((0.4 + idx * 0.7).toFixed(1));
            // Scatter map coordinates around selected city coordinate
            const cityData =
              CITIES.find((city) => city.id === selectedCity) || CITIES[0];
            const angle = (idx * 2 * Math.PI) / 5;
            const x = Math.round(
              cityData.x + Math.cos(angle) * (distance * 18),
            );
            const y = Math.round(
              cityData.y + Math.sin(angle) * (distance * 18),
            );

            return {
              ...c,
              distance,
              address: `${c.merchantId?.businessName || "Store"} - Sector ${idx + 2}, ${cityData.name}`,
              mapX: x,
              mapY: y,
            };
          });
          setCoupons(enriched);
        }
      } catch (err) {
        console.error("Error loading nearby offers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [selectedCity]);

  // Filter based on selected radius
  const filteredCoupons = coupons.filter(
    (c) => c.distance <= parseFloat(radius),
  );

  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm space-y-4 text-left select-none">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-zinc-850 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nearby Deals Explorer
          </h3>
          <p className="text-[10px] text-slate-400 font-light">
            Explore live partner store coupons around your physical location
            dynamically.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* City Selection */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-[10px] font-medium border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 rounded-sm px-2 py-1 outline-none text-slate-700 dark:text-zinc-300"
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Radius Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-sm p-0.5 bg-slate-50 dark:bg-zinc-900">
            {["1", "3", "5"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm transition-all uppercase cursor-pointer border-0 ${
                  radius === r
                    ? "bg-slate-950 dark:bg-zinc-850 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white bg-transparent"
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Sleek Map Simulator */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-md relative overflow-hidden h-[340px] flex items-center justify-center">
          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
              className="w-7 h-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="w-7 h-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Map Container */}
          <div
            className="w-full h-full transition-transform duration-300 ease-out relative flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Grid Map Vector lines */}
            <svg
              className="absolute inset-0 w-full h-full text-slate-200 dark:text-zinc-800"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M 40 0 L 0 0 0 40" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Roads / Pathways representation */}
              <path
                d="M 0 100 Q 150 180 400 150"
                fill="none"
                strokeWidth="2.5"
                className="stroke-slate-300/60 dark:stroke-zinc-700/40"
              />
              <path
                d="M 120 0 C 180 150 100 300 240 400"
                fill="none"
                strokeWidth="2"
                className="stroke-slate-300/60 dark:stroke-zinc-700/40"
              />
            </svg>

            {/* Radius overlay circle */}
            {CITIES.map((c) => {
              if (c.id !== selectedCity) return null;
              return (
                <div
                  key={c.id}
                  className="absolute rounded-full border border-blue-500/25 bg-blue-500/[0.03] transition-all duration-300 pointer-events-none flex items-center justify-center"
                  style={{
                    left: `${c.x}px`,
                    top: `${c.y}px`,
                    width: `${parseFloat(radius) * 44}px`,
                    height: `${parseFloat(radius) * 44}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-[7px] text-blue-500/40 font-bold uppercase select-none">
                    {radius}km Radius
                  </span>
                </div>
              );
            })}

            {/* Core Location Pin */}
            {CITIES.map((c) => {
              if (c.id !== selectedCity) return null;
              return (
                <div
                  key={c.id}
                  className="absolute z-10"
                  style={{
                    left: `${c.x}px`,
                    top: `${c.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="flex h-4 w-4 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white items-center justify-center text-white text-[8px] font-bold">
                      H
                    </span>
                  </span>
                </div>
              );
            })}

            {/* Nearby Stores Pins */}
            {filteredCoupons.map((coupon) => {
              const isSelected = selectedCouponId === coupon._id;
              return (
                <button
                  key={coupon._id}
                  type="button"
                  onClick={() => setSelectedCouponId(coupon._id)}
                  className="absolute p-0 border-0 bg-transparent cursor-pointer transition-all hover:scale-110 z-10"
                  style={{
                    left: `${coupon.mapX}px`,
                    top: `${coupon.mapY}px`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <MapPin
                    className={`w-5 h-5 drop-shadow-sm transition-colors ${
                      isSelected
                        ? "text-emerald-600 dark:text-emerald-400 scale-110"
                        : "text-blue-500 dark:text-blue-400"
                    }`}
                  />
                  {isSelected && (
                    <span className="absolute left-1/2 -top-6 -translate-x-1/2 bg-slate-950 dark:bg-zinc-800 text-white text-[7px] font-semibold px-1 py-0.5 rounded-sm whitespace-nowrap uppercase">
                      ₹{coupon.discountValue} OFF
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Scrollable List of Compact Store Cards */}
        <div className="lg:col-span-5 flex flex-col space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400">
              Locating nearest outlets...
            </div>
          ) : filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon) => {
              const isSelected = selectedCouponId === coupon._id;
              const merchantName =
                coupon.merchantId?.businessName ||
                coupon.merchantId?.name ||
                "Premium Partner";
              const discountFormatted =
                coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% OFF`
                  : `₹${coupon.discountValue} OFF`;

              return (
                <div
                  key={coupon._id}
                  onClick={() => setSelectedCouponId(coupon._id)}
                  className={`border p-2.5 rounded-md flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-400">
                        {merchantName}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {discountFormatted}
                      </h4>
                    </div>
                    <span className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded-sm">
                      {coupon.distance} km
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
                    {coupon.title}
                  </p>

                  <div className="flex justify-between items-center text-[8px] text-slate-400 pt-1 border-t border-slate-100 dark:border-zinc-900/60">
                    <span className="truncate max-w-[130px]">
                      {coupon.address}
                    </span>
                    <button
                      type="button"
                      className="text-[8px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-sm px-2 py-0.5 border-0 cursor-pointer"
                    >
                      Claim
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-md space-y-1.5">
              <span className="text-xs text-slate-400">
                No stores found in radius
              </span>
              <button
                type="button"
                onClick={() => setRadius("5")}
                className="text-[9px] font-semibold text-blue-600 hover:underline border-0 bg-transparent cursor-pointer"
              >
                Expand Search to 5km
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
