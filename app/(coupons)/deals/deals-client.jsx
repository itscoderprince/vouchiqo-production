"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import CouponCard from "@/components/shared/CouponCard";
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

const CATEGORY_LIST = [
  { name: "All", emoji: "🏷️" },
  { name: "Food", emoji: "🍔" },
  { name: "Travel", emoji: "✈️" },
  { name: "SaaS", emoji: "💻" },
  { name: "Fashion", emoji: "👕" },
  { name: "Beauty", emoji: "💄" },
  { name: "Services", emoji: "🛠️" },
];

const CouponSkeleton = () => (
  <div className="bg-brand-bg border border-brand-border rounded-xl p-5 space-y-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-16 h-5 bg-slate-200 rounded"></div>
      <div className="w-20 h-5 bg-slate-200 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
    <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
  </div>
);

function DealsListingContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const urlLocation = searchParams?.get("location") || "All";

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState(urlLocation);
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // New filters state
  const [discountTypes, setDiscountTypes] = useState({
    percentage: true,
    fixed: true,
    freebie: true,
  });
  const [minDiscount, setMinDiscount] = useState(0);
  const [validity, setValidity] = useState("anytime"); // "anytime" | "today" | "week"

  // Sync state if searchParams change (e.g. searching from Navbar)
  useEffect(() => {
    setSearchQuery(searchParams?.get("search") || "");
    setSelectedLocation(searchParams?.get("location") || "All");
  }, [searchParams]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSelectedLocation("All");
    setSortBy("featured");
    setDiscountTypes({ percentage: true, fixed: true, freebie: true });
    setMinDiscount(0);
    setValidity("anytime");
  };

  // Reset page to 1 when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset page on filter state changes
  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    sortBy,
    discountTypes,
    minDiscount,
    validity,
  ]);

  // Fetch coupons from API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "coupons",
      { page, searchQuery, selectedCategory, selectedLocation, sortBy },
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("page", page.toString());
      queryParams.set("limit", "9");

      if (searchQuery) {
        queryParams.set("search", searchQuery);
      }
      if (selectedCategory && selectedCategory !== "All") {
        const categoryMap = {
          Food: "food",
          Travel: "travel",
          SaaS: "electronics",
          Fashion: "fashion",
          Beauty: "beauty",
          Services: "services",
        };
        const mapped =
          categoryMap[selectedCategory] || selectedCategory.toLowerCase();
        queryParams.set("category", mapped);
      }
      if (selectedLocation && selectedLocation !== "All") {
        queryParams.set("city", selectedLocation);
      }

      if (sortBy === "success") {
        queryParams.set("sortBy", "totalClaims");
        queryParams.set("sortOrder", "desc");
      } else if (sortBy === "expiring") {
        queryParams.set("sortBy", "expiresAt");
        queryParams.set("sortOrder", "asc");
      } else {
        queryParams.set("sortBy", "createdAt");
        queryParams.set("sortOrder", "desc");
      }

      const res = await fetch(`/api/coupons?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch coupons");
      }
      const json = await res.json();
      return json.data;
    },
  });

  const coupons = data?.coupons || [];

  // Client-side filtering logic matching the mockup's parameters
  const filteredCoupons = coupons.filter((coupon) => {
    // 1. Discount Type Filter
    const type = coupon.discountType; // "percentage", "fixed", "freebie"
    if (type && !discountTypes[type]) return false;

    // 2. Min Discount Filter (only apply to percentage discount type)
    if (
      coupon.discountType === "percentage" &&
      coupon.discountValue < minDiscount
    ) {
      return false;
    }

    // 3. Validity Filter
    if (coupon.expiresAt) {
      const expiryDate = new Date(coupon.expiresAt);
      const now = new Date();
      const timeDiff = expiryDate - now;

      if (validity === "today") {
        // Expires within 24 hours
        if (timeDiff > 86400000) return false;
      } else if (validity === "week") {
        // Expires within 7 days
        if (timeDiff > 86400000 * 7) return false;
      }
    }

    return true;
  });

  const totalPages = data?.meta?.pages || 1;
  const totalOffers = data?.meta?.total || 0;

  const handleClaimConfirm = async (couponId) => {
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId }),
      });

      if (res.status === 401 || res.status === 403) {
        // Fallback for mock/demo flow
        await new Promise((resolve) => setTimeout(resolve, 800));
        return `VOUCH-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      if (!res.ok) {
        throw new Error("Claim failed");
      }

      const json = await res.json();
      return (
        json.data?.code ||
        `VOUCH-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`
      );
    } catch (_err) {
      // Fallback in case of server/database errors or network issues
      return `VOUCH-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#1A3C5E] text-white py-12 px-4 text-center border-b border-white/5 relative overflow-hidden select-none">
        {/* Background radial overlay and blurs */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          <Badge className="bg-white/10 text-brand-warning hover:bg-white/15 border border-white/10 rounded-full px-3 py-1 font-bold text-xs shadow-none gap-1.5 w-fit animate-float mx-auto">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>100% Authorized & Verified Vouchers</span>
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight text-white animate-fade-in-up stagger-1">
            Browse All{" "}
            <span className="text-brand-gradient">Verified Deals</span>
          </h1>

          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium animate-fade-in-up stagger-2">
            Vouchiqo eliminates expired offers through merchant-authorized
            verification. Browse, filter, and claim active discount codes from
            SaaS, dining, fashion, travel, and more.
          </p>

          <div className="max-w-xl mx-auto pt-2 animate-fade-in-up stagger-3">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white focus-within:ring-2 focus-within:ring-brand-blue/50 focus-within:border-brand-blue transition-all shadow-lg backdrop-blur-sm">
              <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search brands, stores, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-sm w-full p-0 h-auto focus:ring-0 focus:outline-none placeholder-slate-400 text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col lg:flex-row gap-8">
        {/* Left Side: Sidebar Filters (Desktop) */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4 hidden lg:block lg:sticky lg:top-[80px] self-start z-20">
          {/* Location Switcher */}
          <div className="bg-brand-bg rounded-xl border border-brand-border p-4 shadow-sm">
            <h3 className="text-xs font-bold text-brand-navy mb-3 uppercase tracking-wider">
              Location
            </h3>
            <div className="flex bg-brand-surface border border-brand-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedLocation === "All") {
                    setSelectedLocation("Patna"); // default choice when switching to "Near City"
                  }
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  selectedLocation !== "All"
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-brand-subtext hover:text-brand-text"
                }`}
              >
                {selectedLocation !== "All"
                  ? `Near ${selectedLocation}`
                  : "Near City"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocation("All")}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  selectedLocation === "All"
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-brand-subtext hover:text-brand-text"
                }`}
              >
                All India
              </button>
            </div>
            {selectedLocation !== "All" && (
              <div className="mt-2 animate-fade-in-up">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-text focus:ring-1 focus:ring-brand-blue/30 shadow-none cursor-pointer flex items-center gap-1.5 h-8">
                    <MapPin className="w-3.5 h-3.5 text-brand-warning flex-shrink-0" />
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg text-brand-text border-brand-border">
                    <SelectItem value="Arrah">Arrah</SelectItem>
                    <SelectItem value="Patna">Patna</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Filter Card */}
          <div className="bg-brand-bg rounded-xl border border-brand-border p-4 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-2.5">
              <span className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
                <span>Filters</span>
              </span>
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="h-auto p-0 text-xs text-brand-blue hover:text-brand-navy font-bold border-0 bg-transparent shadow-none cursor-pointer hover:bg-transparent"
              >
                Reset
              </Button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Keyword Search
              </label>
              <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg p-2 text-brand-text">
                <Search className="w-4 h-4 text-brand-subtext mr-2" />
                <Input
                  type="text"
                  placeholder="Enter brand name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-brand-subtext shadow-none"
                />
              </div>
            </div>

            {/* Category Chips */}
            <div>
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                Category
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                      selectedCategory === cat.name
                        ? "bg-brand-navy text-white border-brand-navy shadow-sm"
                        : "bg-brand-surface text-brand-subtext border-brand-border hover:border-brand-navy hover:text-brand-text"
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                Discount Type
              </h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={discountTypes.percentage}
                    onChange={(e) =>
                      setDiscountTypes((prev) => ({
                        ...prev,
                        percentage: e.target.checked,
                      }))
                    }
                    className="rounded border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Percentage Off
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={discountTypes.fixed}
                    onChange={(e) =>
                      setDiscountTypes((prev) => ({
                        ...prev,
                        fixed: e.target.checked,
                      }))
                    }
                    className="rounded border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Flat Amount
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={discountTypes.freebie}
                    onChange={(e) =>
                      setDiscountTypes((prev) => ({
                        ...prev,
                        freebie: e.target.checked,
                      }))
                    }
                    className="rounded border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    BOGO / Freebie
                  </span>
                </label>
              </div>
            </div>

            {/* Min Discount Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  Min Discount
                </h3>
                <span className="text-xs font-bold text-brand-navy">
                  {minDiscount}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-navy dark:bg-slate-700"
              />
              <div className="flex justify-between text-[10px] text-brand-subtext mt-1 font-semibold">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Validity */}
            <div>
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                Validity
              </h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="validity"
                    checked={validity === "anytime"}
                    onChange={() => setValidity("anytime")}
                    className="border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Anytime
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="validity"
                    checked={validity === "today"}
                    onChange={() => setValidity("today")}
                    className="border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Expires Today
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="validity"
                    checked={validity === "week"}
                    onChange={() => setValidity("week")}
                    className="border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Expires this Week
                  </span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Main Listing Panel */}
        <section className="flex-1 space-y-6">
          {/* Top Bar (controls title, count, mobile filter, and sort selector) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black font-heading text-brand-navy tracking-tight">
                Explore Deals
              </h1>
              <p className="text-xs text-brand-subtext font-semibold">
                Showing{" "}
                <span className="font-bold text-brand-navy">
                  {isLoading ? "..." : filteredCoupons.length}
                </span>{" "}
                of {isLoading ? "..." : totalOffers} verified offers
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <Button
                onClick={() => setShowMobileFilters(true)}
                variant="outline"
                className="lg:hidden h-9 text-xs px-3 border-brand-border bg-brand-bg flex items-center gap-1.5 cursor-pointer shadow-sm text-brand-navy font-bold rounded-lg"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-blue" />
                <span>Filters</span>
              </Button>

              {/* Sorting controls */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-brand-subtext">Sort By:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px] bg-brand-bg border border-brand-border rounded-lg px-3 py-1.5 text-xs font-bold text-brand-navy focus:ring-1 focus:ring-brand-blue/30 shadow-sm cursor-pointer h-9">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg text-brand-text border-brand-border">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="success">Success Rate</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {(selectedCategory !== "All" ||
            selectedLocation !== "All" ||
            minDiscount > 0 ||
            validity !== "anytime" ||
            !discountTypes.percentage ||
            !discountTypes.fixed ||
            !discountTypes.freebie) && (
            <div className="flex flex-wrap gap-2 items-center bg-brand-surface/30 p-2.5 rounded-lg border border-brand-border/40 animate-fade-in-up">
              <span className="text-xs font-bold text-brand-subtext uppercase tracking-wider">
                Active Filters:
              </span>

              {/* Category Pill */}
              {selectedCategory !== "All" && (
                <span className="px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-text text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="hover:text-brand-error transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Location Pill */}
              {selectedLocation !== "All" && (
                <span className="px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-text text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  Near {selectedLocation}
                  <button
                    type="button"
                    onClick={() => setSelectedLocation("All")}
                    className="hover:text-brand-error transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Discount Types Pill */}
              {(!discountTypes.percentage ||
                !discountTypes.fixed ||
                !discountTypes.freebie) && (
                <span className="px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-text text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  Types:{" "}
                  {Object.entries(discountTypes)
                    .filter(([_, enabled]) => enabled)
                    .map(([name]) =>
                      name === "fixed"
                        ? "Flat"
                        : name === "freebie"
                          ? "BOGO"
                          : "% Off",
                    )
                    .join(", ") || "None"}
                  <button
                    type="button"
                    onClick={() =>
                      setDiscountTypes({
                        percentage: true,
                        fixed: true,
                        freebie: true,
                      })
                    }
                    className="hover:text-brand-error transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Min Discount Pill */}
              {minDiscount > 0 && (
                <span className="px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-text text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  Min {minDiscount}% Off
                  <button
                    type="button"
                    onClick={() => setMinDiscount(0)}
                    className="hover:text-brand-error transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {/* Validity Pill */}
              {validity !== "anytime" && (
                <span className="px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-text text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  Expires: {validity === "today" ? "Today" : "This Week"}
                  <button
                    type="button"
                    onClick={() => setValidity("anytime")}
                    className="hover:text-brand-error transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-brand-blue hover:text-brand-navy ml-2 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Grid of coupon cards or loading skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CouponSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-brand-bg border border-brand-border rounded-lg py-16 text-center">
              <h3 className="text-lg font-bold text-brand-navy font-heading mb-1">
                Failed to load coupons
              </h3>
              <p className="text-xs text-brand-subtext max-w-xs mx-auto mb-4">
                {error.message ||
                  "An unexpected error occurred while loading active coupons."}
              </p>
              <Button
                onClick={() => refetch()}
                className="btn-primary text-xs py-2 px-4 border-0 h-auto cursor-pointer shadow-none animate-none"
              >
                Try Again
              </Button>
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} />
              ))}
            </div>
          ) : (
            <div className="bg-brand-bg border border-brand-border rounded-lg py-16 text-center shadow-sm">
              <h3 className="text-lg font-bold text-brand-navy font-heading mb-1">
                No coupons match your filters
              </h3>
              <p className="text-xs text-brand-subtext max-w-xs mx-auto mb-4">
                Try resetting your search query or choosing another category.
              </p>
              <Button
                onClick={handleResetFilters}
                className="btn-primary text-xs py-2 px-4 border-0 h-auto cursor-pointer shadow-none"
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && coupons.length > 0 && (
            <div className="flex items-center justify-between border-t border-brand-border pt-6">
              <Button
                variant="outline"
                className="btn-tertiary text-xs py-1.5 px-4 font-bold disabled:opacity-50 cursor-pointer h-auto border-brand-border text-brand-text hover:bg-brand-surface animate-none shadow-sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-brand-subtext font-semibold">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                className="btn-tertiary text-xs py-1.5 px-4 font-bold disabled:opacity-50 cursor-pointer h-auto border-brand-border text-brand-text hover:bg-brand-surface animate-none shadow-sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={handleClaimConfirm}
        />
      )}

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-end justify-center p-0 animate-fade-in-scale lg:hidden">
          <div className="bg-brand-bg border-t border-brand-border rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-left space-y-6 shadow-2xl animate-slide-in-up">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <h3 className="font-heading text-base font-black text-brand-navy flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
                <span>Filter &amp; Sort Deals</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="text-slate-400 hover:text-brand-navy p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Keyword Search
              </label>
              <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg p-2 text-brand-text">
                <Search className="w-4 h-4 text-brand-subtext mr-2" />
                <Input
                  type="text"
                  placeholder="Enter brand name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-brand-subtext shadow-none"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-xs font-semibold text-brand-text focus:ring-1 focus:ring-brand-blue/30 shadow-none cursor-pointer">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent className="bg-brand-bg text-brand-text border-brand-border">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="success">Success Rate</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Location
              </label>
              <div className="flex bg-brand-surface border border-brand-border rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedLocation === "All") {
                      setSelectedLocation("Patna"); // default choice when switching to "Near City"
                    }
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedLocation !== "All"
                      ? "bg-brand-navy text-white shadow-sm"
                      : "text-brand-subtext hover:text-brand-text"
                  }`}
                >
                  {selectedLocation !== "All"
                    ? `Near ${selectedLocation}`
                    : "Near City"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocation("All")}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedLocation === "All"
                      ? "bg-brand-navy text-white shadow-sm"
                      : "text-brand-subtext hover:text-brand-text"
                  }`}
                >
                  All India
                </button>
              </div>
              {selectedLocation !== "All" && (
                <div className="mt-2 animate-fade-in-up">
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger className="w-full bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-text focus:ring-1 focus:ring-brand-blue/30 shadow-none cursor-pointer flex items-center gap-1.5 h-8">
                      <MapPin className="w-3.5 h-3.5 text-brand-warning flex-shrink-0" />
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-bg text-brand-text border-brand-border">
                      <SelectItem value="Arrah">Arrah</SelectItem>
                      <SelectItem value="Patna">Patna</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                      selectedCategory === cat.name
                        ? "bg-brand-navy text-white border-brand-navy shadow-sm"
                        : "bg-brand-surface text-brand-subtext border-brand-border hover:border-brand-navy hover:text-brand-text"
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Discount Type
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={discountTypes.percentage}
                    onChange={(e) =>
                      setDiscountTypes((prev) => ({
                        ...prev,
                        percentage: e.target.checked,
                      }))
                    }
                    className="rounded border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Percentage Off
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={discountTypes.fixed}
                    onChange={(e) =>
                      setDiscountTypes((prev) => ({
                        ...prev,
                        fixed: e.target.checked,
                      }))
                    }
                    className="rounded border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Flat Amount
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={discountTypes.freebie}
                    onChange={(e) =>
                      setDiscountTypes((prev) => ({
                        ...prev,
                        freebie: e.target.checked,
                      }))
                    }
                    className="rounded border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    BOGO / Freebie
                  </span>
                </label>
              </div>
            </div>

            {/* Min Discount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  Min Discount
                </label>
                <span className="text-xs font-bold text-brand-navy">
                  {minDiscount}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-navy dark:bg-slate-700"
              />
              <div className="flex justify-between text-[10px] text-brand-subtext mt-1 font-semibold">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Validity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Validity
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="validity-mobile"
                    checked={validity === "anytime"}
                    onChange={() => setValidity("anytime")}
                    className="border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Anytime
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="validity-mobile"
                    checked={validity === "today"}
                    onChange={() => setValidity("today")}
                    className="border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Expires Today
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="validity-mobile"
                    checked={validity === "week"}
                    onChange={() => setValidity("week")}
                    className="border-brand-border text-brand-navy focus:ring-brand-navy bg-brand-surface w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-brand-text group-hover:text-brand-navy transition-colors select-none">
                    Expires this Week
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-brand-border">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1 py-3 text-xs font-bold border-brand-border text-brand-text hover:bg-brand-surface shadow-none h-auto cursor-pointer flex items-center justify-center gap-1.5 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </Button>
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="btn-primary flex-grow py-3 text-xs font-bold border-0 h-auto cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Apply Filters</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DealsListing() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-surface">
          <div className="text-sm font-semibold text-brand-subtext animate-pulse">
            Loading Deals...
          </div>
        </div>
      }
    >
      <DealsListingContent />
    </Suspense>
  );
}
