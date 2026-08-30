"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function HeroSection({ banners: initialBanners = [] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);

  // Swipe/drag refs
  const dragStart = useRef(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontalSwipe = useRef(null);
  const hasMoved = useRef(false);

  // Bottom logos scroll refs
  const thumbTrackRef = useRef(null);
  const thumbRefs = useRef([]);

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
    // Sort strictly by priority descending (highest priority first)
    const sorted = [...dbBanners].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );
    return sorted.map((b, idx) => ({ id: b._id || idx, ...b }));
  }, [banners]);

  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (!autoRotate || slides.length <= 1 || isDragging.current) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRotate, slides.length]);

  // Function to smoothly center the active bottom logo inside the scroll container
  const scrollToThumb = useCallback((index) => {
    const container = thumbTrackRef.current;
    const item = thumbRefs.current[index];
    if (!container || !item) return;

    const containerWidth = container.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;

    // Centering formula: calculates target scroll position so active item is centered
    const targetScrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  }, []);

  // Scroll active logo into view when slide changes
  useEffect(() => {
    scrollToThumb(currentSlide);
  }, [currentSlide, scrollToThumb]);

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
    scrollToThumb(idx);
  };

  // Touch and Drag handlers for main banner
  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    hasMoved.current = false;
    isHorizontalSwipe.current = null;
    setAutoRotate(false);
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
    setAutoRotate(false);
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

  // Scroll bottom logos bar manually left/right
  const scrollThumbBar = (direction) => {
    const container = thumbTrackRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // If no DB banners exist for Hero Section
  if (slides.length === 0) {
    return (
      <div className="w-full flex flex-col select-none">
        <section className="select-none w-full text-left">
          <div className="w-full rounded-md overflow-hidden border border-slate-200/80 bg-slate-950 h-[200px] sm:h-[300px] md:h-[380px] flex flex-col items-center justify-center text-white p-6 text-center">
            <ImageIcon className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-300">
              No Banners Available
            </h2>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col select-none">
      {/* Full Width Banners Section */}
      <section className="select-none w-full text-left">
        <div
          className="w-full rounded-md overflow-hidden shadow-sm relative group border border-slate-200/80 bg-slate-950"
          style={{ aspectRatio: "1200 / 430" }}
        >
          {/* Viewport for horizontal sliding */}
          <div
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`flex h-full w-full ${
                isDragging.current ? "transition-none" : "transition-transform duration-500 ease-in-out"
              }`}
              style={{
                transform:
                  dragOffset !== 0
                    ? `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`
                    : `translateX(-${currentSlide * 100}%)`,
              }}
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
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <img
                      src={slide.image}
                      alt={slide.title || slide.name || "Banner slide"}
                      className="w-full h-full object-cover cursor-pointer select-none pointer-events-none"
                      draggable={false}
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

                    {Boolean(slide.isPaid) && (
                      <div className="absolute top-3 right-3 bg-black/50 text-white/90 text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
                        Sponsored
                      </div>
                    )}
                  </div>
                );

                const handleLinkClick = (e) => {
                  if (hasMoved.current) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                };

                return (
                  <div
                    key={slide.id}
                    className="w-full h-full flex-none shrink-0 min-w-full max-w-full basis-full relative overflow-hidden"
                  >
                    {isExternal ? (
                      <a
                        href={slide.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className="block w-full h-full"
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        href={slide.link || "/deals"}
                        onClick={handleLinkClick}
                        className="block w-full h-full"
                      >
                        {linkContent}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows - Compact and modern */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white/90 hover:text-white backdrop-blur-xs border border-white/10 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white/90 hover:text-white backdrop-blur-xs border border-white/10 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBrandClick(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all border-0 cursor-pointer ${
                    idx === currentSlide
                      ? "bg-white w-4 sm:w-5"
                      : "bg-white/40 hover:bg-white/60 w-1.5 sm:w-2"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Synchronized Responsive Brands Bar Below (Visible on Mobile & Desktop, supporting 50+ logos) */}
      {slides.some((s) => s.logo || s.name || s.title) && (
        <div className="relative group/thumb flex w-full mt-2 sm:mt-2.5 select-none text-left items-center">
          {/* Scroll Left Button for Thumbnails (Shown on overflow/hover) */}
          {slides.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbBar("left")}
              className="hidden sm:flex absolute left-0 z-10 -translate-x-2 items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-all opacity-0 group-hover/thumb:opacity-100 cursor-pointer"
              aria-label="Scroll logos left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Logos Scroll Track */}
          <div
            ref={thumbTrackRef}
            className="w-full flex items-center overflow-x-auto scrollbar-hide py-2 gap-2 sm:gap-3 px-1 scroll-smooth flex-nowrap"
          >
            {slides.map((brand, idx) => {
              const isActive = idx === currentSlide;
              const titleText = brand.name || brand.title || `Slide ${idx + 1}`;
              return (
                <button
                  key={brand.id}
                  ref={(el) => (thumbRefs.current[idx] = el)}
                  onClick={() => handleBrandClick(idx)}
                  type="button"
                  className={`relative flex-none shrink-0 inline-flex items-center justify-center cursor-pointer border rounded-md bg-white p-1.5 w-[76px] sm:w-[84px] h-[36px] sm:h-[40px] transition-all duration-200 ${
                    isActive
                      ? "border-blue-600 shadow-sm ring-1 ring-blue-600/30 scale-105"
                      : "border-slate-200 hover:border-blue-400 opacity-80 hover:opacity-100"
                  }`}
                  title={titleText}
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={titleText}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-md select-none pointer-events-none"
                    />
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 truncate max-w-full text-center uppercase px-0.5 select-none">
                      {titleText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button for Thumbnails (Shown on overflow/hover) */}
          {slides.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbBar("right")}
              className="hidden sm:flex absolute right-0 z-10 translate-x-2 items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-all opacity-0 group-hover/thumb:opacity-100 cursor-pointer"
              aria-label="Scroll logos right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

