"use client";

import { useState } from "react";
import { CheckCircle2, Heart, SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";

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

              {/* Brand name + badges */}
              <div className="space-y-1.5 pb-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                    }}
                  >
                    {merchant.businessName}
                  </h1>
                  {merchant.isVerified !== false && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {merchant.plan && (
                    <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {merchant.plan} Partner
                    </span>
                  )}
                </div>

                <p
                  className="text-[13px] text-gray-500 font-normal"
                  style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
                >
                  {coupons.length} active deals · validated on{" "}
                  <span className="text-gray-700 font-medium">{todayStr}</span>
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

            {/* Right: Actions */}
            <div
              className={`${
                showMobileFilters ? "flex" : "hidden"
              } sm:flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pb-4 flex-wrap w-full sm:w-auto mt-2 sm:mt-0`}
            >
              {/* Star rating */}
              <button
                onClick={handleRate}
                type="button"
                disabled={isRated}
                title="Rate this store"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 disabled:opacity-60"
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(ratingVal) ? "fill-current" : ""} stroke-current`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {ratingVal.toFixed(1)} ({votesCount})
                </span>
              </button>

              {/* Follow */}
              <button
                onClick={handleFollow}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                  isFollowing
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                }`}
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${isFollowing ? "fill-white" : ""}`}
                />
                <span>{isFollowing ? "Following" : "Follow"}</span>
                <span className="text-xs opacity-70">({followers})</span>
              </button>

              {/* Existing User toggle */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                <span
                  className="text-[12px] font-medium text-gray-600 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
                >
                  Existing User
                </span>
                <button
                  type="button"
                  onClick={() => setExistingUser((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    existingUser ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      existingUser ? "translate-x-4" : "translate-x-0"
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
