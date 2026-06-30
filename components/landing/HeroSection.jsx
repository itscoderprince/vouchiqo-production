"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const LEFT_BRANDS = [
  {
    id: 0,
    name: "Hostinger",
    slug: "hostinger",
    title: "Power your website with premium hosting",
    subtitle: "Hostinger Premium Web Hosting - Up to 75% OFF",
    buttonText: "Grab Coupon",
    image:
      "https://cdn.grabon.in/gograbon/images/banners/banner-1773810900601/Offer%20Code.jpg",
    link: "/brand/hostinger",
  },
  {
    id: 1,
    name: "Redrail",
    slug: "redrail",
    title: "Book bus and train tickets across India online",
    subtitle: "Redrail Exclusive - Flat ₹500 OFF Ticket Bookings",
    buttonText: "Claim Discount",
    image:
      "https://cdn.grabon.in/gograbon/images/banners/banner-1781007250960/Coupon%20Codes.jpg",
    link: "/brand/redrail",
  },
  {
    id: 2,
    name: "Coursera",
    slug: "coursera",
    title: "Meet new goals with midyear savings",
    subtitle: "Coursera Plus - Limited Time 40% OFF",
    buttonText: "Explore Offer",
    image:
      "https://cdn.grabon.in/gograbon/images/banners/banner-1781613909772/Discount%20Codes.jpg",
    link: "/brand/redrail",
  },
  {
    id: 3,
    name: "Dell",
    slug: "dell",
    title: "Upgrade your productivity gear today",
    subtitle: "Dell XPS & Inspiron Laptops - Up to 45% OFF",
    buttonText: "Save Now",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/dell",
  },
  {
    id: 4,
    name: "Ulta Host",
    slug: "ultahost",
    title: "Fastest managed VPS hosting solutions",
    subtitle: "UltaHost Hosting Plans - Flat 25% OFF sitewide",
    buttonText: "Explore Plans",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/ultahost",
  },
  {
    id: 5,
    name: "Google Workspace",
    slug: "google",
    title: "Google Workspace with Gemini",
    subtitle: "UP TO 15% OFF On Your Subscription Purchase For First 3 Months",
    buttonText: "Start Free Trial",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/google",
  },
  {
    id: 6,
    name: "Ajio",
    slug: "ajio",
    title: "Giant Fashion Sale is live now",
    subtitle: "AJIO Giant Fashion Sale - Flat 22% OFF",
    buttonText: "Grab Now",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/ajio",
  },
  {
    id: 7,
    name: "Amazon",
    slug: "amazon",
    title: "Prime Day Sale is live now",
    subtitle: "Amazon Deals - Up to 80% OFF + 10% Bank Discount",
    buttonText: "View Deals",
    image:
      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/amazon",
  },
  {
    id: 8,
    name: "Klook",
    slug: "klook",
    title: "Explore popular travel destinations",
    subtitle: "Klook Travel Deals - Up to 50% OFF activities",
    buttonText: "Book Now",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/klook",
  },
  {
    id: 9,
    name: "Adidas",
    slug: "adidas",
    title: "End of season sports fashion sale",
    subtitle: "Adidas Apparel & Shoes - Flat 30% OFF + Extra 15%",
    buttonText: "Grab Offer",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    link: "/brand/adidas",
  },
];

const RIGHT_BRANDS = [
  {
    id: 0,
    name: "UBER",
    slug: "uber",
    title: "UBER PROMO",
    headline: "FLAT 50% OFF",
    description:
      "Flat 50% OFF First 3 Uber Rides — Up to ₹100 Per Ride. Valid for new users.",
    image:
      "https://images.unsplash.com/photo-1619551734325-81aaf323686c?q=80&w=600&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
    buttonText: "GRAB NOW",
    link: "/brand/google",
  },
];

