"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Check,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

// Mapped from Merchant Categories_Phase 1.txt
const CATEGORIES = [
  { key: "fashion", label: "Fashion & Clothing", emoji: "👗" },
  { key: "food", label: "Food & Dining", emoji: "🍔" },
  { key: "electronics", label: "Electronics & Gadgets", emoji: "💻" },
  { key: "beauty", label: "Beauty & Wellness", emoji: "💅" },
  { key: "travel", label: "Travel & Hospitality", emoji: "✈️" },
  { key: "home", label: "Home & Living", emoji: "🏠" },
  { key: "home-improvement", label: "Home Improvement", emoji: "🔨" },
  { key: "fitness", label: "Fitness & Healthcare", emoji: "🏋️" },
  { key: "education", label: "Education & Courses", emoji: "🎓" },
  { key: "kids-baby", label: "Kids & Baby Products", emoji: "👶" },
  { key: "jewellery", label: "Jewellery & Accessories", emoji: "💎" },
  { key: "automotive", label: "Automobile & Auto Services", emoji: "🚗" },
  { key: "entertainment", label: "Gaming & Entertainment", emoji: "🎮" },
  { key: "grocery", label: "Grocery & Essentials", emoji: "🛒" },
  { key: "finance", label: "Finance & Insurance", emoji: "💵" },
];

export function OnboardingModal({ isOpen, onClose, onSaveComplete }) {
  const [gender, setGender] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (key) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!gender) {
      return toast.error("Please select a gender preference to continue.");
    }
    if (selectedInterests.length < 2) {
      return toast.error("Please select two or more interests to proceed.");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          interests: selectedInterests,
          isOnboarded: true,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Failed to save onboarding settings");
      }

      toast.success("Preferences saved successfully! 🎉");
      if (onSaveComplete) {
        onSaveComplete(selectedInterests);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isContinueEnabled = gender && selectedInterests.length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-[550px] w-[calc(100%-2rem)] border border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[85vh] transition-all scrollbar-thin outline-none"
      >
        <DialogHeader className="space-y-2 text-center pb-5">
          <div className="mx-auto w-12 h-12 bg-blue-50/80 dark:bg-blue-950/30 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/40 dark:border-blue-900/20 mb-1">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">
            Let's personalize your feed
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            Select your preferences to discover the best deals and active coupons customized for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Section 1: Gender Selection */}
          <div className="space-y-2.5">
            <Label className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              👤 1. Who are you shopping for?
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: "men", label: "Men", emoji: "👨" },
                { value: "women", label: "Women", emoji: "👩" },
                { value: "not_preferred", label: "Rather not say", emoji: "👤" },
              ].map((item) => {
                const isSelected = gender === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGender(item.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-250 cursor-pointer text-xs font-semibold h-[76px] gap-1.5 select-none active:scale-[0.97] ${
                      isSelected
                        ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-600 text-blue-600 ring-[0.5px] ring-blue-500/20"
                        : "bg-slate-50/40 dark:bg-zinc-900/30 border-slate-200/60 dark:border-zinc-850 text-slate-500 dark:text-slate-450 hover:border-slate-300 dark:hover:border-zinc-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl leading-none">{item.emoji}</span>
                    <span className="truncate leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Interest Categories */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                💡 2. Let's select your interests
              </Label>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold pl-4">
                Please select two or more to proceed.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center py-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedInterests.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleInterest(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all duration-250 cursor-pointer select-none active:scale-[0.95] h-8 ${
                      isSelected
                        ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-600 text-blue-600 ring-[0.5px] ring-blue-500/20"
                        : "bg-slate-50/40 dark:bg-zinc-900/30 border-slate-200/50 dark:border-zinc-850 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm shrink-0 leading-none">{cat.emoji}</span>
                    <span className="truncate leading-none">{cat.label}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-blue-600 shrink-0 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-900/60 mt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isContinueEnabled || isSaving}
            className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border-0 cursor-pointer transition-all duration-250 h-10 ${
              isContinueEnabled
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 active:scale-[0.99]"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-slate-650 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? "Saving..." : "Continue"}
            {!isSaving && <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
