"use client";

import { Loader2, MessageSquareHeart, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FEEDBACK_TAGS = [
  "Fast Document Upload",
  "Clear Step-by-Step Guidance",
  "Easy Location Pinning",
  "Simple Operating Hours Setup",
  "Clear KYC Instructions",
  "Mobile Friendly Experience",
  "Need More Tooltips / Help",
  "Overall Super Smooth",
];

const STAR_LABELS = {
  1: "Needs Significant Improvement",
  2: "Somewhat Difficult",
  3: "Good / Standard Experience",
  4: "Very Smooth & Fast",
  5: "Exceptional & Effortless!",
};

export default function ProcessFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  onDismiss,
  isSubmitting = false,
  title = "How was your profile setup experience?",
  subtitle = "You've completed your business profile. Help us make the partner journey even smoother!",
  merchantName = "",
}) {
  const [starRating, setStarRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [scaleScore, setScaleScore] = useState(85);
  const [selectedTags, setSelectedTags] = useState([
    "Clear Step-by-Step Guidance",
    "Overall Super Smooth",
  ]);
  const [comment, setComment] = useState("");

  const activeStar = hoveredStar || starRating;

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const getScaleDescriptor = useMemo(() => {
    if (scaleScore < 35)
      return {
        label: "Complex / Needs Help",
        color: "text-rose-600",
        barColor: "bg-rose-500",
      };
    if (scaleScore < 70)
      return {
        label: "Moderate & Acceptable",
        color: "text-amber-600",
        barColor: "bg-amber-500",
      };
    return {
      label: "Effortless & Intuitive",
      color: "text-emerald-600",
      barColor: "bg-emerald-500",
    };
  }, [scaleScore]);

  const handleSubmit = () => {
    onSubmit?.({
      starRating,
      scaleScore,
      selectedTags,
      comment: comment.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl font-sans overflow-hidden">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <MessageSquareHeart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                {merchantName ? `${merchantName} • ` : ""}
                {subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 pb-1">
          {/* 1. Interactive 1-5 Star Rating */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-center space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Overall Setup Rating
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none bg-transparent border-0"
                >
                  <Star
                    className={
                      "w-7 h-7 sm:w-8 sm:h-8 transition-colors " +
                      (star <= activeStar
                        ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                        : "text-slate-300 hover:text-slate-400")
                    }
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-800 min-h-[18px] transition-all">
              {STAR_LABELS[activeStar] || "Select your rating"}
            </p>
          </div>

          {/* 2. Interactive Progress Bar Scaling */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Setup Ease &amp; Satisfaction Scale
              </span>
              <span className={`font-bold ${getScaleDescriptor.color}`}>
                {scaleScore}% • {getScaleDescriptor.label}
              </span>
            </div>

            {/* Custom interactive progress bar track */}
            <div className="relative w-full">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scaleScore}
                onChange={(e) => setScaleScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Dynamic visual progress fill */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getScaleDescriptor.barColor}`}
                style={{ width: `${scaleScore}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
              <span>0% (Complex)</span>
              <span>50% (Average)</span>
              <span>100% (Effortless)</span>
            </div>
          </div>

          {/* 3. Quick Sentiment Badges */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              What highlights stood out to you?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FEEDBACK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={
                      "text-[11px] font-medium px-3 py-1 rounded-full border transition-all cursor-pointer " +
                      (isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50")
                    }
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Optional Comment Textarea */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 block">
              Additional Suggestions or Thoughts (Optional)
            </span>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what we can do better or what feature you'd love to see next..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none font-normal text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 h-9 px-4 rounded-xl cursor-pointer"
          >
            Maybe Later
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs h-9.5 px-6 rounded-xl border-0 shadow-md shadow-blue-500/20 cursor-pointer transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
