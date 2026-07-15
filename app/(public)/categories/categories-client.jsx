"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/shared/listing/Breadcrumb";
import PageHeader from "@/components/shared/listing/PageHeader";
import Sidebar from "@/components/shared/listing/Sidebar";
import AlphaFilter from "@/components/shared/listing/AlphaFilter";
import GridToggle from "@/components/shared/listing/GridToggle";
import EmptyResults from "@/components/shared/listing/EmptyResults";
import { POPULAR_CATEGORIES } from "@/lib/mock/mock-data";

function CategoryCard({ cat }) {
  return (
    <Link
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
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,91,219,0.1)";
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
  );
}

export default function CategoriesClient({
  categories,
  totalCategories,
  totalCoupons,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4);
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

  // Filter categories by search + alpha letter
  const filteredCategories = useMemo(() => {
    let list = categories;
    if (activeLetter !== "all") {
      list = list.filter((c) => c.title.toUpperCase().startsWith(activeLetter));
    }
    if (searchQuery.trim()) {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [categories, activeLetter, searchQuery]);

  // Which letters are available for the categories
  const availableLetters = useMemo(() => {
    const set = new Set(categories.map((c) => c.title[0].toUpperCase()));
    return set;
  }, [categories]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: "12px",
  };

  const breadcrumbSegments = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
  ];

  const headerStats = [
    { value: totalCategories, label: "Categories" },
    { value: `${totalCoupons.toLocaleString()}+`, label: "Coupons & Offers" },
  ];

  const headerIcon = (
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
  );

  const aboutText =
    "If there's a deal out there, we've already found it for you. Vouchiqo is your #1 coupon destination, bringing you the best deals on fashion, food, gadgets, travel, entertainment, and more. With thousands of verified offers from top brands, we make saving as easy as spending.";

  return (
    <main style={{ background: "#f5f6fa", minHeight: "70vh", paddingBottom: 40 }}>
      <Breadcrumb segments={breadcrumbSegments} />
      <PageHeader
        title="Categories"
        icon={headerIcon}
        stats={headerStats}
        verifiedDate={today}
      />

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
        <Sidebar
          activeNavKey="Categories"
          aboutTitle="About Categories"
          aboutText={aboutText}
        />

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
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>
                All Categories
              </h2>
              <GridToggle gridCols={gridCols} onGridChange={setGridCols} />
            </div>

            <AlphaFilter
              activeLetter={activeLetter}
              availableLetters={Array.from(availableLetters)}
              searchQuery={searchQuery}
              searchPlaceholder="Search by categories name"
              onLetterChange={setActiveLetter}
              onSearchChange={setSearchQuery}
            />

            {filteredCategories.length > 0 ? (
              <div style={gridStyle}>
                {filteredCategories.map((cat) => (
                  <CategoryCard key={cat.slug} cat={cat} />
                ))}
              </div>
            ) : (
              <EmptyResults
                searchQuery={searchQuery}
                itemType="categories"
                onClearFilter={() => {
                  setSearchQuery("");
                  setActiveLetter("all");
                }}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
