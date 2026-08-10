"use client";

import { Gift, LayoutGrid, MapPin, Search, Store, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DirectoryLayout from "@/components/layout/DirectoryLayout";
import { ALL_FESTIVALS, POPULAR_FESTIVALS } from "@/lib/mock/mock-data";
import {
  ALPHA_LETTERS,
  POPULAR_MERCHANTS_SIDEBAR,
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

export default function CampaignsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [layoutType, setLayoutType] = useState("wide"); // 'compact' or 'wide'
  const [mounted, setMounted] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);

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

  const filteredFestivals = useMemo(() => {
    let list = ALL_FESTIVALS;
    if (activeLetter !== "all") {
      list = list.filter((f) => f.title.toUpperCase().startsWith(activeLetter));
    }
    if (searchQuery.trim()) {
      list = list.filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [activeLetter, searchQuery]);

  const availableLetters = useMemo(() => {
    const set = new Set(ALL_FESTIVALS.map((f) => f.title[0].toUpperCase()));
    return set;
  }, []);

  const visibleSidebarMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  const totalOffersCount = 596;
  const totalFestivals = ALL_FESTIVALS.length;

  return (
    <DirectoryLayout
      activeKey="Festivals"
      title="Festival Offers"
      icon={Gift}
      stat1={{
        count: totalFestivals,
        label: "Total Festival Offers",
        shortLabel: "Festivals",
      }}
      stat2={{ count: totalOffersCount, label: "Total Verified Offers" }}
      aboutTitle="About Festival Offers"
      aboutText="India's got no shortage of festivals, and we're here for it. From Diwali lights to Christmas cheer, Vouchiqo brings you epic deals to grab the best savings."
    >
      {/* ── POPULAR FESTIVALS SECTION ── */}
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
          Popular Festival Offers
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {POPULAR_FESTIVALS.map((fest) => {
            const totalOffers = (fest.coupons || 0) + (fest.offers || 0);
            return (
              <Link
                key={fest.title}
                href={`/category/${fest.slug}`}
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
                    <img
                      src={fest.image}
                      alt={fest.title}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%234685e8' stroke-width='2'%3E%3Cpath d='M20 12V22H4V12'/%3E%3Cpath d='M22 7H2v5h20V7z'/%3E%3Cpath d='M12 22V7'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px 14px",
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "center",
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
                      {fest.title}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#2563eb",
                        fontWeight: 600,
                        margin: "4px 0 0",
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

      {/* ── ALL FESTIVALS SECTION ── */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          padding: "16px 20px 20px",
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
            All Festival Offers
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
              <span
                style={{ fontSize: 13, fontWeight: 900, letterSpacing: -1 }}
              >
                ||
              </span>
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
              <span
                style={{ fontSize: 13, fontWeight: 900, letterSpacing: -1 }}
              >
                |||
              </span>
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
              background:
                activeLetter === "all" && !searchQuery ? "#4685e8" : "#f1f5f9",
              color:
                activeLetter === "all" && !searchQuery ? "#ffffff" : "#475569",
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
                disabled={!availableLetters.has(letter)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    activeLetter === letter ? "#4685e8" : "transparent",
                  color:
                    activeLetter === letter
                      ? "#ffffff"
                      : availableLetters.has(letter)
                        ? "#64748b"
                        : "#cbd5e1",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: availableLetters.has(letter) ? "pointer" : "default",
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
              placeholder="Search festivals by name..."
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

        {/* All Campaigns Grid */}
        {filteredFestivals.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                layoutType === "compact" ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
              gap: "16px 12px",
            }}
            className="all-festivals-responsive-grid"
          >
            {filteredFestivals.map((fest) => {
              const totalOffers = (fest.coupons || 0) + (fest.offers || 0);
              return (
                <Link
                  key={fest.slug}
                  href={`/category/${fest.slug}`}
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
                    <img
                      src={fest.image}
                      alt={fest.title}
                      style={{
                        maxHeight: "85%",
                        maxWidth: "85%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%234685e8' stroke-width='2'%3E%3Cpath d='M20 12V22H4V12'/%3E%3Cpath d='M22 7H2v5h20V7z'/%3E%3Cpath d='M12 22V7'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1e293b",
                      textAlign: "center",
                    }}
                  >
                    {fest.title}
                  </span>
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
              No festival offers found for &quot;{searchQuery}&quot;
            </p>
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
    </DirectoryLayout>
  );
}
