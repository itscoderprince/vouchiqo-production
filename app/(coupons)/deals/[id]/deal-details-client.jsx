"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";

export default function DealDetailsClient({ coupon, relatedCoupons = [] }) {
  const router = useRouter();
  const { isLoggedIn, user } = useUser();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'yes' | 'no' | null
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const isMockCoupon = typeof coupon._id === "string" && coupon._id.startsWith("mock_");
  const [localMockSaved, setLocalMockSaved] = useState(false);

  useEffect(() => {
    if (isMockCoupon && typeof window !== "undefined") {
      setLocalMockSaved(localStorage.getItem(`mock_claim_${coupon._id}`) === "true");
    }
  }, [coupon._id, isMockCoupon]);

  // Fetch active saved claims for the user
  const { data: claims = [], refetch: refetchClaims } = useQuery({
    queryKey: ["user-claims"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const res = await fetch("/api/claims?status=active");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.claims || [];
    },
    enabled: isLoggedIn && !isMockCoupon,
  });

  const matchedClaim = useMemo(() => {
    if (!claims || !Array.isArray(claims)) return null;
    return claims.find((c) => {
      if (!c || !c.couponId) return false;
      const cId = typeof c.couponId === "object" ? (c.couponId._id || c.couponId.id) : c.couponId;
      return String(cId) === String(coupon._id);
    });
  }, [claims, coupon._id]);

  const isSaved = isMockCoupon ? localMockSaved : !!matchedClaim;

  const claimId = useMemo(() => {
    if (isMockCoupon) return `mock_clm_${String(coupon._id).slice(-8)}`;
    if (matchedClaim?._id) return String(matchedClaim._id);
    if (matchedClaim?.id) return String(matchedClaim.id);
    if (isLoggedIn) {
      const uId = String(user?.id || user?._id || "user").slice(-4);
      const cId = String(coupon._id || "deal").slice(-4);
      return `clm_${uId}${cId}`;
    }
    return null;
  }, [isMockCoupon, matchedClaim, isLoggedIn, user, coupon._id]);

  const uniqueClaimCode = useMemo(() => {
    if (!claimId) return null;
    const prefixCode = (coupon.code || "DEAL").replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const suffix = String(claimId).replace(/[^A-Z0-9]/gi, "").slice(-8).toUpperCase();
    return `VQ-${prefixCode || "DEAL"}-${suffix}`;
  }, [claimId, coupon.code]);

  // Toggle Save / Claim mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        const res = await fetch(`/api/claims/${claimId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to unsave coupon");
        return { action: "unsave" };
      } else {
        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponId: coupon._id }),
        });
        if (!res.ok) throw new Error("Failed to save coupon");
        return { action: "save" };
      }
    },
    onSuccess: (data) => {
      refetchClaims();
      toast.success(
        data.action === "save"
          ? "Coupon saved to your collection!"
          : "Coupon removed from your collection.",
      );
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update save status.");
    },
  });

  const handleToggleSave = () => {
    if (isMockCoupon) {
      const newSaved = !localMockSaved;
      setLocalMockSaved(newSaved);
      if (typeof window !== "undefined") {
        localStorage.setItem(`mock_claim_${coupon._id}`, String(newSaved));
      }
      toast.success(
        newSaved
          ? "Coupon saved to your collection!"
          : "Coupon removed from your collection.",
      );
      return;
    }
    if (!isLoggedIn) {
      toast.error("Please login to save coupons!");
      router.push(`/login?callbackUrl=/deals/${coupon._id}`);
      return;
    }
    toggleSaveMutation.mutate();
  };

  const autoClaim = async () => {
    if (isMockCoupon) return;
    if (isLoggedIn && !isSaved) {
      try {
        await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponId: coupon._id }),
        });
        refetchClaims();
      } catch (err) {
        console.error("Auto-claim failed:", err);
      }
    }
  };

  useEffect(() => {
    if (isMockCoupon) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`mock_claim_${coupon._id}`, "true");
      }
      setLocalMockSaved(true);
      return;
    }
    if (isLoggedIn && !isSaved) {
      autoClaim();
    }
  }, [isLoggedIn, isSaved, isMockCoupon, coupon._id]);

  const merchantName = coupon.merchantId?.businessName || "Partner";
  const logoUrl = coupon.merchantId?.logo || "/placeholder-brand.png";

  const discountFormatted =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;

  const formattedExpiry = (() => {
    if (!coupon.expiresAt) return "30 Nov 2026";
    const d = new Date(coupon.expiresAt);
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthStr = months[d.getMonth()];
    const year = d.getFullYear();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayStr = days[d.getDay()];
    return `${monthStr} ${day}, ${year} (${dayStr})`;
  })();

  const handleCopyCode = () => {
    if (!coupon.code) return;
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);

    // Save claim event to DB in the background
    autoClaim();

    // Open Code Copied success dialog
    setIsCopyModalOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setShowShareTooltip(true);
    setTimeout(() => {
      setCopiedShare(false);
      setShowShareTooltip(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB] text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow space-y-6">
        {/* Navigation Action Row */}
        <div className="flex justify-between items-center select-none">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Save Offer Toggle Action */}
            <button
              type="button"
              onClick={handleToggleSave}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border shadow-sm cursor-pointer transition-all ${
                isSaved
                  ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Offer"}</span>
            </button>

            {/* Share action */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 text-xs font-bold text-brand-blue bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all"
              >
                <span>Share</span>
                <Share2 className="w-3.5 h-3.5" />
              </button>
              {showShareTooltip && (
                <span className="absolute bottom-full right-0 mb-2 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md whitespace-nowrap animate-fade-in">
                  Link Copied!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Coupon Card (Left) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
            {/* Header section: label, title, and logo */}
            <div className="p-6 md:p-8 flex justify-between items-start gap-4 border-b border-slate-100 bg-white">
              <div className="space-y-2">
                <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {coupon.code ? "Coupon" : "Sale"}
                </span>
                <h1 className="text-lg md:text-xl font-black text-slate-800 leading-snug tracking-tight">
                  {coupon.code ? (
                    <>
                      {"Use Code & Get "}
                      {discountFormatted}
                      {" on "}
                      {coupon.merchantId?.slug ? (
                        <Link
                          href={`/brand/${coupon.merchantId.slug}`}
                          className="text-brand-blue hover:underline cursor-pointer"
                        >
                          {merchantName}
                        </Link>
                      ) : (
                        merchantName
                      )}
                    </>
                  ) : (
                    `Sale: ${coupon.title}`
                  )}
                </h1>
              </div>
              {coupon.merchantId?.slug ? (
                <Link
                  href={`/brand/${coupon.merchantId.slug}`}
                  className="w-16 h-16 rounded-2xl border border-slate-200 bg-white flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm hover:border-brand-blue transition-colors cursor-pointer"
                >
                  <img
                    src={logoUrl}
                    alt={merchantName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
                    }}
                  />
                </Link>
              ) : (
                <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={logoUrl}
                    alt={merchantName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Coupon Box Container */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/40 text-center space-y-6">
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {coupon.code
                    ? "Your Promo Code is Ready Below"
                    : "Your Offer Has Been Activated On The Website Already"}
                </p>
              </div>

              {/* Dotted coupon box */}
              <div className="max-w-md mx-auto select-all">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`w-full border-2 border-dashed rounded-2xl py-5 px-6 relative cursor-pointer transition-all duration-300 ${
                    copiedCode
                      ? "border-brand-success bg-brand-success/5"
                      : "border-brand-blue/40 bg-white hover:bg-slate-50 hover:border-brand-blue"
                  }`}
                >
                  <span className="font-mono text-2xl font-black tracking-[0.2em] text-slate-800 uppercase pl-3">
                    {coupon.code ? coupon.code : "OFFER ACTIVATED"}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-white rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <span className="font-bold flex items-center gap-2 text-xs">
                      {copiedCode ? "Copied!" : "Click to Copy Code"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Unique In-Store Claim Card */}
              {isLoggedIn ? (
                uniqueClaimCode ? (
                  <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">
                        Unique In-Store Claim Code
                      </span>
                      <span className="text-[10px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-bold">
                        Ready to Present
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 select-all">
                      <span className="font-mono text-base font-black tracking-wider text-slate-800 uppercase">
                        {uniqueClaimCode}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(uniqueClaimCode);
                          toast.success("Claim code copied!");
                        }}
                        type="button"
                        className="text-xs text-brand-blue font-bold hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Present this code at the physical counter. The merchant can verify your claim and customer details using this code.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 font-semibold py-2">
                    Generating unique in-store claim code...
                  </div>
                )
              ) : (
                <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-500 font-bold mb-2">
                    Want to redeem in-store?
                  </p>
                  <Link
                    href={`/login?callbackUrl=/deals/${coupon._id}`}
                    className="inline-block bg-brand-blue text-white text-[11px] font-black px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Login to Generate In-Store Code
                  </Link>
                </div>
              )}

              {/* Redirect link OR In-Store Details */}
              {coupon.merchantId?.website ? (
                <div className="pt-2">
                  <a
                    href={coupon.merchantId.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={autoClaim}
                    className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-blue hover:underline transition-colors"
                  >
                    <span>Go To {merchantName} Website</span>
                    <ExternalLink className="w-4 h-4 text-brand-blue" />
                  </a>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100/80">
                  <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="text-lg">📍</span>
                      <span>Physical Store Counter Location</span>
                    </div>
                    {coupon.merchantId?.location ? (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800">
                          {coupon.merchantId.businessName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          {[
                            coupon.merchantId.location.address,
                            coupon.merchantId.location.city,
                            coupon.merchantId.location.state,
                            coupon.merchantId.location.pincode
                          ].filter(Boolean).join(", ")}
                        </p>
                        <div className="pt-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${coupon.merchantId.businessName} ${coupon.merchantId.location.address || ""} ${coupon.merchantId.location.city || ""} ${coupon.merchantId.location.pincode || ""}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-black text-brand-blue hover:underline"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-semibold italic">
                        No physical location or website details available for this store partner.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status Tags */}
              <ul className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-success fill-brand-success/10" />
                  <span>Verified</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Existing User</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Valid Till: {formattedExpiry}</span>
                </li>
              </ul>
            </div>

            {/* Telegram promotional banner */}
            <div className="p-6 md:p-8 border-b border-slate-100">
              <a
                href="https://t.me/vouchiqo"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-sky-600 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h3 className="text-lg font-black tracking-tight">
                      Don't Miss out on incredible deals &amp; exclusive
                      coupons!
                    </h3>
                    <p className="text-xs text-blue-100 font-semibold">
                      Join the Vouchiqo official channel and save more.
                    </p>
                  </div>
                  <span className="bg-white text-blue-600 font-black text-xs px-5 py-2.5 rounded-full uppercase tracking-wider hover:bg-slate-100 transition-colors">
                    Join Our Telegram
                  </span>
                </div>
              </a>
            </div>

            {/* T&C Section */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/20 text-left">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                T&amp;C's
              </h3>
              <ul className="text-xs text-slate-500 space-y-3 list-disc pl-5 leading-relaxed font-semibold">
                <li>
                  Get{" "}
                  <span className="text-brand-blue">{discountFormatted}</span>{" "}
                  on your <span className="text-slate-800">{coupon.title}</span>
                </li>
                <li>
                  Applicable on active categories and selected items on
                  checkout.
                </li>
                <li>
                  Learn from verified partner stores and save with Vouchiqo
                  promo codes.
                </li>
                <li>
                  Cannot be combined with other running vouchers or promotions.
                </li>
                <li>
                  Expiry date is subject to change at merchant discretion.
                </li>
                <li>Hurry up! limited time offer</li>
              </ul>
            </div>

            {/* Feedback / Voting */}
            <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-left">
              <span className="text-xs text-slate-500 font-bold">
                Did the coupon work?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserVote("yes")}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    userVote === "yes"
                      ? "bg-brand-success/15 border-brand-success text-brand-success"
                      : "border-slate-200 hover:bg-slate-50 text-slate-500 bg-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Yes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserVote("no")}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    userVote === "no"
                      ? "bg-brand-error/15 border-brand-error text-brand-error"
                      : "border-slate-200 hover:bg-slate-50 text-slate-500 bg-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>No</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Coupons Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 text-left">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b-2 border-brand-blue/30 w-fit">
                Vouchiqo Related Coupons
              </h2>

              <div className="space-y-4">
                {relatedCoupons.length > 0 ? (
                  relatedCoupons.map((c) => {
                    const cDiscount =
                      c.discountType === "percentage"
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} OFF`;
                    const cBrand =
                      c.merchantId?.businessName || "Verified Partner";
                    const cLogo =
                      c.merchantId?.logo || "/placeholder-brand.png";
                    return (
                      <Link
                        key={c._id}
                        href={`/deals/${c._id}`}
                        className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-300 group"
                      >
                        <div className="w-14 h-14 rounded-lg border border-slate-100 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={cLogo}
                            alt={cBrand}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="text-[10px] font-black text-brand-blue uppercase tracking-wider block">
                            {cDiscount}
                          </span>
                          <h4 className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed group-hover:text-brand-blue transition-colors">
                            {c.title}
                          </h4>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-xs font-semibold text-slate-400">
                    No related coupons found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Copy Success Dialog Box per SRD requirements */}
      <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg">
          <DialogHeader className="space-y-2 pb-2">
            <DialogTitle className="font-heading text-lg font-black text-slate-800 uppercase tracking-wide flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Promo Code Copied!</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Your discount coupon is copied and ready to be used.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {coupon.code && (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-left pl-1">
                  Online Promo Code:
                </span>
                <div className="bg-slate-50 border-2 border-dashed border-brand-blue/30 rounded-xl py-4 px-6 select-all font-mono text-xl font-black tracking-widest text-slate-800 uppercase">
                  {coupon.code}
                </div>
              </div>
            )}
            {uniqueClaimCode && (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-left pl-1">
                  Unique In-Store Verification Code:
                </span>
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl py-3 px-6 select-all font-mono text-base font-black tracking-wider text-blue-700 uppercase flex items-center justify-between">
                  <span>{uniqueClaimCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uniqueClaimCode);
                      toast.success("Claim code copied!");
                    }}
                    type="button"
                    className="text-xs text-blue-600 font-bold hover:underline border-0 bg-transparent p-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              {uniqueClaimCode
                ? "Show the unique verification code above to the merchant shop counter to claim your deal!"
                : `Now visit ${merchantName}, shop for eligible items, and paste the code at payment checkout!`}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {coupon.merchantId?.website ? (
              <Button
                asChild
                className="bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs h-10 w-full rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <a
                  href={coupon.merchantId.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={autoClaim}
                >
                  <span>Visit {merchantName} Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            ) : (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-left space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  📍 Counter Claim Address:
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {merchantName}
                </p>
                {coupon.merchantId?.location ? (
                  <>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      {[
                        coupon.merchantId.location.address,
                        coupon.merchantId.location.city,
                        coupon.merchantId.location.state,
                        coupon.merchantId.location.pincode
                      ].filter(Boolean).join(", ")}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${merchantName} ${coupon.merchantId.location.address || ""} ${coupon.merchantId.location.city || ""} ${coupon.merchantId.location.pincode || ""}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-black text-brand-blue hover:underline pt-1"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 font-semibold italic">
                    In-Store Counter Verification Only.
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCopyModalOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 py-2 cursor-pointer transition-colors"
            >
              Close Window
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
