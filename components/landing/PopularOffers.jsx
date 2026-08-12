"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import EmblaCarouselControls from "@/components/shared/EmblaCarouselControls";

const CATEGORY_GRADIENTS = {
  fashion: "linear-gradient(135deg, #f472b6, #db2777)",
  food: "linear-gradient(135deg, #fb923c, #ea580c)",
  electronics: "linear-gradient(135deg, #60a5fa, #2563eb)",
  beauty: "linear-gradient(135deg, #f472b6, #e11d48)",
  travel: "linear-gradient(135deg, #2dd4bf, #0d9488)",
  home: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  "home-improvement": "linear-gradient(135deg, #fbbf24, #d97706)",
  fitness: "linear-gradient(135deg, #34d399, #059669)",
  education: "linear-gradient(135deg, #818cf8, #4f46e5)",
  "kids-baby": "linear-gradient(135deg, #fbcfe8, #ec4899)",
  jewellery: "linear-gradient(135deg, #fde047, #ca8a04)",
  automotive: "linear-gradient(135deg, #9ca3af, #4b5563)",
  entertainment: "linear-gradient(135deg, #c084fc, #7e22ce)",
  grocery: "linear-gradient(135deg, #a7f3d0, #059669)",
  finance: "linear-gradient(135deg, #6ee7b7, #047857)",
  other: "linear-gradient(135deg, #38bdf8, #0284c7)",
};

function PopularOfferCard({ coupon }) {
  const val = coupon.rawDiscountValue || coupon.discountValue;
  const isNum = val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
  let discountFormatted = "SPECIAL DEAL";

  if (coupon.offerType === "deal" && coupon.salePrice) {
    if (coupon.originalPrice && coupon.originalPrice > coupon.salePrice) {
      const pct = Math.round(((coupon.originalPrice - coupon.salePrice) / coupon.originalPrice) * 100);
      discountFormatted = `${pct}% OFF`;
    } else {
      discountFormatted = `₹${coupon.salePrice} DEAL`;
    }
  } else if (coupon.discountType === "percentage" && isNum) {
    discountFormatted = `${val}% OFF`;
  } else if (coupon.discountType === "fixed" && isNum) {
    discountFormatted = `₹${val} OFF`;
  } else if (coupon.specialOfferType) {
    discountFormatted = coupon.specialOfferType.toUpperCase();
  } else if (typeof val === "string" && val.trim() && !isNum) {
    discountFormatted = val.toUpperCase();
  } else if (val) {
    discountFormatted = isNum ? `${val}% OFF` : String(val).toUpperCase();
  }

  const merchantName =
    coupon.merchantId?.businessName || coupon.merchantId?.name || "Partner";

  const coverImage =
    coupon.image ||
    coupon.banner ||
    coupon.merchantId?.banner ||
    coupon.merchantId?.logo ||
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop";

  const logoUrl =
    coupon.merchantId?.logo ||
    coupon.logo ||
    "/placeholder-brand.png";

  const isExclusive = coupon.isFeatured;

  return (
    <Link
      href={`/deals/${coupon._id}`}
      className="po-card group relative rounded-xl no-underline cursor-pointer block border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)] hover:border-blue-500 transition-all duration-300 select-none text-left overflow-hidden"
    >
      {/* LAYER 1: Full Background Banner Image */}
      <div className="po-card__banner absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={coupon.title || "Offer"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          draggable={false}
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* LAYER 2: White Content Box at Bottom */}
      <div className="po-card__box absolute bottom-0 left-0 w-full bg-white rounded-b-xl rounded-tl-[6px] px-3.5 pt-6 pb-3 sm:px-4 sm:pt-7 sm:pb-3.5">
        {/* LAYER 3: Circular Logo straddling top edge */}
        <div
          className="po-card__logo-wrap absolute flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-md"
          style={{
            width: "40px",
            height: "40px",
            top: "-22px",
            left: "14px",
            zIndex: 3,
          }}
        >
          <img
            src={logoUrl}
            referrerPolicy="no-referrer"
            alt={merchantName}
            className="w-7 h-7 object-contain p-0.5 rounded-full select-none pointer-events-none"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234685E8' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Discount Title */}
        <div className="mb-0.5">
          <p className="po-card__title text-left text-[13px] sm:text-[15px] font-extrabold uppercase tracking-tight text-[#3E80DD] leading-tight">
            {isExclusive ? "VOUCHIQO EXCLUSIVE" : discountFormatted}
          </p>
        </div>

        {/* Coupon Description / Title */}
        <div className="po-card__desc-wrap mb-2 pb-1.5">
          <p className="po-card__desc text-left text-[11px] sm:text-[12.5px] text-slate-800 leading-snug font-bold line-clamp-2">
            {coupon.title}
          </p>
        </div>

        {/* "GRAB NOW" text link for small screens */}
        <div className="po-card__grab sm:hidden mt-1">
          <span className="text-left text-[10px] font-black uppercase tracking-wider text-[#3E80DD]">
            GRAB NOW &rarr;
          </span>
        </div>

        {/* Hover Claim Now button (Desktop) */}
        <div className="po-card__extra hidden sm:block">
          <div className="po-card__redeem mt-1.5">
            <span
              className="po-card__redeem-btn block w-full rounded-md py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-white transition-all shadow-xs"
              style={{ backgroundColor: "#3E80DD" }}
            >
              Claim now
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .po-card {
          --anim-duration: 400ms;
          --anim-ease-v4: cubic-bezier(0.4, 0, 0.2, 1);
          --logo-lift: 36px;
          position: relative;
          height: 195px;
        }
        @media (min-width: 768px) {
          .po-card {
            height: 270px;
          }
        }

        .po-card__banner { z-index: 1; }
        .po-card__box { z-index: 2; }
        .po-card__logo-wrap { z-index: 3; }

        .po-card__banner {
          transition: transform var(--anim-duration) var(--anim-ease-v4);
        }
        .po-card:hover .po-card__banner {
          transform: translateY(calc(-1 * var(--logo-lift)));
        }

        .po-card__box {
          transform: translateY(0);
          transition: transform var(--anim-duration) var(--anim-ease-v4);
        }
        @media (min-width: 768px) {
          .po-card__box {
            transform: translateY(46px);
          }
          .po-card:hover .po-card__box {
            transform: translateY(0) !important;
          }
        }

        .po-card__desc-wrap {
          border-bottom: 2px dashed transparent;
          transition: border-color var(--anim-duration) var(--anim-ease-v4);
        }
        .po-card:hover .po-card__desc-wrap {
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </Link>
  );
}

