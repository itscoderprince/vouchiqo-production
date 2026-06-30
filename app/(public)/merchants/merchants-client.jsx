"use client";

import { Tag, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Sidebar navigation links
const SIDEBAR_NAV = [
  {
    label: "Categories",
    href: "/categories",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allcategory-small-active.svg",
  },
  {
    label: "Stores",
    href: "/merchants",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allstores-small-icon-v2.svg",
    active: true,
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
const POPULAR_MERCHANTS_SIDEBAR = [
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

// Trending Merchants Slider data
const TRENDING_STORES = [
  {
    slug: "stylezone", // StyleZone fallback to Myntra
    businessName: "Myntra",
    logo: "/brandlogos/10021.jpg",
    coupons: 34,
    offers: 22,
  },
  {
    slug: "burger-house", // fallback to Air India
    businessName: "Air India",
    logo: "/brandlogos/10022.jpg",
    coupons: 48,
    offers: 30,
  },
  {
    slug: "techgadgets", // TechGadgets fallback to Dell
    businessName: "Dell",
    logo: "/brandlogos/10007.jpg",
    coupons: 8,
    offers: 6,
  },
  {
    slug: "ajio",
    businessName: "AJIO",
    logo: "/brandlogos/10014.jpg",
    coupons: 34,
    offers: 13,
  },
];

// Mock list of stores to fill the alphabet grids beautifully
const MOCK_MERCHANTS_SEED = [
  { businessName: "Zomato", slug: "zomato", coupons: 26, offers: 8 },
  { businessName: "Zivame", slug: "zivame", coupons: 57, offers: 15 },
  { businessName: "ZoomCar", slug: "zoomcar", coupons: 7, offers: 5 },
  { businessName: "Zappfresh", slug: "zappfresh", coupons: 18, offers: 4 },
  { businessName: "Zoomin", slug: "zoomin", coupons: 48, offers: 12 },
  { businessName: "ZOROY", slug: "zoroy", coupons: 7, offers: 3 },
  { businessName: "7NetLive", slug: "7netlive", coupons: 12, offers: 6 },
  { businessName: "Zestpics", slug: "zestpics", coupons: 18, offers: 9 },
  {
    businessName: "Zenith Nutrition",
    slug: "zenith-nutrition",
    coupons: 9,
    offers: 4,
  },
  { businessName: "Zyppys", slug: "zyppys", coupons: 11, offers: 5 },
  { businessName: "Zymrat", slug: "zymrat", coupons: 12, offers: 6 },
  { businessName: "Zoe", slug: "zoe", coupons: 10, offers: 4 },
  { businessName: "Zooty", slug: "zooty", coupons: 7, offers: 3 },
  { businessName: "Zostel", slug: "zostel", coupons: 18, offers: 9 },
  { businessName: "Zara", slug: "zara", coupons: 13, offers: 6 },
  { businessName: "Zebpay", slug: "zebpay", coupons: 7, offers: 3 },
  { businessName: "Zodiac", slug: "zodiac", coupons: 11, offers: 5 },
  { businessName: "Zoludio", slug: "zoludio", coupons: 13, offers: 6 },
  { businessName: "ZEE5", slug: "zee5", coupons: 8, offers: 3 },
  { businessName: "ZestMoney", slug: "zestmoney", coupons: 11, offers: 5 },
  { businessName: "ZoloStays", slug: "zolostays", coupons: 10, offers: 4 },
  { businessName: "Zoomcar Zap", slug: "zoomcar-zap", coupons: 11, offers: 5 },
  { businessName: "Zomato Gold", slug: "zomato-gold", coupons: 12, offers: 6 },
  { businessName: "ZALORA", slug: "zalora", coupons: 14, offers: 7 },
  { businessName: "Zoff Foods", slug: "zoff-foods", coupons: 8, offers: 4 },
  { businessName: "Zapvi", slug: "zapvi", coupons: 29, offers: 11 },
  { businessName: "Zebronics", slug: "zebronics", coupons: 16, offers: 7 },
  { businessName: "Zandu Care", slug: "zandu-care", coupons: 40, offers: 18 },
  { businessName: "Zarlin", slug: "zarlin", coupons: 13, offers: 6 },
  { businessName: "Zyro", slug: "zyro", coupons: 7, offers: 3 },
  { businessName: "Zingavita", slug: "zingavita", coupons: 11, offers: 5 },
  { businessName: "Zunpulse", slug: "zunpulse", coupons: 13, offers: 6 },
  { businessName: "Zool Retail", slug: "zool-retail", coupons: 9, offers: 4 },
  { businessName: "Zerodha", slug: "zerodha", coupons: 9, offers: 4 },
  { businessName: "Zingbus", slug: "zingbus", coupons: 14, offers: 7 },
  { businessName: "Zopto", slug: "zopto", coupons: 27, offers: 11 },
  { businessName: "Zouk", slug: "zouk", coupons: 32, offers: 15 },
  { businessName: "Zigly", slug: "zigly", coupons: 5, offers: 2 },
  { businessName: "Zoomcar Host", slug: "zoomcar-host", coupons: 9, offers: 4 },
  { businessName: "Zap Cricket", slug: "zap-cricket", coupons: 9, offers: 4 },
  { businessName: "Zety", slug: "zety", coupons: 10, offers: 4 },
  { businessName: "Zavya", slug: "zavya", coupons: 8, offers: 3 },
  { businessName: "Zeroharm", slug: "zeroharm", coupons: 13, offers: 6 },
  { businessName: "Zomunk", slug: "zomunk", coupons: 8, offers: 3 },
  { businessName: "Zulutrade", slug: "zulutrade", coupons: 8, offers: 4 },
  { businessName: "ZoogVPN", slug: "zoogvpn", coupons: 7, offers: 3 },
  { businessName: "Zoviz", slug: "zoviz", coupons: 11, offers: 5 },
  { businessName: "Zlade", slug: "zlade", coupons: 9, offers: 4 },
  { businessName: "Zink London", slug: "zink-london", coupons: 8, offers: 4 },
  {
    businessName: "Zonka Feedback",
    slug: "zonka-feedback",
    coupons: 8,
    offers: 4,
  },
  { businessName: "Zeligate", slug: "zeligate", coupons: 7, offers: 3 },
  { businessName: "Zop", slug: "zop", coupons: 9, offers: 4 },
  { businessName: "ZipWP", slug: "zipwp", coupons: 7, offers: 3 },
  { businessName: "Zoominfo", slug: "zoominfo", coupons: 8, offers: 4 },
  { businessName: "Zendesk", slug: "zendesk", coupons: 8, offers: 4 },
  { businessName: "Zapier", slug: "zapier", coupons: 7, offers: 3 },
  { businessName: "Zeemo", slug: "zeemo", coupons: 7, offers: 3 },
  { businessName: "Zoho", slug: "zoho", coupons: 7, offers: 3 },
  { businessName: "Zibaa", slug: "zibaa", coupons: 7, offers: 3 },
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

export default function MerchantsClient({
  merchants,
  totalMerchants,
  totalCoupons,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("Z"); // Match GrabOn screenshot default active 'Z'
  const [gridCols, setGridCols] = useState(4);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  const visibleMerchantsList = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  // Combine database merchants with mock merchants
  const allMergedMerchants = useMemo(() => {
    // Convert DB merchants to standard format
    const dbFormatted = merchants.map((m, idx) => ({
      businessName: m.businessName,
      slug: m.slug,
      coupons: m.totalCoupons || 3,
      offers: Math.ceil((m.totalCoupons || 3) * 0.7),
      isDb: true,
      logo: m.logo || `/brandlogos/${10002 + (idx % 42)}.jpg`,
    }));

    // Filter out duplicates if any
    const dbSlugs = new Set(dbFormatted.map((m) => m.slug));
    const mocks = MOCK_MERCHANTS_SEED.map((m, idx) => ({
      ...m,
      logo: `/brandlogos/${10002 + ((idx + dbFormatted.length) % 42)}.jpg`,
    })).filter((m) => !dbSlugs.has(m.slug));

    return [...dbFormatted, ...mocks];
  }, [merchants]);

  // Filter merchants list by search + active letter
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

  // Available letters
  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedMerchants.map((m) => m.businessName[0].toUpperCase()),
    );
    return ALPHA_LETTERS.filter((l) => set.has(l));
  }, [allMergedMerchants]);

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
            <li style={{ color: "#374151", fontWeight: 500 }}>Merchants</li>
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
              {/* Store Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b5bdb"
                strokeWidth="1.8"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.44-4A2 2 0 0 1 7.18 4h9.64a2 2 0 0 1 1.74 1L21 9" />
                <path d="M9 22V12h6v10" />
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
                Merchants
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
                  {totalMerchants + 59}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>{"Total"}</span>
                  {" Stores"}
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
                  {(totalCoupons + 480).toLocaleString()}+
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
            Verified On: {formattedDate}
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

          {/* About Stores */}
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
              About Stores
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
              Who doesn&apos;t love a great deal? Vouchiqo brings you the best
              discounts from top stores like Amazon, Flipkart, Myntra, Nykaa,
              Swiggy, Domino&apos;s and more. From fashion shopping to food
              delivery, find active coupons.
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
              {visibleMerchantsList.map((m) => (
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
                <Link
                  key={store.businessName}
                  href={`/brand/${store.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      border: "1px solid #e8eaf0",
                      borderRadius: 12,
                      background: "#fff",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, transform 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 6px 18px rgba(0,0,0,0.06)";
                      e.currentTarget.style.borderColor = "#3b5bdb";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#e8eaf0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Logo container */}
                    <div
                      style={{
                        height: 95,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px",
                        background: "#fff",
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
                      />
                    </div>
                    {/* Divider line */}
                    <div style={{ height: 1, background: "#f1f3f9" }} />
                    {/* Content area */}
                    <div style={{ padding: "16px", textAlign: "left" }}>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#111827",
                          margin: "0 0 6px 0",
                        }}
                      >
                        {store.businessName}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#3b5bdb]" />
                        <span>{store.coupons} Coupons</span>
                        <span style={{ color: "#d1d5db" }}>•</span>
                        <Tag className="w-3.5 h-3.5 text-[#FF7A18]" />
                        <span>{store.offers} Offers</span>
                      </div>
                    </div>
                  </div>
                </Link>
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
                All Merchants
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
                  placeholder="Search by merchants name"
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

            {/* Merchants Grid */}
            {filteredMerchantsList.length > 0 ? (
              <div style={gridStyle}>
                {filteredMerchantsList.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/brand/${m.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #e8eaf0",
                        borderRadius: 12,
                        background: "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 6px 18px rgba(0,0,0,0.05)";
                        e.currentTarget.style.borderColor = "#3b5bdb";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e8eaf0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Logo container */}
                      <div
                        style={{
                          height: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px",
                          background: "#fff",
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
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233b5bdb' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      {/* Divider line */}
                      <div style={{ height: 1, background: "#f1f3f9" }} />
                      {/* Content area */}
                      <div style={{ padding: "12px", textAlign: "left" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                            margin: "0 0 4px 0",
                          }}
                        >
                          {m.businessName}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          <Ticket className="w-3 h-3 text-[#3b5bdb]" />
                          <span>{m.coupons} Coupons</span>
                          <span style={{ color: "#d1d5db" }}>•</span>
                          <Tag className="w-3 h-3 text-[#FF7A18]" />
                          <span>{m.offers} Offers</span>
                        </div>
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
                  No stores found for &quot;{searchQuery}&quot;
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
