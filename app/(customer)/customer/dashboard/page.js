"use client";

import { Bookmark, History, PiggyBank, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import CouponCard from "@/components/shared/CouponCard";
import KPICard from "@/components/shared/KPICard";

export default function CustomerDashboard() {
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Mock User
  const user = { name: "Sarah Jenkins", role: "customer" };

  // Mock Coupons
  const claimedCoupons = [
    {
      _id: "c1",
      title: "Get 50% off your next 5 food orders",
      discountValue: 50,
      discountType: "percentage",
      description: "Valid on all restaurant deliveries above $15.",
      category: "Food",
      successRate: 99,
      isMerchantVerified: true,
      isVouchiqoVerified: true,
      workedToday: true,
      merchantId: { name: "Zomato Delivery" },
    },
  ];

  const savedCoupons = [
    {
      _id: "c3",
      title: "Exclusive Notion Plus Plan: $50 Free Credits",
      discountValue: 50,
      discountType: "fixed",
      description:
        "Upgrade your team workspace or personal workspace with $50 billing credits.",
      category: "SaaS",
      successRate: 98,
      isMerchantVerified: true,
      isVouchiqoVerified: true,
      workedToday: false,
      merchantId: { name: "Notion Workspace" },
    },
  ];

  const activities = [
    {
      type: "claim",
      message: "Claimed Starbucks BOGO coupon code",
      time: "2 hours ago",
    },
    {
      type: "save",
      message: "Saved Notion Workspace $50 credits coupon",
      time: "1 day ago",
    },
    {
      type: "revival",
      message: "Voted to revive Uber Premier coupon",
      time: "3 days ago",
    },
  ];

  return (
    <DashboardLayout title="Customer Dashboard" user={user}>
      {/* Welcome Banner */}
      <div className="bg-brand-navy text-white p-6 rounded-[16px] relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-bold font-heading">
            Welcome back, {user.name}!
          </h2>
          <p className="text-xs text-slate-300">
            You saved $45 this week. Check out your updated savings timeline
            details below.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Cash Saved"
          value="$284.50"
          change={12.4}
          icon={PiggyBank}
        />
        <KPICard
          title="Active Claims"
          value="3 Coupons"
          change={0.0}
          icon={History}
        />
        <KPICard
          title="Saved Items"
          value="8 Coupons"
          change={5.2}
          icon={Bookmark}
        />
        <KPICard
          title="Revival Votes"
          value="4 Votes"
          change={25}
          icon={RefreshCw}
        />
      </div>

      {/* Core Dashboard Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Claimed and Saved Coupons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claimed Coupons list */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
              Recently Claimed
            </h3>
            {claimedCoupons.length > 0
              ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {claimedCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon._id}
                      coupon={coupon}
                      onRedeem={(c) => setSelectedCoupon(c)}
                    />
                  ))}
                </div>
              : <div className="bg-brand-bg border border-brand-border rounded-lg p-8 text-center text-xs text-brand-subtext">
                  No claimed coupons yet. Browse deals to get started!
                </div>}
          </div>

          {/* Saved Coupons list */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
              Saved For Later
            </h3>
            {savedCoupons.length > 0
              ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {savedCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon._id}
                      coupon={coupon}
                      onRedeem={(c) => setSelectedCoupon(c)}
                    />
                  ))}
                </div>
              : <div className="bg-brand-bg border border-brand-border rounded-lg p-8 text-center text-xs text-brand-subtext">
                  No saved coupons yet.
                </div>}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-6">
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-xs leading-snug"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-brand-text font-semibold">
                      {act.message}
                    </p>
                    <span className="text-[10px] text-brand-subtext">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Stamp Banner */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-success/10 text-brand-success flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-navy">
                Vouchiqo Security Grade
              </h4>
              <p className="text-[10px] text-brand-subtext mt-0.5">
                Your claims are backed by 100% cryptographic brand
                authentication layers.
              </p>
            </div>
          </div>
        </div>
      </div>
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
    </DashboardLayout>
  );
}
