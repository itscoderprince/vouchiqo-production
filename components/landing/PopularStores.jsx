// components/landing/PopularStores.jsx
"use client";

import { ArrowRight, Percent, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";
import EmblaCarouselControls from "../shared/EmblaCarouselControls";

const POPULAR_STORES_LIST = [
  {
    name: "Lenskart",
    logo: "/brandlogos/10012.jpg",
    href: "/brand/lenskart",
    coupons: 25,
  },
  {
    name: "Sonata",
    logo: "/brandlogos/10035.jpg",
    href: "/brand/sonata",
    coupons: 19,
  },
  {
    name: "Titan",
    logo: "/brandlogos/10035.jpg",
    href: "/brand/titan",
    coupons: 8,
  },
  {
    name: "Dell Store",
    logo: "/brandlogos/10007.jpg",
    href: "/brand/dell",
    coupons: 12,
  },
  {
    name: "Zara",
    logo: "/brandlogos/10028.jpg",
    href: "/brand/zara",
    coupons: 34,
  },
  {
    name: "Dominos Pizza",
    logo: "/brandlogos/10027.jpg",
    href: "/brand/dominos",
    coupons: 9,
  },
  {
    name: "Starbucks",
    logo: "/brandlogos/10026.jpg",
    href: "/brand/starbucks-coffee",
    coupons: 15,
  },
  {
    name: "KFC",
    logo: "/brandlogos/10030.jpg",
    href: "/brand/kfc",
    coupons: 31,
  },
  {
    name: "Samsung",
    logo: "/brandlogos/10005.jpg",
    href: "/brand/samsung",
    coupons: 11,
  },
  {
    name: "Puma",
    logo: "/brandlogos/10011.jpg",
    href: "/brand/puma",
    coupons: 6,
  },
  {
    name: "Nike",
    logo: "/brandlogos/10010.jpg",
    href: "/brand/nike",
    coupons: 18,
  },
  {
    name: "HP World",
    logo: "/brandlogos/10009.jpg",
    href: "/brand/hp-shopping",
    coupons: 10,
  },
  {
    name: "Biba",
    logo: "/brandlogos/10021.jpg",
    href: "/brand/biba",
    coupons: 5,
  },
  {
    name: "Westside",
    logo: "/brandlogos/10021.jpg",
    href: "/brand/westside",
    coupons: 7,
  },
  {
    name: "Shoppers Stop",
    logo: "/brandlogos/10021.jpg",
    href: "/brand/shoppers-stop",
    coupons: 19,
  },
  {
    name: "Decathlon",
    logo: "/brandlogos/10012.jpg",
    href: "/brand/decathlon",
    coupons: 13,
  },
  {
    name: "Fabindia",
    logo: "/brandlogos/10028.jpg",
    href: "/brand/fabindia",
    coupons: 16,
  },
  {
    name: "Bata",
    logo: "/brandlogos/10036.jpg",
    href: "/brand/bata",
    coupons: 8,
  },
  {
    name: "Pantaloons",
    logo: "/brandlogos/10021.jpg",
    href: "/brand/pantaloons",
    coupons: 17,
  },
  {
    name: "Max Fashion",
    logo: "/brandlogos/10028.jpg",
    href: "/brand/max-fashion",
    coupons: 22,
  },
  {
    name: "Raymond",
    logo: "/brandlogos/10028.jpg",
    href: "/brand/raymond",
    coupons: 29,
  },
  {
    name: "Peter England",
    logo: "/brandlogos/10012.jpg",
    href: "/brand/peter-england",
    coupons: 24,
  },
  {
    name: "Croma",
    logo: "/brandlogos/10008.jpg",
    href: "/brand/croma",
    coupons: 15,
  },
  {
    name: "Lakme Salon",
    logo: "/brandlogos/10025.jpg",
    href: "/brand/lakme-salon",
    coupons: 12,
  },
];

export default function PopularStores({ merchants = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Map database merchants into standard structure
  const dbStores = merchants.map((m) => ({
    name: m.businessName,
    logo: m.logo || "/placeholder-brand.png",
    href: `/brand/${m.slug}`,
    coupons: m.totalCoupons || 0,
    banner: m.banner,
    totalOffers: m.totalCoupons + (m.totalRedemptions || 0),
  }));

  // Combine with static list fallback to ensure at least 12 stores are shown
  const finalStoresList =
    dbStores.length >= 8
      ? dbStores
      : [
          ...dbStores,
          ...POPULAR_STORES_LIST.filter(
            (staticStore) =>
              !dbStores.some(
                (db) =>
                  db.name.toLowerCase() === staticStore.name.toLowerCase(),
              ),
          ),
        ];

  // Store of the Month (dynamic first merchant, or fallback)
  const firstDbMerchant = merchants[0];
  const somBanner =
    firstDbMerchant?.banner ||
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop";
  const somLogo = firstDbMerchant?.logo || "/brandlogos/10005.jpg";
  const somHref = firstDbMerchant
    ? `/brand/${firstDbMerchant.slug}`
    : "/brand/samsung";
  const somCoupons = firstDbMerchant ? firstDbMerchant.totalCoupons || 0 : 0;
  const somOffers = firstDbMerchant
    ? (firstDbMerchant.totalCoupons || 0) +
      (firstDbMerchant.totalRedemptions || 0)
    : 71;

  // Group into pages of stores (3 rows x 3 cols = 9 on mobile, 3 rows x 4 cols = 12 on desktop)
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(12);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(finalStoresList.length / itemsPerPage);

  // Auto-rotation effect for slides (5 seconds interval, infinite loop)
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slides = [];
  for (let i = 0; i < totalSlides; i++) {
    slides.push(
      finalStoresList.slice(i * itemsPerPage, (i + 1) * itemsPerPage),
    );
  }

  // Swipe/drag gestures
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    const dragEnd = e.changedTouches[0].clientX;
    const diff = dragStart.current - dragEnd;
    if (diff > 50) {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    } else if (diff < -50) {
      setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
    isDragging.current = false;
  };

  const handleMouseDown = (e) => {
    dragStart.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    const dragEnd = e.clientX;
    const diff = dragStart.current - dragEnd;
    if (diff > 50) {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    } else if (diff < -50) {
      setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
    isDragging.current = false;
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section className="g-pop-store w-full select-none text-left overflow-hidden">
      {/* Custom Section Header with Embla Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-brand-text font-heading">
          Popular Stores
        </h2>
        <div className="flex items-center gap-2 md:gap-4">
          <EmblaCarouselControls
            totalSlides={totalSlides}
            selectedIndex={selectedIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            onDotClick={setSelectedIndex}
            className="flex"
          />
          <Link
            href="/deals"
            className="text-brand-blue text-xs font-semibold hover:underline flex items-center gap-1 transition-colors shrink-0"
          >
            <span>View All</span>
            <div className="bg-brand-blue/5 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-brand-blue" />
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-stretch">
        {/* ── Store of the Month Card ── */}
        <div className="w-full lg:w-1/4 shrink-0 flex flex-col h-auto lg:h-[432px]">
          <Link
            href={somHref}
            className="flex-1 relative flex flex-col justify-between no-underline cursor-pointer rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] group transition-all duration-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] hover:border-blue-600 h-full"
          >
            {/* Background photo + scrim */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              style={{ backgroundImage: `url(${somBanner})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/25 via-slate-900/10 to-white pointer-events-none" />

            {/* Content Wrapper */}
            <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between h-full">
              {/* Top Title & Logo Box */}
              <div className="flex md:flex-col items-center md:items-start justify-between gap-3">
                {/* Logo Box */}
                <div className="w-28 h-16 md:w-full md:h-24 bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-500 transition-colors">
                  <img
                    src={somLogo}
                    alt="Store Logo"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                {/* Title Text */}
                <div className="text-right md:text-left flex-1 min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-blue-600 text-white tracking-wider uppercase mb-1 shadow-2xs">
                    Most Popular
                  </span>
                  <h3 className="text-[16px] sm:text-[20px] font-bold text-slate-900 leading-tight tracking-tight">
                    Store Of The Month
                  </h3>
                </div>
              </div>

              {/* Bottom Stats Bar with Dotted Divider */}
              <div className="mt-4 p-3 bg-blue-50/80 rounded-xl border border-blue-100 grid grid-cols-2 text-center divide-x divide-dashed divide-blue-200">
                <div className="flex items-center justify-center gap-1.5 px-2">
                  <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[12px] sm:text-[13px] font-bold text-slate-800 whitespace-nowrap">
                    {somCoupons} Offers
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 px-2">
                  <Percent className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[12px] sm:text-[13px] font-bold text-slate-800 whitespace-nowrap">
                    {somOffers} Offers
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Sliding Grid of Partner Stores (3 cols on mobile, 4 cols on desktop) ── */}
        <div className="gp-store-wrap lg:w-3/4 overflow-hidden">
          <div
            className="vouchiqo-carousel-viewport h-full cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
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
                    className="gp-store-grid grid grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 h-full"
                    style={{ gridTemplateRows: "repeat(3, 1fr)" }}
                  >
                    {slideStores.map((store, idx) => (
                      <BrandGridItem
                        key={idx}
                        name={store.name}
                        logo={store.logo}
                        banner={store.banner}
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
          border: 1px solid #cbd5e1;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
          transition: box-shadow 300ms ease;
          display: block;
          height: 290px;
        }
        @media (min-width: 768px) {
          .gp-feat { height: 432px; }
        }
        .gp-feat:hover {
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05);
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
          border: 1px solid #e2e8f0;
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
          border-left: 1px dashed #e2e8f0;
        }

        /* Dashed divider reveals on hover */
        .gp-feat__desc-wrap {
          border-bottom: 2px dashed transparent;
          padding-bottom: 10px;
          transition: border-color 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gp-feat:hover .gp-feat__desc-wrap {
          border-color: #e2e8f0 !important;
        }

        /* Mobile grab label button container */
        .gp-feat__grab-label {
          display: block;
          margin: 10px 0 0;
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
          height: 390px;
        }
        @media (min-width: 1024px) {
          .gp-store-wrap {
            height: 432px;
          }
        }

        .gp-store-grid > a {
          height: 100%;
        }
      `}</style>
    </section>
  );
}
