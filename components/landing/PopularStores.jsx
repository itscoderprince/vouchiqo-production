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
    logo: "https://companieslogo.com/img/orig/AMZN-e9f942e4.png",
    href: "/brand/amazon",
  },
  {
    name: "Myntra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png",
    href: "/brand/myntra",
  },
  {
    name: "Air India",
    logo: "https://companieslogo.com/img/orig/Air_India-709ea0f2.png",
    href: "/brand/air-india",
  },
  {
    name: "Dell",
    logo: "https://companieslogo.com/img/orig/DELL-c06f3680.png",
    href: "/brand/dell",
  },
  {
    name: "AJIO",
    logo: "https://companieslogo.com/img/orig/AJIO-007-Logo.png",
    href: "/brand/ajio",
  },
  {
    name: "UBER",
    logo: "https://companieslogo.com/img/orig/UBER-e5d8ff84.png",
    href: "/brand/uber",
  },
  {
    name: "MakeMyTrip",
    logo: "https://companieslogo.com/img/orig/MMYT-1eb8a614.png",
    href: "/brand/makemytrip",
  },
  {
    name: "Udemy",
    logo: "https://companieslogo.com/img/orig/Udemy_logo-2acfb1d2.png",
    href: "/brand/udemy",
  },
  {
    name: "Samsung",
    logo: "https://companieslogo.com/img/orig/SSNLF-6cbf2060.png",
    href: "/brand/samsung",
  },
  {
    name: "BigRock",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BigRock-Logo.svg/1024px-BigRock-Logo.svg.png",
    href: "/brand/bigrock",
  },
  {
    name: "Nykaa",
    logo: "https://companieslogo.com/img/orig/Nykaa-eb34c2bd.png",
    href: "/brand/nykaa",
  },
  {
    name: "HP Shopping",
    logo: "https://companieslogo.com/img/orig/HPQ-df1cb180.png",
    href: "/brand/hp-shopping",
  },
  {
    name: "Starbucks",
    logo: "https://companieslogo.com/img/orig/SBUX-6bbf2060.png",
    href: "/brand/starbucks-coffee",
  },
  {
    name: "Dominos Pizza",
    logo: "https://companieslogo.com/img/orig/DPZ-c06f3680.png",
    href: "/brand/dominos",
  },
  {
    name: "Adidas",
    logo: "https://companieslogo.com/img/orig/ADS.DE-c06f3680.png",
    href: "/brand/adidas",
  },
  {
    name: "Zara",
    logo: "https://companieslogo.com/img/orig/ITX.MC-c06f3680.png",
    href: "/brand/zara",
  },
  {
    name: "JioMart",
    logo: "https://companieslogo.com/img/orig/RELIANCE.NS-df1cb180.png",
    href: "/brand/jiomart",
  },
  {
    name: "KFC",
    logo: "https://companieslogo.com/img/orig/YUM-e9f942e4.png",
    href: "/brand/kfc",
  },
  {
    name: "Puma",
    logo: "https://companieslogo.com/img/orig/PUM.DE-e9f942e4.png",
    href: "/brand/puma",
  },
  {
    name: "Nike",
    logo: "https://companieslogo.com/img/orig/NKE-e9f942e4.png",
    href: "/brand/nike",
  },
  {
    name: "Swiggy",
    logo: "https://companieslogo.com/img/orig/Swiggy-181f5ecb.png",
    href: "/brand/swiggy",
  },
  {
    name: "Zomato",
    logo: "https://companieslogo.com/img/orig/Zomato_logo-181f5ecb.png",
    href: "/brand/zomato",
  },
  {
    name: "Pharmeasy",
    logo: "https://companieslogo.com/img/orig/API.NS-c06f3680.png",
    href: "/brand/pharmeasy",
  },
  {
    name: "Tata CLiQ",
    logo: "https://companieslogo.com/img/orig/TATASTEEL.NS-c06f3680.png",
    href: "/brand/tata-cliq",
  },
];

export default function PopularStores() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const somBanner =
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop";
  const somLogo =
    "https://cdn.grabon.in/gograbon/images/merchant/1773381281318/amazon-logo.jpg";

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
    <section className="g-pop-store bg-brand-surface py-12 select-none text-left overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="gp-feat block relative no-underline cursor-pointer rounded-2xl"
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
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
