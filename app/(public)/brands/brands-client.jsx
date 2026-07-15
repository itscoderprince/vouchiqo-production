"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/shared/listing/Breadcrumb";
import PageHeader from "@/components/shared/listing/PageHeader";
import Sidebar from "@/components/shared/listing/Sidebar";
import AlphaFilter from "@/components/shared/listing/AlphaFilter";
import ListingCard from "@/components/shared/listing/ListingCard";
import GridToggle from "@/components/shared/listing/GridToggle";
import EmptyResults from "@/components/shared/listing/EmptyResults";
import { MOCK_BRANDS_SEED, POPULAR_BRANDS } from "@/lib/mock/mock-data";

export default function BrandsClient({ brands, totalBrands, totalCoupons }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("S");
  const [gridCols, setGridCols] = useState(4);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Combine database brands with mock brands
  const allMergedBrands = useMemo(() => {
    const dbFormatted = brands.map((b, idx) => {
      let brandLogo = b.logo;
      if (!brandLogo) {
        const mockMatch = MOCK_BRANDS_SEED.find(
          (m) =>
            m.slug === b.slug ||
            m.businessName.toLowerCase() === b.businessName.toLowerCase()
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
        b.businessName.toUpperCase().startsWith(activeLetter)
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((b) =>
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [allMergedBrands, activeLetter, searchQuery]);

  // Available letters
  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedBrands.map((b) => b.businessName[0].toUpperCase())
    );
    return set;
  }, [allMergedBrands]);

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

  const breadcrumbSegments = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
  ];

  const headerStats = [
    { value: totalBrands + 24, label: "Brands" },
    { value: `${(totalCoupons + 340).toLocaleString()}+`, label: "Coupons & Offers" },
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
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );

  const aboutText =
    "Brand loyalty doesn't have to mean paying full price. At Vouchiqo, we bring you the best discounts on the top names in fashion, electronics, and everything in between. Whether you are searching for premium tags or daily utility brands, discover active promo codes.";

  return (
    <main style={{ background: "#f5f6fa", minHeight: "70vh", paddingBottom: 40 }}>
      <Breadcrumb segments={breadcrumbSegments} />
      <PageHeader
        title="Brands"
        icon={headerIcon}
        stats={headerStats}
        verifiedDate={formattedDate}
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
          activeNavKey="Brands"
          aboutTitle="About Brands"
          aboutText={aboutText}
        />

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
                <ListingCard
                  key={brand.businessName}
                  name={brand.businessName}
                  slug={brand.slug}
                  logo={brand.logo}
                  coupons={brand.coupons}
                  offers={brand.offers}
                  logoHeight={95}
                />
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
                All Brands
              </h2>
              <GridToggle gridCols={gridCols} onGridChange={setGridCols} />
            </div>

            <AlphaFilter
              activeLetter={activeLetter}
              availableLetters={Array.from(availableLetters)}
              searchQuery={searchQuery}
              searchPlaceholder="Search by brands name"
              onLetterChange={setActiveLetter}
              onSearchChange={setSearchQuery}
            />

            {filteredBrandsList.length > 0 ? (
              <div style={gridStyle}>
                {filteredBrandsList.map((brand) => (
                  <ListingCard
                    key={brand.slug}
                    name={brand.businessName}
                    slug={brand.slug}
                    logo={brand.logo}
                    coupons={brand.coupons}
                    offers={brand.offers}
                  />
                ))}
              </div>
            ) : (
              <EmptyResults
                searchQuery={searchQuery}
                itemType="brands"
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
