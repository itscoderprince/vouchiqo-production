"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ExpiredCouponRevival() {
  const [form, setForm] = useState({
    code: "",
    brandName: "",
    email: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Live stats from settings/API
  const [stats, setStats] = useState({
    totalRequests: 5240,
    thisMonthRequests: 142,
  });
  const [successStories, setSuccessStories] = useState([
    {
      user: "Anish S. from Ranchi",
      brand: "Marbella Tiles & Sanitary",
      offer: "Saved ₹5,400 on home flooring tiles",
      date: "2 days ago",
      text: "Vouchiqo helped reactivate the flat ₹5,000 discount. Marbella Ranchi approved it immediately after receiving the request batch.",
    },
    {
      user: "Sarah J. from Delhi",
      brand: "Starbucks Coffee",
      offer: "Revived Buy 1 Get 1 Free Espresso",
      date: "5 days ago",
      text: "Requested Starbucks BOGO revival. Within 48 hours, Vouchiqo updated the code to active, and I redeemed it in-store.",
    },
    {
      user: "Rohan D. from Bangalore",
      brand: "Notion Premium Team Plan",
      offer: "Recovered $100 SaaS Workspace Credits",
      date: "1 week ago",
      text: "Our team credits coupon had expired. Vouchiqo contacted Notion's merchant partnership team, and they re-enabled it for our domain!",
    },
  ]);

  useEffect(() => {
    async function fetchPlatformSettings() {
      try {
        const res = await fetch("/api/admin/settings?public=true");
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.data?.settings) {
            const s = json.data.settings;
            if (s.revival_stats) {
              setStats(s.revival_stats);
            }
            if (s.social_proof && s.social_proof.length > 0) {
              setSuccessStories(s.social_proof);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch revival stats/stories:", err);
      }
    }
    fetchPlatformSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.brandName || !form.email) {
      setError("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          brandName: form.brandName,
          email: form.email,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Optimistically increment local stats counter
        setStats((prev) => ({
          ...prev,
          totalRequests: (prev.totalRequests || 0) + 1,
          thisMonthRequests: (prev.thisMonthRequests || 0) + 1,
        }));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit revival request.");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to submit request. Please check your network and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0c1a2c] via-[#11243b] to-[#0c1a2c] text-white py-20 px-4 text-center border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <Badge className="bg-orange-500/15 text-[#FF7A18] hover:bg-orange-500/20 border border-[#FF7A18]/20 rounded-full px-3.5 py-1 font-bold text-xs shadow-none gap-1.5 w-fit mx-auto animate-float">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Community-Driven Restorations</span>
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight max-w-2xl mx-auto text-white">
            Have an Expired Offer?
            <br />
            <span className="text-brand-gradient">Don&apos;t Give Up.</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
            Missed an amazing offer? Vouchiqo coordinates with verified brands
            to reactivate beloved discount campaigns. Let us recover your
            savings — 48 hours, zero cost.
          </p>

          {/* Live Counter Display */}
          <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-md mx-auto">
            <div className="text-center flex-1">
              <span className="block text-2xl font-black text-[#FFB020]">
                {stats.thisMonthRequests}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Processed This Month
              </span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-center flex-1">
              <span className="block text-2xl font-black text-[#00B67A]">
                {stats.totalRequests}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Claims Revived
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main split sections */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Revival Form (7 Cols) */}
        <section className="lg:col-span-7 bg-brand-bg border border-brand-border rounded-xl p-6 md:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand-success/20 text-brand-success flex items-center justify-center mx-auto border border-brand-success/30">
                <CheckCircle2 className="w-8 h-8 fill-brand-success/10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-brand-navy">
                  Revival Request Submitted!
                </h3>
                <p className="text-xs text-brand-subtext max-w-sm mx-auto leading-relaxed">
                  Thank you! We have added this deal to our moderation list. We
                  will connect with the brand and notify you on your email when
                  voting is completed.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ code: "", brandName: "", email: "", note: "" });
                }}
                className="btn-primary py-2.5 px-8 text-xs font-bold border-0 h-auto cursor-pointer shadow-none"
              >
                Submit Another Coupon
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
                Coupon Details
              </h2>

              {error && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-brand-error/5 border border-brand-error/15 text-brand-error text-xs items-center">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Brand / Store Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Starbucks, Marbella"
                    value={form.brandName}
                    onChange={(e) =>
                      setForm({ ...form, brandName: e.target.value })
                    }
                    className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                  />
                </div>

                {/* Expired Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Expired Coupon Code *
                  </label>
                  <Input
                    required
                    placeholder="e.g. COFFEEBOGO"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10 uppercase"
                  />
                </div>
              </div>

              {/* Submitter Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Email Address *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. yourname@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                />
              </div>

              {/* Note / Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Why should we revive this? (Optional)
                </label>
                <Textarea
                  placeholder="e.g. I saved ₹5,000 last time, or I want to buy flooring tiles in Ranchi..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={4}
                  className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border min-h-24"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold border-0 h-auto cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Revival Request</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </section>

        {/* Right Side: Process Guide & Success Stories (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          {/* How it works visual */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
              How Revival Works
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy">Submit Details</h4>
                  <p className="text-brand-subtext leading-relaxed mt-0.5">
                    Enter the expired code and brand name. Our system
                    cross-references it with the verified brand database.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy">
                    Merchant Negotiation
                  </h4>
                  <p className="text-brand-subtext leading-relaxed mt-0.5">
                    Vouchiqo aggregates coupon demand and presents conversion
                    projections directly to the brand owner dashboard.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy">
                    Approved Restorations
                  </h4>
                  <p className="text-brand-subtext leading-relaxed mt-0.5">
                    Once the merchant approves, the coupon code is refreshed
                    with a new expiry date, and you are notified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Success Feed */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
              Recent Revival Successes
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {successStories.map((story, idx) => (
                <div
                  key={idx}
                  className="bg-brand-surface border border-brand-border/40 rounded-lg p-3 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-brand-navy block">
                        {story.brand}
                      </span>
                      <span className="text-[10px] text-brand-success font-bold">
                        {story.offer}
                      </span>
                    </div>
                    <Badge className="bg-brand-success/10 text-brand-success hover:bg-brand-success/15 border-0 px-2 py-0.5 text-[8px] font-bold">
                      {story.date}
                    </Badge>
                  </div>
                  <p className="text-brand-subtext leading-relaxed italic bg-white p-2.5 rounded border border-brand-border/30">
                    &ldquo;{story.text}&rdquo;
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 block text-right">
                    — {story.user}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
