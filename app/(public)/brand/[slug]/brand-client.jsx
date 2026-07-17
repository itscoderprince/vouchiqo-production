"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

import BrandHeader from "./components/BrandHeader";
import BrandStats from "./components/BrandStats";
import CouponCard from "./components/CouponCard";
import ExpiredOfferCard from "./components/ExpiredOfferCard";
import RelatedFooter from "./components/RelatedFooter";
import SidebarSection from "./components/SidebarSection";

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
  const [revivalStatus, setRevivalStatus] = useState({});

  const openStatus = useMemo(() => {
    if (!merchant.operatingHours)
      return { label: "Hours Unspecified", color: "text-gray-400" };
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
    return { label: "Open Now", color: "text-blue-600" };
  }, [merchant.operatingHours]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const todayStr = useMemo(() => {
    if (!isClient) return "Today";
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [isClient]);

  const filteredCoupons = useMemo(() => {
    let list = coupons;
    if (existingUser) {
      list = list.filter((c) => !c.title?.toLowerCase().includes("first"));
    }
    if (activeTab === "all") return list;
    if (activeTab === "cpn")
      return list.filter((c) => c.code && c.code.trim() !== "");
    if (activeTab === "dl")
      return list.filter((c) => !c.code || c.code.trim() === "");
    return list;
  }, [coupons, activeTab, existingUser]);

  const couponsCount = useMemo(
    () => coupons.filter((c) => c.code && c.code.trim() !== "").length,
    [coupons],
  );

  const offersCount = useMemo(
    () => coupons.filter((c) => !c.code || c.code.trim() === "").length,
    [coupons],
  );

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
      if (code) {
        navigator.clipboard.writeText(code);
      }
      setCopiedCouponId(couponId);
      setTimeout(() => setCopiedCouponId(null), 2000);
      window.open(`/deals/${couponId}`, "_blank");
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

  const faqs = useMemo(() => {
    const brand = merchant.businessName || "this brand";
    return [
      {
        q: `How do I apply a ${brand} promo code?`,
        a: `Click 'Get Code' to copy the promo code, then paste it into the promo code field on ${brand}'s checkout page and click Apply.`,
      },
      {
        q: "Are all deals on Vouchiqo verified?",
        a: "Yes — every deal is manually reviewed and tested by our team before being listed to ensure it works.",
      },
      {
        q: "What do I do if an offer has expired?",
        a: `Click 'Revive Offer' to request reactivation. Our team will contact ${brand} to secure a fresh active deal.`,
      },
    ];
  }, [merchant.businessName]);

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 text-gray-900"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <Navbar />

      {/* Brand header (breadcrumb + banner + info + tabs) */}
      <BrandHeader
        merchant={merchant}
        coupons={coupons}
        todayStr={todayStr}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFollowing={isFollowing}
        handleFollow={handleFollow}
        followers={followers}
        ratingVal={ratingVal}
        votesCount={votesCount}
        isRated={isRated}
        handleRate={handleRate}
        existingUser={existingUser}
        setExistingUser={setExistingUser}
        couponsCount={couponsCount}
        offersCount={offersCount}
      />

      {/* Main content area - full width */}
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Coupons (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Stats row */}
            <BrandStats coupons={coupons} merchant={merchant} />

            {/* Coupon list */}
            <div className="space-y-3 pt-2">
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    isExpanded={expandedCouponId === coupon._id}
                    toggleDetails={() => toggleDetails(coupon._id)}
                    copiedCouponId={copiedCouponId}
                    handleCopyCode={handleCopyCode}
                    merchant={merchant}
                  />
                ))
              ) : (
                <div className="py-16 text-center bg-white border border-gray-100 rounded-xl">
                  <p className="text-[14px] text-gray-500 font-normal">
                    No deals match your current filter.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("all");
                      setExistingUser(false);
                    }}
                    type="button"
                    className="mt-3 text-blue-600 font-medium text-sm hover:underline border-0 bg-transparent cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            {/* Expired deals */}
            {expiredCoupons.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Expired Offers
                </h3>
                <div className="space-y-2">
                  {expiredCoupons.map((coupon) => (
                    <ExpiredOfferCard
                      key={coupon._id}
                      coupon={coupon}
                      revivalStatus={revivalStatus}
                      handleReviveExpired={handleReviveExpired}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar (4 cols) */}
          <SidebarSection
            merchant={merchant}
            openStatus={openStatus}
            faqs={faqs}
            copiedLink={copiedLink}
            handleShare={handleShare}
          />
        </div>
      </main>

      {/* Related brands */}
      <RelatedFooter relatedBrands={relatedBrands} merchant={merchant} />

      <Footer />
    </div>
  );
}
