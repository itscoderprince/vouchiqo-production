"use client";

import { Gift, Sparkles, Tag, Ticket } from "lucide-react";
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
    active: true,
  },
  {
    label: "Cities Deals",
    href: "/nearby-offers",
    icon: "https://cdn.grabon.in/gograbon/v8/icons/allcities-small-icon-v2.svg",
  },
];

// Popular merchants (sidebar)
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

const POPULAR_FESTIVALS = [
  {
    title: "Amazon Prime Day",
    slug: "amazon-prime-day",
    coupons: 0,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636840/amazon-prime-day-logo.jpg",
  },
  {
    title: "Friendship Day",
    slug: "friendship-day",
    coupons: 9,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637732/friendship-day-logo.jpg",
  },
  {
    title: "Independence Day",
    slug: "independence-day",
    coupons: 8,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637985/independence-day-logo.jpg",
  },
  {
    title: "Onam",
    slug: "onam",
    coupons: 8,
    offers: 10,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638310/onam-logo.jpg",
  },
];

const ALL_FESTIVALS = [
  {
    title: "Amazon Prime Day",
    slug: "amazon-prime-day",
    coupons: 0,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636840/amazon-prime-day-logo.jpg",
  },
  {
    title: "Friendship Day",
    slug: "friendship-day",
    coupons: 9,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637732/friendship-day-logo.jpg",
  },
  {
    title: "Independence Day",
    slug: "independence-day",
    coupons: 8,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637985/independence-day-logo.jpg",
  },
  {
    title: "Onam",
    slug: "onam",
    coupons: 8,
    offers: 10,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638310/onam-logo.jpg",
  },
  {
    title: "Raksha Bandhan",
    slug: "rakshabandhan",
    coupons: 15,
    offers: 26,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638544/raksha-bandhan-logo.jpg",
  },
  {
    title: "Ganesh Chaturthi",
    slug: "ganeshchaturthi",
    coupons: 5,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637815/ganesh-chaturthi-logo.jpg",
  },
  {
    title: "Amazon Great Indian Sale",
    slug: "amazongreatindiansale",
    coupons: 4,
    offers: 8,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636363/amazon-great-indian-sale-logo.jpg",
  },
  {
    title: "Flipkart Big Billion Day Sale",
    slug: "flipkartbigbilliondaysale",
    coupons: 3,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637644/flipkart-big-billion-days-sale-logo.jpg",
  },
  {
    title: "Dussehra",
    slug: "dussehra",
    coupons: 18,
    offers: 23,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637321/dussehra-logo.jpg",
  },
  {
    title: "Black Friday",
    slug: "blackfriday",
    coupons: 10,
    offers: 23,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636918/black-friday-logo.jpg",
  },
  {
    title: "New Year",
    slug: "newyear",
    coupons: 8,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638152/new-year-offers-logo.jpg",
  },
  {
    title: "Cyber Monday",
    slug: "cyber-monday",
    coupons: 2,
    offers: 4,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637164/cyber-monday-logo.jpg",
  },
  {
    title: "Valentines Day",
    slug: "valentinesday",
    coupons: 5,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638853/valentine%27s-day-logo.jpg",
  },
  {
    title: "Christmas",
    slug: "christmas",
    coupons: 6,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637079/christmas-logo.jpg",
  },
  {
    title: "Flash Sale",
    slug: "flashsale",
    coupons: 15,
    offers: 33,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637562/flash-sale-logo.jpg",
  },
  {
    title: "Ugadi",
    slug: "ugadi",
    coupons: 8,
    offers: 16,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638777/ugadi-logo.jpg",
  },
  {
    title: "OMG Sale",
    slug: "omgsale",
    coupons: 3,
    offers: 4,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638232/omg-sale-logo.jpg",
  },
  {
    title: "Diwali",
    slug: "diwali",
    coupons: 5,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637240/diwali-logo.jpg",
  },
  {
    title: "Paytm Sale",
    slug: "paytmsale",
    coupons: 2,
    offers: 5,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638392/paytm-logo.jpg",
  },
  {
    title: "Children's Day",
    slug: "childrensday",
    coupons: 4,
    offers: 6,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636998/children%27s-day-logo.jpg",
  },
  {
    title: "Pongal",
    slug: "pongal",
    coupons: 8,
    offers: 16,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638468/pongal-logo.jpg",
  },
  {
    title: "Republic Day",
    slug: "republicday",
    coupons: 6,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638701/republic-day-logo.jpg",
  },
  {
    title: "Ramzan",
    slug: "ramzan",
    coupons: 7,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638619/ramzan-logo.jpg",
  },
  {
    title: "Mother's Day",
    slug: "mothersday",
    coupons: 15,
    offers: 24,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638067/mother%27s-day-logo.jpg",
  },
  {
    title: "Women's Day",
    slug: "womensday",
    coupons: 5,
    offers: 11,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638931/women%27s-day-logo.jpg",
  },
  {
    title: "Holi",
    slug: "holi",
    coupons: 8,
    offers: 17,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637893/holi-logo.jpg",
  },
  {
    title: "Fathers Day",
    slug: "fathersday",
    coupons: 18,
    offers: 36,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637480/father%27s-day-logo.jpg",
  },
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

export default function CampaignsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
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

  const visibleMerchantsList = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  // Filter festivals by search + letter
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

  // Letters with available items
  const availableLetters = useMemo(() => {
    const set = new Set(ALL_FESTIVALS.map((f) => f.title[0].toUpperCase()));
    return ALPHA_LETTERS.filter((l) => set.has(l));
  }, []);

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
              padding: 0,
              margin: 0,
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
            <li style={{ color: "#374151", fontWeight: 500 }}>
              Festival Offers
            </li>
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
              <Gift className="w-5 h-5 text-[#3b5bdb]" />
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
                Festival Offers
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
                  27
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>Total</span> Festival Offers
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
                  596
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>Total</span> Coupons &
                  Offers
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
              margin: 0,
            }}
          >
            Verified On: {formattedDate || "30 Jun 2026 (TUE)"}
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

          {/* About Festivals */}
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
              About Festival Offers
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
              India&apos;s got no shortage of festivals, and we&apos;re here for
              it. From Diwali lights to Christmas cheer, there&apos;s always a
              reason to celebrate and shop! Vouchiqo&apos;s got your back this
              season with epic deals to help you grab the best gifts and goodies
              without going over your budget. Whether you&apos;re treating
              yourself or spreading some festive joy, we&apos;ve got the offers
              that make saving as fun as shopping.
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
                <Link
                  key={fest.title}
                  href={`/category/${fest.slug}`}
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
                    {/* Image Banner */}
                    <div
                      style={{
                        height: 95,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        background: "#f8fafc",
                      }}
                    >
                      <img
                        src={fest.image}
                        alt={fest.title}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    {/* Divider line */}
                    <div style={{ height: 1, background: "#f1f3f9" }} />
                    {/* Content area */}
                    <div style={{ padding: "16px", textAlign: "left" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111827",
                          margin: "0 0 6px 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={fest.title}
                      >
                        {fest.title}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#3b5bdb]" />
                        <span>{fest.coupons} Coupons</span>
                        <span style={{ color: "#d1d5db" }}>•</span>
                        <Tag className="w-3.5 h-3.5 text-[#FF7A18]" />
                        <span>{fest.offers} Offers</span>
                      </div>
                    </div>
                  </div>
                </Link>
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
                All Festival Offers
              </h2>

              {/* Grid view toggle */}
              <div style={{ display: "flex", gap: 4 }}>
                {[2, 3, 4, 5].map((cols) => (
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
                      fontSize: 11,
                      fontWeight: 700,
                      color: gridCols === cols ? "#fff" : "#4b5563",
                      transition: "all 0.15s",
                    }}
                  >
                    {cols}C
                  </button>
                ))}
              </div>
            </div>

            {/* Filter controls row */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 20,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Alphabet Filters */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  flex: 1,
                  minWidth: 280,
                }}
              >
                <button
                  onClick={() => setActiveLetter("all")}
                  style={{
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 4,
                    border: "1px solid #e8eaf0",
                    background: activeLetter === "all" ? "#3b5bdb" : "#fff",
                    color: activeLetter === "all" ? "#fff" : "#4b5563",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                {ALPHA_LETTERS.map((letter) => {
                  const isAvailable = availableLetters.includes(letter);
                  return (
                    <button
                      key={letter}
                      disabled={!isAvailable}
                      onClick={() => setActiveLetter(letter)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        border: "1px solid #e8eaf0",
                        background:
                          activeLetter === letter
                            ? "#3b5bdb"
                            : isAvailable
                              ? "#fff"
                              : "#f9fafb",
                        color:
                          activeLetter === letter
                            ? "#fff"
                            : isAvailable
                              ? "#4b5563"
                              : "#d1d5db",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isAvailable ? "pointer" : "default",
                      }}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div style={{ position: "relative", width: 220 }}>
                <input
                  type="text"
                  placeholder="Search festival offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: 32,
                    padding: "0 12px 0 28px",
                    borderRadius: 6,
                    border: "1px solid #e8eaf0",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                {/* Search glass icon */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  style={{
                    position: "absolute",
                    left: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* Festivals Grid */}
            {filteredFestivals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#6b7280", fontSize: 13, fontWeight: 500 }}>
                  No festival offers found matching your criteria.
                </p>
              </div>
            ) : (
              <div style={gridStyle}>
                {filteredFestivals.map((fest) => (
                  <Link
                    key={fest.title}
                    href={`/category/${fest.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        border: "1px solid #e8eaf0",
                        borderRadius: 12,
                        background: "#fff",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s, transform 0.2s",
                        display: "flex",
                        flexDirection: "column",
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
                      {/* Image container */}
                      <div
                        style={{
                          height: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          background: "#f8fafc",
                        }}
                      >
                        <img
                          src={fest.image}
                          alt={fest.title}
                          style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      {/* Divider */}
                      <div style={{ height: 1, background: "#f1f3f9" }} />
                      {/* Description */}
                      <div style={{ padding: "12px", textAlign: "left" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                            margin: "0 0 4px 0",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={fest.title}
                        >
                          {fest.title}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                            margin: 0,
                            fontWeight: 500,
                          }}
                        >
                          {fest.coupons + fest.offers} Coupons & Offers
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
