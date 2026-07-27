"use client";

import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WelcomeModal({
  isOpen,
  merchantName,
  onStart,
  onSkip,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="sm:max-w-md border-brand-blue/20 bg-slate-900 text-white rounded-2xl shadow-2xl p-6 border text-left">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center">
            <Store className="w-6 h-6 text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Welcome to Vouchiqo, {merchantName || "Partner"}!
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-slate-300 leading-relaxed">
            Your merchant portal is ready. Take a quick 2-minute interactive
            tour to discover how to publish offer listings, track live offer
            claims, analyze performance, and grow your sales.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 my-2 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Founding Merchant Access Active
          </div>
          <p className="text-[11px] text-slate-400">
            14-day free trial on Growth Partner tier enabled. Guaranteed 0%
            extra commission lock.
          </p>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <Button
            type="button"
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Start Interactive Tour →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
