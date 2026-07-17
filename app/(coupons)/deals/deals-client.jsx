"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Loader2, Tag } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";
import CouponCard from "@/components/shared/CouponCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUPON_CATEGORIES } from "@/utils/constants";

const CITIES = [
  { value: "all", label: "All Locations" },
  { value: "online", label: "Online" },
  { value: "ranchi", label: "Ranchi" },
  { value: "jamshedpur", label: "Jamshedpur" },
  { value: "patna", label: "Patna" },
  { value: "arrah", label: "Arrah" },
  { value: "delhi", label: "Delhi" },
  { value: "mumbai", label: "Mumbai" },
  { value: "bangalore", label: "Bangalore" },
];

const DISCOUNT_TYPES = [
  { value: "all", label: "All Discounts" },
  { value: "percentage", label: "Percentage OFF" },
  { value: "fixed", label: "Flat Price Cut" },
  { value: "freebie", label: "Freebie / Gift" },
];

export default function DealsClient() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [discountType, setDiscountType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Coupons based on current filters
  useEffect(() => {
    async function loadCoupons() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "40" });
        if (search) params.set("search", search);
        if (category !== "all") params.set("category", category);
        if (discountType !== "all") params.set("discountType", discountType);
        if (city !== "all") params.set("city", city);
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        const res = await fetch(`/api/coupons?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setCoupons(json.data?.coupons || []);
        }
      } catch (err) {
        console.error("Failed to load coupons:", err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(loadCoupons, 300); // debounce search input
    return () => clearTimeout(timer);
  }, [search, category, city, discountType, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setCity("all");
    setDiscountType("all");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      {/* Hero Header Section */}
      <section className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-14 px-4 relative overflow-hidden select-none border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="max-w-6xl mx-auto space-y-3 relative z-10 text-left">
          <Badge className="bg-white/10 text-white border border-white/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
            Coupon Vault
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight leading-tight">
            Browse All Verified Offers
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-lg leading-relaxed font-medium">
            Search active discount codes, promo links, and limited-time offline vouchers from our verified merchants.
          </p>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <div className="bg-brand-bg border-b border-brand-border py-4 sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-subtext absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search brand name, keywords or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs placeholder-brand-subtext h-10 border-brand-border bg-brand-surface focus-visible:ring-1 focus-visible:ring-brand-blue"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters((prev) => !prev)}
                className="h-10 text-xs font-bold border-brand-border flex items-center gap-2 hover:bg-brand-surface cursor-pointer bg-brand-bg select-none shadow-none"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {(category !== "all" || city !== "all" || discountType !== "all") && (
                  <Badge className="ml-1 bg-brand-blue text-white w-5 h-5 flex items-center justify-center p-0 text-[10px]">
                    {[category !== "all", city !== "all", discountType !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                <SelectTrigger className="h-10 text-xs w-[140px] border-brand-border cursor-pointer bg-brand-bg font-bold shadow-none text-brand-navy">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-brand-bg border border-brand-border">
                  <SelectItem value="createdAt" className="text-xs text-brand-navy">Newest</SelectItem>
                  <SelectItem value="discountValue" className="text-xs text-brand-navy">Highest Discount</SelectItem>
                  <SelectItem value="expiresAt" className="text-xs text-brand-navy">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-border text-left">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-navy uppercase tracking-wider block">Category</label>
                <Select value={category} onValueChange={(val) => setCategory(val)}>
                  <SelectTrigger className="h-9 text-xs border-brand-border bg-brand-surface text-brand-navy shadow-none">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border border-brand-border">
                    <SelectItem value="all" className="text-xs text-brand-navy">All Categories</SelectItem>
                    {COUPON_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs text-brand-navy capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-navy uppercase tracking-wider block">Location</label>
                <Select value={city} onValueChange={(val) => setCity(val)}>
                  <SelectTrigger className="h-9 text-xs border-brand-border bg-brand-surface text-brand-navy shadow-none">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border border-brand-border">
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-xs text-brand-navy">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount type selector */}
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-bold text-brand-navy uppercase tracking-wider block">Format</label>
                <Select value={discountType} onValueChange={(val) => setDiscountType(val)}>
                  <SelectTrigger className="h-9 text-xs border-brand-border bg-brand-surface text-brand-navy shadow-none">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-bg border border-brand-border">
                    {DISCOUNT_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value} className="text-xs text-brand-navy">{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-brand-subtext font-semibold">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <span>Loading verified vouchers...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {coupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} isLocal={false} />
              ))}
            </div>

            {coupons.length === 0 && (
              <div className="py-20 text-center bg-brand-bg border border-brand-border rounded-xl space-y-4 max-w-lg mx-auto mt-6">
                <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-brand-subtext">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-bold text-brand-navy">No coupons matched your search</h3>
                  <p className="text-xs text-brand-subtext">
                    Try broadening your keywords or resetting the category and location filters.
                  </p>
                </div>
                <Button
                  onClick={handleResetFilters}
                  className="bg-brand-navy text-white text-xs h-9 px-6 font-bold rounded-lg cursor-pointer border-0 shadow-none hover:bg-brand-navy/95"
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