/* ============================================
   POPULAR OFFERS SECTION (Single-Row Carousel)
   ============================================ */
export default function PopularOffers({ coupons = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [dragOffset, setDragOffset] = useState(0);

  // Swipe/drag refs
  const dragStart = useRef(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontalSwipe = useRef(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const finalItems = coupons.length > 0 ? coupons : [];
  const totalSlides = Math.ceil(finalItems.length / itemsPerPage);

  useEffect(() => {
    if (selectedIndex >= totalSlides && totalSlides > 0) {
      setSelectedIndex(0);
    }
  }, [totalSlides, selectedIndex]);

  // Auto-rotation effect for slides (6 seconds interval)
  useEffect(() => {
    if (totalSlides <= 1 || isDragging.current) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slides = [];
  for (let i = 0; i < totalSlides; i++) {
    slides.push(finalItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
  }

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Touch and Drag Handlers for Mobile & Desktop
  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    hasMoved.current = false;
    isHorizontalSwipe.current = null;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - dragStart.current;
    const diffY = currentY - dragStartY.current;

    if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
      hasMoved.current = true;
    }

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = false;
      }
    }

    if (isHorizontalSwipe.current) {
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragOffset < -45) {
      handleNext();
    } else if (dragOffset > 45) {
      handlePrev();
    }
    setDragOffset(0);
  };

  const handleMouseDown = (e) => {
    dragStart.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
    hasMoved.current = false;
    isHorizontalSwipe.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const diffX = e.clientX - dragStart.current;
    if (Math.abs(diffX) > 6) {
      hasMoved.current = true;
    }
    setDragOffset(diffX);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragOffset < -45) {
      handleNext();
    } else if (dragOffset > 45) {
      handlePrev();
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setDragOffset(0);
    }
  };

  if (finalItems.length === 0) return null;

  return (
    <section className="g-sub-banner text-left w-full select-none relative">
      {/* Custom Section Header with Carousel Controls */}
      <div className="flex justify-between items-center mb-5 sm:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-brand-text font-heading">
          Popular Offers of the Day
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

      {/* Carousel viewport & slides */}
      <div className="relative w-full">
        {/* Left Side Chevron for Desktop */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Viewport */}
        <div
          className="w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`w-full flex ${
              isDragging.current ? "transition-none" : "transition-transform duration-500 ease-in-out"
            }`}
            style={{
              transform: `translateX(calc(-${selectedIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {slides.map((slideItems, slideIdx) => (
              <div
                key={slideIdx}
                className="w-full flex-shrink-0 min-w-full"
              >
                {/* Single Row: 2 columns on mobile, 4 columns on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
                  {slideItems.map((coupon) => (
                    <PopularOfferCard key={coupon._id} coupon={coupon} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Chevron for Desktop */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Slide dots at bottom center */}
      {totalSlides > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`transition-all duration-300 ease-in-out rounded-full cursor-pointer h-1.5 ${
                i === selectedIndex
                  ? "w-7 bg-blue-600 opacity-100"
                  : "w-1.5 bg-slate-300 opacity-50 hover:opacity-100 hover:bg-blue-600"
              }`}
              onClick={() => setSelectedIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}


