"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const DISMISS_KEY = "push_prompt_dismissed_until";
const SNOOZE_DAYS = 7;

/**
 * PushNotificationPrompt
 *
 * Floating opt-in banner shown to users who haven't been asked yet.
 * - Snoozes for 7 days if dismissed.
 * - Clears itself after permission is granted or denied.
 * - Floats above mobile bottom navigation (bottom-[110px] on mobile).
 * - Uses brand design tokens — no loud animations.
 */
export default function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const { isSupported, permission, isSubscribed, loading, requestPermission } =
    usePushNotifications();

  useEffect(() => {
    if (!isSupported) return;
    if (permission === "granted" || permission === "denied") return;
    if (isSubscribed) return;

    // Check snooze dismissal
    try {
      const until = localStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < Number(until)) return;
    } catch {
      // localStorage unavailable — show anyway
    }

    // Delay slightly so the prompt doesn't flash on first paint
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [isSupported, permission, isSubscribed]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {}
  };

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted || Notification.permission !== "default") {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 right-3 sm:right-6 left-auto
                 bottom-[85px] sm:bottom-6
                 w-[calc(100vw-24px)] max-w-[270px] sm:max-w-[290px]
                 bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-xl rounded-xl
                 p-3.5 flex items-start gap-2
                 animate-in fade-in slide-in-from-bottom-3 duration-300"
      role="dialog"
      aria-label="Enable push notifications"
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 leading-tight">
          Turn on notifications
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
          Get instant updates on new deals, offer expiries, and alerts.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5">
          <button
            id="push-allow-btn"
            type="button"
            onClick={handleAllow}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700
                       text-white text-[11px] font-medium rounded-md shadow-xs
                       transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Bell className="w-3 h-3" />
            )}
            Allow
          </button>
          <button
            id="push-dismiss-btn"
            type="button"
            onClick={handleDismiss}
            className="px-2 py-1 text-[11px] font-medium text-slate-500
                       hover:text-slate-700 hover:bg-slate-100 rounded-md
                       transition-colors cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5 -mr-1 -mt-0.5 rounded"
        aria-label="Close notification prompt"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
