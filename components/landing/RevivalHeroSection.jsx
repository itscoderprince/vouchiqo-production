"use client";

import {
  Award,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export function RevivalHeroSection() {
  const [brand, setBrand] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand.trim() || !email.trim()) {
      toast.error("Please fill in the brand name and email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/revival-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "customer_form",
          brandRequested: brand,
          couponCodeRequested: code || undefined,
          customerEmail: email,
          customerNote: "Submitted via Homepage Revival Hero",
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Revival request submitted successfully!");
        setBrand("");
        setCode("");
        setEmail("");
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit request.");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-[#0D213F] via-[#1A3C5E] to-[#112948] text-white rounded-md overflow-hidden py-12 px-6 md:p-16 shadow-xl border border-white/5 my-12">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-warning/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Side: Stats & Form */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-warning/15 border border-brand-warning/30 text-brand-warning text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Differentiator</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight text-white">
            Expired Coupon? <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-brand-warning to-[#ff5d8f] bg-clip-text text-transparent">
              Revive It Instantly!
            </span>
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-xl font-medium leading-relaxed">
            Don't let an expired coupon stop your checkout. Tell us the brand
            and the coupon code you tried, and we will work with the merchant to
            revive it for you.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-6 max-w-lg">
            <div>
              <p className="text-2xl md:text-3xl font-black text-brand-warning">
                5,000+
              </p>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                Offers Revived
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-white">
                ₹25L+
              </p>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                Total Savings
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-blue-400">
                78%
              </p>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                Success Rate
              </p>
            </div>
          </div>

          {/* Inline Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Hostinger"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-brand-warning transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., SAVE50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-brand-warning transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-brand-warning transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 sm:w-auto px-6 bg-brand-gradient hover:opacity-95 text-white text-xs font-bold rounded-md uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border-0 shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>
                  {submitting ? "Sending Request..." : "Request Revival"}
                </span>
              </button>

              <Link
                href="/expired-coupon-revival"
                className="text-xs font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider"
              >
                View success stories →
              </Link>
            </div>

            {isSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  We've received your request and will contact the merchant!
                </span>
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Animated SVG Visual */}
        <div className="lg:col-span-5 flex justify-center items-center h-full">
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-inner overflow-hidden group">
            {/* Pulsing ring */}
            <div className="absolute inset-4 rounded-full border border-brand-warning/20 animate-ping opacity-30" />
            <div className="absolute inset-12 rounded-full border border-blue-500/20 animate-pulse" />

            {/* SVG Visual */}
            <svg
              className="w-48 h-48 drop-shadow-2xl"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ticket outline */}
              <path
                d="M30 60C30 54.4772 34.4772 50 40 50H85C87.7614 50 90 52.2386 90 55C90 63.2843 96.7157 70 105 70C113.284 70 120 63.2843 120 55C120 52.2386 122.239 50 125 50H160C165.523 50 170 54.4772 170 60V140C170 145.523 165.523 150 160 150H125C122.239 150 120 147.761 120 145C120 136.716 113.284 130 105 130C96.7157 130 90 136.716 90 145C90 147.761 87.7614 150 85 150H40C34.4772 150 30 145.523 30 140V60Z"
                fill="#1D2E49"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-40"
              />

              {/* Expired Cracked Coupon (Red/Grey) */}
              <g className="animate-revival-out">
                {/* Coupon body */}
                <path
                  d="M30 60C30 54.4772 34.4772 50 40 50H85C87.7614 50 90 52.2386 90 55C90 63.2843 96.7157 70 105 70C113.284 70 120 63.2843 120 55C120 52.2386 122.239 50 125 50H160C165.523 50 170 54.4772 170 60V95L150 100L170 105V140C170 145.523 165.523 150 160 150H125C122.239 150 120 147.761 120 145C120 136.716 113.284 130 105 130C96.7157 130 90 136.716 90 145C90 147.761 87.7614 150 85 150H40C34.4772 150 30 145.523 30 140V105L50 100L30 95V60Z"
                  fill="#ef4444"
                  fillOpacity="0.1"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                {/* Crack Line */}
                <path
                  d="M100 50L95 80L110 110L100 150"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                {/* Text: EXPIRED */}
                <text
                  x="100"
                  y="105"
                  fill="#ef4444"
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(-10 100 105)"
                >
                  EXPIRED
                </text>
              </g>

              {/* Fresh Revived Coupon (Green/Sparkle) */}
              <g className="animate-revival-in">
                {/* Coupon body */}
                <path
                  d="M30 60C30 54.4772 34.4772 50 40 50H85C87.7614 50 90 52.2386 90 55C90 63.2843 96.7157 70 105 70C113.284 70 120 63.2843 120 55C120 52.2386 122.239 50 125 50H160C165.523 50 170 54.4772 170 60V140C170 145.523 165.523 150 160 150H125C122.239 150 120 147.761 120 145C120 136.716 113.284 130 105 130C96.7157 130 90 136.716 90 145C90 147.761 87.7614 150 85 150H40C34.4772 150 30 145.523 30 140V60Z"
                  fill="#2563eb"
                  fillOpacity="0.15"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                />

                {/* Revive logo or arrows inside */}
                <circle
                  cx="105"
                  cy="100"
                  r="24"
                  fill="#2563eb"
                  fillOpacity="0.2"
                />

                <path
                  d="M97 97C97 92.5817 100.582 89 105 89C109.418 89 113 92.5817 113 97C113 99.5 111 102 108 104L105 107"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="105" cy="113" r="1.5" fill="#2563eb" />

                {/* Sparkles around */}
                <path d="M50 80L53 83L50 86L47 83L50 80Z" fill="#2563eb" />
                <path
                  d="M150 120L152 122L150 124L148 122L150 120Z"
                  fill="#2563eb"
                />
                <path d="M140 70L144 74L140 78L136 74L140 70Z" fill="#2563eb" />
              </g>
            </svg>

            {/* Float badges */}
            <div className="absolute top-4 left-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Renewing</span>
            </div>

            <div className="absolute bottom-4 right-4 bg-brand-warning/10 border border-brand-warning/20 text-brand-warning text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Award className="w-3 h-3" />
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded keyframe styles for animations inside this section */}
      <style jsx global>{`
        @keyframes revival-out {
          0%, 30% {
            opacity: 1;
            transform: scale(1);
          }
          45%, 100% {
            opacity: 0;
            transform: scale(0.9);
          }
        }
        @keyframes revival-in {
          0%, 45% {
            opacity: 0;
            transform: scale(0.9);
          }
          60%, 100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-revival-out {
          animation: revival-out 8s infinite ease-in-out;
          transform-origin: center;
        }
        .animate-revival-in {
          animation: revival-in 8s infinite ease-in-out;
          transform-origin: center;
        }
      `}</style>
    </section>
  );
}
