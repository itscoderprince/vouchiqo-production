"use client";

import {
  ArrowRight,
  ChevronRight,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

// Animated typewriter placeholder phrases (concise and punchy so they never get truncated)
const PLACEHOLDER_PHRASES = [
  "Search brands, deals, stores...",
  "Search for 'Zomato'...",
  "Search for 'Fashion'...",
  "Search for 'Electronics'...",
  "Search for 'Milton'...",
  "Search for 'Food & Dining'...",
  "Search for 'Beauty'...",
  "Search discount coupons...",
];

// Instant local category index for 0ms visual feedback
const QUICK_CATEGORIES = [
  { name: "Fashion & Clothing", slug: "fashion", type: "Category", emoji: "🛍️" },
  { name: "Food & Dining", slug: "food", type: "Category", emoji: "🍔" },
  { name: "Electronics & Gadgets", slug: "electronics", type: "Category", emoji: "💻" },
  { name: "Beauty & Wellness", slug: "beauty", type: "Category", emoji: "💄" },
  { name: "Travel & Hospitality", slug: "travel", type: "Category", emoji: "✈️" },
  { name: "Home & Living", slug: "home", type: "Category", emoji: "🏠" },
  { name: "Fitness & Healthcare", slug: "fitness", type: "Category", emoji: "💪" },
  { name: "Gaming & Entertainment", slug: "entertainment", type: "Category", emoji: "🎮" },
  { name: "Grocery & Essentials", slug: "grocery", type: "Category", emoji: "🛒" },
  { name: "Finance & Insurance", slug: "finance", type: "Category", emoji: "💳" },
];

export const SearchBar = ({ autoFocus = false, onSelect = null }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus when triggered (e.g. mobile search toggle open)
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Typewriter animation states
  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Smooth Typewriter Effect for Search Placeholder
  useEffect(() => {
    const currentPhrase =
      PLACEHOLDER_PHRASES[phraseIndex % PLACEHOLDER_PHRASES.length] ||
      "Search brands, deals, coupons...";

    let typingSpeed = isDeleting ? 35 : 70;

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 1900; // Pause at end of full phrase
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
      typingSpeed = 250;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        setPlaceholderText(currentPhrase.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholderText(currentPhrase.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        setIsDeleting(true);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute search suggestions dynamically via Unified /api/search
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setTotalMatches(0);
      setIsOpen(false);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    // 1. Instant local category match (0ms latency preview)
    const instantCategories = QUICK_CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(q) || c.slug.includes(q)
    ).map((c) => ({
      id: `local_cat_${c.slug}`,
      title: c.name,
      subtitle: "Explore Category",
      type: "Category",
      href: `/category/${c.slug}`,
      iconType: "category",
      emoji: c.emoji,
    }));

    setSuggestions(instantCategories);
    setIsOpen(true);
    setLoading(true);
    setSelectedIndex(-1);

    // 2. Query unified search API
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
        if (!res.ok || isCancelled) return;

        const json = await res.json();
        const data = json.data || {};

        const brandItems = (data.brands || []).map((b) => ({
          id: `brand_${b.id || b.slug}`,
          title: b.title,
          subtitle: b.category ? `${b.category} • Store` : "Verified Store",
          type: "Brand",
          href: b.href || `/brand/${b.slug}`,
          logo: b.logo,
          iconType: "brand",
        }));

        const couponItems = (data.coupons || []).map((c) => ({
          id: `coupon_${c.id}`,
          title: c.title,
          subtitle: c.merchant?.name
            ? `${c.merchant.name}${c.code ? ` • Code: ${c.code}` : " • Offer"}`
            : c.code
            ? `Code: ${c.code}`
            : "Special Deal",
          type: "Offer",
          href: c.href || `/deals/${c.id}`,
          logo: c.merchant?.logo,
          iconType: "deal",
        }));

        const categoryItems = (data.categories || []).map((cat) => ({
          id: `cat_${cat.slug}`,
          title: cat.title,
          subtitle: "Explore Category",
          type: "Category",
          href: cat.href || `/category/${cat.slug}`,
          iconType: "category",
          emoji:
            QUICK_CATEGORIES.find((q) => q.slug === cat.slug)?.emoji || "🏷️",
        }));

        const productItems = (data.products || []).map((p) => ({
          id: `prod_${p.id}`,
          title: p.title,
          subtitle: p.merchant?.name
            ? `${p.merchant.name}${p.discountPrice ? ` • ₹${p.discountPrice}` : ""}`
            : p.discountPrice
            ? `Special Price: ₹${p.discountPrice}`
            : "Product Deal",
          type: "Product",
          href: p.href || "#",
          logo: p.imageUrl,
          iconType: "product",
          isExternal: !!p.href && p.href.startsWith("http"),
        }));

        // Deduplicate by href
        const hrefMap = new Map();
        const all = [...brandItems, ...couponItems, ...categoryItems, ...productItems];
        all.forEach((item) => {
          if (!hrefMap.has(item.href)) {
            hrefMap.set(item.href, item);
          }
        });

        const combined = Array.from(hrefMap.values());
        if (!isCancelled) {
          setSuggestions(combined.length > 0 ? combined : instantCategories);
          setTotalMatches(data.total || combined.length);
          setLoading(false);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        if (!isCancelled) setLoading(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev + 1;
        return next > suggestions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? suggestions.length : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        setIsOpen(false);
        if (onSelect) onSelect();
        if (selected.isExternal) {
          window.open(selected.href, "_blank", "noopener,noreferrer");
        } else {
          router.push(selected.href);
        }
      } else if (query.trim()) {
        setIsOpen(false);
        if (onSelect) onSelect();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (onSelect) onSelect();
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      setIsOpen(false);
      if (onSelect) onSelect();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setTotalMatches(0);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="w-full relative flex items-center">
      <Search
        className="absolute left-3 sm:left-3.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors z-10 shrink-0"
        onClick={handleSearchClick}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholderText || "Search brands, deals, coupons..."}
        value={query}
        onFocus={() => {
          if (query.trim() && (suggestions.length > 0 || loading)) {
            setIsOpen(true);
          }
        }}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-8.5 sm:pl-10 pr-9 sm:pr-10 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-slate-400 transition-all duration-200 shadow-2xs"
      />

      {/* Right icons: Loading spinner or Clear button */}
      <div className="absolute right-2.5 sm:right-3 flex items-center gap-1 z-10">
        {loading && (
          <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Live Suggestions Floating Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
          {/* Header section */}
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>
              {loading ? "Searching..." : `Results (${suggestions.length})`}
            </span>
            <span className="text-[10px] text-slate-400">
              Press Enter to search
            </span>
          </div>

          {/* Scrollable suggestions box */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelect) onSelect();
                    }}
                    className={`flex items-center justify-between gap-3 p-2.5 transition-colors group cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 text-blue-900"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Logo / Icon Container */}
                      <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-300 transition-colors">
                        {item.iconType === "category" ? (
                          <span className="text-sm select-none">
                            {item.emoji || "🏷️"}
                          </span>
                        ) : item.logo && typeof item.logo === "string" ? (
                          <SafeImage
                            src={item.logo}
                            alt={item.title}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : item.iconType === "deal" ? (
                          <Tag className="w-4 h-4 text-amber-500" />
                        ) : item.iconType === "product" ? (
                          <ShoppingBag className="w-4 h-4 text-purple-500" />
                        ) : (
                          <Store className="w-4 h-4 text-blue-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-[10px] text-slate-400 font-medium truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          item.type === "Brand"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : item.type === "Category"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.type === "Product"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {item.type}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                );
              })
            ) : !loading ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No instant matches found.
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="block mx-auto mt-2 text-blue-600 font-semibold hover:underline"
                >
                  Search everywhere for &ldquo;{query}&rdquo; →
                </button>
              </div>
            ) : null}
          </div>

          {/* Bottom Action: View all search results */}
          {query.trim() && (
            <div className="p-2 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={handleSearchClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedIndex === suggestions.length
                    ? "bg-blue-600 text-white"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    View all results for &ldquo;{query.trim()}&rdquo;
                  </span>
                </span>
                <span className="flex items-center gap-1 shrink-0 text-[11px] font-normal">
                  {totalMatches > 0 && (
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full font-semibold text-[10px]">
                      {totalMatches}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
