// components/landing/PopularStores.jsx
"use client";

import { ArrowRight, Percent, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";
import EmblaCarouselControls from "../shared/EmblaCarouselControls";

export default function PopularStores({ merchants = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dbMerchants, setDbMerchants] = useState(merchants || []);

  useEffect(() => {
    if (merchants && merchants.length > 0) {
      setDbMerchants(merchants);
    }
  }, [merchants]);

  // Map database merchants into standard structure (ONLY real merchants, NO static fake brands)
  const finalStoresList = (dbMerchants || []).map((m) => ({
    name: m.businessName || m.name || "Store Partner",
    logo: m.logo || "/placeholder-brand.png",
    href: `/brand/${m.slug}`,
    coupons: m.totalCoupons || 0,
    banner: m.banner,
    totalOffers: (m.totalCoupons || 0) + (m.totalRedemptions || 0),
  }));

  // Store of the Month (dynamic first real merchant)
  const firstDbMerchant = dbMerchants[0];
  const somBanner =
    firstDbMerchant?.banner ||
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop";
  const somLogo = firstDbMerchant?.logo || "/placeholder-brand.png";
  const somHref = firstDbMerchant
    ? `/brand/${firstDbMerchant.slug}`
    : "/deals";
  const somCoupons = firstDbMerchant ? firstDbMerchant.totalCoupons || 0 : 0;
  const somOffers = firstDbMerchant
    ? (firstDbMerchant.totalCoupons || 0) +
      (firstDbMerchant.totalRedemptions || 0)
    : 0;

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
      {/* Custom Section Header */}
      <div className="flex justify-between items-center mb-3.5 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-[#F72853] tracking-tight">
          Popular Stores
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-3 sm:mt-4 items-stretch">
        {/* ── Store of the Month Card ── */}
        <div className="w-full lg:w-1/4 shrink-0 flex flex-col h-auto lg:h-[432px]">
          <Link
            href={somHref}
            className="flex-1 relative flex flex-col justify-between no-underline cursor-pointer rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs group transition-all duration-200 hover:shadow-[0_8px_20px_rgba(247,40,83,0.14)] hover:border-[#F72853] h-full"
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
                <div className="w-24 h-14 md:w-full md:h-20 bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-[#F72853]/40 transition-colors">
                  <img
                    src={somLogo}
                    alt="Store Logo"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                {/* Title Text */}
                <div className="text-right md:text-left flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-medium bg-rose-50 text-[#F72853] border border-[#F72853]/30 tracking-wider uppercase mb-1 shadow-2xs">
                    Most Popular
                  </span>
                  <h3 className="text-sm sm:text-base font-medium text-slate-900 group-hover:text-[#F72853] transition-colors leading-tight tracking-tight">
                    Store Of The Month
                  </h3>
                </div>
              </div>

              {/* Bottom Stats Bar with Dotted Divider */}
              <div className="mt-3.5 p-2.5 bg-rose-50/40 rounded-xl border border-rose-100 grid grid-cols-2 text-center divide-x divide-dashed divide-rose-200">
                <div className="flex items-center justify-center gap-1.5 px-2">
                  <Tag className="w-3.5 h-3.5 text-[#F72853] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-normal text-slate-800 whitespace-nowrap">
                    {somCoupons} Offers
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 px-2">
                  <Percent className="w-3.5 h-3.5 text-[#F72853] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-normal text-slate-800 whitespace-nowrap">
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
