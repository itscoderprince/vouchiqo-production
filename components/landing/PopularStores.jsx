// components/landing/PopularStores.jsx
"use client";

import { ChevronLeft, ChevronRight, Percent, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";

export default function PopularStores({ merchants = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Map database merchants into standard structure
  const finalStoresList = useMemo(() => {
    return (merchants || []).map((m) => {
      const rawCat = m.category || "Deals";
      const cleanCat =
        rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();

      return {
        name: m.businessName || m.name || "Store Partner",
        logo: m.logo || "/placeholder-brand.png",
        href: `/brand/${m.slug}`,
        coupons: m.totalCoupons || 0,
        banner: m.banner,
        category: cleanCat,
        discount: m.maxDiscount
          ? `Up to ${m.maxDiscount}% OFF`
          : m.totalCoupons > 0
            ? `${m.totalCoupons} LIVE ${m.totalCoupons === 1 ? "OFFER" : "OFFERS"}`
            : null,
        isVerified: m.isVerified ?? m.status === "approved",
        totalOffers: (m.totalCoupons || 0) + (m.totalRedemptions || 0),
      };
    });
  }, [merchants]);

  // Store of the Month (Prioritize merchant with active coupons and complete branding)
  const storeOfTheMonth = useMemo(() => {
    return (
      merchants.find((m) => (m.totalCoupons || 0) > 0 && m.logo) ||
      merchants.find((m) => (m.totalCoupons || 0) > 0) ||
      merchants.find((m) => (m.totalRedemptions || 0) > 0) ||
      merchants[0]
    );
  }, [merchants]);

  const somName =
    storeOfTheMonth?.businessName ||
    storeOfTheMonth?.name ||
    "Featured Partner";
  const somCategory = storeOfTheMonth?.category
    ? `${storeOfTheMonth.category.charAt(0).toUpperCase() + storeOfTheMonth.category.slice(1).toLowerCase()} Deals`
    : "Verified Deals";
  const somBanner =
    storeOfTheMonth?.banner ||
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop";
  const somLogo = storeOfTheMonth?.logo || "/placeholder-brand.png";
  const somHref = storeOfTheMonth ? `/brand/${storeOfTheMonth.slug}` : "/deals";
  const somCoupons = storeOfTheMonth ? storeOfTheMonth.totalCoupons || 0 : 0;
  const somOffers = storeOfTheMonth
    ? (storeOfTheMonth.totalCoupons || 0) +
      (storeOfTheMonth.totalRedemptions || 0)
    : 0;
  const somDiscount = storeOfTheMonth?.maxDiscount
    ? `Up to ${storeOfTheMonth.maxDiscount}% OFF`
    : null;

  // Responsive grouping: 2 cols x 3 rows = 6 on phone, 3 cols x 3 rows = 9 on tablet, 4 cols x 3 rows = 12 on desktop
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(12);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.max(
    1,
    Math.ceil(finalStoresList.length / itemsPerPage),
  );

  // Reset index if out of range
  useEffect(() => {
    if (selectedIndex >= totalSlides) {
      setSelectedIndex(0);
    }
  }, [totalSlides, selectedIndex]);

  // Auto-rotation effect for slides (6 seconds interval, infinite loop)
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
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
    if (diff > 45) {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    } else if (diff < -45) {
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
    if (diff > 45) {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    } else if (diff < -45) {
      setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
    isDragging.current = false;
  };

  const handlePrev = (e) => {
    e?.preventDefault();
    setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.preventDefault();
    setSelectedIndex((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section className="g-pop-store w-full select-none text-left overflow-hidden">
      {/* Custom Section Header with Navigation Controls */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F72853] tracking-tight">
            Popular Stores
          </h2>
          <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {finalStoresList.length} Stores
          </span>
        </div>

        {totalSlides > 1 && (
          <div className="flex items-center gap-2">
            {/* Slide dots indicator */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    selectedIndex === idx
                      ? "w-4.5 bg-[#F72853]"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1 ml-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#F72853] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                aria-label="Previous stores"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#F72853] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                aria-label="Next stores"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 mt-1 sm:mt-2 items-stretch">
        {/* ── Store of the Month Card ── */}
        <div className="w-full lg:w-1/4 shrink-0 flex flex-col self-stretch">
          <Link
            href={somHref}
            className="flex-1 relative flex flex-col justify-between no-underline cursor-pointer rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs group transition-all duration-200 hover:shadow-[0_8px_20px_rgba(247,40,83,0.14)] hover:border-[#F72853] h-full min-h-[160px] sm:min-h-[220px]"
          >
            {/* Background photo + scrim */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              style={{ backgroundImage: `url(${somBanner})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/10 to-white pointer-events-none" />

            {/* Content Wrapper */}
            <div className="relative z-10 p-3.5 sm:p-4.5 flex flex-col justify-between h-full">
              {/* Top Title & Logo Box */}
              <div className="flex md:flex-col items-center md:items-start justify-between gap-3">
                {/* Logo Box */}
                <div className="w-20 h-14 sm:w-24 sm:h-16 md:w-full md:h-20 bg-white border border-slate-200/90 rounded-xl p-2 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-[#F72853]/40 transition-colors">
                  <img
                    src={somLogo}
                    alt={somName}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                {/* Title & Store Info */}
                <div className="text-right md:text-left flex-1 min-w-0">
                  <div className="flex items-center justify-end md:justify-start gap-1.5 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#F72853] text-white tracking-wider uppercase shadow-2xs">
                      Most Popular
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                      • Store Of The Month
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#F72853] transition-colors leading-tight tracking-tight line-clamp-1">
                    {somName}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-600 capitalize line-clamp-1 mt-0.5">
                    {somCategory}
                  </p>
                </div>
              </div>

              {/* Bottom Stats Bar with Dotted Divider */}
              <div className="mt-3 p-2 sm:p-2.5 bg-white/95 backdrop-blur-xs rounded-xl border border-rose-200/90 shadow-2xs grid grid-cols-2 text-center divide-x divide-dashed divide-rose-200">
                <div className="flex items-center justify-center gap-1.5 px-1.5 sm:px-2">
                  <Tag className="w-3.5 h-3.5 text-[#F72853] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">
                    {somCoupons > 0
                      ? `${somCoupons} Live ${somCoupons === 1 ? "Offer" : "Offers"}`
                      : "Verified Store"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 px-1.5 sm:px-2">
                  <Percent className="w-3.5 h-3.5 text-[#F72853] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-[#F72853] whitespace-nowrap">
                    {somDiscount ||
                      (somOffers > 0
                        ? `${somOffers} Redemptions`
                        : "Up to 50% OFF")}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Sliding Grid of Partner Stores (2 cols on mobile, 3 on tablet, 4 on desktop) ── */}
        <div className="gp-store-wrap lg:w-3/4 overflow-hidden">
          <div
            className="vouchiqo-carousel-viewport w-full cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div
              className="vouchiqo-carousel-container flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
            >
              {slides.map((slideStores, slideIdx) => (
                <div
                  key={slideIdx}
                  className="vouchiqo-carousel-slide w-full flex-shrink-0"
                >
                  <div className="gp-store-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {slideStores.map((store, idx) => (
                      <BrandGridItem
                        key={idx}
                        name={store.name}
                        logo={store.logo}
                        banner={store.banner}
                        category={store.category}
                        discount={store.discount}
                        href={store.href}
                        coupons={store.coupons}
                        isVerified={store.isVerified}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
