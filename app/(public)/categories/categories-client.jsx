"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Sidebar navigation links
const SIDEBAR_NAV = [
  {
    label: "Categories",
    href: "/categories",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allcategory-small-active.svg",
    active: true,
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

// Popular merchants
const POPULAR_MERCHANTS = [
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

// Popular categories to show in the horizontal slider
const POPULAR_CATEGORIES = [
  {
    slug: "fashion",
    title: "Fashion",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648143/fashion.svg",
    coupons: "1,371",
    offers: "5,324",
  },
  {
    slug: "electronics",
    title: "Electronics",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647250/electronics.svg",
    coupons: "402",
    offers: "2,025",
  },
  {
    slug: "beauty",
    title: "Beauty",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409643778/beauty.svg",
    coupons: "1,345",
    offers: "4,650",
  },
  {
    slug: "travel",
    title: "Travel",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656824/travel.svg",
    coupons: "491",
    offers: "794",
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

export default function CategoriesClient({
  categories,
  totalCategories,
  totalCoupons,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const today = useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  }, [mounted]);

  const visibleMerchants = showAllMerchants
    ? POPULAR_MERCHANTS
    : POPULAR_MERCHANTS.slice(0, 6);

  // Filter categories by search + alpha letter
  const filteredCategories = useMemo(() => {
    let list = categories;
    if (activeLetter !== "all") {
      list = list.filter((c) => c.title.toUpperCase().startsWith(activeLetter));
    }
    if (searchQuery.trim()) {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [categories, activeLetter, searchQuery]);

  // Which letters are available for the categories
  const availableLetters = useMemo(() => {
    const set = new Set(categories.map((c) => c.title[0].toUpperCase()));
    return ALPHA_LETTERS.filter((l) => set.has(l));
  }, [categories]);

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
            <li style={{ color: "#374151", fontWeight: 500 }}>Categories</li>
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
              {/* Grid icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b5bdb"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
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
                Categories
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
                  {totalCategories}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>{"Total"}</span>
                  {" Categories"}
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
                  {totalCoupons.toLocaleString()}+
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
            Verified On: {today}
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

          {/* About */}
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
              About Categories
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
              If there&apos;s a deal out there, we&apos;ve already found it for
              you. Vouchiqo is your #1 coupon destination, bringing you the best
              deals on fashion, food, gadgets, travel, entertainment, and more.
              With thousands of verified offers from top brands, we make saving
              as easy as spending.
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
              {visibleMerchants.map((m) => (
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
          {/* Popular Categories horizontal scroll */}
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
              Popular Categories
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {POPULAR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      border: "1px solid #e8eaf0",
                      borderRadius: 12,
                      padding: "20px 16px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, transform 0.2s",
                      background: "#fff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 18px rgba(59,91,219,0.12)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <img
                      src={cat.icon}
                      alt={cat.title}
                      width={52}
                      height={52}
                      style={{ marginBottom: 10, objectFit: "contain" }}
                    />
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: 6,
                      }}
                    >
                      {cat.title}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          background: "#f5f6fa",
                          borderRadius: 4,
                          padding: "2px 6px",
                        }}
                      >
                        {cat.coupons} Coupons
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          background: "#f5f6fa",
                          borderRadius: 4,
                          padding: "2px 6px",
                        }}
                      >
                        {cat.offers} Offers
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* All Categories */}
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
                All Categories
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
                  placeholder="Search by categories name"
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

            {/* Categories Grid */}
            {filteredCategories.length > 0 ? (
              <div style={gridStyle}>
                {filteredCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #e8eaf0",
                        borderRadius: 10,
                        padding: "16px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        background: "#fff",
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b5bdb";
                        e.currentTarget.style.boxShadow =
                          "0 4px 14px rgba(59,91,219,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e8eaf0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <img
                        src={cat.icon}
                        alt={cat.title}
                        width={44}
                        height={44}
                        style={{ objectFit: "contain" }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: 4,
                          }}
                        >
                          {cat.title}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#3b5bdb" }}>
                            {cat.total}
                          </span>{" "}
                          Coupons &amp; Offers
                        </p>
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
                  No categories found for &quot;{searchQuery}&quot;
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
