"use client";

import {
  Headphones,
  Plane,
  ShoppingBag,
  Ticket,
  Utensils,
  Home,
  Wrench,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import EmblaCarouselControls from "@/components/shared/EmblaCarouselControls";
import FlatCouponCard from "@/components/shared/FlatCouponCard";

export const TodayTopCoupons = ({
  couponTab,
  setCouponTab,
  filteredTabCoupons,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset page whenever category tab changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset index when tab changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [couponTab]);

  const TABS = [
    { id: "most-used", label: "Most Used", IconComp: Ticket },
    { id: "fashion", label: "Fashion & Clothing", IconComp: ShoppingBag },
    { id: "food", label: "Food & Dining", IconComp: Utensils },
    { id: "electronics", label: "Electronics & Gadgets", IconComp: Headphones },
    { id: "beauty", label: "Beauty & Wellness", IconComp: Sparkles },
    { id: "travel", label: "Travel & Hospitality", IconComp: Plane },
    { id: "home", label: "Home & Living", IconComp: Home },
    { id: "home-improvement", label: "Home Improvement", IconComp: Wrench },
  ];

  // Group into pages of 6 (2 rows of 3 columns)
  const itemsPerPage = 6;
  const totalSlides = Math.ceil(
    (filteredTabCoupons?.length || 0) / itemsPerPage,
  );

  const slides = [];
  for (let i = 0; i < totalSlides; i++) {
    slides.push(
      (filteredTabCoupons || []).slice(
        i * itemsPerPage,
        (i + 1) * itemsPerPage,
      ),
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  return (
    <section className="text-left w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-brand-text font-heading">
          Today's Top Coupons &amp; Offers
        </h2>
        {/* Slider Controls */}
        <EmblaCarouselControls
          totalSlides={totalSlides}
          selectedIndex={selectedIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          onDotClick={setSelectedIndex}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = couponTab === tab.id;
          const Icon = tab.IconComp;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCouponTab(tab.id)}
              className={`px-5 py-2.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all border cursor-pointer ${
                isActive
                  ? "bg-brand-blue border-brand-blue text-white shadow-sm font-extrabold"
                  : "bg-white border-[#e2e8f0] text-[#475569] hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-white" : "text-[#64748b]"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Coupons Sliding Viewport */}
      <div className="vouchiqo-carousel-viewport">
        <div
          className="vouchiqo-carousel-container flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
        >
          {slides.map((slideCoupons, slideIdx) => (
            <div key={slideIdx} className="vouchiqo-carousel-slide min-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {slideCoupons.map((coupon) => (
                  <FlatCouponCard key={coupon._id} coupon={coupon} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TodayTopCoupons;
