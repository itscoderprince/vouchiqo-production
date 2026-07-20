"use client";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  Ticket
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RevivalPromo() {
  const [form, setForm] = useState({ code: "", brandName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.code || !form.brandName || !form.email) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ code: "", brandName: "", email: "" });
      } else {
        const data = await res.json();
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
    <section className="relative overflow-hidden bg-slate-50 dark:bg-zinc-950/40 py-16 px-4 border-t border-b border-slate-100 dark:border-zinc-900 select-none">
      {/* Subtle decorative background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl z-0" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Full Information & Trust */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <Badge className="bg-blue-600/10 hover:bg-blue-600/10 text-[#2563eb] dark:text-blue-400 border-0 rounded-full px-3 py-1 font-bold text-[10px] tracking-wider uppercase w-fit shadow-none">
              INDIA'S ONLY EXPIRED COUPON REVIVAL
            </Badge>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-black text-[#0A2E6E] dark:text-white tracking-tight leading-[1.15]">
                Expired coupon? <br className="hidden md:inline" />
                It may still be <span className="text-[#2563eb]">worth something</span>.
              </h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-450 leading-relaxed font-medium max-w-lg">
                Submit the coupon you missed. We&apos;ll reconnect with the merchant and try to recover your savings.
              </p>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-450 dark:text-slate-500 border-t border-slate-200/60 dark:border-zinc-850 pt-6 max-w-xl">
              <span>5,000+ revivals processed</span>
              <span className="text-slate-300 dark:text-zinc-800 font-normal select-none hidden sm:inline">•</span>
              <span>₹25L+ savings recovered</span>
              <span className="text-slate-300 dark:text-zinc-800 font-normal select-none hidden sm:inline">•</span>
              <span>78% approval rate</span>
            </div>

            <div className="pt-2">
              <Link
                href="/expired-coupon-revival"
                className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-all duration-200 flex items-center gap-1 hover:underline w-fit"
              >
                <span>See how Coupon Revival works</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-250 hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Ticket Form Container */}
          <div className="lg:col-span-5 w-full">
            <div className="relative bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-lg max-w-md mx-auto lg:mx-0">
              
              {/* Ticket Top Section */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#2563eb]" />
                  COUPON REVIVAL TICKET
                </span>
                <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50/60 dark:bg-blue-950/20 px-2 py-0.5 rounded-full border border-blue-100/30">
                  FREE
                </span>
              </div>

              {/* Perforated Divider with Circular Punch Cuts */}
              <div className="relative my-5">
                {/* Left Cutout Punch */}
                <div className="absolute -left-[33px] md:-left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-zinc-950 border-r border-slate-200/80 dark:border-zinc-800/80 z-10" />
                {/* Dashed Line */}
                <div className="border-t border-dashed border-slate-200/80 dark:border-zinc-800/80 w-full" />
                {/* Right Cutout Punch */}
                <div className="absolute -right-[33px] md:-right-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-zinc-950 border-l border-slate-200/80 dark:border-zinc-800/80 z-10" />
              </div>

              {/* Ticket Content Form */}
              {success ? (
                <div className="text-center py-6 space-y-4 animate-fade-in-scale">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                      Request Registered!
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto leading-relaxed font-medium">
                      We will contact the merchant to negotiate a revival. We&apos;ll email you in 48 hours.
                    </p>
                  </div>
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="ghost"
                    className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl mt-1 cursor-pointer"
                  >
                    Revive Another Coupon
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-0.5">
                        Expired Code
                      </label>
                      <Input
                        placeholder="e.g. ZOMATO50"
                        value={form.code}
                        onChange={(e) =>
                          setForm({ ...form, code: e.target.value })
                        }
                        className="bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/85 text-slate-800 dark:text-zinc-200 placeholder-slate-400/70 text-xs h-10 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl shadow-none"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-0.5">
                        Brand Name
                      </label>
                      <Input
                        placeholder="e.g. Zomato"
                        value={form.brandName}
                        onChange={(e) =>
                          setForm({ ...form, brandName: e.target.value })
                        }
                        className="bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/85 text-slate-800 dark:text-zinc-200 placeholder-slate-400/70 text-xs h-10 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl shadow-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-0.5">
                      Your Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. shopper@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/85 text-slate-800 dark:text-zinc-200 placeholder-slate-400/70 text-xs h-10 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl shadow-none"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-semibold text-left pl-0.5">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold border-0 h-10 cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revive My Coupon</span>
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Ticket Footer Microcopy */}
              <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold tracking-wide pt-4 border-t border-slate-100 dark:border-zinc-850 mt-4 select-none">
                Free to submit &bull; Response within 48 hours
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
