"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/shared/listing/Breadcrumb";
import PageHeader from "@/components/shared/listing/PageHeader";
import Sidebar from "@/components/shared/listing/Sidebar";
import AlphaFilter from "@/components/shared/listing/AlphaFilter";
import ListingCard from "@/components/shared/listing/ListingCard";
import GridToggle from "@/components/shared/listing/GridToggle";
import EmptyResults from "@/components/shared/listing/EmptyResults";
import { MOCK_MERCHANTS_SEED, TRENDING_STORES } from "@/lib/mock/mock-data";

export default function MerchantsClient({
  merchants,
  totalMerchants,
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

  // Combine database merchants with mock merchants
  const allMergedMerchants = useMemo(() => {
    const dbFormatted = merchants.map((m, idx) => {
      let storeLogo = m.logo;
      if (!storeLogo) {
        const mockMatch = MOCK_MERCHANTS_SEED.find(
          (mock) =>
            mock.slug === m.slug ||
            mock.businessName.toLowerCase() === m.businessName.toLowerCase()
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

  // Filter merchants by search + alpha letter
  const filteredMerchantsList = useMemo(() => {
    let list = allMergedMerchants;
    if (activeLetter !== "all") {
      list = list.filter((m) =>
        m.businessName.toUpperCase().startsWith(activeLetter)
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((m) =>
        m.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [allMergedMerchants, activeLetter, searchQuery]);

  // Which letters are available for the merchants
  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedMerchants.map((m) => m.businessName[0].toUpperCase())
    );
    return set;
  }, [allMergedMerchants]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: "12px",
  };

  const breadcrumbSegments = [
    { label: "Home", href: "/" },
    { label: "Stores", href: "/merchants" },
  ];

  const headerStats = [
    { value: totalMerchants + 120, label: "Stores" },
    { value: `${(totalCoupons + 450).toLocaleString()}+`, label: "Coupons & Offers" },
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
      <rect x="3" y="9" width="7" height="12" rx="1" />
      <rect x="14" y="9" width="7" height="12" rx="1" />
      <path d="M3 5h18a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v0a2 2 0 0 0 2 2Z" />
    </svg>
  );

  const aboutText =
    "Who doesn't love a great deal? Vouchiqo brings you the best discounts from top stores like Amazon, Flipkart, Myntra, Nykaa, Swiggy, Domino's and more. From fashion shopping to food delivery, find active coupons.";

  return (
    <main style={{ background: "#f5f6fa", minHeight: "70vh", paddingBottom: 40 }}>
      <Breadcrumb segments={breadcrumbSegments} />
      <PageHeader
        title="Stores"
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
          activeNavKey="Stores"
          aboutTitle="About Stores"
          aboutText={aboutText}
        />

        <div>
          {/* Trending Merchants Section */}
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
              Trending Merchants
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {TRENDING_STORES.map((store) => (
                <ListingCard
                  key={store.businessName}
                  name={store.businessName}
                  slug={store.slug}
                  logo={store.logo}
                  coupons={store.coupons}
                  offers={store.offers}
                  logoHeight={95}
                />
              ))}
            </div>
          </section>

          {/* All Merchants Section */}
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
                All Merchants
              </h2>
              <GridToggle gridCols={gridCols} onGridChange={setGridCols} />
            </div>

            <AlphaFilter
              activeLetter={activeLetter}
              availableLetters={Array.from(availableLetters)}
              searchQuery={searchQuery}
              searchPlaceholder="Search by merchants name"
              onLetterChange={setActiveLetter}
              onSearchChange={setSearchQuery}
            />

            {filteredMerchantsList.length > 0 ? (
              <div style={gridStyle}>
                {filteredMerchantsList.map((m) => (
                  <ListingCard
                    key={m.slug}
                    name={m.businessName}
                    slug={m.slug}
                    logo={m.logo}
                    coupons={m.coupons}
                    offers={m.offers}
                  />
                ))}
              </div>
            ) : (
              <EmptyResults
                searchQuery={searchQuery}
                itemType="stores"
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
