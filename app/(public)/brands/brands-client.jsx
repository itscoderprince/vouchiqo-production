"use client";

import { Tag, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Sidebar navigation links
const SIDEBAR_NAV = [
  {
    label: "Categories",
    href: "/categories",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allcategory-small-active.svg",
  },
  {
    label: "Stores",
    href: "/merchants",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allstores-small-icon-v2.svg",
  },
  {
    label: "Brands",
    href: "/brands",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allbrands-small-icon-v2.svg",
    active: true,
  },
  {
    label: "Festivals",
    href: "/campaigns",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allfestivals-small-icon-v2.svg",
  },
  {
    label: "Cities Deals",
    href: "/nearby-offers",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allcities-small-icon-v2.svg",
  },
];

// Popular merchants (sidebar)
const POPULAR_MERCHANTS_SIDEBAR = [
  { label: "Air India Coupons", href: "#" },
  { label: "Myntra Coupons", href: "#" },
  { label: "Amazon Coupons", href: "#" },
  { label: "Hostinger Coupons", href: "#" },
  { label: "Etihad Coupons", href: "#" },
  { label: "Samsung Coupons", href: "#" },
  { label: "Udemy Coupons", href: "#" },
  { label: "Puma Coupons", href: "#" },
  { label: "Myprotein Coupons", href: "#" },
  { label: "BigRock Coupons", href: "#" },
  { label: "RedBus Coupons", href: "#" },
  { label: "GoDaddy Coupons", href: "#" },
];

// Popular Brands Slider data (Samsung, OnePlus, Adidas, Lenovo)
const POPULAR_BRANDS = [
  {
    slug: "techgadgets", // maps to Samsung
    businessName: "Samsung",
    logo: "/brandlogos/10005.jpg",
    coupons: 1,
    offers: 53,
  },
  {
    slug: "oneplus",
    businessName: "OnePlus",
    logo: "/brandlogos/10006.jpg",
    coupons: 1,
    offers: 34,
  },
  {
    slug: "stylezone", // maps to Adidas
    businessName: "Adidas",
    logo: "/brandlogos/10012.jpg",
    coupons: 1,
    offers: 32,
  },
  {
    slug: "lenovo",
    businessName: "Lenovo",
    logo: "/brandlogos/10017.jpg",
    coupons: 4,
    offers: 32,
  },
];

// Mock list of brands starting with S (Samsung, Sony, Sparx, SOME BY MI) and others
const MOCK_BRANDS_SEED = [
  {
    businessName: "Samsung",
    slug: "samsung",
    logo: "/brandlogos/10005.jpg",
  },
  {
    businessName: "Sony",
    slug: "sony",
    logo: "/brandlogos/10035.jpg",
  },
  {
    businessName: "Sparx",
    slug: "sparx",
    logo: "/brandlogos/10036.jpg",
  },
  {
    businessName: "SOME BY MI",
    slug: "some-by-mi",
    logo: "/brandlogos/10037.jpg",
  },
  {
    businessName: "Adidas",
    slug: "adidas",
    logo: "/brandlogos/10012.jpg",
  },
  {
    businessName: "Apple",
    slug: "apple",
    logo: "/brandlogos/10013.jpg",
  },
  {
    businessName: "Asus",
    slug: "asus",
    logo: "/brandlogos/10008.jpg",
  },
  {
    businessName: "Dell",
    slug: "dell",
    logo: "/brandlogos/10007.jpg",
  },
  {
    businessName: "HP",
    slug: "hp",
    logo: "/brandlogos/10009.jpg",
  },
  {
    businessName: "Lenovo",
    slug: "lenovo",
    logo: "/brandlogos/10017.jpg",
  },
  {
    businessName: "Nike",
    slug: "nike",
    logo: "/brandlogos/10010.jpg",
  },
  {
    businessName: "Puma",
    slug: "puma",
    logo: "/brandlogos/10011.jpg",
  },
];

const ALPHA_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export default function BrandsClient({ brands, totalBrands, totalCoupons }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("S"); // Match second screenshot default active 'S'
  const [gridCols, setGridCols] = useState(4);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  const visibleMerchantsList = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  // Combine database brands with mock brands
  const allMergedBrands = useMemo(() => {
    const dbFormatted = brands.map((b, idx) => {
      // Find fallback logo if empty
      let brandLogo = b.logo;
      if (!brandLogo) {
        const mockMatch = MOCK_BRANDS_SEED.find(
          (m) =>
            m.slug === b.slug ||
            m.businessName.toLowerCase() === b.businessName.toLowerCase(),
        );
        brandLogo = mockMatch ? mockMatch.logo : "";
      }
      return {
        businessName: b.businessName,
        slug: b.slug,
        logo: brandLogo || `/brandlogos/${10002 + (idx % 42)}.jpg`,
        coupons: b.totalCoupons || 4,
        offers: Math.ceil((b.totalCoupons || 4) * 0.7) + 2,
      };
    });

    const dbSlugs = new Set(dbFormatted.map((b) => b.slug));
    const mocks = MOCK_BRANDS_SEED.map((m, idx) => ({
      businessName: m.businessName,
      slug: m.slug,
      logo:
        m.logo ||
        `/brandlogos/${10002 + ((idx + dbFormatted.length) % 42)}.jpg`,
      coupons: 12 + (idx % 25),
      offers: 8 + (idx % 15),
    })).filter((m) => !dbSlugs.has(m.slug));

    return [...dbFormatted, ...mocks];
  }, [brands]);

  // Filter brands by search + letter
  const filteredBrandsList = useMemo(() => {
    let list = allMergedBrands;
    if (activeLetter !== "all") {
      list = list.filter((b) =>
        b.businessName.toUpperCase().startsWith(activeLetter),
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((b) =>
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [allMergedBrands, activeLetter, searchQuery]);

  // Available letters
  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedBrands.map((b) => b.businessName[0].toUpperCase()),
    );
    return ALPHA_LETTERS.filter((l) => set.has(l));
  }, [allMergedBrands]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  }, [mounted]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: "12px",
  };

  return (
    <main style={{ background: "#f5f6fa", minHeight: "70vh" }}>
      {/* ── Breadcrumb + Title Section ─────────────────────── */}
      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid #e8eaf0",
          paddingBottom: 0,
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            maxWidth: 1248,
            margin: "0 auto",
            padding: "12px 20px 0",
          }}
        >
          <ul
            style={{
              display: "flex",
              gap: 8,
              listStyle: "none",
              fontSize: 13,
              color: "#6b7280",
              alignItems: "center",
            }}
          >
            <li>
              <Link
                href="/"
                style={{ color: "#3b5bdb", textDecoration: "none" }}
              >
                Home
              </Link>
            </li>
            <li style={{ color: "#9ca3af" }}>›</li>
            <li style={{ color: "#374151", fontWeight: 500 }}>Brands</li>
          </ul>
        </div>

        {/* Title Row */}
        <div
          style={{
            maxWidth: 1248,
            margin: "0 auto",
            padding: "16px 20px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Left: icon + title + stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* Tag Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b5bdb"
                strokeWidth="1.8"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Brands
              </h1>
            </div>
            <div style={{ display: "flex", gap: 24, marginLeft: 12 }}>
              <div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {totalBrands + 24}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>{"Total"}</span>
                  {" Brands"}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {(totalCoupons + 340).toLocaleString()}+
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>{"Total"}</span>
                  {" Coupons & Offers"}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Verified date */}
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Verified On: {formattedDate}
          </p>
        </div>
      </section>

      {/* ── Main Layout: Sidebar + Content ──────────────────── */}
      <div
        style={{
          maxWidth: 1248,
          margin: "0 auto",
          padding: "24px 20px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside>
          {/* Nav tabs */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eaf0",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {SIDEBAR_NAV.map((nav) => (
              <Link
                key={nav.label}
                href={nav.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 16px",
                  textDecoration: "none",
                  background: nav.active ? "#3b5bdb" : "transparent",
                  color: nav.active ? "#fff" : "#374151",
                  fontSize: 14,
                  fontWeight: nav.active ? 700 : 500,
                  borderBottom: "1px solid #f1f3f9",
                  transition: "background 0.15s",
                }}
              >
                <img
                  src={nav.icon}
                  alt={nav.label}
                  width={20}
                  height={20}
                  style={{
                    filter: nav.active ? "brightness(0) invert(1)" : "none",
                  }}
                />
                {nav.label}
              </Link>
            ))}
          </div>

          {/* About Brands */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eaf0",
              padding: "16px",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: "2px solid #3b5bdb",
                display: "inline-block",
              }}
            >
              About Brands
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.6,
                margin: 0,
                overflow: showMoreAbout ? "visible" : "hidden",
                display: "-webkit-box",
                WebkitLineClamp: showMoreAbout ? "unset" : 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              Brand loyalty doesn&apos;t have to mean paying full price. At
              Vouchiqo, we bring you the best discounts on the top names in
              fashion, electronics, and everything in between. Whether you are
              searching for premium tags or daily utility brands, discover
              active promo codes.
            </p>
            <button
              onClick={() => setShowMoreAbout((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#3b5bdb",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "6px 0 0",
              }}
            >
              {showMoreAbout ? "Less" : "More"}
            </button>
          </div>

          {/* Popular Merchants */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eaf0",
              padding: "16px",
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: "2px solid #3b5bdb",
                display: "inline-block",
              }}
            >
              Popular Merchants
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visibleMerchantsList.map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#3b5bdb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#374151";
                  }}
                >
                  {m.label}
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowAllMerchants((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#3b5bdb",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "8px 0 0",
              }}
            >
              {showAllMerchants ? "See less" : "See more"}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div>
          {/* Popular Brands Section */}
          <section
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eaf0",
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Popular Brands
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {POPULAR_BRANDS.map((brand) => (
                <Link
                  key={brand.businessName}
                  href={`/brand/${brand.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      border: "1px solid #e8eaf0",
                      borderRadius: 12,
                      background: "#fff",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, transform 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 6px 18px rgba(0,0,0,0.06)";
                      e.currentTarget.style.borderColor = "#3b5bdb";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#e8eaf0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Logo container */}
                    <div
                      style={{
                        height: 95,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px",
                        background: "#fff",
                      }}
                    >
                      <img
                        src={brand.logo}
                        alt={brand.businessName}
                        style={{
                          maxHeight: "85%",
                          maxWidth: "85%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    {/* Divider line */}
                    <div style={{ height: 1, background: "#f1f3f9" }} />
                    {/* Content area */}
                    <div style={{ padding: "16px", textAlign: "left" }}>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#111827",
                          margin: "0 0 6px 0",
                        }}
                      >
                        {brand.businessName}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#3b5bdb]" />
                        <span>{brand.coupons} Coupons</span>
                        <span style={{ color: "#d1d5db" }}>•</span>
                        <Tag className="w-3.5 h-3.5 text-[#FF7A18]" />
                        <span>{brand.offers} Offers</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* All Brands Section */}
          <section
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eaf0",
              padding: "20px",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#111827",
                  margin: 0,
                }}
              >
                All Brands
              </h2>

              {/* Grid view toggle */}
              <div style={{ display: "flex", gap: 4 }}>
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    title={`${cols} Columns`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid #e8eaf0",
                      background: gridCols === cols ? "#3b5bdb" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    {Array.from({ length: cols }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          display: "block",
                          width: gridCols === 4 ? 4 : gridCols === 3 ? 5 : 7,
                          height: 14,
                          borderRadius: 2,
                          background: gridCols === cols ? "#fff" : "#9ca3af",
                        }}
                      />
                    ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Alpha filter + Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "1px solid #f1f3f9",
              }}
            >
              {/* Alpha letters */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <button
                  onClick={() => setActiveLetter("all")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid",
                    borderColor: activeLetter === "all" ? "#3b5bdb" : "#e8eaf0",
                    background:
                      activeLetter === "all" ? "#3b5bdb" : "transparent",
                    color: activeLetter === "all" ? "#fff" : "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  All
                </button>
                {availableLetters.map((letter) => (
                  <button
                    key={letter}
                    onClick={() =>
                      setActiveLetter(activeLetter === letter ? "all" : letter)
                    }
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor:
                        activeLetter === letter ? "#3b5bdb" : "#e8eaf0",
                      background:
                        activeLetter === letter ? "#3b5bdb" : "transparent",
                      color: activeLetter === letter ? "#fff" : "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #e8eaf0",
                  borderRadius: 8,
                  padding: "7px 12px",
                  background: "#f9fafb",
                  minWidth: 200,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  placeholder="Search by brands name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: "#374151",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            {/* Brands Grid */}
            {filteredBrandsList.length > 0 ? (
              <div style={gridStyle}>
                {filteredBrandsList.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brand/${brand.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #e8eaf0",
                        borderRadius: 12,
                        background: "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 6px 18px rgba(0,0,0,0.05)";
                        e.currentTarget.style.borderColor = "#3b5bdb";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e8eaf0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Logo container */}
                      {/* Logo container */}
                      <div
                        style={{
                          height: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px",
                          background: "#fff",
                        }}
                      >
                        <img
                          src={brand.logo}
                          alt={brand.businessName}
                          style={{
                            maxHeight: "85%",
                            maxWidth: "85%",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233b5bdb' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      {/* Divider line */}
                      <div style={{ height: 1, background: "#f1f3f9" }} />
                      {/* Content area */}
                      <div style={{ padding: "12px", textAlign: "left" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                            margin: "0 0 4px 0",
                          }}
                        >
                          {brand.businessName}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          <Ticket className="w-3 h-3 text-[#3b5bdb]" />
                          <span>{brand.coupons} Coupons</span>
                          <span style={{ color: "#d1d5db" }}>•</span>
                          <Tag className="w-3 h-3 text-[#FF7A18]" />
                          <span>{brand.offers} Offers</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: 14 }}>
                  No brands found for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveLetter("all");
                  }}
                  style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #3b5bdb",
                    background: "#3b5bdb",
                    color: "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
