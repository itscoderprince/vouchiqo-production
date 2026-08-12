"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export const TrendingOffer = ({ banners: initialBanners = [] }) => {
  const [banners, setBanners] = useState(initialBanners);
  const [current, setCurrent] = useState(0);
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

  // Client-side fetch from /api/banners if no banners provided via props
  useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
      fetch("/api/banners")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setBanners(json.data);
          }
        })
        .catch((err) => console.error("Failed to fetch trending banners:", err));
    }
  }, [initialBanners]);

  const slides = useMemo(() => {
    const dbTrending = (banners || []).filter(
      (b) => b.slot === "trending" || b.slot === "trending-offer",
    );
    return dbTrending.map((b, idx) => ({ id: b._id || idx, ...b }));
  }, [banners]);

  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(timer);
  }, [total]);

  useEffect(() => {
    if (current >= total && total > 0) setCurrent(0);
  }, [total, current]);

  const goTo = (idx) => setCurrent(idx);
  const goPrev = () => setCurrent((prev) => (prev - 1 + total) % total);
  const goNext = () => setCurrent((prev) => (prev + 1) % total);

  // Touch/mouse swipe
  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    const diff = dragStart.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
    isDragging.current = false;
  };
  const handleMouseDown = (e) => {
    dragStart.current = e.clientX;
    isDragging.current = true;
  };
  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    const diff = dragStart.current - e.clientX;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
    isDragging.current = false;
  };

  // If no DB banners exist for Trending Offer section, hide section cleanly
  if (!slides || slides.length === 0) return null;

  return (
    <section className="text-left w-full select-none">
      {/* Heading */}
      <h2 className="text-base md:text-xl font-bold text-brand-text mb-3">
        Trending Offer
      </h2>

      {/* Carousel wrapper with responsive 1400:300 (~4.67:1) aspect ratio */}
      <div
        className="relative w-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-sm border border-slate-200/80 bg-slate-950"
        style={{ aspectRatio: "1400 / 300", minHeight: "120px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Slides */}
        {slides.map((s, idx) => {
          const isExternal =
            s.link?.startsWith("http://") || s.link?.startsWith("https://");
          const targetUrl = s.link && s.link !== "#" ? s.link : "/deals";

          const hasText = Boolean(
            (s.title && s.title.trim() !== "") ||
              (s.subtitle && s.subtitle.trim() !== "") ||
              (s.buttonText && s.buttonText.trim() !== ""),
          );

          const innerContent = (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              {/* Background image matching 1400x300 aspect ratio */}
              <img
                src={s.image}
                alt={s.title || "Trending Banner"}
                className="w-full h-full object-contain md:object-cover transition-transform duration-700"
                style={{
                  transform: idx === current ? "scale(1.01)" : "scale(1)",
                }}
              />

              {/* Optional Text Overlay */}
              {hasText && (
                <div
                  className={`absolute inset-0 flex flex-col justify-center px-6 sm:px-10 gap-1.5 pointer-events-none ${
                    s.textPosition === "center"
                      ? "items-center text-center bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent"
                      : s.textPosition === "right"
                        ? "items-end text-right bg-gradient-to-l from-slate-950/85 via-slate-950/40 to-transparent"
                        : "items-start text-left bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent"
                  }`}
                >
                  {s.subtitle && (
                    <span
                      className="text-[11px] uppercase tracking-wider font-semibold"
                      style={{ color: s.subtitleColor || "#fbbf24" }}
                    >
                      {s.subtitle}
                    </span>
                  )}
                  {s.title && (
                    <h3
                      className="text-lg sm:text-2xl font-extrabold max-w-lg leading-tight"
                      style={{ color: s.textColor || "#ffffff" }}
                    >
                      {s.title}
                    </h3>
                  )}
                  {s.buttonText && (
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-md pointer-events-auto transition-transform active:scale-95"
                        style={{
                          backgroundColor: s.buttonBgColor || "#f59e0b",
                          color: s.buttonTextColor || "#0f172a",
                        }}
                      >
                        {s.buttonText}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {s.isPaid && (
                <div className="absolute top-3 right-3 bg-black/50 text-white/90 text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
                  Sponsored
                </div>
              )}
            </div>
          );

          return isExternal ? (
            <a
              key={s.id}
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              className="absolute inset-0 block w-full h-full transition-opacity duration-700"
              style={{
                opacity: idx === current ? 1 : 0,
                pointerEvents: idx === current ? "auto" : "none",
              }}
            >
              {innerContent}
            </a>
          ) : (
            <Link
              key={s.id}
              href={targetUrl}
              draggable={false}
              className="absolute inset-0 block w-full h-full transition-opacity duration-700"
              style={{
                opacity: idx === current ? 1 : 0,
                pointerEvents: idx === current ? "auto" : "none",
              }}
            >
              {innerContent}
            </Link>
          );
        })}

        {/* Dot navigation — inside image at bottom center */}
        {slides.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goTo(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className="border-0 p-0 transition-all duration-300 cursor-pointer rounded-full"
                style={{
                  width: idx === current ? "20px" : "6px",
                  height: "6px",
                  backgroundColor:
                    idx === current ? "#ffffff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingOffer;
