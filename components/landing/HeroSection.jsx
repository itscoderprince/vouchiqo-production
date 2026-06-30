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

export function HeroSection() {
  const [currentLeftSlide, setCurrentLeftSlide] = useState(0); // Start at Hostinger
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
                      className="w-full h-full object-fill cursor-pointer"
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
                        className="w-full h-full object-fill cursor-pointer"
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
        <div className="md:w-3/4 flex justify-start items-center overflow-x-auto scrollbar-hide py-3.5 gap-4 px-4 border-b border-brand-border">
          {LEFT_BRANDS.map((brand) => {
            const isActive = brand.id === currentLeftSlide;
            return (
              <button
                key={brand.id}
                onClick={() => handleLeftBrandClick(brand.id)}
                type="button"
                className={`relative flex items-center justify-center cursor-pointer border rounded-lg bg-white p-1.5 w-[76px] h-[40px] transition-all duration-200 shrink-0 ${
                  isActive
                    ? "border-[#FF7A18] shadow-sm ring-1 ring-[#FF7A18]/30"
                    : "border-brand-border hover:border-[#FF7A18]/50"
                }`}
                title={brand.name}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-cover rounded-md"
                />
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-[#FF7A18] rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider (Vertical line aligned with gap) */}
        <div className="hidden md:block w-px h-6 bg-brand-border self-center" />

        {/* Right brand list (25% width) */}
        <div className="md:w-1/4 flex justify-around items-center py-3.5 gap-4 px-2 border-b border-brand-border">
          {RIGHT_BRANDS.map((brand) => {
            const isActive = brand.id === currentRightCard;
            return (
              <button
                key={brand.id}
                onClick={() => handleRightBrandClick(brand.id)}
                type="button"
                className={`relative flex items-center justify-center cursor-pointer border rounded-lg bg-white p-1.5 w-[76px] h-[40px] transition-all duration-200 shrink-0 ${
                  isActive
                    ? "border-[#FF7A18] shadow-sm ring-1 ring-[#FF7A18]/30"
                    : "border-brand-border hover:border-[#FF7A18]/50"
                }`}
                title={brand.name}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-cover rounded-md"
                />
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-[#FF7A18] rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
