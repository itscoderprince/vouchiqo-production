// components/landing/PopularStores.jsx
"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BrandGridItem from "../shared/BrandGridItem";
import EmblaCarouselControls from "../shared/EmblaCarouselControls";

const POPULAR_STORES_LIST = [
  {
    name: "Amazon",
    logo: "/brandlogos/10015.jpg",
    href: "/brand/amazon",
    coupons: 25,
  },
  {
    name: "Myntra",
    logo: "/brandlogos/10021.jpg",
    href: "/brand/myntra",
    coupons: 19,
  },
  {
    name: "Air India",
    logo: "/brandlogos/10022.jpg",
    href: "/brand/air-india",
    coupons: 8,
  },
  {
    name: "Dell",
    logo: "/brandlogos/10007.jpg",
    href: "/brand/dell",
    coupons: 12,
  },
  {
    name: "AJIO",
    logo: "/brandlogos/10014.jpg",
    href: "/brand/ajio",
    coupons: 34,
  },
  {
    name: "UBER",
    logo: "/brandlogos/10018.jpg",
    href: "/brand/uber",
    coupons: 9,
  },
  {
    name: "MakeMyTrip",
    logo: "/brandlogos/10023.jpg",
    href: "/brand/makemytrip",
    coupons: 15,
  },
  {
    name: "Udemy",
    logo: "/brandlogos/10019.jpg",
    href: "/brand/udemy",
    coupons: 31,
  },
  {
    name: "Samsung",
    logo: "/brandlogos/10005.jpg",
    href: "/brand/samsung",
    coupons: 11,
  },
  {
    name: "BigRock",
    logo: "/brandlogos/10024.jpg",
    href: "/brand/bigrock",
    coupons: 6,
  },
  {
    name: "Nykaa",
    logo: "/brandlogos/10025.jpg",
    href: "/brand/nykaa",
    coupons: 18,
  },
  {
    name: "HP Shopping",
    logo: "/brandlogos/10009.jpg",
    href: "/brand/hp-shopping",
    coupons: 10,
  },
  {
    name: "Starbucks",
    logo: "/brandlogos/10026.jpg",
    href: "/brand/starbucks-coffee",
    coupons: 5,
  },
  {
    name: "Dominos Pizza",
    logo: "/brandlogos/10027.jpg",
    href: "/brand/dominos",
    coupons: 7,
  },
  {
    name: "Adidas",
    logo: "/brandlogos/10012.jpg",
    href: "/brand/adidas",
    coupons: 19,
  },
  {
    name: "Zara",
    logo: "/brandlogos/10028.jpg",
    href: "/brand/zara",
    coupons: 13,
  },
  {
    name: "JioMart",
    logo: "/brandlogos/10029.jpg",
    href: "/brand/jiomart",
    coupons: 16,
  },
  {
    name: "KFC",
    logo: "/brandlogos/10030.jpg",
    href: "/brand/kfc",
    coupons: 8,
  },
  {
    name: "Puma",
    logo: "/brandlogos/10011.jpg",
    href: "/brand/puma",
    coupons: 17,
  },
  {
    name: "Nike",
    logo: "/brandlogos/10010.jpg",
    href: "/brand/nike",
    coupons: 22,
  },
  {
    name: "Swiggy",
    logo: "/brandlogos/10031.jpg",
    href: "/brand/swiggy",
    coupons: 29,
  },
  {
    name: "Zomato",
    logo: "/brandlogos/10032.jpg",
    href: "/brand/zomato",
    coupons: 24,
  },
  {
    name: "Pharmeasy",
    logo: "/brandlogos/10033.jpg",
    href: "/brand/pharmeasy",
    coupons: 15,
  },
  {
    name: "Tata CLiQ",
    logo: "/brandlogos/10034.jpg",
    href: "/brand/tata-cliq",
    coupons: 12,
  },
];

