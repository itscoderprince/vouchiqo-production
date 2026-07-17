"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
  Building2,
  Tag,
  Phone,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SOURCE_PLATFORMS = [
  "Vouchiqo",
  "Instagram",
  "WhatsApp Forward",
  "Google Search",
  "Another Coupon Website",
  "Physical Store or Flyer",
  "Friend or Family",
  "Other",
];

const DISCOUNT_TYPES = [
  { value: "percentage", label: "% Off" },
  { value: "fixed", label: "Flat ₹ Off" },
  { value: "bogo", label: "BOGO (Buy One Get One)" },
  { value: "freebie", label: "Free Gift with Purchase" },
  { value: "other", label: "Other" },
];

const CATEGORIES = [
  "Fashion & Clothing",
  "Food & Dining",
  "Electronics & Gadgets",
  "Beauty & Wellness",
  "Travel & Hospitality",
  "Home & Living",
  "Home Improvement",
  "Fitness & Healthcare",
  "Education & Courses",
  "Kids & Baby Products",
  "Jewellery & Accessories",
  "Automobile & Auto Services",
  "Gaming & Entertainment",
  "Grocery & Essentials",
  "Finance & Insurance",
];

export default function ExpiredCouponRevival() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    brandName: "",
    merchantWebsite: "",
    merchantCity: "Ranchi",
    whereDidYouFindThisOffer: "Google Search",
    code: "",
    discountType: "percentage",
    discountValue: "",
    description: "",
    whenSeen: new Date().toISOString().split("T")[0],
    whatBuying: "",
    email: "",
    mobileNumber: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
          if (json.success && json.data?.settings) {
            const s = json.data.settings;
            if (s.revival_stats) setStats(s.revival_stats);
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

  const nextStep = () => {
    if (step === 1) {
      if (!form.brandName || !form.merchantCity) {
        setError("Please enter a Brand Name and City.");
        return;
      }
    } else if (step === 2) {
      if (!form.discountType || !form.description) {
        setError("Please provide offer details (Type & Description).");
        return;
      }
    } else if (step === 3) {
      if (!form.email || !form.mobileNumber) {
        setError("Email and WhatsApp mobile number are required.");
        return;
      }
      if (!/^\d{10}$/.test(form.mobileNumber)) {
        setError("Please enter a valid 10-digit Indian WhatsApp number.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent) {
      setError("You must check the expectation consent checkbox to proceed.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discountValue: form.discountValue ? Number(form.discountValue) : null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
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
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0c1a2c] via-[#11243b] to-[#0c1a2c] text-white py-16 px-4 text-center border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <Badge className="bg-blue-600/15 text-[#2563eb] hover:bg-blue-600/20 border border-[#2563eb]/20 rounded-full px-3.5 py-1 font-bold text-xs shadow-none gap-1.5 w-fit mx-auto animate-float">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tested Before It Reaches You</span>
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight max-w-2xl mx-auto text-white">
            Have an Expired Offer?
            <br />
            <span className="text-brand-gradient">Don&apos;t Give Up.</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
            Submit your expired discount codes here. Vouchiqo contacts the
            merchant on your behalf and requests a fresh verified offer — free,
            within 48 hours.
          </p>

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
              <span className="block text-2xl font-black text-[#2563eb]">
                {stats.totalRequests}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Claims Revived
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main split layout */}
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
                  Submitted! We&apos;re on it.
                </h3>
                <p className="text-xs text-brand-subtext max-w-sm mx-auto leading-relaxed">
                  We&apos;ve received your request and will contact the merchant
                  on your behalf. You&apos;ll hear back within 48 hours — check
                  your email and WhatsApp.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                  setForm({
                    brandName: "",
                    merchantWebsite: "",
                    merchantCity: "Ranchi",
                    whereDidYouFindThisOffer: "Google Search",
                    code: "",
                    discountType: "percentage",
                    discountValue: "",
                    description: "",
                    whenSeen: new Date().toISOString().split("T")[0],
                    whatBuying: "",
                    email: "",
                    mobileNumber: "",
                    consent: false,
                  });
                }}
                className="bg-brand-navy hover:bg-slate-800 text-white py-2.5 px-8 text-xs font-bold border-0 h-auto cursor-pointer shadow-none rounded-lg"
              >
                Submit Another Offer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wizard progress header */}
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h2 className="text-sm font-bold text-brand-navy font-heading uppercase tracking-wider flex items-center gap-2">
                  {step === 1 && (
                    <Building2 className="w-4 h-4 text-brand-blue" />
                  )}
                  {step === 2 && <Tag className="w-4 h-4 text-brand-blue" />}
                  {step === 3 && <Phone className="w-4 h-4 text-brand-blue" />}
                  {step === 4 && (
                    <CheckSquare className="w-4 h-4 text-brand-blue" />
                  )}
                  <span>
                    Step {step} of 4:{" "}
                    {step === 1
                      ? "Merchant Details"
                      : step === 2
                        ? "Offer Details"
                        : step === 3
                          ? "Contact Information"
                          : "Confirm Consent"}
                  </span>
                </h2>
                <span className="text-[11px] font-bold text-brand-subtext">
                  {Math.round((step / 4) * 100)}% Complete
                </span>
              </div>

              {error && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-brand-error/5 border border-brand-error/15 text-brand-error text-xs items-center">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Merchant Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Brand or Business Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Marbella, Zomato, Starbucks"
                      value={form.brandName}
                      onChange={(e) =>
                        setForm({ ...form, brandName: e.target.value })
                      }
                      className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Merchant Website or Instagram (If you know it)
                    </label>
                    <Input
                      placeholder="e.g. @marbellaranchi or https://brand.com"
                      value={form.merchantWebsite}
                      onChange={(e) =>
                        setForm({ ...form, merchantWebsite: e.target.value })
                      }
                      className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Which city is this business in? *
                      </label>
                      <Input
                        required
                        placeholder="e.g. Ranchi"
                        value={form.merchantCity}
                        onChange={(e) =>
                          setForm({ ...form, merchantCity: e.target.value })
                        }
                        className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Where did you find this offer? *
                      </label>
                      <select
                        value={form.whereDidYouFindThisOffer}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            whereDidYouFindThisOffer: e.target.value,
                          })
                        }
                        className="w-full bg-brand-surface border border-brand-border rounded-lg text-xs h-10 px-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      >
                        {SOURCE_PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand-navy hover:bg-slate-800 text-white w-full py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none rounded-lg flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Continue to Offer Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Offer Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Expired Offer Code (If there was one)
                      </label>
                      <Input
                        placeholder="e.g. SAVE20, MARBELLA15"
                        value={form.code}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10 uppercase"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        What was the offer? *
                      </label>
                      <select
                        value={form.discountType}
                        onChange={(e) =>
                          setForm({ ...form, discountType: e.target.value })
                        }
                        className="w-full bg-brand-surface border border-brand-border rounded-lg text-xs h-10 px-2 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      >
                        {DISCOUNT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(form.discountType === "percentage" ||
                    form.discountType === "fixed") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        How much off? (Numerical Value only)
                      </label>
                      <Input
                        type="number"
                        placeholder={
                          form.discountType === "percentage"
                            ? "e.g. 20 (for 20%)"
                            : "e.g. 500 (for ₹500)"
                        }
                        value={form.discountValue}
                        onChange={(e) =>
                          setForm({ ...form, discountValue: e.target.value })
                        }
                        className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Offer description (Brief) *
                    </label>
                    <Input
                      placeholder="e.g. 20% off all bathroom tiles, BOGO coffee"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        When did you see/find this offer? *
                      </label>
                      <Input
                        type="date"
                        value={form.whenSeen}
                        onChange={(e) =>
                          setForm({ ...form, whenSeen: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        What were you trying to buy? (optional)
                      </label>
                      <Input
                        placeholder="e.g. Espresso drinks, Tiles"
                        value={form.whatBuying}
                        onChange={(e) =>
                          setForm({ ...form, whatBuying: e.target.value })
                        }
                        className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      className="border border-brand-border bg-transparent text-brand-navy hover:bg-slate-50 w-fit px-4 py-2.5 text-xs font-bold rounded-lg cursor-pointer h-auto shadow-none flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-brand-navy hover:bg-slate-800 text-white flex-1 py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>Continue to Contact</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your email — we&apos;ll send the fresh offer here *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your WhatsApp number — for faster delivery *
                    </label>
                    <Input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.mobileNumber}
                      onChange={(e) =>
                        setForm({ ...form, mobileNumber: e.target.value })
                      }
                      className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-10"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      className="border border-brand-border bg-transparent text-brand-navy hover:bg-slate-50 w-fit px-4 py-2.5 text-xs font-bold rounded-lg cursor-pointer h-auto shadow-none flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-brand-navy hover:bg-slate-800 text-white flex-1 py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>Continue to Consent</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Consent & Submit */}
              {step === 4 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-4">
                    <h4 className="font-heading text-xs font-extrabold text-brand-navy uppercase tracking-widest">
                      Expectation-Setting Agreement
                    </h4>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={form.consent}
                        onChange={(e) =>
                          setForm({ ...form, consent: e.target.checked })
                        }
                        className="w-4 h-4 mt-0.5 border-brand-border text-brand-blue focus:ring-brand-blue rounded"
                      />
                      <span className="text-xs leading-relaxed text-slate-600 font-medium">
                        I understand Vouchiqo will try to get this offer
                        reactivated, but cannot guarantee a working code will be
                        available. If this isn&apos;t possible, I&apos;ll be
                        notified and may be offered a similar active offer from
                        this brand or category instead.
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      className="border border-brand-border bg-transparent text-brand-navy hover:bg-slate-50 w-fit px-4 py-2.5 text-xs font-bold rounded-lg cursor-pointer h-auto shadow-none flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#0f172a] hover:bg-slate-800 text-white flex-1 py-3 text-xs font-bold border-0 h-auto cursor-pointer shadow-md flex items-center justify-center gap-2 rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Revival Request</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        {/* Right Side: Process Guide & Success Stories (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          {/* How it works visual */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
              How Revival Works
            </h3>

            <div className="space-y-4 text-xs font-semibold">
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
              Recent Successful Revivals
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
