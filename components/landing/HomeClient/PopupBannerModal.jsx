"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export function PopupBannerModal({ banners: initialBanners = [] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [open, setOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

  useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
      fetch("/api/banners")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setBanners(json.data);
          }
        })
        .catch((err) => console.error("Failed to fetch popup banners:", err));
    }
  }, [initialBanners]);

  useEffect(() => {
    // Find active popup banner
    const popupBanners = (banners || []).filter(
      (b) => b.slot === "popup" || b.slot === "popup-modal",
    );

    if (popupBanners.length === 0) return;

    // Pick top priority popup banner
    const selected = popupBanners[0];
    const bannerId = selected._id || "default";

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem(`popup-banner-dismissed-${bannerId}`);
    if (!isDismissed) {
      setActiveBanner(selected);
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [banners]);

  const handleClose = () => {
    setOpen(false);
    if (activeBanner?._id) {
      sessionStorage.setItem(`popup-banner-dismissed-${activeBanner._id}`, "true");
    }
  };

  if (!open || !activeBanner) return null;

  const isExternal =
    activeBanner.link?.startsWith("http://") ||
    activeBanner.link?.startsWith("https://");
  const targetUrl = activeBanner.link && activeBanner.link !== "#" ? activeBanner.link : "/deals";

  const hasText = Boolean(
    (activeBanner.title && activeBanner.title.trim() !== "") ||
      (activeBanner.subtitle && activeBanner.subtitle.trim() !== "") ||
      (activeBanner.buttonText && activeBanner.buttonText.trim() !== ""),
  );

  const modalBody = (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-700/50">
      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/20"
        aria-label="Close Popup"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Banner Image */}
      <div className="relative w-full h-[280px] sm:h-[360px]">
        <img
          src={activeBanner.image}
          alt={activeBanner.title || "Promotional Banner"}
          className="w-full h-full object-cover"
        />

        {/* Optional Text Overlay */}
        {hasText && (
          <div
            className={`absolute inset-0 flex flex-col justify-end p-6 gap-2 pointer-events-none ${
              activeBanner.textPosition === "center"
                ? "items-center text-center bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
                : activeBanner.textPosition === "right"
                  ? "items-end text-right bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
                  : "items-start text-left bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
            }`}
          >
            {activeBanner.subtitle && (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: activeBanner.subtitleColor || "#fbbf24" }}
              >
                {activeBanner.subtitle}
              </span>
            )}
            {activeBanner.title && (
              <h3
                className="text-xl sm:text-2xl font-extrabold leading-tight"
                style={{ color: activeBanner.textColor || "#ffffff" }}
              >
                {activeBanner.title}
              </h3>
            )}
            {activeBanner.buttonText && (
              <div className="pt-1">
                <span
                  className="inline-flex items-center px-4 py-2 rounded-xl font-bold text-xs shadow-lg pointer-events-auto transition-transform active:scale-95"
                  style={{
                    backgroundColor: activeBanner.buttonBgColor || "#f59e0b",
                    color: activeBanner.buttonTextColor || "#0f172a",
                  }}
                >
                  {activeBanner.buttonText}
                </span>
              </div>
            )}
          </div>
        )}

        {activeBanner.isPaid && (
          <div className="absolute top-3 left-3 bg-black/50 text-white/90 text-[9px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
            Sponsored
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-300">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        {isExternal ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="block w-full"
          >
            {modalBody}
          </a>
        ) : (
          <Link href={targetUrl} onClick={handleClose} className="block w-full">
            {modalBody}
          </Link>
        )}
      </div>
    </div>
  );
}

export default PopupBannerModal;
