"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, Heart, Share2, SlidersHorizontal, Sparkles, Star, TrendingUp, X } from "lucide-react";
import Link from "next/link";

function TwitterGreenTick({ className = "w-4.5 h-4.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Verified account"
      className={`${className} flex-shrink-0 text-emerald-500 fill-current`}
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.26.16-.42.24-.88.24-1.35 0-2.13-1.73-3.86-3.86-3.86-.47 0-.93.08-1.35.24C14.5 2.45 13.26 1.57 11.83 1.57s-2.67.88-3.26 2.19c-.42-.16-.88-.24-1.35-.24-2.13 0-3.86 1.73-3.86 3.86 0 .47.08.93.24 1.35C2.32 9.33 1.44 10.57 1.44 12s.88 2.67 2.19 3.26c-.16.42-.24.88-.24 1.35 0 2.13 1.73 3.86 3.86 3.86.47 0 .93-.08 1.35-.24.59 1.31 1.83 2.19 3.26 2.19s2.67-.88 3.26-2.19c.42.16.88.24 1.35.24 2.13 0 3.86-1.73 3.86-3.86 0-.47-.08-.93-.24-1.35 1.31-.59 2.19-1.83 2.19-3.26zm-11.4 4.54l-4.14-4.14 1.41-1.41 2.73 2.73 6.09-6.09 1.41 1.41-7.5 7.5z" />
    </svg>
  );
}

