"use client";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
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
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-surface via-white to-brand-surface py-20 px-4 border-t border-b border-brand-border select-none">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-brand-success/5 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl z-0" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Form & Details (55%) */}
        <div className="lg:col-span-7 space-y-6 text-left animate-fade-in-up stagger-1">
          <Badge className="bg-orange-500/15 text-[#FF7A18] hover:bg-orange-500/20 border border-[#FF7A18]/20 rounded-full px-3.5 py-1 font-extrabold text-xs shadow-none gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span>INDIA'S ONLY EXPIRED COUPON REVIVAL</span>
          </Badge>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-heading text-brand-text tracking-tight leading-tight">
              Your Expired Coupon Has Value.
              <br />
              <span className="text-brand-gradient">Claim It.</span>
            </h2>
            <p className="text-sm md:text-base text-brand-subtext max-w-xl leading-relaxed font-medium">
              Don&apos;t throw away your expired discount codes. Vouchiqo&apos;s
              Revival system reconnects you with the merchant and recovers your
              savings — 48 hours, zero cost to you.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 py-3 border-t border-b border-brand-border max-w-lg">
            <div>
              <span className="block text-lg md:text-xl font-black text-brand-text">
                5,000+
              </span>
              <span className="text-[9px] md:text-xs text-brand-subtext font-bold uppercase tracking-wider">
                Revivals Processed
              </span>
            </div>
            <div>
              <span className="block text-lg md:text-xl font-black text-[#00B67A]">
                ₹25L+
              </span>
              <span className="text-[9px] md:text-xs text-brand-subtext font-bold uppercase tracking-wider">
                Recovered Savings
              </span>
            </div>
            <div>
              <span className="block text-lg md:text-xl font-black text-brand-warning">
                78%
              </span>
              <span className="text-[9px] md:text-xs text-brand-subtext font-bold uppercase tracking-wider">
                Approval Rate
              </span>
            </div>
          </div>

          {/* Inline mini-form */}
          <div className="max-w-xl bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-xl relative">
            {success ? (
              <div className="text-center py-6 space-y-4 animate-fade-in-scale">
                <div className="w-12 h-12 rounded-full bg-brand-success/20 text-brand-success flex items-center justify-center mx-auto border border-brand-success/30">
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-xl font-bold text-brand-text">
                  Submission Successful!
                </h3>
                <p className="text-xs text-brand-subtext max-w-sm mx-auto leading-relaxed">
                  We have registered your request. Our system will contact the
                  merchant to negotiate a revival. We will reach out to you
                  within 48 hours.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="ghost"
                  className="text-xs font-bold text-brand-blue hover:text-brand-blue hover:bg-brand-surface mt-2 cursor-pointer"
                >
                  Revive Another Coupon
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-subtext uppercase tracking-wider">
                      Expired Code
                    </label>
                    <Input
                      placeholder="e.g. ZOMATO50"
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                      className="bg-brand-bg border-brand-border text-brand-text placeholder-brand-subtext/60 text-xs h-10 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue shadow-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-subtext uppercase tracking-wider">
                      Brand Name
                    </label>
                    <Input
                      placeholder="e.g. Zomato"
                      value={form.brandName}
                      onChange={(e) =>
                        setForm({ ...form, brandName: e.target.value })
                      }
                      className="bg-brand-bg border-brand-border text-brand-text placeholder-brand-subtext/60 text-xs h-10 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-subtext uppercase tracking-wider">
                    Your Email
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. shopper@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="bg-brand-bg border-brand-border text-brand-text placeholder-brand-subtext/60 text-xs h-10 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue shadow-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-brand-error font-semibold">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none flex items-center justify-center gap-2"
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
          </div>

          <div className="pt-2">
            <Link
              href="/expired-coupon-revival"
              className="text-xs font-bold text-[#FF7A18] hover:text-[#FF3D77] transition-colors flex items-center gap-1 hover:underline"
            >
              <span>Learn how Vouchiqo Revival works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Animated Visual (45%) */}
        <div className="lg:col-span-5 flex justify-center items-center select-none animate-fade-in-scale stagger-2">
          {/* Transforming coupon CSS visual */}
          <div className="w-[320px] h-[220px] relative flex items-center justify-center">
            {/* Background glowing ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7A18]/10 to-[#00B67A]/10 rounded-2xl blur-2xl animate-pulse" />

            {/* Glowing active success border */}
            <div className="absolute inset-2 border border-brand-success/15 rounded-xl animate-pulse z-0" />

            {/* Expired cracked coupon (sliding left, fading out) */}
            <div className="absolute left-4 w-52 h-32 bg-white border border-brand-error/20 rounded-xl p-4 flex flex-col justify-between shadow-lg transform -rotate-6 animate-float z-10 opacity-60 hover:opacity-80 transition-opacity">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black text-brand-error border border-brand-error/30 px-1 py-0.5 rounded bg-brand-error/5">
                  EXPIRED
                </span>
                <span className="text-[14px] text-brand-subtext font-bold">
                  ✂️
                </span>
              </div>
              <div className="text-left space-y-1">
                <h4 className="text-xs font-bold text-brand-subtext line-through">
                  Flat 30% OFF
                </h4>
                <div className="w-full h-1 bg-brand-border rounded-full" />
              </div>
              {/* Crack overlay line */}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,#E5484D_48%,#E5484D_52%,transparent_55%)] opacity-20 pointer-events-none" />
            </div>

            {/* Fresh revived coupon (sliding right, glowing checkmark) */}
            <div
              className="absolute right-4 w-52 h-32 bg-white border border-brand-success/30 rounded-xl p-4 flex flex-col justify-between shadow-xl transform rotate-3 animate-float z-20"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black text-brand-success border border-brand-success/20 px-1.5 py-0.5 rounded bg-brand-success/10 animate-pulse">
                  REVIVED
                </span>
                {/* Green checkmark circle */}
                <div className="w-5 h-5 rounded-full bg-brand-success text-white flex items-center justify-center shadow-md animate-bounce">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-white/10" />
                </div>
              </div>
              <div className="text-left space-y-1">
                <h4 className="text-xs font-black text-brand-text">
                  Flat 30% OFF
                </h4>
                <span className="text-[9px] text-[#00B67A] font-bold">
                  Successfully Verified Code!
                </span>
              </div>
              <div className="border-t border-dashed border-brand-border pt-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#00B67A] font-black">
                  ACTIVE NOW
                </span>
                <span className="text-[9px] text-brand-subtext">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
