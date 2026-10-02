"use client";

import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Filter,
  Flame,
  Layers,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { TwitterVerifiedBadge } from "@/components/shared/TwitterVerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CURATED_CATEGORIES = [
  { name: "Food & Dining", slug: "food", emoji: "🍔" },
  { name: "Fashion & Clothing", slug: "fashion", emoji: "🛍️" },
  { name: "Electronics & Gadgets", slug: "electronics", emoji: "💻" },
  { name: "Beauty & Wellness", slug: "beauty", emoji: "💄" },
  { name: "Travel & Hospitality", slug: "travel", emoji: "✈️" },
  { name: "Grocery & Essentials", slug: "grocery", emoji: "🥦" },
];

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams?.get("q") || searchParams?.get("search") || "";

  // State
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'brands' | 'coupons' | 'products' | 'categories'
  const [sortBy, setSortBy] = useState("relevance"); // 'relevance' | 'discount' | 'newest' | 'price-asc' | 'price-desc'
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Filters State
  const [minDiscount, setMinDiscount] = useState(0); // 0, 10, 20, 50
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Raw API Search Data
  const [searchData, setSearchData] = useState({
    brands: [],
    coupons: [],
    categories: [],
    products: [],
    total: 0,
  });

  // Sync with URL query parameter
  useEffect(() => {
    const q = searchParams?.get("q") || searchParams?.get("search") || "";
    setActiveQuery(q);
  }, [searchParams]);

  // Fetch search results whenever active query changes
  useEffect(() => {
    if (!activeQuery.trim()) {
      setSearchData({
        brands: [],
        coupons: [],
        categories: [],
        products: [],
        total: 0,
      });
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(activeQuery.trim())}&limit=36`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isCancelled) return;
        if (json?.data) {
          setSearchData(json.data);
        } else {
          setSearchData({
            brands: [],
            coupons: [],
            categories: [],
            products: [],
            total: 0,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search API error:", err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeQuery]);

  // Available Categories in Results
  const availableCategories = useMemo(() => {
    const set = new Set();
    searchData.brands?.forEach((b) => b.category && set.add(b.category));
    searchData.coupons?.forEach((c) => c.category && set.add(c.category));
    searchData.products?.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [searchData]);

  // Max price among products
  const highestProductPrice = useMemo(() => {
    let max = 5000;
    searchData.products?.forEach((p) => {
      const price = Number(p.discountPrice || p.originalPrice || 0);
      if (price > max) max = price;
    });
    return Math.ceil(max / 500) * 500;
  }, [searchData.products]);

  // Handle Coupon Code Copy
  const handleCopyCode = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Copied "${code}" to clipboard!`, {
      icon: "📋",
      style: {
        borderRadius: "10px",
        background: "#0F172A",
        color: "#fff",
        fontSize: "13px",
      },
    });
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinDiscount(0);
    setSelectedCategory("all");
    setMaxPrice(highestProductPrice);
    setVerifiedOnly(false);
  };

  const isFiltered =
    minDiscount > 0 ||
    selectedCategory !== "all" ||
    maxPrice < highestProductPrice ||
    verifiedOnly;

  // Filtered & Sorted Brands
  const filteredBrands = useMemo(() => {
    let list = [...(searchData.brands || [])];
    if (verifiedOnly) {
      list = list.filter((b) => b.isVerified);
    }
    if (selectedCategory !== "all") {
      list = list.filter(
        (b) => b.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return list;
  }, [searchData.brands, verifiedOnly, selectedCategory]);

  // Filtered & Sorted Coupons
  const filteredCoupons = useMemo(() => {
    let list = [...(searchData.coupons || [])];

    if (minDiscount > 0) {
      list = list.filter((c) => {
        const val = Number(c.discountValue) || 0;
        return val >= minDiscount;
      });
    }

    if (selectedCategory !== "all") {
      list = list.filter(
        (c) => c.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "discount") {
      list.sort(
        (a, b) => (Number(b.discountValue) || 0) - (Number(a.discountValue) || 0)
      );
    }

    return list;
  }, [searchData.coupons, minDiscount, selectedCategory, sortBy]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...(searchData.products || [])];

    if (minDiscount > 0) {
      list = list.filter((p) => {
        const discount = Number(p.discountPercentage) || 0;
        return discount >= minDiscount;
      });
    }

    if (selectedCategory !== "all") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (maxPrice < highestProductPrice) {
      list = list.filter((p) => {
        const price = Number(p.discountPrice || p.originalPrice || 0);
        return price <= maxPrice;
      });
    }

    if (sortBy === "discount") {
      list.sort(
        (a, b) =>
          (Number(b.discountPercentage) || 0) -
          (Number(a.discountPercentage) || 0)
      );
    } else if (sortBy === "price-asc") {
      list.sort(
        (a, b) =>
          (Number(a.discountPrice || a.originalPrice) || 0) -
          (Number(b.discountPrice || b.originalPrice) || 0)
      );
    } else if (sortBy === "price-desc") {
      list.sort(
        (a, b) =>
          (Number(b.discountPrice || b.originalPrice) || 0) -
          (Number(a.discountPrice || a.originalPrice) || 0)
      );
    }

    return list;
  }, [
    searchData.products,
    minDiscount,
    selectedCategory,
    maxPrice,
    highestProductPrice,
    sortBy,
  ]);

  // Total results
  const totalResults =
    (searchData.brands?.length || 0) +
    (searchData.coupons?.length || 0) +
    (searchData.categories?.length || 0) +
    (searchData.products?.length || 0);

  const filteredTotal =
    filteredBrands.length +
    filteredCoupons.length +
    (searchData.categories?.length || 0) +
    filteredProducts.length;

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased w-full">
        <Navbar />

        {/* ── 1. Full-Width Unified Header Strip ── */}
        <section className="bg-white border-b border-slate-200/80 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Clean Query Summary & Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-medium text-slate-500">Search</span>
              <span className="text-slate-300 text-xs">/</span>

              {activeQuery ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Showing</span>
                  <Badge variant="secondary" className="font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/60">
                    {filteredTotal} results
                  </Badge>
                  <span className="text-xs text-slate-600">for</span>
                  <Badge variant="outline" className="font-semibold text-slate-900 border-slate-300 bg-slate-50 text-xs">
                    &ldquo;{activeQuery}&rdquo;
                  </Badge>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-700">
                  All Discovery Deals
                </span>
              )}
            </div>

            {/* Right: Sort & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort results"
                className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="relevance">Relevance</option>
                <option value="discount">Highest Discount</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden gap-1.5 h-8 text-xs font-semibold"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
                {isFiltered ? (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                ) : null}
              </Button>
            </div>
          </div>
        </section>

        {/* ── 2. Full-Width Sticky Navigation Tabs ── */}
        <nav
          aria-label="Filter navigation"
          className="sticky top-0 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs w-full"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant={activeTab === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("all")}
                className={`gap-2 text-xs font-semibold transition-all h-8 rounded-lg cursor-pointer ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Results</span>
                <Badge
                  variant={activeTab === "all" ? "secondary" : "outline"}
                  className={`text-[10px] h-4.5 px-1.5 font-bold ${
                    activeTab === "all"
                      ? "bg-white/20 text-white border-transparent"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {filteredTotal}
                </Badge>
              </Button>

              <Button
                variant={activeTab === "brands" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("brands")}
                className={`gap-2 text-xs font-semibold transition-all h-8 rounded-lg cursor-pointer ${
                  activeTab === "brands"
                    ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Brands & Stores</span>
                <Badge
                  variant={activeTab === "brands" ? "secondary" : "outline"}
                  className={`text-[10px] h-4.5 px-1.5 font-bold ${
                    activeTab === "brands"
                      ? "bg-white/20 text-white border-transparent"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {filteredBrands.length}
                </Badge>
              </Button>

              <Button
                variant={activeTab === "coupons" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("coupons")}
                className={`gap-2 text-xs font-semibold transition-all h-8 rounded-lg cursor-pointer ${
                  activeTab === "coupons"
                    ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Coupons & Deals</span>
                <Badge
                  variant={activeTab === "coupons" ? "secondary" : "outline"}
                  className={`text-[10px] h-4.5 px-1.5 font-bold ${
                    activeTab === "coupons"
                      ? "bg-white/20 text-white border-transparent"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {filteredCoupons.length}
                </Badge>
              </Button>

              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("products")}
                className={`gap-2 text-xs font-semibold transition-all h-8 rounded-lg cursor-pointer ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Products & Deals</span>
                <Badge
                  variant={activeTab === "products" ? "secondary" : "outline"}
                  className={`text-[10px] h-4.5 px-1.5 font-bold ${
                    activeTab === "products"
                      ? "bg-white/20 text-white border-transparent"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {filteredProducts.length}
                </Badge>
              </Button>

              {searchData.categories?.length > 0 ? (
                <Button
                  variant={activeTab === "categories" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("categories")}
                  className={`gap-2 text-xs font-semibold transition-all h-8 rounded-lg cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>🏷️ Categories</span>
                  <Badge
                    variant={activeTab === "categories" ? "secondary" : "outline"}
                    className={`text-[10px] h-4.5 px-1.5 font-bold ${
                      activeTab === "categories"
                        ? "bg-white/20 text-white border-transparent"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {searchData.categories.length}
                  </Badge>
                </Button>
              ) : null}
            </div>

            {/* Quick Active Filter Chips on Bar */}
            {isFiltered ? (
              <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                {minDiscount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 text-xs hover:bg-blue-100"
                    onClick={() => setMinDiscount(0)}
                  >
                    <span>{minDiscount}%+ Off</span>
                    <X className="w-3 h-3 text-blue-500" />
                  </Badge>
                ) : null}
                {selectedCategory !== "all" ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 text-xs capitalize hover:bg-blue-100"
                    onClick={() => setSelectedCategory("all")}
                  >
                    <span>{selectedCategory}</span>
                    <X className="w-3 h-3 text-blue-500" />
                  </Badge>
                ) : null}
                {verifiedOnly ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 text-xs hover:bg-blue-100"
                    onClick={() => setVerifiedOnly(false)}
                  >
                    <span>Verified Only</span>
                    <X className="w-3 h-3 text-blue-500" />
                  </Badge>
                ) : null}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetFilters}
                  className="text-xs text-blue-600 font-semibold gap-1 h-6 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </Button>
              </div>
            ) : null}
          </div>
        </nav>

        {/* ── 3. Full-Width Main Canvas (Sidebar + Grid) ── */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex items-start gap-7 w-full">
            {/* ── Left Sidebar Filters (Desktop Sticky) ── */}
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-28 self-start">
              <Card className="shadow-xs border-slate-200/90 rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-5 space-y-5">
                  {/* Header: Title + Reset */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                    </div>
                    {isFiltered ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={resetFilters}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold h-7 px-2 gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </Button>
                    ) : null}
                  </div>

                  {/* Filter: Minimum Discount */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Discount
                    </h4>
                    <div className="space-y-1">
                      {[
                        { label: "All Discounts", value: 0 },
                        { label: "10% or more", value: 10 },
                        { label: "20% or more", value: 20 },
                        { label: "50% or more", value: 50 },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            minDiscount === opt.value
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="minDiscount"
                            checked={minDiscount === opt.value}
                            onChange={() => setMinDiscount(opt.value)}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Filter: Categories */}
                  {availableCategories.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Category
                      </h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        <label
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            selectedCategory === "all"
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedCategory"
                            checked={selectedCategory === "all"}
                            onChange={() => setSelectedCategory("all")}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span>All Categories</span>
                        </label>

                        {availableCategories.map((cat) => (
                          <label
                            key={cat}
                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                              selectedCategory === cat
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedCategory"
                              checked={selectedCategory === cat}
                              onChange={() => setSelectedCategory(cat)}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span className="capitalize truncate">{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {availableCategories.length > 0 ? <Separator /> : null}

                  {/* Filter: Verified Deals Only (Twitter Verified Checkmark) */}
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="verified-filter"
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                      <TwitterVerifiedBadge className="w-4 h-4" />
                      <span>Verified Deals Only</span>
                    </label>
                    <Checkbox
                      id="verified-filter"
                      checked={verifiedOnly}
                      onCheckedChange={(val) => setVerifiedOnly(Boolean(val))}
                    />
                  </div>

                  {/* Filter: Price Range (Products) */}
                  {searchData.products?.length > 0 ? (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Max Price
                          </h4>
                          <span className="text-xs font-bold text-slate-900">
                            ₹{maxPrice.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max={highestProductPrice}
                          step="100"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>₹200</span>
                          <span>₹{highestProductPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </aside>

            {/* ── Right Results Canvas (Full Expansion) ── */}
            <div className="flex-1 min-w-0 space-y-10">
              {/* Loading Skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <Card key={n} className="p-4 space-y-3">
                      <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </Card>
                  ))}
                </div>
              ) : null}

              {/* Empty State: Zero Results */}
              {!loading && totalResults === 0 ? (
                <Card className="p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <Search className="w-8 h-8 text-blue-500" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {activeQuery
                        ? `No matches found for "${activeQuery}"`
                        : "Discover top savings & verified deals"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      We couldn&rsquo;t find verified coupons, partner brands, or
                      deals matching your search term. Try exploring popular categories.
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Top Discovery Categories
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CURATED_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all text-left flex items-center gap-2.5 group"
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                      <Link href="/deals" className="gap-2">
                        <span>Browse All Verified Deals</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* Empty State: Zero Filtered Results */}
              {!loading && totalResults > 0 && filteredTotal === 0 ? (
                <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No items match the active filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your discount range, price slider, or category to see matching deals.
                  </p>
                  <div>
                    <Button
                      onClick={resetFilters}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 rounded-xl cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* ── Content Sections ── */}
              {!loading && filteredTotal > 0 ? (
                <div className="space-y-10">
                  {/* ── 1. BRANDS & STORES SECTION ── */}
                  {(activeTab === "all" || activeTab === "brands") &&
                  filteredBrands.length > 0 ? (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <Store className="w-4 h-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">
                            Matching Brands & Stores
                          </h2>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {filteredBrands.length}
                          </Badge>
                        </div>

                        {activeTab === "all" && filteredBrands.length > 5 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("brands")}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 gap-1 cursor-pointer"
                          >
                            <span>View all {filteredBrands.length}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        ) : null}
                      </div>

                      {/* Brands Grid (Wide Responsive, No Premature Truncation) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {filteredBrands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={brand.href}
                            className="group block"
                          >
                            <Card className="h-full border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl">
                              <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2.5 h-full">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-200 transition-colors">
                                    {brand.logo ? (
                                      <img
                                        src={brand.logo}
                                        alt={brand.title}
                                        className="w-full h-full object-contain p-1"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <Store className="w-6 h-6 text-blue-600" />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                        {brand.title}
                                      </h3>
                                      {brand.isVerified ? (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="inline-flex shrink-0">
                                              <TwitterVerifiedBadge className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>Verified Store</TooltipContent>
                                        </Tooltip>
                                      ) : null}
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-slate-500 capitalize truncate mt-0.5">
                                      {brand.category || "Store"} • {brand.totalCoupons || 0} Deals
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* ── 2. COUPONS & PROMO CODES SECTION ── */}
                  {(activeTab === "all" || activeTab === "coupons") &&
                  filteredCoupons.length > 0 ? (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                            <Tag className="w-4 h-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">
                            Verified Coupons & Offers
                          </h2>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {filteredCoupons.length}
                          </Badge>
                        </div>

                        {activeTab === "all" && filteredCoupons.length > 6 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("coupons")}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 gap-1 cursor-pointer"
                          >
                            <span>View all {filteredCoupons.length}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        ) : null}
                      </div>

                      {/* Coupons Grid (3-Cols on Large Screens) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredCoupons.map((coupon) => (
                          <Card
                            key={coupon.id}
                            className="relative border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col justify-between group"
                          >
                            {/* Blue Accent Strip */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-600" />

                            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                              <div className="space-y-3.5">
                                {/* Top: Store info & Discount badge */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                      {coupon.merchant?.logo ? (
                                        <img
                                          src={coupon.merchant.logo}
                                          alt={coupon.merchant.name}
                                          className="w-full h-full object-contain p-0.5"
                                          onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <Store className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-slate-800 truncate block">
                                          {coupon.merchant?.name || "Partner Store"}
                                        </span>
                                        <TwitterVerifiedBadge className="w-3 h-3 shrink-0" />
                                      </div>
                                      {coupon.category ? (
                                        <span className="text-[10px] text-slate-400 capitalize block">
                                          {coupon.category}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>

                                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold gap-1 shrink-0 hover:bg-amber-100">
                                    <Flame className="w-3 h-3 text-amber-500" />
                                    <span>
                                      {coupon.discountValue
                                        ? `${coupon.discountValue}${
                                            coupon.discountType === "percentage"
                                              ? "% OFF"
                                              : "₹ OFF"
                                          }`
                                        : "SPECIAL DEAL"}
                                    </span>
                                  </Badge>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                  {coupon.title}
                                </h3>
                              </div>

                              {/* Bottom: Copy Code & Claim Action */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                                {coupon.code ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyCode(coupon.code, coupon.id)}
                                    className="font-mono text-xs font-bold border-dashed border-blue-300 bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 gap-1.5 h-8 rounded-lg cursor-pointer shadow-2xs"
                                  >
                                    {copiedId === coupon.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700 font-sans">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5 text-blue-500" />
                                        <span>{coupon.code}</span>
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium">
                                    No code needed
                                  </span>
                                )}

                                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5 text-xs font-semibold h-8 shadow-xs">
                                  <Link href={coupon.href}>
                                    <span>Claim Deal</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* ── 3. MATCHING CATEGORIES SECTION ── */}
                  {(activeTab === "all" || activeTab === "categories") &&
                  searchData.categories?.length > 0 ? (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <Tag className="w-4 h-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">
                            Matching Categories
                          </h2>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {searchData.categories.length}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {searchData.categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={cat.href}
                            className="group block"
                          >
                            <Card className="border-slate-200/90 hover:border-emerald-400 hover:shadow-xs transition-all duration-200 rounded-xl">
                              <CardContent className="p-3.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-lg">🏷️</span>
                                  <span className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                                    {cat.title}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* ── 4. CURATED PRODUCTS & DEALS SECTION ── */}
                  {(activeTab === "all" || activeTab === "products") &&
                  filteredProducts.length > 0 ? (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">
                            Curated Products & Deals
                          </h2>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {filteredProducts.length}
                          </Badge>
                        </div>

                        {activeTab === "all" && filteredProducts.length > 5 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("products")}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 gap-1 cursor-pointer"
                          >
                            <span>View all {filteredProducts.length}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        ) : null}
                      </div>

                      {/* Products Grid (4-Cols on Desktop, 5-Cols on 2XL) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
                        {filteredProducts.map((prod) => (
                          <Card
                            key={prod.id}
                            className="border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col justify-between group"
                          >
                            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                              <div className="space-y-3">
                                {/* Image Container (aspect 4:3) */}
                                <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                  {prod.imageUrl ? (
                                    <img
                                      src={prod.imageUrl}
                                      alt={prod.title}
                                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                                  )}

                                  {/* Discount Ribbon Badge */}
                                  {Number(prod.discountPercentage) > 0 ? (
                                    <Badge className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold shadow-xs hover:bg-emerald-700 border-none">
                                      {prod.discountPercentage}% OFF
                                    </Badge>
                                  ) : null}
                                </div>

                                {/* Title & Brand */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider truncate block">
                                      {prod.merchant?.name || prod.category || "Verified Deal"}
                                    </span>
                                    <TwitterVerifiedBadge className="w-3 h-3 shrink-0" />
                                  </div>
                                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                    {prod.title}
                                  </h3>
                                </div>
                              </div>

                              {/* Price & Shop CTA */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div>
                                  {prod.discountPrice ? (
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-base font-extrabold text-slate-900">
                                        ₹{prod.discountPrice}
                                      </span>
                                      {Number(prod.originalPrice) > Number(prod.discountPrice) ? (
                                        <span className="text-xs text-slate-400 line-through">
                                          ₹{prod.originalPrice}
                                        </span>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <span className="text-xs font-semibold text-slate-700">
                                      Special Offer
                                    </span>
                                  )}
                                </div>

                                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg gap-1.5 h-8 shadow-xs">
                                  <a
                                    href={prod.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span>Shop</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </main>

        {/* ── Mobile Filter Sheet Drawer (Shadcn Sheet) ── */}
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col bg-white">
            <SheetHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <SheetTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filters</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Discount */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Discount
                </h4>
                <div className="space-y-1">
                  {[
                    { label: "All Discounts", value: 0 },
                    { label: "10% or more", value: 10 },
                    { label: "20% or more", value: 20 },
                    { label: "50% or more", value: 50 },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                        minDiscount === opt.value
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileMinDiscount"
                        checked={minDiscount === opt.value}
                        onChange={() => setMinDiscount(opt.value)}
                        className="text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {availableCategories.length > 0 ? (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <label
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                        selectedCategory === "all"
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileCategory"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="text-blue-600"
                      />
                      <span>All Categories</span>
                    </label>

                    {availableCategories.map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobileCategory"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                          className="text-blue-600"
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Verified Only (Twitter Verified Checkmark) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <label
                  htmlFor="mobile-verified"
                  className="flex items-center gap-2 text-xs font-medium text-slate-700"
                >
                  <TwitterVerifiedBadge className="w-4 h-4" />
                  <span>Verified Deals Only</span>
                </label>
                <Checkbox
                  id="mobile-verified"
                  checked={verifiedOnly}
                  onCheckedChange={(val) => setVerifiedOnly(Boolean(val))}
                />
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex-1 text-xs font-semibold h-9 rounded-xl"
              >
                Reset
              </Button>
              <Button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Footer />
      </div>
    </TooltipProvider>
  );
}
