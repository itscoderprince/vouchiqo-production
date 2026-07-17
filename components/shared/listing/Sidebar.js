"use client";

import Link from "next/link";
import { useState } from "react";
import {
  POPULAR_MERCHANTS_SIDEBAR,
  SIDEBAR_NAV,
} from "@/utils/shared-navigation";

/**
 * Shared sidebar used by Brands, Categories, Merchants, Campaigns listing pages.
 * Contains navigation tabs, about section, and popular merchants list.
 *
 * @param {string} activeNavKey - The `label` from SIDEBAR_NAV that should be highlighted
 * @param {string} aboutTitle - Title for the "About" section
 * @param {string} aboutText - Description text for the "About" section
 */
export default function Sidebar({
  activeNavKey,
  aboutTitle = "About",
  aboutText = "",
}) {
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  const navWithActive = SIDEBAR_NAV.map((nav) => ({
    ...nav,
    active: nav.label === activeNavKey,
  }));

  const visibleMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  return (
    <aside>
      {/* Navigation Tabs */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e8eaf0",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {navWithActive.map((nav) => (
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

      {/* About Section */}
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
          {aboutTitle}
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
          {aboutText}
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
  );
}
