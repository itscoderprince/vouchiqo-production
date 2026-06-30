"use client";

import {
  Activity,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Filter,
  Loader2,
  Locate,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Tag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
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
  const [savedState, setSavedState] = useState("Jharkhand");
  const [savedPincode, setSavedPincode] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.3441, 85.3096]); // Default Ranchi center
  const [distance, setDistance] = useState("10"); // Default 10 km
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dealTypeFilter, setDealTypeFilter] = useState("all"); // 'all' | 'coupon' | 'offer'
  const [sortOrder, setSortOrder] = useState("distance"); // 'distance' | 'discount'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("nearest"); // 'nearest' | 'city' | 'state' | 'all'
  const [rawCouponsList, setRawCouponsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpsDetecting, setGpsDetecting] = useState(false);

  // Map view toggle: initially false (don't show map)
  const [showMap, setShowMap] = useState(false);
  // Unified Collapsible Filters drawer
  const [showFilters, setShowFilters] = useState(false);

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

      const storedState = localStorage.getItem("vouchiqo_state") || "";
      if (storedState) {
        setSavedState(storedState);
      } else if (savedCity) {
        const derivedState = CITY_TO_STATE[savedCity.toLowerCase()];
        if (derivedState) setSavedState(derivedState);
      }

      if (savedCity) {
        const lowerCity = savedCity.toLowerCase();
        if (CITY_COORDINATES[lowerCity]) {
          setMapCenter(CITY_COORDINATES[lowerCity]);
        }
      }
    } catch (e) {
      console.error("Failed to read location from localStorage:", e);
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
        const queryParams = new URLSearchParams({ limit: "60" });
        if (savedCity) {
          queryParams.set("city", savedCity);
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
  }, [savedCity]);

  // Process raw coupons list to compute geodesic distances
  const coupons = useMemo(() => {
    return rawCouponsList.map((c) => {
      const mLoc = c.merchantId?.location;
      const hasCoords =
        mLoc?.coordinates?.lat !== undefined &&
        mLoc?.coordinates?.lng !== undefined;

      let lat = hasCoords ? mLoc.coordinates.lat : null;
      let lng = hasCoords ? mLoc.coordinates.lng : null;

      // Fallback coordinates if not populated (distribute around center)
      if (lat === null || lng === null) {
        const center =
          CITY_COORDINATES[savedCity?.toLowerCase()] || CITY_COORDINATES.ranchi;
        const hash = c._id
          ? c._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
          : 0;
        lat = center[0] + ((hash % 100) / 100 - 0.5) * 0.03;
        lng = center[1] + (((hash * 13) % 100) / 100 - 0.5) * 0.03;
      }

      const dist = getHaversineDistance(mapCenter[0], mapCenter[1], lat, lng);

      return {
        ...c,
        coords: [lat, lng],
        distance: dist,
        address: mLoc?.address
          ? `${mLoc.address}, ${mLoc.city || ""}, ${mLoc.state || ""}, ${mLoc.pincode || ""}`
          : `${c.merchantId?.businessName || "Store"} Main Rd, ${savedCity || "Ranchi"}`,
        city: mLoc?.city || savedCity || "Ranchi",
        state: mLoc?.state || savedState || "Jharkhand",
      };
    });
  }, [rawCouponsList, mapCenter, savedCity, savedState]);

  // Center map to first coupon if city has no hardcoded coordinates
  useEffect(() => {
    if (rawCouponsList.length > 0 && savedCity) {
      const lowerCity = savedCity.toLowerCase();
      if (!CITY_COORDINATES[lowerCity]) {
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
      state: savedState || "Jharkhand",
      city: savedCity || "Ranchi",
      area: savedPincode || "",
    });
    setShowLocationModal(true);
  };

  // Detect location via GPS
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGpsDetecting(true);
    toast.loading("Requesting GPS coordinates...", { id: "gps-status" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 14);
        }
        // Reverse geocode to find city and state
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
            const detectedState = data.address?.state || null;
            if (detectedCity) {
              setSavedCity(detectedCity);
              if (detectedState) {
                setSavedState(detectedState);
                localStorage.setItem("vouchiqo_state", detectedState);
              }
              toast.success(`Location updated to ${detectedCity}!`, {
                id: "gps-status",
              });
            } else {
              toast.success("Location synced successfully!", {
                id: "gps-status",
              });
            }
          } else {
            toast.success("Coordinates synced successfully!", {
              id: "gps-status",
            });
          }
        } catch (e) {
          console.error("GPS reverse geocode failed:", e);
          toast.success("Location synced successfully!", { id: "gps-status" });
        } finally {
          setGpsDetecting(false);
        }
      },
      (err) => {
        setGpsDetecting(false);
        toast.dismiss("gps-status");
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("GPS access denied. Please set manually.");
        } else {
          toast.error("Unable to retrieve GPS location.");
        }
        openLocationModal();
      },
      { timeout: 10000 },
    );
  };

  // Set manual location
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualForm.city) {
      const selectedCity = manualForm.city;
      const selectedState = manualForm.state;
      setSavedCity(selectedCity);
      setSavedState(selectedState);
      const pin = manualForm.area ? manualForm.area.trim() : "";
      setSavedPincode(pin);

      try {
        localStorage.setItem("vouchiqo_pincode", pin);
        localStorage.setItem("vouchiqo_state", selectedState);
      } catch (err) {
        console.error("Failed to write to localStorage:", err);
      }

      const lowerCity = selectedCity.toLowerCase();
      if (CITY_COORDINATES[lowerCity]) {
        const coords = CITY_COORDINATES[lowerCity];
        setMapCenter(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 14);
        }
      }
      setShowLocationModal(false);
      toast.success(`Location set to ${selectedCity}, ${selectedState}!`);
    }
  };

  // Re-render Leaflet Map & Markers when center/filters change
  useEffect(() => {
    if (
      !showMap ||
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
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    } else {
      mapInstanceRef.current.setView(mapCenter, 13);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Custom Ping Icon for User
    const userIcon = L.divIcon({
      className: "user-marker-wrapper",
      html: `
        <div class="w-7 h-7 bg-brand-blue border-2 border-white rounded-full flex items-center justify-center shadow-lg">
          <div class="w-3.5 h-3.5 bg-white rounded-full animate-ping" />
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker(mapCenter, { icon: userIcon }).addTo(markersGroup);

    // Custom Tag Icon for Deals
    const orangeIcon = L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A18] to-[#FF3D77] border-2 border-white shadow-lg transform hover:scale-110 transition-transform">
          <span class="text-white text-xs font-black">🏷️</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -10],
    });

    // Populate markers based on all coupons currently in view
    coupons
      .filter((c) => {
        if (categoryFilter !== "all" && c.category !== categoryFilter)
          return false;
        if (
          dealTypeFilter !== "all" &&
          c.discountType !==
            (dealTypeFilter === "coupon" ? "percentage" : "flat")
        )
          return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = c.title?.toLowerCase().includes(query);
          const matchBrand = c.merchantId?.businessName
            ?.toLowerCase()
            .includes(query);
          if (!matchTitle && !matchBrand) return false;
        }
        return true;
      })
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
          <div class="p-2 space-y-2 text-left w-48 text-slate-800 font-sans">
            <h4 class="font-bold text-xs text-brand-navy leading-none">${brandName}</h4>
            <p class="font-extrabold text-[11px] text-[#00B67A]">${discountText}</p>
            <p class="text-[9px] text-slate-400 font-semibold leading-tight line-clamp-2">${c.title}</p>
            <p class="text-[9px] text-slate-500 font-medium">${c.distance} km away</p>
            <a href="/deals/${c._id}" class="inline-block w-full text-center bg-brand-blue text-white text-[9px] font-bold py-1 rounded hover:bg-blue-600 mt-1">View Deal</a>
          </div>
        `;

        marker.bindPopup(popupHTML);
      });
  }, [
    showMap,
    leafletLoaded,
    mapCenter,
    coupons,
    categoryFilter,
    dealTypeFilter,
    searchQuery,
  ]);

  // Trigger leaflet redraw size when Map View is toggled
  useEffect(() => {
    if (showMap && leafletLoaded && mapInstanceRef.current) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [showMap, leafletLoaded]);

  // Compute distinct lists for grouping tab selection
  const groupedCoupons = useMemo(() => {
    let list = coupons.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter)
        return false;
      if (
        dealTypeFilter !== "all" &&
        c.discountType !== (dealTypeFilter === "coupon" ? "percentage" : "flat")
      )
        return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = c.title?.toLowerCase().includes(query);
        const matchBrand = c.merchantId?.businessName
          ?.toLowerCase()
          .includes(query);
        if (!matchTitle && !matchBrand) return false;
      }
      return true;
    });

    if (sortOrder === "distance") {
      list = list.sort((a, b) => a.distance - b.distance);
    } else {
      list = list.sort(
        (a, b) => (b.discountValue || 0) - (a.discountValue || 0),
      );
    }

    const nearest = list.filter((c) => c.distance <= parseFloat(distance));
    const cityWide = list.filter(
      (c) => c.city?.toLowerCase() === savedCity?.toLowerCase(),
    );
    const stateWide = list.filter(
      (c) => c.state?.toLowerCase() === savedState?.toLowerCase(),
    );

    return {
      nearest,
      city: cityWide,
      state: stateWide,
      all: list,
    };
  }, [
    coupons,
    distance,
    categoryFilter,
    dealTypeFilter,
    sortOrder,
    searchQuery,
    savedCity,
    savedState,
  ]);

  const activeCouponsList = groupedCoupons[activeTab];

  // Number of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (distance !== "10") count++;
    if (categoryFilter !== "all") count++;
    if (dealTypeFilter !== "all") count++;
    if (sortOrder !== "distance") count++;
    return count;
  }, [distance, categoryFilter, dealTypeFilter, sortOrder]);

  // Reusable components/elements
  const filterControlsRow = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search brands or discount deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs border-brand-border bg-white rounded-xl focus:ring-brand-blue w-full shadow-none"
          />
        </div>

        {/* Unified Filters Toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 h-9 border rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            showFilters || activeFilterCount > 0
              ? "bg-[#eff6ff] text-brand-blue border-blue-200"
              : "bg-white text-slate-700 border-brand-border hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-brand-blue text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Map View Toggle (Only in list view) */}
        {!showMap && (
          <button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-1.5 px-3 h-9 bg-white text-slate-700 border border-brand-border hover:bg-slate-50 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 shadow-none"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        )}
      </div>

      {/* Unified collapsible drawer */}
      {showFilters && (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 text-left animate-fade-in-up space-y-3.5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Radius filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide">
                Radius Distance
              </label>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger className="text-[10px] h-8 bg-white border-brand-border cursor-pointer">
                  <SelectValue placeholder="10 km" />
                </SelectTrigger>
                <SelectContent className="bg-white border-brand-border text-brand-text text-xs">
                  <SelectItem value="2">Within 2 km</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km (Default)</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-[10px] h-8 bg-white border-brand-border cursor-pointer">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border-brand-border text-brand-text text-xs">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Dining &amp; Food</SelectItem>
                  <SelectItem value="fashion">Fashion &amp; Apparel</SelectItem>
                  <SelectItem value="home">Home Improvements</SelectItem>
                  <SelectItem value="travel">Travel &amp; Hotels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deal Type filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide">
                Coupon Type
              </label>
              <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
                <SelectTrigger className="text-[10px] h-8 bg-white border-brand-border cursor-pointer">
                  <SelectValue placeholder="All Deals" />
                </SelectTrigger>
                <SelectContent className="bg-white border-brand-border text-brand-text text-xs">
                  <SelectItem value="all">All Coupon Types</SelectItem>
                  <SelectItem value="coupon">Promo Codes Only</SelectItem>
                  <SelectItem value="offer">Direct Offers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide">
                Sort Results
              </label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="text-[10px] h-8 bg-white border-brand-border cursor-pointer">
                  <SelectValue placeholder="Nearest First" />
                </SelectTrigger>
                <SelectContent className="bg-white border-brand-border text-brand-text text-xs">
                  <SelectItem value="distance">Nearest First</SelectItem>
                  <SelectItem value="discount">Highest Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
                setDealTypeFilter("all");
                setDistance("10");
                setSortOrder("distance");
                setSearchQuery("");
              }}
              className="text-[10px] font-bold text-slate-500 hover:text-brand-navy hover:underline cursor-pointer bg-transparent border-none"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const tabsRow = (
    <div className="flex border-b border-brand-border bg-white flex-shrink-0 p-1">
      <button
        onClick={() => setActiveTab("nearest")}
        className={`flex-1 text-[11px] font-black py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 border-none ${
          activeTab === "nearest"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <Activity className="w-3.5 h-3.5" />
        <span>Nearest</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[9px] ${
            activeTab === "nearest"
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {groupedCoupons.nearest.length}
        </span>
      </button>

      <button
        onClick={() => setActiveTab("city")}
        className={`flex-1 text-[11px] font-black py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 border-none ${
          activeTab === "city"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>City</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[9px] ${
            activeTab === "city"
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {groupedCoupons.city.length}
        </span>
      </button>

      <button
        onClick={() => setActiveTab("state")}
        className={`flex-1 text-[11px] font-black py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 border-none ${
          activeTab === "state"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <Map className="w-3.5 h-3.5" />
        <span>State</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[9px] ${
            activeTab === "state"
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {groupedCoupons.state.length}
        </span>
      </button>

      <button
        onClick={() => setActiveTab("all")}
        className={`flex-1 text-[11px] font-black py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 border-none ${
          activeTab === "all"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>All Local</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[9px] ${
            activeTab === "all"
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {groupedCoupons.all.length}
        </span>
      </button>
    </div>
  );

  const renderCouponCard = (coupon) => {
    const brandName = coupon.merchantId?.businessName || "Verified Brand";
    const isMarbella = brandName.toLowerCase() === "marbella";
    const discountText =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;

    return (
      <div
        key={coupon._id}
        className={`bg-white border rounded-2xl p-4 transition-all hover:border-brand-blue cursor-pointer shadow-sm relative flex gap-3.5 group hover:shadow-md ${
          isMarbella
            ? "border-[#FF7A18]/45 bg-[#FF7A18]/[0.02]"
            : "border-brand-border"
        }`}
        onClick={() => {
          if (showMap) {
            setMapCenter(coupon.coords);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(coupon.coords, 16);
            }
          }
        }}
      >
        {/* Merchant logo */}
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
          {coupon.merchantId?.logo ? (
            <img
              src={coupon.merchantId.logo}
              alt={brandName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand-navy text-white font-black flex items-center justify-center text-[15px]">
              {brandName[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5 text-left">
          <div className="flex justify-between items-center gap-1.5">
            <h4 className="font-extrabold text-[10px] text-brand-navy uppercase tracking-wider truncate">
              {brandName}
            </h4>
            <span className="text-[10px] font-black text-brand-blue bg-[#eff6ff] px-2 py-0.5 rounded-full whitespace-nowrap">
              {coupon.distance} km away
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-black text-base text-brand-text group-hover:text-brand-blue transition-colors leading-snug">
              {discountText}
            </h3>
            <p className="text-[11px] text-brand-subtext font-semibold leading-relaxed line-clamp-1">
              {coupon.title}
            </p>
          </div>

          <p className="text-[9px] text-slate-400 font-semibold truncate leading-none flex items-center gap-1 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{coupon.address}</span>
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-50">
            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 shadow-none text-[8px] font-bold px-2 py-0.5 rounded uppercase">
              {coupon.category}
            </Badge>
            <Link
              href={`/deals/${coupon._id}`}
              className="text-[11px] font-extrabold text-brand-blue hover:underline flex items-center gap-0.5 ml-auto"
            >
              Claim Offer <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const noCouponsFallback = (
    <div className="py-16 text-center text-xs text-brand-subtext font-medium bg-white rounded-2xl border border-brand-border p-5 space-y-2 max-w-lg mx-auto">
      <p>No coupons available in this segment matching your active filters.</p>
      <button
        type="button"
        onClick={() => {
          setCategoryFilter("all");
          setDealTypeFilter("all");
          setDistance("25");
          setSortOrder("distance");
          setSearchQuery("");
        }}
        className="text-brand-blue font-bold hover:underline cursor-pointer border-none bg-transparent"
      >
        Clear all filters
      </button>
    </div>
  );

  const locationModal = (
    <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4 animate-fade-in-scale">
      <form
        onSubmit={handleManualSubmit}
        className="bg-brand-bg border border-brand-border rounded-2xl max-w-sm w-full p-6 text-left space-y-4 shadow-2xl"
      >
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <h3 className="font-heading text-base font-black text-brand-navy flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF7A18]" />
            <span>Select Manual Location</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowLocationModal(false)}
            className="text-slate-400 hover:text-brand-navy cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-brand-subtext">Country</label>
            <Input
              value="India"
              disabled
              className="bg-brand-surface/50 cursor-not-allowed border-brand-border text-brand-text h-9"
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
          <span>Explore Deals Near Me</span>
        </Button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      {!showMap ? (
        // ── FULL WIDTH LIST VIEW (INITIAL VIEW) ───────────────────────
        <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow space-y-6">
          {/* Breadcrumb & Title Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4 text-left">
            <div className="space-y-1 animate-fade-in-up">
              <ul className="flex gap-2 list-none text-xs text-brand-subtext items-center p-0 m-0">
                <li>
                  <Link
                    href="/"
                    className="hover:text-brand-blue text-brand-subtext"
                    style={{ textDecoration: "none" }}
                  >
                    Home
                  </Link>
                </li>
                <li style={{ color: "#9ca3af" }}>›</li>
                <li className="font-bold text-brand-text">Nearby Offers</li>
              </ul>
              <h1 className="text-2xl font-black text-brand-navy flex items-center gap-1.5 mt-1 tracking-tight leading-tight">
                <Compass
                  className="w-6 h-6 text-brand-blue animate-spin"
                  style={{ animationDuration: "16s" }}
                />
                <span>Nearby Offers & Deals</span>
              </h1>
              <p className="text-xs text-brand-subtext font-semibold">
                Explore local deals and vouchers sorted by distance from your
                location.
              </p>
            </div>

            {/* Sync coordinates & change location bubble */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="bg-white border border-brand-border px-3.5 py-2 rounded-xl text-xs flex items-center gap-4 shadow-sm justify-between">
                <span className="font-bold text-brand-navy flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A18] animate-bounce" />
                  <span>
                    {savedCity}, {savedState}{" "}
                    {savedPincode ? `(${savedPincode})` : ""}
                  </span>
                </span>
                <button
                  onClick={openLocationModal}
                  className="text-[10px] font-black text-brand-blue hover:underline bg-transparent border-none cursor-pointer"
                >
                  Change
                </button>
              </div>

              <button
                onClick={handleGPSDetect}
                disabled={gpsDetecting}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#eff6ff] hover:bg-[#dbeafe] text-brand-blue border border-blue-200/50 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50 h-9"
              >
                {gpsDetecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Locate className="w-4 h-4" />
                )}
                <span>Sync GPS Location</span>
              </button>
            </div>
          </div>

          {/* Unified search & collapsible filter panel */}
          {filterControlsRow}

          {/* Group Tab navigation */}
          {tabsRow}

          {/* Coupons grid */}
          {loading ? (
            <div className="py-24 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto" />
              <span className="text-xs text-brand-subtext font-bold">
                Scanning local coordinates...
              </span>
            </div>
          ) : activeCouponsList.length === 0 ? (
            noCouponsFallback
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
              {activeCouponsList.map(renderCouponCard)}
            </div>
          )}
        </main>
      ) : (
        // ── SPLIT MAP VIEW ──────────────────────────────────────────
        <div className="flex-1 flex flex-col lg:flex-row items-stretch select-none">
          {/* Left Panel: Deal list (480px) */}
          <section className="w-full lg:w-[480px] flex-shrink-0 flex flex-col bg-brand-bg border-r border-brand-border h-[calc(100vh-72px)] overflow-hidden">
            {/* Header controls */}
            <div className="p-4 border-b border-brand-border space-y-3 flex-shrink-0 text-left bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h1 className="text-base font-black text-brand-navy flex items-center gap-1 leading-none">
                    <Compass
                      className="w-4 h-4 text-brand-blue animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                    <span>Map savings</span>
                  </h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleGPSDetect}
                    disabled={gpsDetecting}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-brand-blue border border-blue-200/50 rounded-xl text-[10px] font-black transition-all cursor-pointer h-7"
                  >
                    {gpsDetecting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Locate className="w-3.5 h-3.5" />
                    )}
                    <span>Sync</span>
                  </button>
                  <Button
                    onClick={() => setShowMap(false)}
                    variant="outline"
                    className="h-7 text-[10px] px-2.5 border-brand-border bg-white rounded-xl flex items-center gap-1 cursor-pointer shadow-none"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>List View</span>
                  </Button>
                </div>
              </div>

              {/* Active location Selector */}
              <div className="flex items-center justify-between bg-brand-surface border border-brand-border px-3 py-1.5 rounded-xl text-xs">
                <span className="text-brand-navy font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A18]" />
                  {savedCity}, {savedState}
                </span>
                <button
                  onClick={openLocationModal}
                  className="text-[10px] font-black text-brand-blue hover:underline bg-transparent border-none cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Search & filters row */}
              {filterControlsRow}
            </div>

            {/* Tabs */}
            {tabsRow}

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-left">
              {loading ? (
                <div className="py-24 text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto" />
                </div>
              ) : activeCouponsList.length === 0 ? (
                noCouponsFallback
              ) : (
                activeCouponsList.map(renderCouponCard)
              )}
            </div>
          </section>

          {/* Right Panel: Leaflet Map */}
          <section className="flex-grow bg-[#f1f3f9] relative h-[calc(100vh-72px)]">
            <div ref={mapRef} className="w-full h-full z-10" />

            {/* Sync GPS trigger float overlay */}
            <div className="absolute top-4 left-4 z-20">
              <Button
                onClick={() => setShowMap(false)}
                className="btn-primary py-2.5 px-4 text-xs font-bold border-0 h-auto cursor-pointer shadow-lg rounded-xl flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Back to Full List</span>
              </Button>
            </div>

            {!leafletLoaded && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center text-white flex-col">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
          </section>
        </div>
      )}

      {/* Manual Location Dialog Modal */}
      {showLocationModal && locationModal}
    </div>
  );
}

// Custom Close Icon
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
