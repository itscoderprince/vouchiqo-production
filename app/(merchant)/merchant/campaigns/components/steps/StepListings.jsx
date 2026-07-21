"use client";

import { Percent, Plus, Search, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StepListings({
  campaignData,
  setCampaignData,
  filteredCoupons,
  listingSearch,
  setListingSearch,
  toggleCouponAttachment,
  onBack,
  onNext,
}) {
  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Attach Listings</h3>
      </div>

      <div className="space-y-4">
        {/* Promo Code & Offer Type settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Ticket className="w-3.5 h-3.5 text-orange-600" /> Campaign Promo Code *
            </Label>
            <Input
              type="text"
              placeholder="e.g. SAVE20"
              value={campaignData.code}
              onChange={(e) => setCampaignData({ ...campaignData, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
              className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Percent className="w-3.5 h-3.5 text-blue-600" /> Offer Type *
            </Label>
            <Select
              value={campaignData.offerType}
              onValueChange={(val) => setCampaignData({ ...campaignData, offerType: val })}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
                <SelectValue placeholder="Select offer type" />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                <SelectItem value="Percentage Discount (% off)">Percentage Discount (% off)</SelectItem>
                <SelectItem value="Flat ₹ Amount Off">Flat ₹ Amount Off</SelectItem>
                <SelectItem value="Buy One Get One (BOGO)">Buy One Get One (BOGO)</SelectItem>
                <SelectItem value="Free Gift / Service with Purchase">Free Gift / Service with Purchase</SelectItem>
                <SelectItem value="Bundle / Combo Pricing">Bundle / Combo Pricing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search coupons */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            type="text"
            placeholder="Search coupons or deals..."
            value={listingSearch}
            onChange={(e) => setListingSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-xs h-10 rounded-xl"
          />
        </div>

        {/* Coupon selection list */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {filteredCoupons.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-medium">
              No active coupons found matching search.
            </div>
          ) : (
            filteredCoupons.map((couponItem) => {
              const isAttached = campaignData.couponIds.includes(couponItem._id);
              return (
                <label
                  key={couponItem._id}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isAttached ? "bg-orange-50/40" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAttached}
                      onCheckedChange={() => toggleCouponAttachment(couponItem._id)}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {couponItem.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                        {couponItem.code || "NO CODE"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#e85d04]">
                    {couponItem.discountType === "percentage"
                      ? `${couponItem.discountValue}% OFF`
                      : `₹${couponItem.discountValue} OFF`}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <Link
          href="/merchant/coupons"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#e85d04] hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create new coupon for this campaign</span>
        </Link>
      </div>

      {/* Step 2 Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-slate-700 border-slate-200 text-xs font-bold rounded-xl"
        >
          &lt; Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#e85d04] hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer"
        >
          Next &gt;
        </Button>
      </div>
    </Card>
  );
}