export function HeroSection() {
  const [currentLeftSlide, setCurrentLeftSlide] = useState(5); // Default to Google Workspace (index 5)
  const [currentRightCard, setCurrentRightCard] = useState(0); // Default to UBER (index 0)
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto rotate slides
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setCurrentLeftSlide((prev) => (prev + 1) % LEFT_BRANDS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const handlePrev = useCallback(() => {
    setAutoRotate(false);
    setCurrentLeftSlide(
      (prev) => (prev - 1 + LEFT_BRANDS.length) % LEFT_BRANDS.length,
    );
  }, []);

  const handleNext = useCallback(() => {
    setAutoRotate(false);
    setCurrentLeftSlide((prev) => (prev + 1) % LEFT_BRANDS.length);
  }, []);

  const handleLeftBrandClick = (idx) => {
    setAutoRotate(false);
    setCurrentLeftSlide(idx);
  };

  const handleRightBrandClick = (idx) => {
    setCurrentRightCard(idx);
  };

  const activeLeft = LEFT_BRANDS[currentLeftSlide];
  const activeRight = RIGHT_BRANDS[currentRightCard];

  return (
    <div className="w-full flex flex-col select-none">
      {/* Upper Banners Row */}
      <section className="flex flex-col md:flex-row gap-4 select-none w-full text-left">
        {/* Left Column: Banners Carousel (75% Width) */}
        <div
          className="md:w-3/4 rounded-lg overflow-hidden shadow-sm relative w-full max-w-[904px] group border border-brand-border bg-slate-900"
          style={{ height: "430px" }}
        >
          {/* Viewport for horizontal sliding */}
          <div className="w-full h-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentLeftSlide * 100}%)` }}
            >
              {LEFT_BRANDS.map((slide) => (
                <div
                  key={slide.id}
                  className="w-full h-full flex-shrink-0 min-w-full relative"
                >
                  <Link href={slide.link} className="block w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
            {LEFT_BRANDS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLeftBrandClick(idx)}
                className={`w-2 h-2 rounded-full transition-all border-0 cursor-pointer ${
                  idx === currentLeftSlide ? "bg-white w-4" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Banners Carousel (25% Width) */}
        <div
          className="md:w-1/4 rounded-lg overflow-hidden shadow-sm relative w-full border border-brand-border bg-slate-900"
          style={{ height: "430px" }}
        >
          {/* Viewport for horizontal sliding */}
          <div className="w-full h-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentRightCard * 100}%)` }}
            >
              {RIGHT_BRANDS.map((slide, idx) => {
                const isActive = idx === currentRightCard;
                return (
                  <div
                    key={slide.id}
                    className="w-full h-full flex-shrink-0 min-w-full relative"
                  >
                    <Link
                      href={slide.link}
                      className="block w-full h-full relative overflow-hidden"
                    >
                      <img
                        src={slide.image}
                        alt={slide.name}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      {/* Floating card overlay that slides up smoothly when active */}
                      <div
                        className={`absolute bottom-5 left-4 right-4 bg-white rounded-2xl p-5 shadow-lg text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isActive
                            ? "translate-y-0 opacity-100 delay-150"
                            : "translate-y-16 opacity-0"
                        }`}
                      >
                        <h3 className="font-extrabold text-[#191F2E] text-[15px] leading-snug mb-1">
                          {slide.headline}
                        </h3>
                        <p className="text-[12px] text-[#4A5568] leading-relaxed mb-3 line-clamp-2">
                          {slide.description}
                        </p>
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[#3E80DD]">
                          {slide.buttonText}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
            {RIGHT_BRANDS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRightBrandClick(idx)}
                className={`w-2 h-2 rounded-full transition-all border-0 cursor-pointer ${
                  idx === currentRightCard ? "bg-white w-4" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brands List (Synchronized directly with slider) */}
      <div className="flex flex-col md:flex-row gap-4 mt-2 select-none w-full text-left">
        {/* Left brand list (75% width) */}
        <div className="md:w-3/4 flex justify-between items-center overflow-x-auto scrollbar-hide py-3 gap-6 text-[11px] font-black text-brand-subtext px-4 border-b border-brand-border">
          {LEFT_BRANDS.map((brand) => {
            const isActive = brand.id === currentLeftSlide;
            return (
              <button
                key={brand.id}
                onClick={() => handleLeftBrandClick(brand.id)}
                type="button"
                className={`relative whitespace-nowrap uppercase tracking-wider cursor-pointer border-0 bg-transparent py-1 transition-colors ${
                  isActive ? "text-brand-blue" : "hover:text-brand-blue"
                }`}
              >
                <span>{brand.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider (Vertical line aligned with gap) */}
        <div className="hidden md:block w-px h-6 bg-brand-border self-center" />

        {/* Right brand list (25% width) */}
        <div className="md:w-1/4 flex justify-around items-center py-3 gap-4 text-[11px] font-black text-brand-subtext px-2 border-b border-brand-border">
          {RIGHT_BRANDS.map((brand) => {
            const isActive = brand.id === currentRightCard;
            return (
              <button
                key={brand.id}
                onClick={() => handleRightBrandClick(brand.id)}
                type="button"
                className={`relative whitespace-nowrap uppercase tracking-wider cursor-pointer border-0 bg-transparent py-1 transition-colors ${
                  isActive ? "text-brand-blue" : "hover:text-brand-blue"
                }`}
              >
                <span>{brand.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
