"use client";

import {
  CheckCircle2,
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
import { MOCK_MERCHANTS_SEED, TRENDING_STORES } from "@/lib/mock/mock-data";
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
        width: 16,
        height: 16,
        color: isActive ? "#ffffff" : "#4b5563",
        flexShrink: 0,
      }}
    />
  );
}

export default function MerchantsClient({
  merchants,
  totalMerchants,
  totalCoupons,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4);
  const [mounted, setMounted] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) {
        setSearchQuery(query);
        setActiveLetter("all");
      }
    }
  }, []);

  // Combine database merchants with mock merchants
  const allMergedMerchants = useMemo(() => {
    const dbFormatted = merchants.map((m, idx) => {
      let storeLogo = m.logo;
      if (!storeLogo) {
        const mockMatch = MOCK_MERCHANTS_SEED.find(
          (mock) =>
            mock.slug === m.slug ||
            mock.businessName.toLowerCase() === m.businessName.toLowerCase(),
        );
        storeLogo = mockMatch ? mockMatch.logo : "";
      }
      return {
        businessName: m.businessName,
        slug: m.slug,
        logo: storeLogo || `/brandlogos/${10002 + (idx % 42)}.jpg`,
        coupons: m.totalCoupons || 4,
        offers: Math.ceil((m.totalCoupons || 4) * 0.7) + 2,
      };
    });

    const dbSlugs = new Set(dbFormatted.map((m) => m.slug));
    const mocks = MOCK_MERCHANTS_SEED.map((m, idx) => ({
      businessName: m.businessName,
      slug: m.slug,
      logo:
        m.logo ||
        `/brandlogos/${10002 + ((idx + dbFormatted.length) % 42)}.jpg`,
      coupons: m.coupons || 12 + (idx % 25),
      offers: m.offers || 8 + (idx % 15),
    })).filter((m) => !dbSlugs.has(m.slug));

    return [...dbFormatted, ...mocks];
  }, [merchants]);

  const filteredMerchantsList = useMemo(() => {
    let list = allMergedMerchants;
    if (activeLetter !== "all") {
      list = list.filter((m) =>
        m.businessName.toUpperCase().startsWith(activeLetter),
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((m) =>
        m.businessName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [allMergedMerchants, activeLetter, searchQuery]);

  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedMerchants.map((m) => m.businessName[0].toUpperCase()),
    );
    return set;
  }, [allMergedMerchants]);

  const formattedDate = useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  }, [mounted]);

  const visibleSidebarMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 8);

  const totalOffersCount = totalCoupons + 450;

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
          <span style={{ color: "#111827", fontWeight: 500 }}>Stores</span>
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "24px",
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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 4,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #dbeafe",
              }}
            >
              <Store style={{ width: 20, height: 20, color: "#2563eb" }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#000000",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                Stores
              </h1>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
                Explore physical stores with verified local offers
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 24,
                marginLeft: 24,
                paddingLeft: 24,
                borderLeft: "1px solid #e5e7eb",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#000000",
                    margin: 0,
                  }}
                >
                  {totalMerchants + 120}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    fontWeight: 600,
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Total Stores
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#000000",
                    margin: 0,
                  }}
                >
                  {totalOffersCount.toLocaleString()}+
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    fontWeight: 600,
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Total Offers
                </p>
              </div>
            </div>
          </div>
          {formattedDate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f8fafc",
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              <CheckCircle2
                style={{ width: 14, height: 14, color: "#2563eb" }}
              />
              <span style={{ fontSize: 12, color: "#1e293b", fontWeight: 600 }}>
                Verified On: {formattedDate}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div
        style={{
          width: "100%",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 24,
          alignItems: "start",
        }}
        className="stores-grid-layout"
      >
        {/* ── SIDEBAR ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nav */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            {SIDEBAR_NAV.map((nav) => {
              const isActive = nav.label === "Stores";
              return (
                <Link
                  key={nav.label}
                  href={nav.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    textDecoration: "none",
                    background: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "#ffffff" : "#1f2937",
                    fontSize: 13,
                    fontWeight: 600,
                    borderBottom: "1px solid #f3f4f6",
                    transition: "all 0.2s",
                  }}
                  className={isActive ? "" : "sidebar-item-hover"}
                >
                  {getSidebarIcon(nav.label, isActive)}
                  <span>{nav.label}</span>
                </Link>
              );
            })}
          </div>

          {/* About */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px",
            }}
          >
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 10px 0",
                paddingBottom: 6,
                borderBottom: "2px solid #2563eb",
                display: "inline-block",
              }}
            >
              About Stores
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#4b5563",
                lineHeight: 1.6,
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: showMoreAbout ? "unset" : 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              Vouchiqo connects you with the best deals from physical stores in
              your city. From fashion brands and electronics showrooms to cafés
              and salons — discover verified local offers and save every time
              you shop in-store.
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
                display: "block",
              }}
            >
              {showMoreAbout ? "Show Less" : "Read More"}
            </button>
          </div>

          {/* Popular Stores */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px",
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 10px 0",
                paddingBottom: 6,
                borderBottom: "2px solid #2563eb",
                display: "inline-block",
              }}
            >
              Popular Stores
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
                    transition: "color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  className="sidebar-link-item"
                >
                  <span>{m.label}</span>
                  <ChevronRight
                    style={{ width: 12, height: 12, color: "#9ca3af" }}
                  />
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
                display: "block",
              }}
            >
              {showAllMerchants ? "See less" : "See more"}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Trending Stores */}
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
              Trending Stores
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {TRENDING_STORES.map((store) => {
                const totalOffers = store.coupons + store.offers;
                return (
                  <Link
                    key={store.businessName}
                    href={`/brand/${store.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        background: "#ffffff",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        transition: "all 0.2s ease-in-out",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      }}
                      className="brand-card-hover"
                    >
                      <div
                        style={{
                          height: 75,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#ffffff",
                        }}
                      >
                        <img
                          src={store.logo}
                          alt={store.businessName}
                          style={{
                            maxHeight: "85%",
                            maxWidth: "85%",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='1'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div style={{ height: 1, background: "#f3f4f6" }} />
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#000000",
                            margin: "0 0 2px 0",
                          }}
                        >
                          {store.businessName}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#2563eb",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {totalOffers} Active Offers
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* All Stores */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px 20px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#000000",
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                All Stores
              </h2>
              <div style={{ display: "flex", gap: 4 }}>
                {[3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    title={`${cols} Columns`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      background: gridCols === cols ? "#2563eb" : "#ffffff",
                      color: gridCols === cols ? "#ffffff" : "#4b5563",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                    className={gridCols === cols ? "" : "grid-btn-hover"}
                  >
                    <LayoutGrid style={{ width: 14, height: 14 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Alpha + Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <button
                  onClick={() => setActiveLetter("all")}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: activeLetter === "all" ? "#2563eb" : "#e5e7eb",
                    background:
                      activeLetter === "all" ? "#2563eb" : "transparent",
                    color: activeLetter === "all" ? "#ffffff" : "#4b5563",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  All
                </button>
                {ALPHA_LETTERS.map((letter) => (
                  <button
                    key={letter}
                    onClick={() =>
                      setActiveLetter(activeLetter === letter ? "all" : letter)
                    }
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor:
                        activeLetter === letter ? "#2563eb" : "#e5e7eb",
                      background:
                        activeLetter === letter ? "#2563eb" : "transparent",
                      color: activeLetter === letter ? "#ffffff" : "#1f2937",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  padding: "5px 10px",
                  background: "#ffffff",
                  minWidth: 200,
                }}
              >
                <Search style={{ width: 14, height: 14, color: "#9ca3af" }} />
                <input
                  placeholder="Search by store name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#000000",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            {/* Grid */}
            {filteredMerchantsList.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gap: "12px",
                }}
                className="all-stores-responsive-grid"
              >
                {filteredMerchantsList.map((m) => {
                  const totalOffers = m.coupons + m.offers;
                  return (
                    <Link
                      key={m.slug}
                      href={`/brand/${m.slug}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          background: "#ffffff",
                          padding: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          transition: "all 0.2s ease-in-out",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}
                        className="brand-card-hover"
                      >
                        <div
                          style={{
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#ffffff",
                          }}
                        >
                          <img
                            src={m.logo}
                            alt={m.businessName}
                            style={{
                              maxHeight: "85%",
                              maxWidth: "85%",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='1'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div style={{ height: 1, background: "#f3f4f6" }} />
                        <div style={{ textAlign: "center" }}>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#000000",
                              margin: "0 0 1px 0",
                            }}
                          >
                            {m.businessName}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#2563eb",
                              fontWeight: 600,
                              margin: 0,
                            }}
                          >
                            {totalOffers} Offers
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: 13 }}>
                  No stores found for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveLetter("all");
                  }}
                  style={{
                    marginTop: 12,
                    padding: "6px 12px",
                    borderRadius: 4,
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
        .sidebar-item-hover:hover {
          background: #f8fafc !important;
          color: #2563eb !important;
        }
        .sidebar-link-item:hover {
          color: #2563eb !important;
        }
        .brand-card-hover:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border-color: #2563eb !important;
          transform: translateY(-1px);
        }
        .grid-btn-hover:hover {
          background: #f8fafc !important;
          color: #2563eb !important;
          border-color: #2563eb !important;
        }
        @media (max-width: 900px) {
          .stores-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .all-stores-responsive-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}
