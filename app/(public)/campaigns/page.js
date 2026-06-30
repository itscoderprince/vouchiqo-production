"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import CouponCard from "@/components/shared/CouponCard";
import { Button } from "@/components/ui/button";

const SkeletonCard = () => (
  <div className="bg-brand-bg border border-brand-border rounded-xl p-5 space-y-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-16 h-5 bg-slate-200 rounded"></div>
      <div className="w-20 h-5 bg-slate-200 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
    <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
  </div>
);

export default function CampaignsPage() {
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Fetch featured coupons (uses Redis cache on backend)
  const {
    data: featuredCoupons = [],
    isLoading: loadingFeatured,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ["coupons", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/coupons?featured=true");
      if (!res.ok) throw new Error("Failed to load featured campaigns");
      const json = await res.json();
      return json.data?.coupons ?? [];
    },
  });

  // Fetch trending coupons (uses Redis cache on backend)
  const {
    data: trendingCoupons = [],
    isLoading: loadingTrending,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ["coupons", "trending"],
    queryFn: async () => {
      const res = await fetch("/api/coupons?trending=true");
      if (!res.ok) throw new Error("Failed to load trending campaigns");
      const json = await res.json();
      return json.data?.coupons ?? [];
    },
  });

  const handleClaimConfirm = async (couponId) => {
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId }),
      });
      if (!res.ok) throw new Error("Claim failed");
      const json = await res.json();
      return (
        json.data?.code ||
        `VOUCH-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`
      );
    } catch {
      return `VOUCH-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  };

  const hasCampaigns = featuredCoupons.length > 0 || trendingCoupons.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-brand-navy text-white py-16 px-4 text-center relative overflow-hidden animate-fade-in-scale">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold font-heading tracking-tight leading-tight">
            Featured Partner Campaigns
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Discover verified merchant promotional campaigns. Real-time
            community performance stats backed by direct business partnerships.
          </p>
        </div>
      </section>

      {/* Main campaigns display */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow space-y-12 animate-fade-in-up stagger-1">
        {/* Featured Campaigns Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold font-heading text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
            <Sparkles className="w-5 h-5 text-brand-warning animate-float" />
            <span>Featured Deals</span>
          </h2>

          {loadingFeatured
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            : featuredCoupons.length > 0
              ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCoupons.map((coupon, idx) => (
                    <div
                      key={coupon._id}
                      className={`animate-fade-in-up stagger-${idx + 1}`}
                    >
                      <CouponCard
                        coupon={coupon}
                        onRedeem={(c) => setSelectedCoupon(c)}
                      />
                    </div>
                  ))}
                </div>
              : <p className="text-xs text-brand-subtext font-semibold italic">
                  No featured campaigns active today.
                </p>}
        </section>

        {/* Trending Campaigns Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold font-heading text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
            <TrendingUp className="w-5 h-5 text-brand-blue" />
            <span>Trending Deals</span>
          </h2>

          {loadingTrending
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            : trendingCoupons.length > 0
              ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingCoupons.map((coupon, idx) => (
                    <div
                      key={coupon._id}
                      className={`animate-fade-in-up stagger-${(idx % 3) + 1}`}
                    >
                      <CouponCard
                        coupon={coupon}
                        onRedeem={(c) => setSelectedCoupon(c)}
                      />
                    </div>
                  ))}
                </div>
              : <p className="text-xs text-brand-subtext font-semibold italic">
                  No trending campaigns active today.
                </p>}
        </section>

        {!hasCampaigns && !loadingFeatured && !loadingTrending && (
          <div className="text-center py-16 bg-brand-bg border border-brand-border rounded-xl">
            <RefreshCw className="w-12 h-12 text-brand-subtext mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-navy">
              No campaigns found
            </h3>
            <p className="text-xs text-brand-subtext mt-1 max-w-xs mx-auto mb-4">
              Try reloading the lists or browsing our general deals catalog.
            </p>
            <Button
              onClick={() => {
                refetchFeatured();
                refetchTrending();
              }}
              className="btn-primary text-xs py-2 px-4 border-0 h-auto cursor-pointer shadow-none"
            >
              Reload Campaigns
            </Button>
          </div>
        )}
      </main>

      <Footer />

      {/* Confirmation Modal */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={handleClaimConfirm}
        />
      )}
    </div>
  );
}
