"use client";

import {
  ChevronRight,
  Gift,
  LayoutGrid,
  MapPin,
  Search,
  Store,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOCK_BRANDS_SEED, POPULAR_BRANDS } from "@/lib/mock/mock-data";
import {
  ALPHA_LETTERS,
  POPULAR_MERCHANTS_SIDEBAR,
  SIDEBAR_NAV,
} from "@/utils/shared-navigation";

const SIDEBAR_ICONS = {
  Categories: LayoutGrid,
  Stores: Store,
  Brands: Tag,
  Festivals: Gift,
  "Cities Deals": MapPin,
};

function getSidebarIcon(label, isActive) {
  const IconComponent = SIDEBAR_ICONS[label] || Tag;
  return (
    <IconComponent
      style={{
        width: 15,
        height: 15,
        color: isActive ? "#ffffff" : "#4b5563",
        flexShrink: 0,
      }}
    />
  );
}

export default function BrandsClient({ brands, totalBrands, totalCoupons }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4); // 3, 4, or 5 columns view
  const [mounted, setMounted] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) {
        setSearchQuery(query);
      }
    }
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

  // Combine database brands with mock brands
  const allMergedBrands = useMemo(() => {
    const dbFormatted = (brands || []).map((b) => {
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
        logo: brandLogo || "",
        coupons: b.totalCoupons || 1,
        offers: Math.ceil((b.totalCoupons || 1) * 0.7) + 2,
      };
    });

    const dbSlugs = new Set(dbFormatted.map((b) => b.slug));
    const mocks = MOCK_BRANDS_SEED.map((m, idx) => ({
      businessName: m.businessName,
      slug: m.slug,
      logo: m.logo || "",
      coupons: 1 + (idx % 3),
      offers: 8 + (idx % 15),
    })).filter((m) => !dbSlugs.has(m.slug));

    return [...dbFormatted, ...mocks];
  }, [brands]);

  // Available letters set
  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedBrands.map((b) => b.businessName[0].toUpperCase()),
    );
    return set;
  }, [allMergedBrands]);

  // Filter brands by search + A-Z active letter
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

  const visibleSidebarMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 8);

  const totalOffersCount = (totalCoupons || 0) + 1200;

  return (
    <main
      style={{
        background: "#ffffff",
        minHeight: "80vh",
        paddingBottom: 60,
        width: "100%",
      }}
    >
      {/* ── BREADCRUMB ── */}
      <div style={{ borderBottom: "1px solid #f3f4f6", background: "#ffffff" }}>
        <div
          style={{
            width: "100%",
            padding: "12px 24px",
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "#4b5563",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Home
          </Link>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ color: "#111827", fontWeight: 500 }}>Brands</span>
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 24px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #dbeafe",
              }}
            >
              <Tag style={{ width: 22, height: 22, color: "#2563eb" }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#000000",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Brands
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 12,
                  color: "#6b7280",
                  marginTop: 4,
                }}
              >
                <span>
                  <strong>{totalBrands || allMergedBrands.length}</strong> Total Brands
                </span>
                <span>
                  <strong>{totalOffersCount.toLocaleString()}</strong> Total Coupons &amp; Offers
                </span>
              </div>
            </div>
          </div>
          {formattedDate && (
            <span
              style={{
                fontSize: 12,
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              Verified On: {formattedDate}
            </span>
          )}
        </div>
      </section>

      {/* ── MAIN CONTENT WITH LEFT SIDEBAR ── */}
      <div
        style={{
          width: "100%",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 24,
        }}
        className="brands-main-grid"
      >
        {/* ── LEFT SIDEBAR ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Navigation Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              padding: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {SIDEBAR_NAV.map((nav) => {
              const isActive = nav.label === "Brands";
              return (
                <Link
                  key={nav.label}
                  href={nav.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 14px",
                      borderRadius: 4,
                      background: isActive ? "#2563eb" : "transparent",
                      color: isActive ? "#ffffff" : "#374151",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      marginBottom: 2,
                    }}
                  >
                    {getSidebarIcon(nav.label, isActive)}
                    <span>{nav.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* About Brands Sidebar Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 8,
                borderBottom: "2px solid #2563eb",
                paddingBottom: 4,
                display: "inline-block",
              }}
            >
              ABOUT BRANDS
            </h3>
            <p
              style={{
                fontSize: 11,
                color: "#4b5563",
                lineHeight: 1.5,
                margin: "8px 0 0",
              }}
            >
              Brand loyalty doesn&apos;t have to mean paying full price. At Vouchiqo, we bring you the best discounts on the top names in fashion, electronics, and everything in between. Whether...
            </p>
            <button
              onClick={() => setShowMoreAbout((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                padding: "6px 0 0",
              }}
            >
              {showMoreAbout ? "Read Less" : "Read More"}
            </button>
          </div>

          {/* Popular Stores Sidebar Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 12,
                borderBottom: "2px solid #2563eb",
                paddingBottom: 4,
                display: "inline-block",
              }}
            >
              POPULAR STORES
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visibleSidebarMerchants.map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  style={{
                    fontSize: 12,
                    color: "#4b5563",
                    textDecoration: "none",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{m.label} Offers</span>
                  <ChevronRight style={{ width: 13, height: 13, color: "#9ca3af" }} />
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowAllMerchants((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                padding: "8px 0 0",
                marginTop: 4,
              }}
            >
              {showAllMerchants ? "See less" : "See more"}
            </button>
          </div>
        </aside>

        {/* ── RIGHT MAIN CONTENT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Popular Brands Section */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px 20px 20px",
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#000000",
                marginBottom: 16,
                letterSpacing: "-0.2px",
              }}
            >
              Popular Brands
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      background: "#ffffff",
                      overflow: "hidden",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "left",
                      height: "100%",
                      transition: "all 0.2s ease",
                    }}
                    className="brand-card-hover"
                  >
                    <div
                      style={{
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#ffffff",
                        padding: 12,
                      }}
                    >
                      {brand.logo && !failedLogos[brand.slug] ? (
                        <img
                          src={brand.logo}
                          alt={brand.businessName}
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                          onError={() => {
                            setFailedLogos((prev) => ({
                              ...prev,
                              [brand.slug]: true,
                            }));
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                          }}
                        >
                          {brand.businessName?.[0]}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px 14px",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#000000",
                          margin: 0,
                        }}
                      >
                        {brand.businessName}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "#6b7280",
                          fontWeight: 600,
                          margin: "4px 0 0",
                        }}
                      >
                        {brand.coupons} Coupons • {brand.offers} Offers
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* All Brands Section */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px 20px 20px",
            }}
          >
            {/* Header: Title + Column Switcher (3, 4, 5 columns) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                All Brands
              </h2>

              {/* Column Switcher Buttons (|||, ||||, |||||) */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[3, 4, 5].map((cols) => {
                  const isActive = gridCols === cols;
                  return (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols)}
                      title={`${cols} Columns View`}
                      style={{
                        height: 32,
                        padding: "0 10px",
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: isActive ? "#2563eb" : "#e2e8f0",
                        background: isActive ? "#2563eb" : "#ffffff",
                        color: isActive ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        transition: "all 0.15s ease",
                        boxShadow: isActive
                          ? "0 2px 6px rgba(37,99,235,0.25)"
                          : "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          letterSpacing: "1px",
                          lineHeight: 1,
                        }}
                      >
                        {"|".repeat(cols)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Bar: A-Z Letters on Left, Search Box on Right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 18,
                paddingBottom: 14,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              {/* A-Z Letter Pills */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 4,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <button
                  onClick={() => setActiveLetter("all")}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "none",
                    background: activeLetter === "all" ? "#2563eb" : "transparent",
                    color: activeLetter === "all" ? "#ffffff" : "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  All
                </button>
                {ALPHA_LETTERS.map((letter) => {
                  const hasBrands = availableLetters.has(letter);
                  const isActive = activeLetter === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() =>
                        setActiveLetter(isActive ? "all" : letter)
                      }
                      disabled={!hasBrands}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "none",
                        background: isActive ? "#2563eb" : "transparent",
                        color: isActive
                          ? "#ffffff"
                          : hasBrands
                            ? "#475569"
                            : "#cbd5e1",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: hasBrands ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              {/* Search Box on Right */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "6px 12px",
                  background: "#ffffff",
                  minWidth: 230,
                }}
              >
                <Search style={{ width: 14, height: 14, color: "#94a3b8" }} />
                <input
                  placeholder="Search by brands name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#0f172a",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            {/* All Brands Grid with Dynamic Columns */}
            {filteredBrandsList.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gap: "12px",
                }}
                className="brands-responsive-grid"
              >
                {filteredBrandsList.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brand/${brand.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        background: "#ffffff",
                        padding: "16px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        textAlign: "center",
                        height: "100%",
                        transition: "all 0.2s ease",
                      }}
                      className="brand-card-hover"
                    >
                      <div
                        style={{
                          height: 52,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {brand.logo && !failedLogos[brand.slug] ? (
                          <img
                            src={brand.logo}
                            alt={brand.businessName}
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                            onError={() => {
                              setFailedLogos((prev) => ({
                                ...prev,
                                [brand.slug]: true,
                              }));
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 6,
                              background: "#eff6ff",
                              color: "#2563eb",
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                            }}
                          >
                            {brand.businessName?.[0]}
                          </div>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1e293b",
                          margin: 0,
                        }}
                      >
                        {brand.businessName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#94a3b8",
                }}
              >
                <p style={{ fontSize: 13 }}>
                  No brands found for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveLetter("all");
                  }}
                  style={{
                    marginTop: 12,
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .brand-card-hover:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border-color: #2563eb !important;
          transform: translateY(-1px);
        }
        @media (max-width: 900px) {
          .brands-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
