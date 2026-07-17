"use client";

import {
  Baby,
  Car,
  ChevronRight,
  Dumbbell,
  Flower,
  Gamepad2,
  Gem,
  GraduationCap,
  Home,
  IndianRupee,
  Laptop,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Utensils,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { SYSTEM_CATEGORIES } from "./constants";

const ICON_MAP = {
  fashion: ShoppingBag,
  food: Utensils,
  electronics: Laptop,
  beauty: Flower,
  travel: Plane,
  home: Home,
  "home-improvement": Wrench,
  fitness: Dumbbell,
  education: GraduationCap,
  "kids-baby": Baby,
  jewellery: Gem,
  automotive: Car,
  entertainment: Gamepad2,
  grocery: ShoppingCart,
  finance: IndianRupee,
};

export const InterestBanner = ({
  show,
  onDismiss,
  selectedInterests,
  setSelectedInterests,
  handleSaveInterests,
}) => {
  const { city } = useLocation();

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[350px] bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-[150] animate-fade-in-scale space-y-3"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      {/* Title & Close */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h4 className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
            <span>
              {city ? `Personalise Ranchi Savings` : "Personalise Your Savings"}
            </span>
          </h4>
          <p className="text-[11px] text-gray-500 font-normal leading-relaxed">
            Select what you are shopping for today in {city || "your city"} to
            unlock custom deals.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Chips Carousel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin py-0.5">
        {SYSTEM_CATEGORIES.map((cat) => {
          const isSelected = selectedInterests.includes(cat.slug);
          const IconComponent = ICON_MAP[cat.slug] || Sparkles;

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                const next = isSelected
                  ? selectedInterests.filter((s) => s !== cat.slug)
                  : [...selectedInterests, cat.slug];
                setSelectedInterests(next);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                  : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-gray-500"}`}
              />
              <span>{cat.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11px] font-medium text-gray-500 hover:text-gray-800 cursor-pointer bg-transparent border-0"
        >
          No thanks, show all
        </button>
        <Button
          onClick={() => handleSaveInterests(selectedInterests)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 text-[11px] font-medium border-0 h-auto cursor-pointer shadow-xs flex items-center gap-1 rounded-lg"
        >
          Show Me Deals
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default InterestBanner;
