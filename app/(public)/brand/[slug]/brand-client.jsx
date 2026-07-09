"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Facebook,
  Globe,
  Heart,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Share2,
  Star,
  Twitter,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function BrandClient({
  merchant,
  coupons = [],
  expiredCoupons = [],
  relatedBrands = [],
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState(null);
  const [followers, setFollowers] = useState(merchant.followerCount || 42);
  const [ratingVal, setRatingVal] = useState(4.8);
  const [votesCount, setVotesCount] = useState(61);
  const [isRated, setIsRated] = useState(false);
  const [existingUser, setExistingUser] = useState(false);
  const [expandedCouponId, setExpandedCouponId] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Expired revival state
  const [revivalStatus, setRevivalStatus] = useState({});

  // Dynamic FAQs expanded states
  const [expandedFaq, setExpandedFaq] = useState(0);

  const getOpenStatus = () => {
    if (!merchant.operatingHours)
      return { label: "Hours Unspecified", color: "text-slate-400" };
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const now = new Date();
    const dayName = days[now.getDay()];
    const hours = merchant.operatingHours[dayName];
    if (!hours || hours.closed)
      return { label: "Closed Today", color: "text-red-500" };
    return { label: "Open Now", color: "text-emerald-500" };
  };
  const openStatus = getOpenStatus();

  // Mount gate to prevent hydration date mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  const todayStr = useMemo(() => {
    if (!isClient) return "Today";
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [isClient]);

  // Filter coupons based on tab selection
  const filteredCoupons = useMemo(() => {
    let list = coupons;

    // Filter by existing user toggle
    if (existingUser) {
      list = list.filter((c) => !c.title?.toLowerCase().includes("first"));
    }

    if (activeTab === "all") return list;
    if (activeTab === "cpn") {
      return list.filter((c) => c.code && c.code.trim() !== "");
    }
    if (activeTab === "dl") {
      return list.filter((c) => !c.code || c.code.trim() === "");
    }
    return list;
  }, [coupons, activeTab, existingUser]);

  const couponsCount = useMemo(() => {
    return coupons.filter((c) => c.code && c.code.trim() !== "").length;
  }, [coupons]);

  const offersCount = useMemo(() => {
    return coupons.filter((c) => !c.code || c.code.trim() === "").length;
  }, [coupons]);

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowers((prev) => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowers((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = (code, couponId) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCouponId(couponId);
      setTimeout(() => setCopiedCouponId(null), 2000);
      window.open(merchant.website || "https://google.com", "_blank");
    }
  };

  const handleReviveExpired = async (couponId) => {
    setRevivalStatus((prev) => ({ ...prev, [couponId]: "loading" }));
    try {
      const targetCoupon = expiredCoupons.find((c) => c._id === couponId);
      if (!targetCoupon) throw new Error();

      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCoupon.code || "UNKNOWN",
          brandName: merchant.businessName,
          email: "guest@vouchiqo.com",
        }),
      });

      if (res.ok) {
        setRevivalStatus((prev) => ({ ...prev, [couponId]: "success" }));
      } else {
        setRevivalStatus((prev) => ({ ...prev, [couponId]: "error" }));
      }
    } catch {
      setRevivalStatus((prev) => ({ ...prev, [couponId]: "error" }));
    }
  };

  const handleRate = () => {
    if (!isRated) {
      setIsRated(true);
      setVotesCount((prev) => prev + 1);
      setRatingVal(5.0);
    }
  };

  const toggleDetails = (couponId) => {
    setExpandedCouponId((prev) => (prev === couponId ? null : couponId));
  };

  // Generate dynamic FAQs for the brand
  const faqs = useMemo(() => {
    const brand = merchant.businessName || "this brand";
    return [
      {
        q: `How do I apply a discount coupon for ${brand}?`,
        a: `Select a verified coupon from our page, click 'Get Coupon Code' to copy it, then paste it into the coupon/promo code entry box on ${brand}'s official website during checkout.`,
      },
      {
        q: `Are all coupons on Vouchiqo verified?`,
        a: `Yes! Every discount code and offer listed on Vouchiqo is manually checked and verified by our deal hunters daily to ensure you always get working discounts.`,
      },
      {
        q: `What can I do if a coupon has expired?`,
        a: `If a coupon has expired, you can vote to revive it by clicking 'Revive Coupon'. Our team monitors these requests and reaches out to ${brand} to secure new active promotional offers.`,
      },
    ];
  }, [merchant.businessName]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fa] text-[#191f2e] font-sans">
      <Navbar />

      {/* Cover Banner */}
      <div className="relative w-full bg-gradient-to-r from-[#0D213F] to-[#1A3C5E] h-[160px] md:h-[220px] overflow-hidden select-none">
        {merchant.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={merchant.banner}
            alt={`${merchant.businessName} banner`}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0D213F] via-[#1A3C5E] to-[#2563eb] opacity-80" />
        )}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Breadcrumb section */}
      <div className="bg-white border-b border-[#e5e7eb] py-3.5 relative z-10">
        <div className="max-w-[1248px] mx-auto px-4">
          <ul className="flex items-center gap-2 text-[13px] text-[#6b7280] font-medium overflow-x-auto whitespace-nowrap scrollbar-none">
            <li>
              <Link href="/" className="hover:text-[#3e80dd] transition-colors">
                Home
              </Link>
            </li>
            <span>/</span>
            <li>
              <Link
                href="/brands"
                className="hover:text-[#3e80dd] transition-colors"
              >
                Brands
              </Link>
            </li>
            <span>/</span>
            <li className="text-[#191f2e] font-semibold">
              {merchant.businessName} Coupons
            </li>
          </ul>
        </div>
      </div>

      {/* Intro Header Section */}
      <section className="bg-white border-b border-[#e5e7eb] pb-6 select-none relative">
        <div className="max-w-[1248px] mx-auto px-4">
          {/* Overlapping layout block */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-[45px] md:-mt-[60px] relative z-20">
            {/* Left Block: Logo & Title Details */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end w-full md:w-auto">
              {/* Logo */}
              <div
                style={{
                  width: 140,
                  height: 100,
                  borderRadius: 12,
                  border: "4px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  flexShrink: 0,
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
                  <span className="font-extrabold text-3xl text-[#3e80dd]">
                    {merchant.businessName?.[0]}
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1 text-left pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#191f2e] tracking-tight">
                    {merchant.businessName}
                  </h1>
                  {/* Plan badge */}
                  <span className="bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {merchant.plan || "Starter"} Partner
                  </span>
                  {merchant.isVerified !== false && (
                    <span className="bg-[#eaf5ec] text-[#2f855a] border border-[#c6f6d5] px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#2f855a]" />
                      <span>Verified Store</span>
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#6b7280] font-medium">
                  Best {coupons.length} Coupons &amp; Offers last validated on{" "}
                  <span className="text-[#191f2e] font-semibold">
                    {todayStr}
                  </span>
                </p>

                {/* Mobile ratings row */}
                <div className="flex md:hidden items-center gap-2 mt-1">
                  <div className="flex text-[#f59e0b]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-current stroke-none"
                      />
                    ))}
                  </div>
                  <span className="text-[12px] text-[#4b5563] font-semibold">
                    {ratingVal.toFixed(1)}/5 ({votesCount} votes)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Block: Star Rating & Toggle */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 flex-shrink-0 w-full md:w-auto pb-1 justify-between md:justify-end">
              {/* Star ratings container */}
              <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2 rounded-xl shadow-sm text-right">
                <div>
                  <button
                    onClick={handleRate}
                    type="button"
                    className="flex text-[#f59e0b] hover:scale-105 transition-transform border-0 bg-transparent cursor-pointer p-0"
                    title="Click to Rate Store"
                    disabled={isRated}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(ratingVal) ? "fill-[#f59e0b]" : ""
                        } stroke-current`}
                      />
                    ))}
                  </button>
                  <p className="text-[11px] text-[#6b7280] font-bold mt-1 uppercase tracking-wider">
                    {ratingVal.toFixed(1)} / 5 ({votesCount} votes)
                  </p>
                </div>
                <div className="w-px h-8 bg-[#e2e8f0] mx-1" />
                <div className="text-left">
                  <button
                    onClick={handleFollow}
                    type="button"
                    className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider border-0 bg-transparent cursor-pointer transition-colors ${
                      isFollowing
                        ? "text-[#2f855a]"
                        : "text-[#3e80dd] hover:text-[#2563eb]"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isFollowing ? "fill-[#2f855a]" : ""}`}
                    />
                    <span>{isFollowing ? "Following" : "Follow Store"}</span>
                  </button>
                  <p className="text-[10px] text-[#6b7280] font-semibold mt-1">
                    {followers} Followers
                  </p>
                </div>
              </div>

              {/* Existing user switch */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-[#4b5563]">
                  Existing User Offers
                </span>
                <button
                  type="button"
                  onClick={() => setExistingUser((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    existingUser ? "bg-[#3e80dd]" : "bg-[#d1d5db]"
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

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#f1f5f9] text-left">
            <div className="bg-[#f8fafc] px-4 py-3 rounded-xl border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Deals
              </span>
              <span className="text-sm font-black text-[#191f2e] mt-0.5 block">
                {coupons.length} Listed
              </span>
            </div>
            <div className="bg-[#f8fafc] px-4 py-3 rounded-xl border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Average Discount
              </span>
              <span className="text-sm font-black text-[#191f2e] mt-0.5 block">
                Up to 45%
              </span>
            </div>
            <div className="bg-[#f8fafc] px-4 py-3 rounded-xl border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Channel Type
              </span>
              <span className="text-sm font-black text-[#191f2e] mt-0.5 block capitalize">
                {merchant.businessType || "Both"}
              </span>
            </div>
            <div className="bg-[#f8fafc] px-4 py-3 rounded-xl border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <span className="text-sm font-black text-[#191f2e] mt-0.5 block capitalize">
                {merchant.category || "General"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Links list matching GrabOn Tab */}
        <div className="max-w-[1248px] mx-auto px-4 mt-5">
          <div className="flex border-b border-[#e5e7eb] w-full">
            <button
              onClick={() => setActiveTab("all")}
              type="button"
              className={`pb-2.5 px-4 text-[13px] font-black uppercase tracking-wider transition-all border-0 bg-transparent cursor-pointer relative ${
                activeTab === "all"
                  ? "text-[#3e80dd]"
                  : "text-[#6b7280] hover:text-[#3e80dd]"
              }`}
            >
              {"All "}
              <span className="text-[11px] font-bold text-[#9ca3af]">
                ({coupons.length})
              </span>
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3e80dd]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("cpn")}
              type="button"
              className={`pb-2.5 px-4 text-[13px] font-black uppercase tracking-wider transition-all border-0 bg-transparent cursor-pointer relative ${
                activeTab === "cpn"
                  ? "text-[#3e80dd]"
                  : "text-[#6b7280] hover:text-[#3e80dd]"
              }`}
            >
              {"Coupons "}
              <span className="text-[11px] font-bold text-[#9ca3af]">
                ({couponsCount})
              </span>
              {activeTab === "cpn" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3e80dd]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("dl")}
              type="button"
              className={`pb-2.5 px-4 text-[13px] font-black uppercase tracking-wider transition-all border-0 bg-transparent cursor-pointer relative ${
                activeTab === "dl"
                  ? "text-[#3e80dd]"
                  : "text-[#6b7280] hover:text-[#3e80dd]"
              }`}
            >
              {"Offers "}
              <span className="text-[11px] font-bold text-[#9ca3af]">
                ({offersCount})
              </span>
              {activeTab === "dl" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3e80dd]" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content layout grid */}
      <main className="max-w-[1248px] mx-auto px-4 py-6 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Coupons Grid (8 cols, 68% width) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-4">
            {filteredCoupons.map((coupon) => {
              const isExpanded = expandedCouponId === coupon._id;
              const hasCode = coupon.code && coupon.code.trim() !== "";
              const discountText =
                coupon.discountAmount && coupon.discountType
                  ? coupon.discountType === "percentage"
                    ? `${coupon.discountAmount}%`
                    : `₹${coupon.discountAmount}`
                  : null;

              return (
                <div
                  key={coupon._id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                    overflow: "hidden",
                  }}
                  className="transition-all hover:shadow-md"
                >
                  {/* Top card block */}
                  <div className="flex flex-col sm:flex-row items-stretch min-h-[110px]">
                    {/* Left discount badge */}
                    <div
                      style={{
                        background: hasCode
                          ? "linear-gradient(135deg, #3e80dd, #1e40af)"
                          : "linear-gradient(135deg, #10b981, #047857)",
                        color: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px 20px",
                        textAlign: "center",
                        minWidth: 125,
                      }}
                      className="sm:w-[130px] flex-shrink-0"
                    >
                      {discountText ? (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-90">
                            Discount
                          </span>
                          <span className="text-xl sm:text-2xl font-black leading-none my-1">
                            {discountText}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                            OFF
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-90">
                            Exclusive
                          </span>
                          <span className="text-lg font-black leading-none my-1">
                            {hasCode ? "CODE" : "DEAL"}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        </>
                      )}
                    </div>

                    {/* Right content box */}
                    <div className="flex-1 p-5 flex flex-col justify-between text-left gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#eaf5ec] text-[#2f855a] border border-[#c6f6d5] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                          <span className="text-xs text-[#6b7280] font-semibold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>3 Uses Today</span>
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-[#191f2e] leading-snug">
                          {coupon.title}
                        </h3>
                        <p className="text-[12px] text-[#6b7280] leading-relaxed line-clamp-2">
                          {coupon.description}
                        </p>
                      </div>

                      {/* Bottom row: Details trigger and CTA button */}
                      <div className="flex justify-between items-center pt-2 border-t border-[#f1f5f9]">
                        <button
                          onClick={() => toggleDetails(coupon._id)}
                          type="button"
                          className="text-[12px] font-black text-[#6b7280] hover:text-[#3e80dd] transition-colors flex items-center gap-1 border-0 bg-transparent cursor-pointer p-0"
                        >
                          <span>Show Details</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {hasCode ? (
                          <div className="flex items-center">
                            {copiedCouponId === coupon._id ? (
                              <span className="bg-[#eaf5ec] text-[#2f855a] border border-[#c6f6d5] text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-lg">
                                Code Copied!
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleCopyCode(coupon.code, coupon._id)
                                }
                                type="button"
                                style={{
                                  background: "#3e80dd",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  padding: "8px 16px",
                                  cursor: "pointer",
                                  transition: "background 0.2s",
                                }}
                                className="hover:bg-[#2563eb]"
                              >
                                Get Code
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              window.open(
                                merchant.website || "https://google.com",
                                "_blank",
                              )
                            }
                            type="button"
                            style={{
                              background: "#10b981",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              padding: "8px 16px",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            className="hover:bg-[#059669]"
                          >
                            Get Deal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail drawer */}
                  {isExpanded && (
                    <div className="bg-[#fafbfc] border-t border-[#e2e8f0] p-5 text-left text-xs text-[#4b5563] space-y-3">
                      <p className="font-bold uppercase tracking-wider text-[#191f2e] text-[10px]">
                        Offer Details &amp; Terms
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[#6b7280] font-medium">
                        <li>
                          Applicable only on verified purchases via official
                          partner channels.
                        </li>
                        <li>
                          Discount applies to base order value; taxes, fees, and
                          surcharges excluded.
                        </li>
                        <li>
                          Cannot be combined with other ongoing merchant
                          promotions or wallet cashbacks.
                        </li>
                        <li>
                          Offer valid for a limited time period. Valid until
                          stock lasts.
                        </li>
                      </ul>
                      {hasCode && (
                        <div className="flex items-center gap-2 pt-2">
                          <span className="font-bold text-[#191f2e]">
                            Promo Code:
                          </span>
                          <span className="font-mono bg-white border border-[#cbd5e1] text-[#3e80dd] px-2 py-1 rounded font-bold">
                            {coupon.code}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCoupons.length === 0 && (
              <div className="py-16 text-center bg-white border border-[#e2e8f0] rounded-2xl p-6">
                <p className="text-sm font-bold text-[#6b7280]">
                  No active coupon campaigns matching your selection listed for
                  this brand currently.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setExistingUser(false);
                  }}
                  type="button"
                  className="mt-4 text-[#3e80dd] font-black uppercase text-xs hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Expired Coupons section */}
          {expiredCoupons.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-extrabold text-[#4b5563] uppercase tracking-wider text-left">
                Expired Coupons &amp; Offers
              </h3>
              <div className="space-y-2">
                {expiredCoupons.map((coupon) => {
                  const isSuccess = revivalStatus[coupon._id] === "success";
                  const isLoading = revivalStatus[coupon._id] === "loading";

                  return (
                    <div
                      key={coupon._id}
                      className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden"
                    >
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          {coupon.code && (
                            <span className="font-mono text-xs bg-[#f1f5f9] px-2 py-0.5 rounded text-slate-400 line-through">
                              {coupon.code}
                            </span>
                          )}
                          <span className="bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                            Expired
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">
                          {coupon.title}
                        </h4>
                        <p className="text-[11px] text-[#6b7280] leading-snug">
                          {coupon.description}
                        </p>
                      </div>

                      {/* Action button */}
                      <div className="flex-shrink-0 self-stretch sm:self-auto flex items-center justify-end">
                        {isSuccess ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#2f855a] font-bold bg-[#eaf5ec] border border-[#c6f6d5] px-4 py-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Revival Vote Counted</span>
                          </div>
                        ) : (
                          <button
                            disabled={isLoading}
                            onClick={() => handleReviveExpired(coupon._id)}
                            type="button"
                            className="bg-[#3e80dd] hover:bg-[#2563eb] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 border-0 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                <span>Requesting...</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Revive Coupon</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar (4 cols, 32% width) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          {/* About store card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
              About {merchant.businessName}
            </h3>
            <p className="text-[13px] text-[#6b7280] leading-relaxed">
              {merchant.longDescription ||
                merchant.description ||
                "No description provided for this brand storefront."}
            </p>
            {merchant.website && (
              <a
                href={merchant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs font-extrabold text-[#3e80dd] hover:underline flex items-center gap-1"
              >
                <span>Visit Official Store Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Operating Hours Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#f1f5f9]">
              <h3 className="text-xs font-extrabold text-[#191f2e] uppercase tracking-wider">
                Operating Hours
              </h3>
              <span className={`text-[11px] font-bold ${openStatus.color}`}>
                ● {openStatus.label}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-[#6b7280]">
              {merchant.operatingHours ? (
                Object.entries(merchant.operatingHours).map(([day, hrs]) => (
                  <div key={day} className="flex justify-between font-semibold">
                    <span className="capitalize">{day}</span>
                    <span>
                      {hrs.closed ? "Closed" : `${hrs.open} - ${hrs.close}`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">Not specified</p>
              )}
            </div>
          </div>

          {/* Store Location Map */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
              Interactive Map Proximity
            </h3>
            <div className="relative h-44 w-full bg-slate-100 rounded-lg overflow-hidden border border-[#e2e8f0] flex items-center justify-center">
              <iframe
                title="Store Map Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${merchant.location?.lat || 23.3441},${merchant.location?.lng || 85.3096}&z=15&output=embed`}
                allowFullScreen
              />
            </div>
          </div>

          {/* FAQ Accordion block */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3.5">
              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border-b border-[#f1f5f9] last:border-0 pb-3 last:pb-0"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      type="button"
                      className="w-full flex justify-between items-start text-left font-bold text-[13px] text-[#191f2e] hover:text-[#3e80dd] transition-colors border-0 bg-transparent cursor-pointer p-0"
                    >
                      <span className="pr-4">{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#6b7280]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#6b7280]" />
                      )}
                    </button>
                    {isExpanded && (
                      <p className="text-xs text-[#6b7280] leading-relaxed mt-2 pl-1 font-medium">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
              Store Location &amp; Contact
            </h3>
            <div className="space-y-3 text-xs text-[#4b5563] font-semibold">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-[#3e80dd] flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[#6b7280]">
                  {merchant.location?.address &&
                    `${merchant.location.address}, `}
                  {merchant.location?.city ? (
                    <>
                      {merchant.location.city},{" "}
                      {merchant.location.state || "Jharkhand"}
                      {merchant.location?.pincode &&
                        `, ${merchant.location.pincode}`}
                    </>
                  ) : (
                    "Ranchi, Jharkhand, India"
                  )}
                </p>
              </div>

              {merchant.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#3e80dd] flex-shrink-0" />
                  <span className="text-[#6b7280]">
                    {merchant.contactPhone}
                  </span>
                </div>
              )}

              {merchant.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#3e80dd] flex-shrink-0" />
                  <span className="text-[#6b7280]">
                    {merchant.contactEmail}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Share widget */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
              Share {merchant.businessName} Offers
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                type="button"
                className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 border-0 cursor-pointer transition-colors"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2f855a]" />
                    <span className="text-[#2f855a]">Copied Link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Page Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Related brands carousel footer */}
      {relatedBrands.length > 0 && (
        <section className="bg-white border-t border-[#e2e8f0] py-10 px-4 mt-8 select-none">
          <div className="max-w-[1248px] mx-auto space-y-6">
            <h3 className="text-lg font-black text-[#191f2e] tracking-tight text-left">
              Related Brands in {merchant.category || "Same Category"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              {relatedBrands.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brand/${brand.slug}`}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 hover:border-[#3e80dd] flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#3e80dd] text-white font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                    {brand.businessName?.[0]}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-xs text-[#191f2e] truncate leading-none">
                      {brand.businessName}
                    </h5>
                    <span className="text-[9px] text-[#6b7280] font-bold block mt-1 uppercase tracking-wide">
                      {brand.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
