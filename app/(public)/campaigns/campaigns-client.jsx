"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/shared/listing/Breadcrumb";
import PageHeader from "@/components/shared/listing/PageHeader";
import Sidebar from "@/components/shared/listing/Sidebar";
import AlphaFilter from "@/components/shared/listing/AlphaFilter";
import ListingCard from "@/components/shared/listing/ListingCard";
import GridToggle from "@/components/shared/listing/GridToggle";
import EmptyResults from "@/components/shared/listing/EmptyResults";
import { ALL_FESTIVALS, POPULAR_FESTIVALS } from "@/lib/mock/mock-data";
import { Gift } from "lucide-react";

export default function CampaignsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4);
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

  // Filter festivals by search + letter
  const filteredFestivals = useMemo(() => {
    let list = ALL_FESTIVALS;
    if (activeLetter !== "all") {
      list = list.filter((f) => f.title.toUpperCase().startsWith(activeLetter));
    }
    if (searchQuery.trim()) {
      list = list.filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [activeLetter, searchQuery]);

  // Letters with available items
  const availableLetters = useMemo(() => {
    const set = new Set(ALL_FESTIVALS.map((f) => f.title[0].toUpperCase()));
    return set;
  }, []);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: "12px",
  };

  const breadcrumbSegments = [
    { label: "Home", href: "/" },
    { label: "Festival Offers", href: "/campaigns" },
  ];

  const headerStats = [
    { value: 27, label: "Festival Offers" },
    { value: 596, label: "Coupons & Offers" },
  ];

  const headerIcon = <Gift className="w-5 h-5 text-[#3b5bdb]" />;

  const aboutText =
    "India's got no shortage of festivals, and we're here for it. From Diwali lights to Christmas cheer, there's always a reason to celebrate and shop! Vouchiqo's got your back this season with epic deals to help you grab the best gifts and goodies without going over your budget. Whether you're treating yourself or spreading some festive joy, we've got the offers that make saving as fun as shopping.";

  return (
    <main style={{ background: "#f5f6fa", minHeight: "70vh", paddingBottom: 40 }}>
      <Breadcrumb segments={breadcrumbSegments} />
      <PageHeader
        title="Festival Offers"
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
          activeNavKey="Festivals"
          aboutTitle="About Festival Offers"
          aboutText={aboutText}
        />

        <div>
          {/* Popular Festival Offers Slider Section */}
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
              Popular Festival Offers
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {POPULAR_FESTIVALS.map((fest) => (
                <ListingCard
                  key={fest.title}
                  name={fest.title}
                  slug={fest.slug}
                  logo={fest.image}
                  coupons={fest.coupons}
                  offers={fest.offers}
                  href={`/category/${fest.slug}`}
                  logoHeight={95}
                />
              ))}
            </div>
          </section>

          {/* All Festivals Section */}
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
                All Festival Offers
              </h2>
              <GridToggle gridCols={gridCols} onGridChange={setGridCols} options={[2, 3, 4, 5]} />
            </div>

            <AlphaFilter
              activeLetter={activeLetter}
              availableLetters={Array.from(availableLetters)}
              searchQuery={searchQuery}
              searchPlaceholder="Search by festival name"
              onLetterChange={setActiveLetter}
              onSearchChange={setSearchQuery}
            />

            {filteredFestivals.length > 0 ? (
              <div style={gridStyle}>
                {filteredFestivals.map((fest) => (
                  <ListingCard
                    key={fest.slug}
                    name={fest.title}
                    slug={fest.slug}
                    logo={fest.image}
                    coupons={fest.coupons}
                    offers={fest.offers}
                    href={`/category/${fest.slug}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyResults
                searchQuery={searchQuery}
                itemType="festival offers"
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
