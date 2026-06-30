"use client";

import {
  CheckCircle2,
  ChevronRight,
  Compass,
  Filter,
  Loader2,
  Locate,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "@/hooks/use-location";

const CITY_COORDINATES = {
  ranchi: [23.3441, 85.3096],
  arrah: [25.5564, 84.6681],
  patna: [25.6112, 85.1384],
  delhi: [28.5494, 77.2515],
};

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null)
    return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
}

export default function NearbyOffers() {
  const { city: savedCity, setCity: setSavedCity } = useLocation();
  const [savedPincode, setSavedPincode] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.3441, 85.3096]); // Default Ranchi center
  const [distance, setDistance] = useState("5"); // km
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [rawCouponsList, setRawCouponsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual location modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    state: "Jharkhand",
    city: "Ranchi",
    area: "",
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Hydrate location state from localStorage and set map center on mount/city change
  useEffect(() => {
    try {
      const pin = localStorage.getItem("vouchiqo_pincode") || "";
      setSavedPincode(pin);
      if (savedCity) {
        const lowerCity = savedCity.toLowerCase();
        if (CITY_COORDINATES[lowerCity]) {
          setMapCenter(CITY_COORDINATES[lowerCity]);
        }
      }
    } catch (e) {
      console.error("Failed to read pincode from localStorage:", e);
    }
  }, [savedCity]);

  // Load Leaflet dynamically on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      setLeafletLoaded(true);
      return;
    }

    let link = document.querySelector(
      'link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let script = document.querySelector(
      'script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]',
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      if (window.L) {
        setLeafletLoaded(true);
      } else {
        script.addEventListener("load", () => setLeafletLoaded(true));
      }
    }
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

  // Fetch local coupons
  useEffect(() => {
    async function fetchLocalCoupons() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({ limit: "40" });
        if (savedCity) {
          queryParams.set("city", savedCity);
        }
        if (savedPincode) {
          queryParams.set("pincode", savedPincode);
        }
        const res = await fetch(`/api/coupons?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRawCouponsList(data.data?.coupons || []);
        }
      } catch (err) {
        console.error("Failed to fetch nearby coupons:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLocalCoupons();
  }, [savedCity, savedPincode]);

  // Process raw coupons list to compute real geodesic coordinates and distances
  const coupons = useMemo(() => {
    return rawCouponsList.map((c) => {
      const mLoc = c.merchantId?.location;
      const hasCoords =
        mLoc?.coordinates?.lat !== undefined &&
        mLoc?.coordinates?.lng !== undefined;

      let lat = hasCoords ? mLoc.coordinates.lat : null;
      let lng = hasCoords ? mLoc.coordinates.lng : null;

      // Fallback coordinates if not populated
      if (lat === null || lng === null) {
        const center =
          CITY_COORDINATES[savedCity?.toLowerCase()] || CITY_COORDINATES.ranchi;
        // Deterministic offset per coupon ID to avoid exact overlap of fallbacks
        const hash = c._id
          ? c._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
          : 0;
        lat = center[0] + ((hash % 100) / 100 - 0.5) * 0.04;
        lng = center[1] + (((hash * 13) % 100) / 100 - 0.5) * 0.04;
      }

      const dist = getHaversineDistance(mapCenter[0], mapCenter[1], lat, lng);

      return {
        ...c,
        coords: [lat, lng],
        distance: dist,
        address: mLoc?.address
          ? `${mLoc.address}, ${mLoc.city || ""}, ${mLoc.state || ""}, ${mLoc.pincode || ""}`
          : `${c.merchantId?.businessName || "Store"} Main Rd, ${savedCity || "Ranchi"}`,
      };
    });
  }, [rawCouponsList, mapCenter, savedCity]);

  // Center map to the first local coupon if city has no hardcoded coordinates
  useEffect(() => {
    if (rawCouponsList.length > 0 && savedCity) {
      const lowerCity = savedCity.toLowerCase();
      if (!CITY_COORDINATES[lowerCity]) {
        // Find the first coupon that has coordinates
        const firstCoupon = rawCouponsList.find((c) => {
          const mLoc = c.merchantId?.location;
          return (
            mLoc?.coordinates?.lat !== undefined &&
            mLoc?.coordinates?.lng !== undefined
          );
        });

        if (firstCoupon) {
          const coords = [
            firstCoupon.merchantId.location.coordinates.lat,
            firstCoupon.merchantId.location.coordinates.lng,
          ];
          setMapCenter(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(coords, 14);
          }
        }
      }
    }
  }, [rawCouponsList, savedCity]);

  const openLocationModal = () => {
    setManualForm({
      state: manualForm.state || "Jharkhand",
      city: savedCity || "Ranchi",
      area: savedPincode || "",
    });
    setShowLocationModal(true);
  };

  // Detect location via Geolocation API
  const handleGPSDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 14);
        }
        // Reverse geocode to find city and set it
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (res.ok) {
            const data = await res.json();
            const detected =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              null;
            if (detected) {
              setSavedCity(detected);
            }
          }
        } catch (e) {
          console.error("GPS reverse geocode failed:", e);
        }
      },
      () => {
        openLocationModal();
      },
    );
  };

  // Set manual location
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualForm.city) {
      setSavedCity(manualForm.city);
      const pin = manualForm.area ? manualForm.area.trim() : "";
      setSavedPincode(pin);
      try {
        localStorage.setItem("vouchiqo_pincode", pin);
      } catch (e) {
        console.error("Failed to write pincode to localStorage:", e);
      }
      const lowerCity = manualForm.city.toLowerCase();
      if (CITY_COORDINATES[lowerCity]) {
        const coords = CITY_COORDINATES[lowerCity];
        setMapCenter(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 14);
        }
      }
      setShowLocationModal(false);
    }
  };

  // Re-render Leaflet Map & Markers when center/coupons change
  useEffect(() => {
    if (
      !leafletLoaded ||
      !mapRef.current ||
      typeof window === "undefined" ||
      !window.L
    )
      return;

    const L = window.L;

    // Create Map Instance if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 14,
        zoomControl: false,
      });

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    } else {
      mapInstanceRef.current.setView(mapCenter, 14);
    }

    // Refresh markers
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Custom Orange Marker Icon for Deals
    const orangeIcon = L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#FF3D77] border-2 border-white shadow-lg animate-float">
          <span class="text-white text-xs font-black">🏷️</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -10],
    });

    // Add user marker
    const userIcon = L.divIcon({
      className: "user-marker-wrapper",
      html: `
        <div class="w-6 h-6 bg-brand-blue border-2 border-white rounded-full flex items-center justify-center shadow-lg">
          <div class="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(mapCenter, { icon: userIcon }).addTo(markersGroup);

    // Add deal markers
    coupons
      .filter((c) => categoryFilter === "all" || c.category === categoryFilter)
      .filter((c) => c.distance <= parseFloat(distance))
      .forEach((c) => {
        const brandName = c.merchantId?.businessName || "Verified Partner";
        const discountText =
          c.discountType === "percentage"
            ? `${c.discountValue}% OFF`
            : `₹${c.discountValue} OFF`;

        const marker = L.marker(c.coords, { icon: orangeIcon }).addTo(
          markersGroup,
        );

        const popupHTML = `
          <div class="p-2 space-y-2 text-left w-48 text-slate-800">
            <h4 class="font-black text-xs text-brand-navy leading-none">${brandName}</h4>
            <p class="font-extrabold text-[11px] text-[#00B67A]">${discountText}</p>
            <p class="text-[9px] text-slate-400 font-bold leading-tight line-clamp-2">${c.title}</p>
            <p class="text-[9px] text-slate-500 font-medium">${c.distance} km away</p>
            <a href="/deals/${c._id}" class="inline-block w-full text-center bg-brand-blue text-white text-[9px] font-black py-1 rounded hover:bg-blue-600 mt-1">View Deal</a>
          </div>
        `;

        marker.bindPopup(popupHTML);
      });
  }, [leafletLoaded, mapCenter, coupons, categoryFilter, distance]);

  // Filter list coupons
  const filteredCoupons = coupons
    .filter((c) => categoryFilter === "all" || c.category === categoryFilter)
    .filter((c) => c.distance <= parseFloat(distance))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row items-stretch select-none">
        {/* Left Panel: Deal list (40% / lg:w-[450px]) */}
        <section className="w-full lg:w-[460px] flex-shrink-0 flex flex-col bg-brand-bg border-r border-brand-border h-[calc(100vh-72px)] overflow-hidden">
          {/* Header controls */}
          <div className="p-4 border-b border-brand-border space-y-3 flex-shrink-0 text-left bg-brand-surface/40">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-brand-navy flex items-center gap-1.5">
                <Compass
                  className="w-5 h-5 text-brand-blue animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <span>Nearby Savings</span>
              </h1>
              <Badge className="bg-brand-success/10 text-brand-success hover:bg-brand-success/15 border-0 shadow-none px-2.5 py-0.5 text-[9px] font-bold">
                Local GPS Active
              </Badge>
            </div>

            {/* GPS Status Nudge */}
            <div className="flex items-center justify-between bg-brand-surface border border-brand-border p-2 rounded-lg text-xs">
              <span className="text-brand-subtext font-bold">
                📍 {savedCity || "Ranchi"}
                {savedPincode ? ` (${savedPincode})` : ""}
              </span>
              <button
                onClick={openLocationModal}
                className="text-[10px] font-black text-brand-blue hover:underline"
              >
                Change Location
              </button>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Distance Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  Distance limit
                </span>
                <Select value={distance} onValueChange={setDistance}>
                  <SelectTrigger className="text-xs h-8 bg-brand-surface border-brand-border cursor-pointer">
                    <SelectValue placeholder="5 km" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border-brand-border text-brand-text">
                    <SelectItem value="1">Within 1 km</SelectItem>
                    <SelectItem value="3">Within 3 km</SelectItem>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Category
                </span>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="text-xs h-8 bg-brand-surface border-brand-border cursor-pointer">
                    <SelectValue placeholder="All Deals" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border-brand-border text-brand-text">
                    <SelectItem value="all">All Deals</SelectItem>
                    <SelectItem value="food">Dining &amp; Food</SelectItem>
                    <SelectItem value="fashion">
                      Fashion &amp; Apparel
                    </SelectItem>
                    <SelectItem value="home">Home Improvement</SelectItem>
                    <SelectItem value="travel">Travel &amp; Hotels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Scrollable Deal List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto" />
                <span className="text-xs text-brand-subtext font-bold">
                  Scanning local coordinates...
                </span>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-20 text-center text-xs text-brand-subtext font-medium bg-brand-surface rounded-xl border border-brand-border p-4">
                No local deals found within {distance}km radius. Adjust your
                filters or location.
              </div>
            ) : (
              filteredCoupons.map((coupon) => {
                const brandName =
                  coupon.merchantId?.businessName || "Verified Brand";
                const isMarbella = brandName.toLowerCase() === "marbella";
                const discountText =
                  coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} OFF`;

                return (
                  <div
                    key={coupon._id}
                    className={`bg-brand-surface border rounded-xl p-4 transition-all hover:border-brand-blue cursor-pointer shadow-sm relative flex gap-3.5 group hover:shadow-md ${
                      isMarbella
                        ? "border-orange-500/30 bg-orange-500/[0.03]"
                        : "border-brand-border"
                    }`}
                    onClick={() => {
                      setMapCenter(coupon.coords);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView(coupon.coords, 16);
                      }
                    }}
                  >
                    {/* Brand icon / Logo */}
                    <div className="w-11 h-11 rounded-lg bg-brand-navy text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {coupon.merchantId?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coupon.merchantId.logo}
                          alt={brandName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        brandName[0]
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1 text-left">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-xs text-brand-navy uppercase tracking-wider truncate">
                          {brandName}
                        </h4>
                        <span className="text-[10px] font-black text-brand-blue whitespace-nowrap">
                          {coupon.distance} km away
                        </span>
                      </div>

                      <h3 className="font-black text-sm text-brand-text group-hover:text-brand-blue transition-colors">
                        {discountText}
                      </h3>
                      <p className="text-[10px] text-brand-subtext leading-relaxed line-clamp-1">
                        {coupon.title}
                      </p>

                      {/* Address */}
                      <p className="text-[9px] text-slate-400 font-semibold truncate leading-none pt-1">
                        📍 {coupon.address}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        {isMarbella && (
                          <Badge className="bg-[#FFB020]/15 text-[#FFB020] hover:bg-[#FFB020]/20 border border-[#FFB020]/20 text-[8px] font-black px-1.5 py-0.5 shadow-none rounded">
                            LOCAL BUSINESS
                          </Badge>
                        )}
                        <Link
                          href={`/deals/${coupon._id}`}
                          className="text-[10px] font-bold text-brand-blue hover:underline flex items-center gap-0.5 ml-auto"
                        >
                          Claim Offer <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Panel: Leaflet Map (60% / lg:flex-1) */}
        <section className="flex-grow bg-brand-surface relative h-[calc(100vh-72px)]">
          {/* Map canvas container */}
          <div ref={mapRef} className="w-full h-full z-10" />

          {/* Float Overlay GPS triggers */}
          <div className="absolute top-4 left-4 z-20 space-y-2">
            <button
              onClick={handleGPSDetect}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-black text-brand-navy shadow-lg hover:bg-brand-surface transition-all cursor-pointer hover:scale-105"
            >
              <Locate className="w-4 h-4 text-brand-blue animate-pulse" />
              <span>Sync GPS Coordinates</span>
            </button>
          </div>

          {!leafletLoaded && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center text-white space-y-2 flex-col">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="text-xs font-bold tracking-wider">
                Acquiring OpenStreetMap tile nodes...
              </span>
            </div>
          )}
        </section>
      </div>

      {/* Manual Location Dialog Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-4 animate-fade-in-scale">
          <form
            onSubmit={handleManualSubmit}
            className="bg-brand-bg border border-brand-border rounded-2xl max-w-sm w-full p-6 text-left space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <h3 className="font-heading text-base font-black text-brand-navy flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-warning" />
                <span>Enter Location Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-brand-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-subtext">Country</label>
                <Input
                  value="India"
                  disabled
                  className="bg-brand-surface/50 cursor-not-allowed border-brand-border text-brand-text h-9 animate-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-subtext">State *</label>
                <Select
                  value={manualForm.state}
                  onValueChange={(val) =>
                    setManualForm({ ...manualForm, state: val })
                  }
                >
                  <SelectTrigger className="h-9 border-brand-border bg-brand-surface text-brand-text cursor-pointer">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border-brand-border text-brand-text">
                    <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                    <SelectItem value="Bihar">Bihar</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-subtext">City *</label>
                <Select
                  value={manualForm.city}
                  onValueChange={(val) =>
                    setManualForm({ ...manualForm, city: val })
                  }
                >
                  <SelectTrigger className="h-9 border-brand-border bg-brand-surface text-brand-text cursor-pointer">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border-brand-border text-brand-text">
                    <SelectItem value="Ranchi">Ranchi</SelectItem>
                    <SelectItem value="Jamshedpur">Jamshedpur</SelectItem>
                    <SelectItem value="Patna">Patna</SelectItem>
                    <SelectItem value="Arrah">Arrah</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-subtext">
                  Area / Pincode
                </label>
                <Input
                  placeholder="e.g. Lalpur or 834001"
                  value={manualForm.area}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, area: e.target.value })
                  }
                  className="border-brand-border bg-brand-surface text-brand-text h-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="btn-primary w-full py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none flex justify-center items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Find Deals Near Me</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

// Simple absolute close SVG mapping for standard close button modal
function X(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
