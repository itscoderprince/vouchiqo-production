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
      }, 1200);
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

  const modalBody = (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-700/50 group">
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

      {/* Pure Banner Image */}
      <div className="relative w-full h-[280px] sm:h-[380px]">
        <img
          src={activeBanner.image}
          alt={activeBanner.title || "Promotional Banner"}
          className="w-full h-full object-cover cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-300">
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
