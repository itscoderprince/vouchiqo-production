"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LEFT_BRANDS = [
  {
    id: 0,
    name: "Hostinger",
    slug: "hostinger",
    title: "Power your website with premium hosting",
    subtitle: "Hostinger Premium Web Hosting - Up to 75% OFF",
    buttonText: "Grab Coupon",
    image: "/herobanners/Offer%2520Code.jpg.jpeg",
    logo: "/brandlogos/10002.jpg",
    link: "/brand/hostinger",
  },
  {
    id: 1,
    name: "Redrail",
    slug: "redrail",
    title: "Book bus and train tickets across India online",
    subtitle: "Redrail Exclusive - Flat ₹500 OFF Ticket Bookings",
    buttonText: "Claim Discount",
    image: "/herobanners/Coupon%2520Codes.jpg.jpeg",
    logo: "/brandlogos/10003.jpg",
    link: "/brand/redrail",
  },
  {
    id: 2,
    name: "Coursera",
    slug: "coursera",
    title: "Meet new goals with midyear savings",
    subtitle: "Coursera Plus - Limited Time 40% OFF",
    buttonText: "Explore Offer",
    image: "/herobanners/Discount%2520Codes.jpg.jpeg",
    logo: "/brandlogos/10004.jpg",
    link: "/brand/coursera",
  },
  {
    id: 3,
    name: "Samsung",
    slug: "samsung",
    title: "Discover the latest tech innovations",
    subtitle: "Samsung Electronics - Flat 15% OFF",
    buttonText: "Grab Deal",
    image: "/herobanners/Coupon%2520Codes.jpg_1.jpeg",
    logo: "/brandlogos/10005.jpg",
    link: "/brand/samsung",
  },
  {
    id: 4,
    name: "OnePlus",
    slug: "oneplus",
    title: "Never Settle with exclusive phone discounts",
    subtitle: "OnePlus Store - Up to ₹5000 Instant Discount",
    buttonText: "Claim Offer",
    image: "/herobanners/Discount%2520Codes.jpg_1.jpeg",
    logo: "/brandlogos/10006.jpg",
    link: "/brand/oneplus",
  },
  {
    id: 5,
    name: "Dell",
    slug: "dell",
    title: "Upgrade your productivity gear today",
    subtitle: "Dell Laptops & Accessories - Up to 45% OFF",
    buttonText: "Save Now",
    image: "/herobanners/Coupon%2520Codes.jpg_2.jpeg",
    logo: "/brandlogos/10007.jpg",
    link: "/brand/dell",
  },
  {
    id: 6,
    name: "Asus",
    slug: "asus",
    title: "Unleash your creative power",
    subtitle: "Asus ROG & Zenbook - Up to 35% OFF",
    buttonText: "Explore",
    image: "/herobanners/Discount%2520Codes.jpg_2.jpeg",
    logo: "/brandlogos/10008.jpg",
    link: "/brand/asus",
  },
  {
    id: 7,
    name: "HP",
    slug: "hp",
    title: "Print and compute with ease",
    subtitle: "HP Store Deals - Flat ₹2000 OFF on Select Laptops",
    buttonText: "Save Big",
    image: "/herobanners/Coupon%2520Codes.jpg_3.jpeg",
    logo: "/brandlogos/10009.jpg",
    link: "/brand/hp-shopping",
  },
  {
    id: 8,
    name: "Nike",
    slug: "nike",
    title: "Just Do It with discount sportswear",
    subtitle: "Nike Store - Up to 40% OFF Select Shoes",
    buttonText: "Explore Shoes",
    image: "/herobanners/Discount%2520Codes.jpg_3.jpeg",
    logo: "/brandlogos/10010.jpg",
    link: "/brand/nike",
  },
  {
    id: 9,
    name: "Puma",
    slug: "puma",
    title: "Run faster, feel lighter",
    subtitle: "Puma End of Season - Flat 50% OFF Sitewide",
    buttonText: "Shop Puma",
    image: "/herobanners/Coupon%2520Codes.jpg_4.jpeg",
    logo: "/brandlogos/10011.jpg",
    link: "/brand/puma",
  },
  {
    id: 10,
    name: "Adidas",
    slug: "adidas",
    title: "Impossible is nothing with style and savings",
    subtitle: "Adidas Apparel & Accessories - Up to 30% OFF",
    buttonText: "Get Adidas",
    image: "/herobanners/Discount%2520Codes.jpg_4.jpeg",
    logo: "/brandlogos/10012.jpg",
    link: "/brand/adidas",
  },
  {
    id: 11,
    name: "Apple",
    slug: "apple",
    title: "Think different with premium Apple products",
    subtitle: "Apple Store India - Exclusive Student Discounts",
    buttonText: "Get Apple",
    image: "/herobanners/Coupon%2520Codes.jpg_5.jpeg",
    logo: "/brandlogos/10013.jpg",
    link: "/brand/apple",
  },
  {
    id: 12,
    name: "Ajio",
    slug: "ajio",
    title: "Giant Fashion Sale is live now",
    subtitle: "AJIO Deals - Flat 22% OFF",
    buttonText: "View Clothes",
    image: "/herobanners/Discount%2520Codes.jpg_5.jpeg",
    logo: "/brandlogos/10014.jpg",
    link: "/brand/ajio",
  },
  {
    id: 13,
    name: "Amazon",
    slug: "amazon",
    title: "Everything you need, delivered tomorrow",
    subtitle: "Amazon Super Deals - Up to 80% OFF",
    buttonText: "Shop Amazon",
    image: "/herobanners/Coupon%2520Codes.jpg_6.jpeg",
    logo: "/brandlogos/10015.jpg",
    link: "/brand/amazon",
  },
  {
    id: 14,
    name: "Klook",
    slug: "klook",
    title: "Plan your next holiday adventures online",
    subtitle: "Klook Travel Deals - Up to 50% OFF Activities",
    buttonText: "Book Travel",
    image: "/herobanners/Coupon%2520Codes.jpg_7.jpeg",
    logo: "/brandlogos/10016.jpg",
    link: "/brand/klook",
  },
  {
    id: 15,
    name: "Lenovo",
    slug: "lenovo",
    title: "Smarter technology for all",
    subtitle: "Lenovo ThinkPad & Legion - Save up to 40%",
    buttonText: "Buy Tech",
    image: "/herobanners/Coupon%2520Codes.jpg_8.jpeg",
    logo: "/brandlogos/10017.jpg",
    link: "/brand/lenovo",
  },
];

