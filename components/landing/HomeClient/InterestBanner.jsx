"use client";

import { ChevronRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYSTEM_CATEGORIES } from "./constants";

export const InterestBanner = ({
  show,
  onDismiss,
  selectedInterests,
  setSelectedInterests,
  handleSaveInterests,
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] bg-brand-bg border border-brand-border rounded-xl shadow-2xl p-6 z-[150] animate-fade-in-scale space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-brand-navy flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-warning fill-brand-warning/10" />
            <span>Personalise Your Savings</span>
          </h4>
          <p className="text-xs text-brand-subtext font-medium leading-tight">
            Select what you are shopping for today to unlock custom deals.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-brand-navy p-1 rounded-full hover:bg-brand-surface cursor-pointer bg-transparent border-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontally scrollable interest chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
        {SYSTEM_CATEGORIES.map((cat) => {
          const isSelected = selectedInterests.includes(cat.slug);
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand-blue text-white border-brand-blue font-black shadow-sm"
                  : "bg-transparent border-brand-border text-brand-text hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-brand-border pt-4">
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-bold text-slate-500 hover:text-brand-navy cursor-pointer bg-transparent border-0"
        >
          No thanks, show all
        </button>
        <Button
          onClick={() => handleSaveInterests(selectedInterests)}
          className="btn-primary py-2 px-5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none flex items-center gap-1"
        >
          Show Me Deals
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default InterestBanner;