export default function PopularStores() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const somBanner =
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop";
  const somLogo = "/brandlogos/10015.jpg";

  // Group into pages of 12 stores (3 rows of 4 columns)
  const itemsPerPage = 12;
  const totalSlides = Math.ceil(POPULAR_STORES_LIST.length / itemsPerPage);

  const slides = [];
  for (let i = 0; i < totalSlides; i++) {
    slides.push(
      POPULAR_STORES_LIST.slice(i * itemsPerPage, (i + 1) * itemsPerPage),
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  return (
    <section className="g-pop-store w-full select-none text-left overflow-hidden">
      {/* Custom Section Header with Embla Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-brand-text font-heading">
          Popular Stores
        </h2>
        <div className="flex items-center gap-4">
          <EmblaCarouselControls
            totalSlides={totalSlides}
            selectedIndex={selectedIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            onDotClick={setSelectedIndex}
          />
          <Link
            href="/deals"
            className="text-brand-blue text-xs font-semibold hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <div className="bg-brand-blue/5 rounded-full w-6 h-6 flex items-center justify-center">
              <ArrowRight className="w-3 h-3 text-brand-blue" />
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* ── Store of the Month Card ── */}
        <div className="lg:w-1/4">
          <Link
            href="/brand/amazon"
            className="gp-feat block relative no-underline cursor-pointer rounded-md"
          >
            {/* ── LAYER 1: Background photo — FIXED, does NOT move on hover ── */}
            <div
              className="gp-feat__banner"
              style={{ backgroundImage: `url(${somBanner})` }}
              role="img"
              aria-label="Store of the Month background"
            />

            {/* ── LAYER 2: Gradient scrim over photo for text readability ── */}
            <div className="gp-feat__scrim" />

            {/* ── LAYER 3: Title text — FIXED at top, overlays the photo ── */}
            <div className="gp-feat__title">
              <p
                style={{
                  color: "#D1DE31",
                  fontWeight: 900,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  margin: "0 0 4px",
                  lineHeight: 1,
                }}
              >
                Most Popular
              </p>
              <h3
                style={{
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "17px",
                  lineHeight: 1.25,
                  margin: 0,
                }}
              >
                Store Of The Month
              </h3>
            </div>

            {/* ── LAYER 4: Dark sliding box — bottom-anchored. ── */}
            <div
              className="gp-feat__box"
              style={{ backgroundColor: "#191F2E" }}
            >
              {/* Amazon logo image */}
              <div
                className="gp-feat__logo-img"
                style={{ backgroundColor: "#222938" }}
              >
                <img
                  src={somLogo}
                  alt="Amazon Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              {/* Stats row */}
              <div className="gp-feat__desc-wrap">
                <ul className="gp-feat__stats-ul">
                  <li>
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="#D1DE31"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.44 1.44 0 002.036 0l4.319-4.319a1.44 1.44 0 000-2.037L10.159 3.658A2.25 2.25 0 009.568 3z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 7.5h.008v.008H6V7.5z"
                      />
                    </svg>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "12px",
                        fontWeight: 700,
                        margin: "4px 0 0",
                      }}
                    >
                      0 Coupons
                    </p>
                  </li>
                  <li>
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="#D1DE31"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9l6 6m0-6L9 15m12-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "12px",
                        fontWeight: 700,
                        margin: "4px 0 0",
                      }}
                    >
                      71 Offers
                    </p>
                  </li>
                </ul>
              </div>

              {/* Mobile-only grab label */}
              <p className="gp-feat__grab-label">GRAB NOW</p>

              {/* Visit Store button */}
              <div className="gp-feat__extra">
                <button
                  type="button"
                  aria-label="Visit Store"
                  style={{
                    display: "block",
                    width: "100%",
                    backgroundColor: "#D1DE31",
                    color: "#191F2E",
                    fontWeight: 900,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "11px 0",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(209,222,49,0.4)",
                  }}
                >
                  Visit Store
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Sliding Grid of 12 Partner Stores per page (3 rows) ── */}
        <div className="gp-store-wrap lg:w-3/4 overflow-hidden">
          <div className="vouchiqo-carousel-viewport h-full">
            <div
              className="vouchiqo-carousel-container h-full flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
            >
              {slides.map((slideStores, slideIdx) => (
                <div
                  key={slideIdx}
                  className="vouchiqo-carousel-slide h-full w-full flex-shrink-0"
                >
                  <div
                    className="gp-store-grid grid grid-cols-2 md:grid-cols-4 gap-3 h-full"
                    style={{ gridTemplateRows: "repeat(3, 1fr)" }}
                  >
                    {slideStores.map((store, idx) => (
                      <BrandGridItem
                        key={idx}
                        name={store.name}
                        logo={store.logo}
                        href={store.href}
                        coupons={store.coupons}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ========================================
           GrabOn-style "Store of the Month" card
           ======================================== */

        /* Card shell */
        .gp-feat {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 1px 1px 6px 0px rgba(203,203,221,1), -1px -1px 6px 0px #F7F7F8;
          transition: box-shadow 300ms ease;
          display: block;
          height: 290px;
        }
        @media (min-width: 768px) {
          .gp-feat { height: 400px; }
        }
        .gp-feat:hover {
          box-shadow: 2px 2px 14px 0px rgba(150,150,200,0.5);
        }

        /* LAYER 1: Background photo — fills whole card, NEVER moves */
        .gp-feat__banner {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
        }

        /* LAYER 2: Gradient scrim */
        .gp-feat__scrim {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            to bottom,
            rgba(10, 14, 26, 0.72) 0%,
            rgba(10, 14, 26, 0.45) 40%,
            rgba(10, 14, 26, 0.05) 65%
          );
          pointer-events: none;
        }

        /* LAYER 3: Fixed title text */
        .gp-feat__title {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 4;
        }

        /* LAYER 4: Sliding dark box */
        .gp-feat__box {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 3;
          border-radius: 20px 20px 16px 16px;
          padding: 14px 16px 12px;
          transform: translateY(0);
          transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (min-width: 768px) {
          .gp-feat__box {
            transform: translateY(60px);
          }
          .gp-feat:hover .gp-feat__box {
            transform: translateY(0) !important;
          }
        }
        @media (max-width: 767px) {
          .gp-feat:hover .gp-feat__box {
            transform: translateY(8px);
          }
        }

        /* Amazon logo image container */
        .gp-feat__logo-img {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          height: 72px;
          margin-bottom: 12px;
        }
        @media (min-width: 768px) {
          .gp-feat__logo-img { height: 90px; }
        }

        /* Stats row */
        .gp-feat__stats-ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .gp-feat__stats-ul li {
          flex: 1;
          text-align: center;
          padding: 4px 0;
        }
        .gp-feat__stats-ul li + li {
          border-left: 1px dashed rgba(255,255,255,0.2);
        }

        /* Dashed divider reveals on hover */
        .gp-feat__desc-wrap {
          border-bottom: 2px dashed transparent;
          padding-bottom: 10px;
          transition: border-color 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gp-feat:hover .gp-feat__desc-wrap {
          border-color: rgba(255,255,255,0.15);
        }

        /* Mobile grab label */
        .gp-feat__grab-label {
          display: block;
          color: #D1DE31;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin: 6px 0 0;
        }
        @media (min-width: 768px) {
          .gp-feat__grab-label { display: none; }
        }

        /* Extra section */
        .gp-feat__extra {
          display: none;
        }
        @media (min-width: 768px) {
          .gp-feat__extra {
            display: block;
            margin-top: 10px;
          }
        }

        /* ── Right-side store grid ── */
        .gp-store-wrap {
          height: 290px;
        }
        @media (min-width: 1024px) {
          .gp-store-wrap {
            height: 400px;
          }
        }

        .gp-store-grid > a {
          height: 100%;
        }
      `}</style>
    </section>
  );
}
