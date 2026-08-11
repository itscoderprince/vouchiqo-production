"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function HeroSection({ banners: initialBanners = [] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Swipe/drag for banner
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  // Sync state if initialBanners updates
  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

  // Client-side fetch from /api/banners if no banners provided via SSR props
  useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
      fetch("/api/banners")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setBanners(json.data);
          }
        })
        .catch((err) => console.error("Failed to fetch hero banners:", err));
    }
  }, [initialBanners]);

  const slides = useMemo(() => {
    const dbBanners = (banners || []).filter(
      (b) =>
        b.slot === "hero" ||
        b.slot === "left-hero" ||
        b.slot === "top-hero" ||
        b.slot === "top" ||
        !b.slot,
    );
    return dbBanners.map((b, idx) => ({ id: b._id || idx, ...b }));
  }, [banners]);

  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
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
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setAutoRotate(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleBrandClick = (idx) => {
    setAutoRotate(false);
    setCurrentSlide(idx);
  };

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

  // If no DB banners exist for Hero Section
  if (slides.length === 0) {
    return (
      <div className="w-full flex flex-col select-none">
        <section className="select-none w-full text-left">
          <div className="w-full rounded-xl overflow-hidden border border-slate-200/80 bg-slate-950 h-[200px] sm:h-[300px] md:h-[380px] flex flex-col items-center justify-center text-white p-6 text-center">
            <ImageIcon className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-300">No Banners Available</h2>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col select-none">
      {/* Full Width Banners Section */}
      <section className="select-none w-full text-left">
        <div className="w-full rounded-xl overflow-hidden shadow-sm relative group border border-slate-200/80 bg-slate-950 h-[200px] sm:h-[300px] md:h-[430px]">
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
              {slides.map((slide) => {
                const isExternal =
                  slide.link?.startsWith("http://") ||
                  slide.link?.startsWith("https://");
                const hasText = Boolean(
                  (slide.title && slide.title.trim() !== "") ||
                    (slide.subtitle && slide.subtitle.trim() !== "") ||
                    (slide.buttonText && slide.buttonText.trim() !== ""),
                );

                const linkContent = (
                  <div className="relative w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title || slide.name || "Banner slide"}
                      className="w-full h-full object-cover cursor-pointer"
                    />

                    {/* Optional Text Overlay */}
                    {hasText && (
                      <div
                        className={`absolute inset-0 flex flex-col justify-center px-8 md:px-14 gap-2 pointer-events-none ${
                          slide.textPosition === "center"
                            ? "items-center text-center bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"
                            : slide.textPosition === "right"
                              ? "items-end text-right bg-gradient-to-l from-slate-950/80 via-slate-950/40 to-transparent"
                              : "items-start text-left bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"
                        }`}
                      >
                        {slide.subtitle && (
                          <span
                            className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                            style={{ color: slide.subtitleColor || "#fbbf24" }}
                          >
                            {slide.subtitle}
                          </span>
                        )}
                        {slide.title && (
                          <h2
                            className="text-xl sm:text-3xl md:text-4xl font-extrabold max-w-xl leading-tight"
                            style={{ color: slide.textColor || "#ffffff" }}
                          >
                            {slide.title}
                          </h2>
                        )}
                        {slide.buttonText && (
                          <div className="pt-2">
                            <span
                              className="inline-flex items-center px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md pointer-events-auto transition-transform active:scale-95"
                              style={{
                                backgroundColor: slide.buttonBgColor || "#f59e0b",
                                color: slide.buttonTextColor || "#0f172a",
                              }}
                            >
                              {slide.buttonText}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {slide.isPaid && (
                      <div className="absolute top-3 right-3 bg-black/50 text-white/90 text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
                        Sponsored
                      </div>
                    )}
                  </div>
                );

                return (
                  <div
                    key={slide.id}
                    className="w-full h-full flex-shrink-0 min-w-full relative"
                  >
                    {isExternal ? (
                      <a
                        href={slide.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link href={slide.link || "#"} className="block w-full h-full">
                        {linkContent}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm border border-white/10 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm border border-white/10 cursor-pointer"
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
      {slides.some((s) => s.logo || s.name || s.title) && (
        <div className="hidden md:flex w-full mt-2 select-none text-left">
          <div className="w-full flex justify-start items-center overflow-x-auto scrollbar-hide py-3.5 gap-4 px-2">
            {slides.map((brand, idx) => {
              const isActive = idx === currentSlide;
              const titleText = brand.name || brand.title || `Slide ${idx + 1}`;
              return (
                <button
                  key={brand.id}
                  onClick={() => handleBrandClick(idx)}
                  type="button"
                  className={`relative flex items-center justify-center cursor-pointer border rounded-md bg-white p-1.5 w-[76px] h-[40px] transition-all duration-200 shrink-0 ${
                    isActive
                      ? "border-blue-600 shadow-sm ring-1 ring-blue-600/30"
                      : "border-slate-200 hover:border-blue-400"
                  }`}
                  title={titleText}
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={titleText}
                      className="w-full h-full object-contain rounded-md"
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-700 truncate max-w-full uppercase px-1">
                      {titleText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
