"use client";

import { Bookmark, Trash2 } from "lucide-react";
import CouponCard from "@/components/shared/CouponCard";
import EmptyState from "@/components/shared/EmptyState";

export default function SavedDealsTab({
  savedClaims,
  handleRemoveClaim,
  setSelectedSavedCoupon,
}) {
  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center border-b border-brand-border pb-3">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider">
          Bookmarked & Saved Deals
        </h3>
      </div>
      {savedClaims.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedClaims.map((coupon) => (
            <div key={coupon._id} className="relative group">
              <CouponCard
                coupon={coupon}
                onRedeem={(c) => setSelectedSavedCoupon(c)}
              />
              <button
                type="button"
                onClick={(e) => handleRemoveClaim(e, coupon.claimId)}
                className="absolute top-3 right-12 z-20 w-8 h-8 rounded-full bg-white border border-brand-border text-brand-subtext hover:text-brand-error flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete Bookmark"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved coupons"
          description="Save coupons while browsing to keep track of deals you want to use later."
        />
      )}
    </div>
  );
}
