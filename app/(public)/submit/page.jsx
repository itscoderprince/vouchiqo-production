"use client";

import {
  AlignLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Heading,
  Link2,
  Mail,
  Phone,
  Store,
  Ticket,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_MERCHANTS = [
  "Amazon",
  "Myntra",
  "Air India",
  "Dell",
  "AJIO",
  "UBER",
  "MakeMyTrip",
  "Udemy",
  "Samsung",
  "BigRock",
  "Nykaa",
  "HP Shopping",
  "Starbucks",
  "Dominos Pizza",
  "Adidas",
  "Zara",
  "JioMart",
  "KFC",
  "Puma",
  "Nike",
  "Swiggy",
  "Zomato",
  "Pharmeasy",
  "Tata CLiQ",
];

const LEADERBOARD = [
  { rank: 1, name: "armory texas", points: 100, medal: true },
  { rank: 2, name: "Bhuvan S raj", points: 10, medal: true },
  { rank: 3, name: "govinda AF", points: 10, medal: true },
  { rank: 4, name: "Rohit Singh", points: 10, medal: false },
];

export default function SubmitCouponPage() {
  // Coupon submission states
  const [couponMerchant, setCouponMerchant] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [terms, setTerms] = useState("");
  const [couponTitle, setCouponTitle] = useState("");
  const [couponDesc, setCouponDesc] = useState("");

  // Merchant submission states
  const [merchantName, setMerchantName] = useState("");
  const [merchantUrl, setMerchantUrl] = useState("");
  const [merchantEmail, setMerchantEmail] = useState("");
  const [merchantMobile, setMerchantMobile] = useState("");

  const filteredMerchants = MOCK_MERCHANTS.filter((m) =>
    m.toLowerCase().includes(couponMerchant.toLowerCase()),
  );

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponMerchant || !couponCode) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success(
      "Thank you! Your coupon has been submitted for verification.",
    );
    // Clear fields
    setCouponMerchant("");
    setCouponCode("");
    setExpiryDate("");
    setTerms("");
    setCouponTitle("");
    setCouponDesc("");
  };

  const handleMerchantSubmit = (e) => {
    e.preventDefault();
    if (!merchantName || !merchantUrl) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Thank you! The merchant details have been submitted.");
    // Clear fields
    setMerchantName("");
    setMerchantUrl("");
    setMerchantEmail("");
    setMerchantMobile("");
  };

  return (
    <div className="w-full flex flex-col py-6 select-none max-w-7xl mx-auto px-4 text-left">
      {/* Page Header */}
      <section className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight font-heading">
            Submit Coupon
          </h1>
          <p className="text-[13px] text-slate-500 font-semibold">
            Verified On:{" "}
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-4 sm:gap-6">
          <div className="bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3 flex flex-col justify-center">
            <span className="text-[20px] font-black text-brand-blue leading-none">
              12,358
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Coupon Submissions
            </span>
          </div>
          <div className="bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3 flex flex-col justify-center">
            <span className="text-[20px] font-black text-brand-blue leading-none">
              2,976
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Merchant Submissions
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forms column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="coupon" className="w-full">
            <TabsList className="bg-[#eff6ff] rounded-xl w-full max-w-md mb-6 flex">
              <TabsTrigger
                value="coupon"
                className="flex-1 py-2 text-xs font-bold transition-all"
              >
                Coupon Submission
              </TabsTrigger>
              <TabsTrigger
                value="merchant"
                className="flex-1 py-2 text-xs font-bold transition-all"
              >
                Merchant Submission
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Coupon Submission */}
            <TabsContent value="coupon">
              <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
                <form onSubmit={handleCouponSubmit} className="space-y-6">
                  {/* Merchant name with autocomplete */}
                  <div className="relative">
                    <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-brand-blue" />
                      Merchant Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or enter store name (e.g. Amazon, Nike)"
                        value={couponMerchant}
                        onChange={(e) => {
                          setCouponMerchant(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        required
                      />
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    {/* Autocomplete Dropdown */}
                    {showSuggestions &&
                      couponMerchant &&
                      filteredMerchants.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-50">
                          {filteredMerchants.map((merchant) => (
                            <div
                              key={merchant}
                              onClick={() => {
                                setCouponMerchant(merchant);
                                setShowSuggestions(false);
                              }}
                              className="px-4 py-2.5 hover:bg-slate-50 text-[13px] text-slate-700 font-medium cursor-pointer"
                            >
                              {merchant}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Code & Expiry Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-brand-blue" />
                        Coupon Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. SAVE50, EXTRA20"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium uppercase"
                          required
                        />
                        <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-blue" />
                        Expiry Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        />
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Terms */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                        <Heading className="w-4 h-4 text-brand-blue" />
                        Title / Deal Line
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. Flat 50% OFF on all orders"
                          value={couponTitle}
                          onChange={(e) => setCouponTitle(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        />
                        <Heading className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-brand-blue" />
                        Terms & Conditions
                      </label>
                      <div className="relative">
                        <textarea
                          placeholder="List any coupon terms, minimum purchase limits, or user restrictions..."
                          value={terms}
                          onChange={(e) => setTerms(e.target.value)}
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        />
                        <FileText className="absolute left-3.5 top-4 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                      <AlignLeft className="w-4 h-4 text-brand-blue" />
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Add a detailed description about how to use this coupon..."
                        value={couponDesc}
                        onChange={(e) => setCouponDesc(e.target.value)}
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                      />
                      <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full bg-[#FF7A18] hover:bg-[#FF7A18]/90 text-white font-bold py-3.5 rounded-xl text-[13px] uppercase tracking-wider transition-colors cursor-pointer border-none shadow-md shadow-orange-500/20"
                  >
                    Submit Coupon
                  </button>
                </form>
              </div>
            </TabsContent>

            {/* Tab 2: Merchant Submission */}
            <TabsContent value="merchant">
              <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
                <form onSubmit={handleMerchantSubmit} className="space-y-6">
                  <div>
                    <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-brand-blue" />
                      Merchant Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter store/company name"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        required
                      />
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-brand-blue" />
                      Merchant Website URL{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={merchantUrl}
                        onChange={(e) => setMerchantUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        required
                      />
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-brand-blue" />
                        Contact Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="e.g. partner@store.com"
                          value={merchantEmail}
                          onChange={(e) => setMerchantEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-brand-blue" />
                        Contact Phone
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={merchantMobile}
                          onChange={(e) => setMerchantMobile(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
                        />
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF7A18] hover:bg-[#FF7A18]/90 text-white font-bold py-3.5 rounded-xl text-[13px] uppercase tracking-wider transition-colors cursor-pointer border-none shadow-md shadow-orange-500/20"
                  >
                    Submit Merchant
                  </button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          {/* Guidelines and instructions card */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-black text-brand-navy mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-blue" />
              Submission Instructions & Guidelines
            </h2>
            <div className="space-y-6 text-[13px] text-slate-600 font-medium">
              <div>
                <h3 className="font-bold text-slate-800 text-[14px] mb-2">
                  Instructions
                </h3>
                <p className="leading-relaxed">
                  Submit a coupon code or partner store details to help our
                  shopping community save more! Each accepted submission helps
                  thousands of members save and increases your ranking.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[14px] mb-2">
                  Submission Guidelines
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                  <li>
                    Only submit public coupon codes (avoid custom/personal
                    corporate codes).
                  </li>
                  <li>
                    Confirm that the coupon dates and details are as accurate as
                    possible.
                  </li>
                  <li>
                    Our administrators will review and verify your submission
                    within 24 hours.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Column (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[16px] font-black text-brand-navy mb-5 flex items-center gap-2 border-b border-slate-50 pb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leader Board
            </h2>
            <div className="flex flex-col divide-y divide-slate-100">
              {LEADERBOARD.map((user) => (
                <div
                  key={user.rank}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                        user.rank === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : user.rank === 2
                            ? "bg-slate-100 text-slate-700"
                            : user.rank === 3
                              ? "bg-orange-100 text-orange-700"
                              : "bg-transparent text-slate-400"
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-brand-navy leading-none">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1">
                        Points: {user.points}
                      </p>
                    </div>
                  </div>
                  {user.medal && (
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-full">
                      👑
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#08214D] to-[#0d3473] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Trophy className="w-40 h-40" />
            </div>
            <h3 className="text-[15px] font-black uppercase tracking-wider mb-2">
              Submitter Benefits
            </h3>
            <ul className="space-y-3.5 text-[12px] font-medium text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="text-yellow-400">★</span>
                <span>
                  <strong>Get Recognized:</strong> Earn profile badges and rise
                  on the leaderboard.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-yellow-400">★</span>
                <span>
                  <strong>Support the Community:</strong> Help shoppers make
                  smart purchases.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-yellow-400">★</span>
                <span>
                  <strong>Win Rewards:</strong> Become eligible for exclusive
                  giveaways.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
