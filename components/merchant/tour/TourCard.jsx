"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SIDEBAR_W = 240;
const CARD_GAP = 20;
const CARD_W = 340;

export default function TourCard({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onSkip,
}) {
  const [pos, setPos] = useState({ top: 240, left: SIDEBAR_W + CARD_GAP });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!step?.anchor) return;

    let timer1, timer2, timer3;

    const compute = () => {
      const el = document.querySelector(step.anchor);
      const card = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cardH = card ? card.offsetHeight : 220;

      if (step.mode === "content") {
        const placement = step.placement || "bottom";
        let top;
        let left = rect.left + rect.width / 2 - CARD_W / 2;

        if (placement === "bottom") {
          top = rect.bottom + 16;
        } else if (placement === "top") {
          top = rect.top - cardH - 16;
        } else if (placement === "right") {
          top = rect.top + rect.height / 2 - cardH / 2;
          left = rect.right + 16;
        } else {
          top = rect.bottom + 16;
        }

        top = Math.max(16, Math.min(window.innerHeight - cardH - 16, top));
        left = Math.max(
          SIDEBAR_W + 16,
          Math.min(window.innerWidth - CARD_W - 16, left),
        );

        setPos({ top, left });
      } else {
        // Sidebar mode: card sits to the RIGHT of the sidebar, aligned with the item
        let top = rect.top + rect.height / 2 - cardH / 2;
        const left = SIDEBAR_W + CARD_GAP;

        top = Math.max(16, Math.min(window.innerHeight - cardH - 16, top));
        setPos({ top, left });
      }
    };

    compute();
    timer1 = setTimeout(compute, 60);
    timer2 = setTimeout(compute, 150);
    timer3 = setTimeout(compute, 300);

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [step?.anchor, step?.mode, step?.placement]);

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        zIndex: 70,
        width: `${CARD_W}px`,
      }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-6 text-left animate-in fade-in zoom-in-95 duration-200 relative"
    >
      {/* Pointer arrow pointing to target element */}
      {step.mode !== "content" && (
        <div
          className="absolute -left-2.5 top-7 w-5 h-5 bg-white border-l border-b border-slate-200/90 rotate-45 shadow-sm"
          aria-hidden="true"
        />
      )}
      {step.mode === "content" && step.placement === "bottom" && (
        <div
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-t border-l border-slate-200/90 rotate-45 shadow-sm"
          aria-hidden="true"
        />
      )}
      {step.mode === "content" && step.placement === "top" && (
        <div
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-b border-r border-slate-200/90 rotate-45 shadow-sm"
          aria-hidden="true"
        />
      )}

      {/* Step label + close */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
          STEP {currentStepIndex + 1} OF {totalSteps}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2 font-sans relative z-10">
        {step.title}
      </h3>

      {/* Body */}
      <p className="text-xs text-slate-600 font-normal leading-relaxed mb-5 font-sans relative z-10">
        {step.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-sans"
        >
          Skip tour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-blue-600/20 font-sans"
        >
          {isLastStep ? "Got it" : "Next"}
        </button>
      </div>
    </div>
  );
}
