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
        width: 14,
        height: 14,
        color: isActive ? "#ffffff" : "#64748b",
        flexShrink: 0,
      }}
    />
  );
}

export default function BrandsClient({ brands, totalBrands, totalCoupons }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [layoutType, setLayoutType] = useState("wide"); // 'compact' or 'wide'
  const [mounted, setMounted] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) {
        setSearchQuery(query);
        setShowSearchBox(true);
        setActiveLetter("all");
      }
    }
  }, []);

  // Combine database brands with mock brands
  const allMergedBrands = useMemo(() => {
    const dbFormatted = brands.map((b, idx) => {
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

  const visibleMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  const totalOffersCount = totalCoupons + 340;

  return (
    <main
      style={{
        background: "#ffffff",
        minHeight: "80vh",
        paddingBottom: 60,
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          background: "#ffffff",
          minHeight: "80vh",
        }}
        className="brands-page-container w-full"
      >
        {/* ── BREADCRUMB (Clean & Simple) ── */}
        <div style={{ borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
          <div
            style={{
              padding: "12px 24px",
              display: "flex",
              gap: 8,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#4685e8",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Home
            </Link>
            <span style={{ color: "#cbd5e1" }}>/</span>
            <span style={{ color: "#334155", fontWeight: 600 }}>Brands</span>
          </div>
        </div>

        {/* ── PAGE HEADER (GrabOn Mockup Style) ── */}
        <section
          style={{
            background: "#ffffff",
            padding: "20px 24px 16px 24px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              <Tag style={{ width: 22, height: 22, color: "#475569" }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "#1e293b",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Brands
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: "12.5px",
                  color: "#64748b",
                  marginTop: 3,
                }}
              >
                <span>
                  Brands : <strong style={{ color: "#1e293b", fontWeight: 700 }}>{totalBrands}</strong>
                </span>
                <span>
                  Coupons & Offers :{" "}
                  <strong style={{ color: "#1e293b", fontWeight: 700 }}>
                    {totalOffersCount.toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TABS BAR (GrabOn Mockup Style) ── */}
        <div style={{ padding: "0 24px 16px 24px", width: "100%", background: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
              scrollbarWidth: "none",
            }}
            className="horizontal-tabs-scrollbar"
          >
            {SIDEBAR_NAV.map((nav) => {
              const isActive = nav.label === "Brands";
              return (
                <Link
                  key={nav.label}
                  href={nav.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: "9999px",
                    background: isActive ? "#4685e8" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    border: isActive ? "none" : "1px solid #e2e8f0",
                  }}
                  className={isActive ? "" : "inactive-tab-btn"}
                >
                  {getSidebarIcon(nav.label, isActive)}
                  <span>{nav.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── ABOUT BRANDS SECTION (GrabOn Mockup Style) ── */}
        <section
          style={{
            padding: "20px 24px 20px 24px",
            width: "100%",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#1e293b",
                margin: 0,
              }}
            >
              About Brands
            </h2>
            <div style={{ height: "1px", background: "#f1f5f9", width: "100%" }} />
            <p
              style={{
                fontSize: "13px",
                color: "#475569",
                lineHeight: 1.6,
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: showMoreAbout ? "unset" : 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              Brand loyalty doesn&apos;t have to mean paying full price. At
              Vouchiqo, we bring you the best discounts on the top names in
              fashion, electronics, and everything in between. Whether you&apos;re
              eyeing the latest gadget or a stylish new pair of kicks, we&apos;ve
              got promo codes from brands like Samsung, Nike, and more to help you
              get the best bang for your buck.
            </p>
            <button
              onClick={() => setShowMoreAbout((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#4685e8",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                alignSelf: "flex-start",
              }}
            >
              {showMoreAbout ? "Less" : "More"}
            </button>
          </div>
        </section>

        {/* ── POPULAR MERCHANTS SECTION (GrabOn Mockup Style) ── */}
        <section
          style={{
            padding: "0 24px 24px 24px",
            width: "100%",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#1e293b",
                margin: 0,
              }}
            >
              Popular Merchants
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleMerchants.map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  style={{
                    fontSize: "13px",
                    color: "#4685e8",
                    textDecoration: "none",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    alignSelf: "flex-start",
                  }}
                  className="popular-merchant-link"
                >
                  <span>{m.label} Coupons</span>
                  <svg
                    style={{ width: 13, height: 13, fill: "none", stroke: "#4685e8", strokeWidth: 2 }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowAllMerchants((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#4685e8",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                alignSelf: "flex-start",
                marginTop: 4,
              }}
            >
              {showAllMerchants ? "See less" : "See more"}
            </button>
          </div>
        </section>

        {/* ── POPULAR BRANDS SECTION (GrabOn Mockup Style) ── */}
        <section
          style={{
            padding: "0 24px 24px 24px",
            width: "100%",
            background: "#ffffff",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: 16,
            }}
          >
            Popular Brands
          </h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
              scrollbarWidth: "none",
            }}
            className="horizontal-tabs-scrollbar"
          >
            {POPULAR_BRANDS.map((brand) => {
              const totalOffers = brand.coupons + brand.offers;
              return (
                <Link
                  key={brand.businessName}
                  href={`/brand/${brand.slug}`}
                  style={{ textDecoration: "none", flexShrink: 0 }}
                >
                  <div
                    style={{
                      width: 190,
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      background: "#ffffff",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s ease",
                    }}
                    className="brand-card-hover"
                  >
                    <div
                      style={{
                        height: 90,
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
                            setFailedLogos((prev) => ({ ...prev, [brand.slug]: true }));
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-base border border-blue-100 uppercase">
                          {brand.businessName?.[0]}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "12px 14px",
                        borderTop: "1px solid #e2e8f0",
                        textAlign: "left",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#1e293b",
                          margin: 0,
                        }}
                      >
                        {brand.businessName}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          fontWeight: 600,
                          margin: "4px 0 0",
                        }}
                      >
                        {brand.coupons} Coupons • {brand.offers} Offers
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── ALL BRANDS SECTION (GrabOn Mockup Style) ── */}
        <section
          style={{
            padding: "0 24px 40px 24px",
            width: "100%",
            background: "#ffffff",
          }}
        >
          {/* Section Header with grid switcher */}
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
                fontSize: "16px",
                fontWeight: 800,
                color: "#1e293b",
                margin: 0,
              }}
            >
              All Brands
            </h2>

            {/* Layout switchers: || and ||| */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setLayoutType("compact")}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: layoutType === "compact" ? "#4685e8" : "#ffffff",
                  color: layoutType === "compact" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                className={layoutType === "compact" ? "" : "layout-btn-hover"}
                title="Compact View (||)"
              >
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: -1 }}>||</span>
              </button>
              <button
                onClick={() => setLayoutType("wide")}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: layoutType === "wide" ? "#4685e8" : "#ffffff",
                  color: layoutType === "wide" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                className={layoutType === "wide" ? "" : "layout-btn-hover"}
                title="Wide View (|||)"
              >
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: -1 }}>|||</span>
              </button>
            </div>
          </div>

          {/* Alphabet filters & Search button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: 12,
            }}
          >
            {/* Search Toggle Icon */}
            <button
              onClick={() => setShowSearchBox((v) => !v)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: showSearchBox ? "#eff6ff" : "#ffffff",
                color: showSearchBox ? "#4685e8" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Search style={{ width: 14, height: 14 }} />
            </button>

            {/* "All" button */}
            <button
              onClick={() => {
                setActiveLetter("all");
                setSearchQuery("");
              }}
              style={{
                padding: "0 14px",
                height: 32,
                borderRadius: "9999px",
                border: "none",
                background: activeLetter === "all" && !searchQuery ? "#4685e8" : "#f1f5f9",
                color: activeLetter === "all" && !searchQuery ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              All
            </button>

            {/* Alphabet letter strip */}
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                height: 32,
                alignItems: "center",
                scrollbarWidth: "none",
              }}
              className="horizontal-tabs-scrollbar"
            >
              {ALPHA_LETTERS.map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setActiveLetter(activeLetter === letter ? "all" : letter);
                    setSearchQuery("");
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "none",
                    background: activeLetter === letter ? "#4685e8" : "transparent",
                    color: activeLetter === letter ? "#ffffff" : "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Search box overlay */}
          {showSearchBox && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 12px",
                background: "#f8fafc",
                marginBottom: 16,
              }}
            >
              <Search style={{ width: 14, height: 14, color: "#94a3b8" }} />
              <input
                placeholder="Search brands by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "12.5px",
                  color: "#1e293b",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
          )}

          {/* All Brands Grid: centered logo inside card, centered name below card */}
          {filteredBrandsList.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  layoutType === "compact"
                    ? "repeat(3, 1fr)"
                    : "repeat(4, 1fr)",
                gap: "16px 12px",
              }}
              className="all-brands-responsive-grid"
            >
              {filteredBrandsList.map((brand) => {
                return (
                  <Link
                    key={brand.slug}
                    href={`/brand/${brand.slug}`}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        background: "#ffffff",
                        width: "100%",
                        height: 75,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                        transition: "all 0.2s ease",
                      }}
                      className="brand-card-hover"
                    >
                      {brand.logo && !failedLogos[brand.slug] ? (
                        <img
                          src={brand.logo}
                          alt={brand.businessName}
                          style={{
                            maxHeight: "85%",
                            maxWidth: "85%",
                            objectFit: "contain",
                          }}
                          onError={() => {
                            setFailedLogos((prev) => ({ ...prev, [brand.slug]: true }));
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-sm border border-blue-100 uppercase">
                          {brand.businessName?.[0]}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1e293b",
                        textAlign: "center",
                      }}
                    >
                      {brand.businessName}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 13 }}>No brands found for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveLetter("all");
                }}
                style={{
                  marginTop: 12,
                  padding: "6px 16px",
                  borderRadius: 9999,
                  border: "none",
                  background: "#4685e8",
                  color: "#ffffff",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .horizontal-tabs-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .inactive-tab-btn:hover {
          background: #f1f5f9 !important;
          color: #1e293b !important;
        }
        .popular-merchant-link:hover {
          text-decoration: underline !important;
        }
        .brand-card-hover:hover {
          box-shadow: 0 4px 16px rgba(70,133,232,0.08) !important;
          border-color: #4685e8 !important;
          transform: translateY(-2px);
        }
        .layout-btn-hover:hover {
          background: #f1f5f9 !important;
          color: #1e293b !important;
          border-color: #94a3b8 !important;
        }
        .all-brands-responsive-grid {
          grid-template-columns: ${
            layoutType === "compact"
              ? "repeat(5, 1fr)"
              : "repeat(6, 1fr)"
          };
        }
        @media (max-width: 1024px) {
          .all-brands-responsive-grid {
            grid-template-columns: ${
              layoutType === "compact"
                ? "repeat(4, 1fr) !important"
                : "repeat(5, 1fr) !important"
            };
          }
        }
        @media (max-width: 768px) {
          .all-brands-responsive-grid {
            grid-template-columns: ${
              layoutType === "compact"
                ? "repeat(3, 1fr) !important"
                : "repeat(4, 1fr) !important"
            };
          }
        }
        @media (max-width: 640px) {
          .all-brands-responsive-grid {
            grid-template-columns: ${
              layoutType === "compact"
                ? "repeat(2, 1fr) !important"
                : "repeat(3, 1fr) !important"
            };
          }
          .brands-page-container {
            box-shadow: none !important;
            padding: 0 12px !important;
          }
        }
      `}</style>
    </main>
  );
}