export default function BrandHeader({
  merchant,
  coupons,
  todayStr,
  activeTab,
  setActiveTab,
  isFollowing,
  handleFollow,
  followers,
  ratingVal,
  votesCount,
  isRated,
  handleRate,
  existingUser,
  setExistingUser,
  couponsCount,
  offersCount,
  affiliateProductsCount = 0,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const tabs = [
    { id: "all", label: "All", count: coupons.length + affiliateProductsCount },
    { id: "cpn", label: "Codes", count: couponsCount },
    { id: "dl", label: "Offers", count: offersCount },
    { id: "affiliate", label: "Affiliate Products", count: affiliateProductsCount },
  ];

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = `${merchant.businessName} Discount Coupons & Deals`;
  const shareText = `Check out verified discount offers, promo codes, and deals for ${merchant.businessName} on Vouchiqo!`;

  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          setIsShareModalOpen(true);
        }
        return;
      }
    }
    setIsShareModalOpen(true);
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="w-full bg-white border-b border-slate-100 font-sans">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <ol className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none font-medium">
            <li>
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
            </li>
            <span className="text-slate-300">/</span>
            <li>
              <Link
                href="/brands"
                className="hover:text-blue-600 transition-colors"
              >
                Brands
              </Link>
            </li>
            <span className="text-slate-300">/</span>
            <li className="text-slate-900 font-bold truncate max-w-[200px]">
              {merchant.businessName}
            </li>
          </ol>
        </div>
      </div>

      {/* Hero Banner Container */}
      <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] bg-slate-950 overflow-hidden select-none font-sans flex items-center justify-center">
        {/* Floating Top-Right Share Button */}
        <button
          type="button"
          onClick={handleShareClick}
          title="Share brand deals"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-extrabold shadow-md border border-white/60 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {merchant.banner ? (
          <>
            {/* Ambient Blurred Backdrop to fill edges seamlessly */}
            <img
              src={merchant.banner}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center blur-xl opacity-40 scale-110 pointer-events-none"
            />
            {/* Centered Sharp Banner Image (Y-center & X-center) */}
            <img
              src={merchant.banner}
              alt={`${merchant.businessName} banner`}
              className="relative z-10 max-w-full max-h-full object-contain object-center opacity-100 transition-transform duration-700"
            />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Brand Identity Section */}
      <section className="w-full bg-white border-b border-slate-200/80 shadow-xs font-sans">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo + Info row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative">
            {/* Left: Logo + Brand Name */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-end">
              {/* Logo — overlaps banner */}
              <div
                className="relative z-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-white shadow-[0_6px_22px_rgba(15,23,42,0.12)] border-3 border-white overflow-hidden"
                style={{
                  width: 104,
                  height: 104,
                  marginTop: -52,
                }}
              >
                {merchant.logo && !logoFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.logo}
                    alt={merchant.businessName}
                    className="max-h-full max-w-full object-contain object-center p-1"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="font-black text-3xl text-blue-600 uppercase">
                    {merchant.businessName?.[0]}
                  </span>
                )}
              </div>

              {/* Brand name + badges */}
              <div className="pt-2 sm:pt-4 space-y-1.5 pb-4 text-left font-sans">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {merchant.businessName}
                  </h1>

                  {/* Verified badge */}
                  {merchant.isVerified !== false && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                      <span>Verified</span>
                      <TwitterGreenTick className="w-4 h-4 text-emerald-500" />
                    </span>
                  )}

                  {/* Growth Partner badge */}
                  {merchant.plan ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80 capitalize shadow-2xs">
                      <span>{merchant.plan} Partner</span>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80 shadow-2xs">
                      <span>Growth Partner</span>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                  {coupons.length} active deals · validated on{" "}
                  <span className="text-slate-800 font-bold">{todayStr}</span>
                </p>

                {/* Mobile rating indicator */}
                <div className="flex sm:hidden items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span className="font-bold text-slate-800">{ratingVal.toFixed(1)}/5</span>
                  <span className="text-slate-300">|</span>
                  <span>{votesCount} Users</span>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleRate}
                    disabled={isRated}
                    className="text-blue-600 font-bold hover:underline border-0 bg-transparent p-0 cursor-pointer text-[11px]"
                  >
                    {isRated ? "Rated" : "Rate Now"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions (Rating, Follow, Share, Existing User Toggle) */}
            <div
              className={`${
                showMobileFilters ? "flex" : "hidden"
              } sm:flex flex-wrap items-center gap-2.5 pb-4 w-full sm:w-auto mt-3 sm:mt-0 font-sans`}
            >
              {/* Star rating pill button */}
              <button
                onClick={handleRate}
                type="button"
                disabled={isRated}
                title={isRated ? "Rating submitted" : "Click to rate this merchant"}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-200 bg-amber-50/80 hover:bg-amber-100 transition-all text-xs font-bold text-amber-900 shadow-xs cursor-pointer active:scale-95"
              >
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(ratingVal)
                          ? "fill-amber-400 text-amber-400"
                          : "text-amber-200 fill-amber-100"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-amber-900 font-extrabold">
                  {ratingVal.toFixed(1)}
                </span>
                <span className="text-amber-700/80 font-medium text-[11px]">
                  ({votesCount})
                </span>
              </button>

              {/* Follow button */}
              <button
                onClick={handleFollow}
                type="button"
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                  isFollowing
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFollowing ? "fill-rose-500 text-rose-500" : "text-slate-500"
                  }`}
                />
                <span>{isFollowing ? "Following" : "Follow"}</span>
                <span className="text-[11px] opacity-70 font-semibold">
                  ({followers})
                </span>
              </button>

              {/* Share Pill button */}
              <button
                onClick={handleShareClick}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Share</span>
              </button>

              {/* Existing User toggle pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 shadow-xs">
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  Existing User
                </span>
                <button
                  type="button"
                  onClick={() => setExistingUser((prev) => !prev)}
                  aria-label="Toggle Existing User Deals"
                  className={`relative inline-flex h-4.5 w-8 flex-shrink-0 cursor-pointer rounded-full border-1 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    existingUser ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      existingUser ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Row Container */}
          <div className="flex items-center justify-between gap-3 mt-3 pb-3 font-sans">
            {/* Capsule Tabs */}
            <div className="flex bg-slate-100/90 p-1 rounded-2xl gap-1 overflow-x-auto scrollbar-none flex-grow max-w-md border border-slate-200/60 shadow-inner">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex-grow py-1.5 px-3.5 text-xs font-bold whitespace-nowrap transition-all border-0 cursor-pointer rounded-xl text-center ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/60 font-black"
                      : "bg-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}{" "}
                  <span className="text-[10px] opacity-70 font-semibold">
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters((prev) => !prev)}
              type="button"
              className={`flex sm:hidden items-center justify-center w-9 h-9 rounded-full shadow-xs border border-slate-200 cursor-pointer flex-shrink-0 transition-all active:scale-95 ${
                showMobileFilters
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Multi-Platform Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5 font-sans relative">
            <button
              onClick={() => setIsShareModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-2">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Share {merchant.businessName} Deals
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Share active promo codes and discounts with friends
              </p>
            </div>

            {/* Social Icons Grid */}
            <div className="grid grid-cols-4 gap-3 py-1">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.254-1.115z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-700">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-700">Facebook</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900/10 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-700">X (Twitter)</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-700">LinkedIn</span>
              </a>
            </div>

            {/* Copy Link field */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-slate-600 font-medium px-2 flex-1 focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


