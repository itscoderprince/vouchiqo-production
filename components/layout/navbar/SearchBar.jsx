"use client";

import { Search, X, Store, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Animated typewriter placeholder phrases (only real existing brands & categories on Vouchiqo)
const PLACEHOLDER_PHRASES = [
  "Search for 'Bewakoof'...",
  "Search for 'Fashion & Clothing'...",
  "Search for 'Zomato'...",
  "Search for 'Milton'...",
  "Search for 'Food & Dining'...",
  "Search for 'Blackberrys'...",
  "Search for 'Electronics & Gadgets'...",
  "Search for 'Kama Ayurveda'...",
  "Search for 'Beauty & Wellness'...",
  "Search for 'Cosmic Byte'...",
  "Search for brands, categories...",
];

// Clean category definitions index
const CATEGORIES_INDEX = [
  { name: "Fashion & Clothing", slug: "fashion", type: "category", emoji: "🛍️" },
  { name: "Food & Dining", slug: "food", type: "category", emoji: "🍔" },
  { name: "Electronics & Gadgets", slug: "electronics", type: "category", emoji: "💻" },
  { name: "Beauty & Wellness", slug: "beauty", type: "category", emoji: "💄" },
  { name: "Travel & Hospitality", slug: "travel", type: "category", emoji: "✈️" },
  { name: "Home & Living", slug: "home", type: "category", emoji: "🏠" },
  { name: "Fitness & Healthcare", slug: "fitness", type: "category", emoji: "💪" },
  { name: "Gaming & Entertainment", slug: "entertainment", type: "category", emoji: "🎮" },
  { name: "Grocery & Essentials", slug: "grocery", type: "category", emoji: "🛒" },
  { name: "Finance & Insurance", slug: "finance", type: "category", emoji: "💳" },
];

// Clean partner brands index (without broken static image paths)
const POPULAR_BRANDS_INDEX = [
  { name: "Maa Storefront", slug: "maa", category: "Grocery & Retail" },
  { name: "Bewakoof.com", slug: "bewakoof", category: "Fashion & Apparel" },
  { name: "Blackberrys", slug: "blackberrys", category: "Menswear" },
  { name: "Cosmic Byte", slug: "cosmic-byte", category: "Gaming & Tech" },
  { name: "Crocks & Cuts", slug: "crocks-cuts", category: "Food & Dining" },
  { name: "KGDC Enterprises LLP", slug: "kgdc", category: "Retail & Supply" },
  { name: "Kama Ayurveda", slug: "kama-ayurveda", category: "Beauty & Wellness" },
  { name: "Maheshwari Decor", slug: "maheshwari-decor", category: "Home & Living" },
  { name: "Marbella Tiles & Sanitary", slug: "marbella-tiles", category: "Home Improvement" },
  { name: "Milton", slug: "milton", category: "Home & Kitchen" },
  { name: "Skydine Cafe", slug: "skydine-cafe", category: "Food & Dining" },
  { name: "Soul Decor Aisha", slug: "soul-decor", category: "Home & Living" },
  { name: "Zomato", slug: "zomato", category: "Food & Delivery" },
  { name: "Starbucks", slug: "starbucks", category: "Cafes & Dining" },
  { name: "Nike", slug: "nike", category: "Sports & Footwear" },
  { name: "Adidas", slug: "adidas", category: "Sports & Shoes" },
  { name: "Sony", slug: "sony", category: "Electronics & Audio" },
  { name: "Samsung", slug: "samsung", category: "Tech & Mobile" },
];

export const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Typewriter animation states
  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Smooth Typewriter Effect for Search Placeholder
  useEffect(() => {
    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex];

    let typingSpeed = isDeleting ? 35 : 75;

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 1800; // Pause at end of full phrase
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

  // Compute search suggestions dynamically from DB and System index
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    // 1. Filter local categories
    const matchedCategories = CATEGORIES_INDEX.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    ).map((c) => ({
      id: `cat_${c.slug}`,
      title: c.name,
      subtitle: "Explore category deals",
      type: "Category",
      href: `/category/${c.slug}`,
      emoji: c.emoji,
      iconType: "category",
    }));

    // 2. Filter local brands index
    const matchedLocalBrands = POPULAR_BRANDS_INDEX.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    ).map((b) => ({
      id: `brand_${b.slug}`,
      title: b.name,
      subtitle: b.category,
      type: "Brand",
      href: `/brand/${b.slug}`,
      logo: null,
      iconType: "brand",
    }));

    let combined = [...matchedLocalBrands, ...matchedCategories];

    // 3. Query real DB merchants & coupons asynchronously
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [resMerchants, resCoupons] = await Promise.all([
          fetch(`/api/merchants?search=${encodeURIComponent(q)}`).then((r) =>
            r.ok ? r.json() : null
          ),
          fetch(`/api/coupons?search=${encodeURIComponent(q)}`).then((r) =>
            r.ok ? r.json() : null
          ),
        ]);

        if (isCancelled) return;

        const dbMerchants =
          resMerchants?.data?.merchants || resMerchants?.merchants || [];
        const dbCoupons =
          resCoupons?.data?.coupons || resCoupons?.coupons || [];

        const extraBrands = dbMerchants.map((m) => ({
          id: `db_brand_${m._id || m.slug}`,
          title: m.businessName,
          subtitle: m.category || "Verified Brand",
          type: "Brand",
          href: `/brand/${m.slug}`,
          logo: m.logo,
          iconType: "brand",
        }));

        const extraDeals = dbCoupons.map((c) => ({
          id: `db_deal_${c._id}`,
          title: c.title,
          subtitle: c.code ? `Code: ${c.code}` : "Special Deal",
          type: "Offer",
          href: `/deals/${c._id}`,
          logo: c.merchantId?.logo,
          iconType: "deal",
        }));

        // Deduplicate by href
        const existingHrefs = new Set(combined.map((item) => item.href));
        const newItems = [...extraBrands, ...extraDeals].filter(
          (item) => !existingHrefs.has(item.href)
        );

        // Replace local mock items with DB items if DB has a matching brand
        const dbHrefs = new Set(extraBrands.map((item) => item.href));
        const filteredLocal = combined.filter(
          (item) => !dbHrefs.has(item.href)
        );

        combined = [...filteredLocal, ...newItems];
        setSuggestions(combined);
      } catch (err) {
        console.error("Live search fetch error:", err);
      }
    }, 100);

    setSuggestions(combined);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      router.push(`/brands?search=${encodeURIComponent(query.trim())}`);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/brands?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="w-full relative flex items-center">
      <Search
        className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 cursor-pointer hover:text-[#2563eb] transition-colors z-10"
        onClick={handleSearchClick}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholderText || "Search for brands, categories..."}
        value={query}
        onFocus={() => {
          if (query.trim() && suggestions.length > 0) setIsOpen(true);
        }}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 placeholder-slate-400 transition-all duration-200 shadow-xs"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors z-10 cursor-pointer bg-transparent border-0 flex items-center justify-center"
          aria-label="Clear search query"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Live Suggestions Floating Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
          {/* Simple non-bold header section */}
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-normal text-slate-400">
            <span>Suggestions ({suggestions.length})</span>
            <span>Scroll for more</span>
          </div>

          {/* Scrollable suggestions box */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Small Square Logo / Avatar Container */}
                    <div className="w-8 h-8 rounded-lg border border-slate-200 bg-blue-50/50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:border-blue-400 transition-colors">
                      {item.iconType === "category" ? (
                        <span className="text-sm select-none">{item.emoji || "🏷️"}</span>
                      ) : item.logo && typeof item.logo === "string" && item.logo.startsWith("http") ? (
                        <img
                          src={item.logo}
                          alt={item.title}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : item.iconType === "deal" ? (
                        <Tag className="w-4 h-4 text-blue-600" />
                      ) : (
                        <span className="text-xs font-black text-blue-600 uppercase select-none">
                          {item.title ? item.title[0] : "B"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#2563eb] transition-colors">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        item.type === "Brand"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.type === "Category"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {item.type}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-xs font-normal text-slate-400">
                No matching results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