const RIGHT_BRANDS = [
  {
    id: 0,
    name: "Uber",
    slug: "uber",
    title: "UBER PROMO",
    headline: "FLAT 50% OFF",
    description:
      "Flat 50% OFF First 3 Uber Rides — Up to ₹100 Per Ride. Valid for new users.",
    image: "/herobanners/Offer%2520Code.jpg.jpeg",
    logo: "/brandlogos/10018.jpg",
    buttonText: "GRAB NOW",
    link: "/brand/uber",
  },
  {
    id: 1,
    name: "Udemy",
    slug: "udemy",
    title: "UDEMY COURSES",
    headline: "UP TO 97% OFF",
    description:
      "Grab Up To 97% OFF Best-Selling Online Courses in programming and business.",
    image: "/herobanners/Coupon%2520Codes.jpg.jpeg",
    logo: "/brandlogos/10019.jpg",
    buttonText: "GRAB NOW",
    link: "/brand/udemy",
  },
  {
    id: 2,
    name: "Google Workspace",
    slug: "google",
    title: "GOOGLE WORKSPACE",
    headline: "14-DAY FREE TRIAL",
    description:
      "Start your free Google Workspace trial today and boost your productivity with Gemini AI.",
    image: "/herobanners/Discount%2520Codes.jpg.jpeg",
    logo: "/brandlogos/10020.jpg",
    buttonText: "GRAB NOW",
    link: "/brand/google",
  },
];

export function HeroSection({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Swipe/drag for banner
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
      handleNext();
    } else if (diff < -50) {
      handlePrev();
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
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    isDragging.current = false;
  };

  const slides = useMemo(() => {
    const dbBanners = (banners || []).filter(
      (b) => b.slot === "left-hero" || b.slot === "hero" || !b.slot,
    );
    return dbBanners.length > 0
      ? dbBanners.map((b, idx) => ({ id: b._id || idx, ...b }))
      : LEFT_BRANDS;
  }, [banners]);

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (!autoRotate || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRotate, slides.length]);

  const handlePrev = useCallback(() => {
    setAutoRotate(false);
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setAutoRotate(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleBrandClick = (idx) => {
    setAutoRotate(false);
    setCurrentSlide(idx);
  };

  return (
    <div className="w-full flex flex-col select-none">
      {/* Full Width Banners Section */}
      <section className="select-none w-full text-left">
        <div className="w-full rounded-md overflow-hidden shadow-sm relative group border border-brand-border bg-slate-900 h-[200px] sm:h-[300px] md:h-[430px]">
          {/* Viewport for horizontal sliding */}
          <div
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="w-full h-full flex-shrink-0 min-w-full relative"
                >
                  <Link href={slide.link || "#"} className="block w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title || slide.name || "Banner slide"}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                    {slide.isPaid && (
                      <div className="absolute top-3 right-3 bg-black/45 text-white/90 text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
                        Sponsored
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm border-0 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm border-0 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBrandClick(idx)}
                  className={`w-2 h-2 rounded-full transition-all border-0 cursor-pointer ${
                    idx === currentSlide
                      ? "bg-white w-5"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Synchronized Brands Bar Below */}
      <div className="hidden md:flex w-full mt-2 select-none text-left">
        <div className="w-full flex justify-start items-center overflow-x-auto scrollbar-hide py-3.5 gap-4 px-2">
          {slides.map((brand, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(idx)}
                type="button"
                className={`relative flex items-center justify-center cursor-pointer border rounded-md bg-white p-1.5 w-[76px] h-[40px] transition-all duration-200 shrink-0 ${
                  isActive
                    ? "border-[#2563eb] shadow-sm ring-1 ring-[#2563eb]/30"
                    : "border-brand-border hover:border-[#2563eb]/50"
                }`}
                title={brand.name || brand.title}
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name || brand.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <span className="text-[9px] font-bold text-brand-subtext truncate max-w-full uppercase">
                    {brand.name || brand.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
