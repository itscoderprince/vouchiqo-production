"use client";

import { useState } from "react";
import { Check, CheckCircle2, Heart, SlidersHorizontal, Sparkles, Star, TrendingUp } from "lucide-react";
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
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const tabs = [
    { id: "all", label: "All", count: coupons.length },
    { id: "cpn", label: "Codes", count: couponsCount },
    { id: "dl", label: "Offers", count: offersCount },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-1.5 text-[13px] text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <li>
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors font-medium"
              >
                Home
              </Link>
            </li>
            <span className="text-gray-300">/</span>
            <li>
              <Link
                href="/brands"
                className="hover:text-blue-600 transition-colors font-medium"
              >
                Brands
              </Link>
            </li>
            <span className="text-gray-300">/</span>
            <li className="text-gray-900 font-semibold truncate max-w-[200px]">
              {merchant.businessName}
            </li>
          </ol>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative w-full h-[140px] sm:h-[200px] bg-gradient-to-r from-gray-900 via-blue-950 to-blue-900 overflow-hidden">
        {merchant.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={merchant.banner}
            alt={`${merchant.businessName} banner`}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <>
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Decorative circles */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Brand Identity Section */}
      <section className="w-full bg-white border-b border-gray-100">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo + Info row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative">
            {/* Left: Logo + Brand Name */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              {/* Logo — overlaps banner */}
              <div
                className="relative z-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-white"
                style={{
                  width: 96,
                  height: 96,
                  marginTop: -48,
                  border: "3px solid #fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                {merchant.logo && !logoFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.logo}
                    alt={merchant.businessName}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span
                    className="font-bold text-2xl text-blue-600"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                    }}
                  >
                    {merchant.businessName?.[0]}
                  </span>
                )}
              </div>

              {/* Brand name + badges (with top gap spacing) */}
              <div className="pt-3 sm:pt-4 space-y-1.5 pb-4 text-left">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1
                    className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                    }}
                  >
                    {merchant.businessName}
                  </h1>

                  {/* Verified Text first (neutral text), then Green Twitter Tick */}
                  {merchant.isVerified !== false && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                      <span>Verified</span>
                      <TwitterGreenTick className="w-4 h-4 text-emerald-500" />
                    </span>
                  )}

                  {/* Growth Partner Text first (neutral text), then Icon */}
                  {merchant.plan ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 capitalize">
                      <span>{merchant.plan} Partner</span>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                      <span>Growth Partner</span>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    </span>
                  )}
                </div>

                <p
                  className="text-[13px] text-gray-500 font-normal"
                  style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
                >
                  {coupons.length} active deals · validated on{" "}
                  <span className="text-gray-700 font-semibold">{todayStr}</span>
                </p>

                {/* Mobile star rating */}
                <div className="flex sm:hidden items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-medium">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                  <span>{ratingVal.toFixed(0) || 4}/5</span>
                  <span className="text-gray-300">|</span>
                  <span>{votesCount} Users</span>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleRate}
                    disabled={isRated}
                    className="text-blue-600 font-semibold hover:underline border-0 bg-transparent p-0 cursor-pointer text-[11px]"
                  >
                    {isRated ? "Rated" : "Rate Now"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions (Rating, Follow, Existing User Toggle) */}
            <div
              className={`${
                showMobileFilters ? "flex" : "hidden"
              } sm:flex flex-wrap items-center gap-2.5 pb-4 w-full sm:w-auto mt-3 sm:mt-0`}
            >
              {/* Star rating pill button */}
              <button
                onClick={handleRate}
                type="button"
                disabled={isRated}
                title={isRated ? "Rating submitted" : "Click to rate this merchant"}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/80 transition-all text-xs font-bold text-amber-900 shadow-2xs disabled:opacity-75 cursor-pointer"
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
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
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isFollowing
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
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

              {/* Existing User toggle pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50/90 shadow-2xs">
                <span
                  className="text-xs font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1"
                  style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
                >
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
          <div className="flex items-center justify-between gap-3 mt-4 pb-3">
            {/* Capsule Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-none flex-grow max-w-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex-grow py-1.5 px-3 text-[12px] font-medium whitespace-nowrap transition-all border-0 cursor-pointer rounded-lg text-center ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-xs font-semibold"
                      : "bg-transparent text-gray-500 hover:text-gray-800"
                  }`}
                  style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
                >
                  {tab.label}{" "}
                  <span className="text-[10px] opacity-70">
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters((prev) => !prev)}
              type="button"
              className={`flex sm:hidden items-center justify-center w-10 h-10 rounded-full shadow-md border-0 cursor-pointer flex-shrink-0 transition-all active:scale-95 ${
                showMobileFilters
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
