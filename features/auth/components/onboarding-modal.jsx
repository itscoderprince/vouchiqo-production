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
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronRight,
  Shirt,
  UtensilsCrossed,
  Smartphone,
  Plane,
  Home,
  Wrench,
  Dumbbell,
  GraduationCap,
  Baby,
  Gem,
  Car,
  Gamepad2,
  ShoppingCart,
  Wallet,
  User,
  Heart,
} from "lucide-react";

// 15 Standard Brand Categories with prominent Lucide icons & color accents
const CATEGORIES = [
  { key: "fashion", label: "Fashion & Clothing", icon: Shirt, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { key: "food", label: "Food & Dining", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { key: "electronics", label: "Electronics & Tech", icon: Smartphone, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "beauty", label: "Beauty & Wellness", icon: SparklesIcon, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { key: "travel", label: "Travel & Hotels", icon: Plane, color: "bg-sky-50 text-sky-600 border-sky-100" },
  { key: "home", label: "Home & Living", icon: Home, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { key: "home-improvement", label: "Home Improvement", icon: Wrench, color: "bg-stone-50 text-stone-600 border-stone-100" },
  { key: "fitness", label: "Fitness & Healthcare", icon: Dumbbell, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { key: "education", label: "Education & Courses", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { key: "kids-baby", label: "Kids & Baby Products", icon: Baby, color: "bg-rose-50 text-rose-600 border-rose-100" },
  { key: "jewellery", label: "Jewellery & Gems", icon: Gem, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { key: "automotive", label: "Automobile & Services", icon: Car, color: "bg-red-50 text-red-600 border-red-100" },
  { key: "entertainment", label: "Gaming & Fun", icon: Gamepad2, color: "bg-violet-50 text-violet-600 border-violet-100" },
  { key: "grocery", label: "Grocery & Essentials", icon: ShoppingCart, color: "bg-teal-50 text-teal-600 border-teal-100" },
  { key: "finance", label: "Finance & Insurance", icon: Wallet, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
];

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}

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
      return toast.error("Please select two or more category interests to proceed.");
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
        className="w-[calc(100%-1.5rem)] sm:max-w-[580px] md:max-w-[720px] lg:max-w-[900px] border border-slate-200 bg-white p-5 sm:p-7 rounded-3xl shadow-xl overflow-y-auto max-h-[92vh] transition-all outline-none text-left font-sans z-[350]"
      >
        {/* Header Header */}
        <DialogHeader className="space-y-1 text-center pb-2">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Personalize Your Deals Feed
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Select your shopping preferences to discover customized discounts, verified coupons &amp; regional deals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Section 1: Shopping Preference (Gender) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <User className="w-3.5 h-3.5 text-[#e85d04]" /> 1. Who are you shopping for? *
              </Label>
              {gender && (
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-bold">
                  Selected
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
              {[
                { value: "men", label: "Men", emoji: "👨" },
                { value: "women", label: "Women", emoji: "👩" },
                { value: "not_preferred", label: "Everyone", emoji: "✨" },
              ].map((item) => {
                const isSelected = gender === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGender(item.value)}
                    className={`flex items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-xs sm:text-sm font-bold h-12 sm:h-14 gap-2 sm:gap-2.5 select-none active:scale-[0.98] ${
                      isSelected
                        ? "bg-orange-50/60 border-[#e85d04] text-[#e85d04] shadow-2xs ring-1 ring-[#e85d04]/30"
                        : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <span className="text-lg sm:text-xl leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Interest Categories Responsive Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wide">
                  <Heart className="w-3.5 h-3.5 text-[#e85d04]" /> 2. Select Your Favorite Categories *
                </Label>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Pick at least 2 categories to build your feed ({selectedInterests.length} selected)
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-slate-600">
                Min 2 Required
              </Badge>
            </div>

            {/* Responsive Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedInterests.includes(cat.key);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleInterest(cat.key)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left active:scale-[0.97] ${
                      isSelected
                        ? "bg-orange-50/70 border-[#e85d04] text-slate-900 ring-1 ring-[#e85d04]/40 shadow-2xs"
                        : "bg-slate-50/50 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold whitespace-normal leading-snug flex-1">
                      {cat.label}
                    </span>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#e85d04] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 mt-1">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isContinueEnabled || isSaving}
            className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-0 cursor-pointer transition-all h-11 ${
              isContinueEnabled
                ? "bg-[#e85d04] hover:bg-orange-600 text-white shadow-xs active:scale-[0.99]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? "Saving Preferences..." : "Continue to Customized Feed"}
            {!isSaving && <ChevronRight className="w-4 h-4 ml-0.5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
