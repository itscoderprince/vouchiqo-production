"use client";

import { CheckCircle2, Heart, Star } from "lucide-react";
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
                  height: 72,
                  marginTop: -36,
                  border: "3px solid #fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                {merchant.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.logo}
                    alt={merchant.businessName}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
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
                <div className="flex sm:hidden items-center gap-1.5 mt-0.5">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-current stroke-none"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {ratingVal.toFixed(1)} ({votesCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 pb-4 flex-wrap">
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

          {/* Tabs */}
          <div className="flex border-b border-gray-100 -mb-px overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`pb-3 px-4 text-[13px] font-medium whitespace-nowrap transition-all border-0 bg-transparent cursor-pointer relative ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                {tab.label}{" "}
                <span
                  className={`text-[11px] ${activeTab === tab.id ? "text-blue-400" : "text-gray-400"}`}
                >
                  ({tab.count})
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
