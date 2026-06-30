"use client";

import {
  CheckCircle2,
  Clock,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import CouponCard from "@/components/shared/CouponCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MerchantPublicProfile({ params }) {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock merchant profile
  const merchant = {
    _id: "m1",
    name: "Zomato Delivery",
    category: "Food Delivery",
    description:
      "Fast, reliable restaurant food delivery network serving over 100 cities globally. Discover verified coupons and discount deals on restaurant checkout items.",
    rating: 4.9,
    reviewsCount: 184,
    location: "Global / Multi-City",
    logo: "Z",
    phone: "+1 (555) 019-2834",
    email: "partner@zomato.com",
    website: "https://zomato.com",
    hours: "24/7 Operations",
    activeDeals: [
      {
        _id: "c1",
        title: "Get 50% off your next 5 food orders",
        discountValue: 50,
        discountType: "percentage",
        description:
          "Valid on all restaurant deliveries above $15. Maximum discount cap of $10 per order.",
        category: "Food",
        successRate: 99,
        isMerchantVerified: true,
        isVouchiqoVerified: true,
        workedToday: true,
        merchantId: { name: "Zomato Delivery" },
      },
      {
        _id: "c4",
        title: "Free Delivery on orders above $30",
        discountValue: 0,
        discountType: "fixed",
        description:
          "Zero delivery fees applied on premium restaurant orders. Automatically verified.",
        category: "Food",
        successRate: 98,
        isMerchantVerified: true,
        isVouchiqoVerified: true,
        workedToday: true,
        merchantId: { name: "Zomato Delivery" },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      {/* Cover Banner */}
      <section className="bg-brand-navy h-48 md:h-64 relative overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center font-extrabold text-3xl text-brand-navy shadow-md">
              {merchant.logo}
            </div>
            <div className="text-white space-y-1 md:pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight leading-none">
                  {merchant.name}
                </h1>
                <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15 border-0 shadow-none px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Brand</span>
                </Badge>
              </div>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                {merchant.category}
              </p>
            </div>
          </div>

          <div className="md:pb-2 flex gap-3">
            <Button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`btn-secondary text-xs px-5 py-2 flex items-center gap-1.5 border-0 h-auto cursor-pointer shadow-none ${
                isFollowing
                  ? "bg-brand-error hover:bg-brand-error/90"
                  : "bg-brand-blue hover:bg-brand-blue/90"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFollowing ? "fill-current" : ""}`}
              />
              <span>{isFollowing ? "Following" : "Follow Brand"}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Active Coupons */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold font-heading text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center justify-between">
            <span>Active Coupons</span>
            <span className="text-xs text-brand-subtext font-semibold">
              ({merchant.activeDeals.length} deals available)
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {merchant.activeDeals.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onRedeem={(c) => setSelectedCoupon(c)}
              />
            ))}
          </div>
        </section>

        {/* Right Section: Sidebar Business Info */}
        <aside className="space-y-6">
          {/* Business Details Card */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
              Business Information
            </h3>
            <p className="text-xs text-brand-subtext leading-relaxed">
              {merchant.description}
            </p>

            <hr className="border-brand-border" />

            <div className="space-y-3.5 text-xs font-semibold text-brand-text">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <span>{merchant.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <a
                  href={merchant.website}
                  className="text-brand-blue hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {merchant.website.replace("https://", "")}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <span>{merchant.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <span>{merchant.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <span>{merchant.hours}</span>
              </div>
            </div>
          </div>

          {/* Location Map Frame */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
              Location Map
            </h3>
            <div className="h-44 bg-brand-surface rounded-lg border border-brand-border flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#1e4faf15_2px,transparent_2px)] [background-size:16px_16px]"></div>
              <div className="p-3 bg-brand-bg border border-brand-border rounded-lg shadow-sm flex items-center gap-2 z-10">
                <MapPin className="w-5 h-5 text-brand-error" />
                <span className="text-[10px] font-bold text-brand-navy">
                  Headquarters Registered
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={async (_id) => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return `VOUCH-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`;
          }}
        />
      )}
    </div>
  );
}
