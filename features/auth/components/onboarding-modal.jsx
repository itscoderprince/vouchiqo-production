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
  Users,
  Check,
  CheckCircle2
} from "lucide-react";

// The 15 categories from Merchant Categories_Phase 1.txt mapped to their emojis and standard database keys
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
      <DialogContent className="max-w-2xl w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] transition-all scrollbar-thin">
        <DialogHeader className="space-y-2 text-center pb-6 border-b border-slate-100 dark:border-zinc-900">
          <DialogTitle className="text-2xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-2">
            Welcome to Vouchiqo! 🎉
          </DialogTitle>
          <DialogDescription className="text-sm font-semibold text-slate-450 dark:text-slate-400">
            Tell us about your preferences to personalize your experience and show the most relevant deals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Section 1: Gender Selection */}
          <div className="space-y-4">
            <Label className="flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Users className="w-4 h-4 text-brand-blue" />
              1. Who are you shopping for?
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    className={`flex items-center sm:flex-col sm:justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-sm font-bold h-16 sm:h-28 gap-3 sm:gap-2 select-none active:scale-95 ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/20 border-[#2563eb] text-[#2563eb] shadow-md shadow-blue-500/5 ring-1 ring-[#2563eb]/20"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-zinc-700 hover:bg-slate-50/40"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Interest Categories */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                💡 2. Let's select your interests
              </Label>
              <p className="text-[12px] text-slate-450 dark:text-slate-500 font-semibold pl-5">
                Please select two or more to proceed.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center py-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedInterests.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleInterest(cat.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/20 border-[#2563eb] text-[#2563eb] shadow-md shadow-blue-500/5 ring-1 ring-[#2563eb]/20"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-850 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/40"
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#2563eb] shrink-0 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-zinc-900">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isContinueEnabled || isSaving}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border-0 cursor-pointer transition-all duration-300 shadow-md ${
              isContinueEnabled
                ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-blue-500/25 active:scale-[0.99]"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? "Saving..." : "Continue"}
            {!isSaving && <CheckCircle2 className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
