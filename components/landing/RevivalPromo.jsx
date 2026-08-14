"use client";

import {
  ArrowRight,
  Clock,
  Loader2,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export function RevivalPromo() {
  const [form, setForm] = useState({ code: "", brandName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.brandName.trim()) {
      setError("Please enter the Store or Brand Name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim() || undefined,
          brandName: form.brandName.trim(),
          email: form.email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setForm({ code: "", brandName: "", email: "" });
        toast.success("Revival request submitted successfully! 🎉");
      } else {
        setError(data.message || "Failed to submit revival request.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full bg-gradient-to-br from-blue-50/90 via-white to-blue-100/60 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-10 sm:py-12 px-4 sm:px-8 border-y border-blue-200/60 dark:border-zinc-900 select-none relative overflow-hidden font-sans text-left">
      {/* Decorative Gradient Graphic Orbs & Subtle Pattern */}
      <div className="absolute -left-20 -top-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-cyan-300/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-tl from-blue-600/20 to-indigo-400/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none z-0" />

      <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Form & Callout (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4 text-left font-sans">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 bg-blue-100/80 border border-blue-200 text-blue-700 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-2xs">
              <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider flex items-center justify-center md:justify-start gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Offer Revival Engine</span>
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-1.5 font-sans">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Got an expired offer? <br />
                <span className="text-blue-600">We'll help you revive it.</span>
              </h2>
              <p className="text-xs sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-xl">
                Submit any expired code or store offer. Our merchant relations team negotiates a fresh active equivalent directly with the brand — usually within 24 hours.
              </p>
            </div>

            {/* Compact Form Container */}
            <div className="max-w-xl">
              {success ? (
                <div className="bg-white border border-blue-200 rounded-xl p-5 text-center space-y-2.5 shadow-sm font-sans">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Revival Request Received!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    We&apos;ve logged your revival request for <span className="text-blue-600 font-bold">{form.brandName || "your brand"}</span>. We&apos;ll email you as soon as a fresh code is negotiated.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1 underline cursor-pointer"
                  >
                    Revive another offer →
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-blue-100/90 rounded-xl p-4 space-y-3 shadow-xs font-sans"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Brand Name Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Store / Brand Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swiggy, Nike, Myntra"
                        value={form.brandName}
                        onChange={(e) =>
                          setForm({ ...form, brandName: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs font-medium"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="shopper@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Expired Code Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Expired Offer Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME50, SAVE20"
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-mono uppercase tracking-wider focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs font-bold"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-semibold text-left">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Submit For Revival</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Learn More Link */}
            <div>
              <Link
                href="/expired-coupon-revival"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 hover:underline font-sans"
              >
                <span>Learn how Revival Negotiation works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Compact Metric Cards (lg:col-span-5) */}
          <div className="lg:col-span-5 w-full font-sans">
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {/* Stat Card 1 */}
              <div className="bg-white border border-blue-100 rounded-xl p-4 text-left shadow-2xs hover:shadow-md hover:border-blue-500 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="block text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  94%
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Redeem Success Rate
                </span>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-blue-100 rounded-xl p-4 text-left shadow-2xs hover:shadow-md hover:border-blue-500 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 border border-blue-100">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="block text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  &lt;24h
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Avg Turnaround
                </span>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-blue-100 rounded-xl p-4 text-left shadow-2xs hover:shadow-md hover:border-blue-500 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 border border-blue-100">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="block text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  8,400+
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Revived This Week
                </span>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white border border-blue-100 rounded-xl p-4 text-left shadow-2xs hover:shadow-md hover:border-blue-500 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 border border-blue-100">
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="block text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">
                  ₹17,500
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Avg User Savings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
