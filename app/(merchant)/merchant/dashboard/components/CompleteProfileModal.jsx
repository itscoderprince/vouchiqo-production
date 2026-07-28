"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  ShieldAlert,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function calculateProfileHealth(merchant) {
  if (!merchant) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 16,
      missingFields: ["All details missing"],
      color: "red",
    };
  }

  const fields = [
    { name: "Business Name", isFilled: Boolean(merchant.businessName) },
    { name: "Brand Slug", isFilled: Boolean(merchant.slug) },
    { name: "Primary Category", isFilled: Boolean(merchant.category) },
    {
      name: "Store Description",
      isFilled: Boolean(merchant.description && merchant.description.length > 10),
    },
    { name: "Contact Email", isFilled: Boolean(merchant.contactEmail) },
    { name: "Contact Phone", isFilled: Boolean(merchant.contactPhone) },
    { name: "Store Address", isFilled: Boolean(merchant.location?.address) },
    {
      name: "City & State",
      isFilled: Boolean(merchant.location?.city && merchant.location?.state),
    },
    { name: "Pincode", isFilled: Boolean(merchant.location?.pincode) },
    { name: "Google Maps Link", isFilled: Boolean(merchant.location?.gmapsLink) },
    { name: "Store Logo", isFilled: Boolean(merchant.logo) },
    { name: "Store Banner Image", isFilled: Boolean(merchant.banner) },
    { name: "Shop Storefront Photo", isFilled: Boolean(merchant.shopImage) },
    { name: "Identity Document Type", isFilled: Boolean(merchant.docType) },
    { name: "Identity Document Image", isFilled: Boolean(merchant.docImage) },
    {
      name: "Store Operating Hours",
      isFilled: Boolean(
        merchant.operatingHours && Object.keys(merchant.operatingHours).length > 0,
      ),
    },
  ];

  const completedCount = fields.filter((f) => f.isFilled).length;
  const totalCount = fields.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingFields = fields.filter((f) => !f.isFilled).map((f) => f.name);

  let color = "red";
  if (percentage >= 85) {
    color = "emerald";
  } else if (percentage >= 50) {
    color = "amber";
  }

  return {
    percentage,
    completedCount,
    totalCount,
    missingFields,
    color,
  };
}

export default function CompleteProfileModal({ merchant }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const health = useMemo(() => calculateProfileHealth(merchant), [merchant]);

  // Check if merchant chose a paid plan but payment is pending / unpaid
  const planName = merchant?.plan || "Starter Free";
  const isStarterPlan =
    planName.toLowerCase().includes("starter") ||
    planName.toLowerCase().includes("free");
  const isPaidPlan = !isStarterPlan;

  const isPaymentCompleted =
    merchant?.paymentStatus === "completed" ||
    merchant?.subscriptionStatus === "active" ||
    merchant?.isPaid === true;

  const isPaymentPending = isPaidPlan && !isPaymentCompleted;
  const isProfileComplete = health.percentage >= 100;

  // Show 2 slides ONLY if payment is pending. If payment is completed, Slide 2 is hidden.
  const totalSlides = isPaymentPending && !isProfileComplete ? 2 : 1;

  useEffect(() => {
    if (!merchant) return;

    // IF Profile is 100% complete AND payment is not pending -> NEVER SHOW MODAL
    if (isProfileComplete && !isPaymentPending) {
      setOpen(false);
      return;
    }

    // Otherwise, show modal if not dismissed in session
    const isDismissedInSession =
      sessionStorage.getItem("complete_profile_modal_dismissed") === "true";

    if (!isDismissedInSession) {
      setOpen(true);
      // If profile is 100% complete but payment is pending, start directly on Slide 1 (which renders payment)
      if (isProfileComplete && isPaymentPending) {
        setCurrentSlide(1);
      }
    }
  }, [merchant, isProfileComplete, isPaymentPending]);

  // Auto-slide effect between slides if 2 slides exist
  useEffect(() => {
    if (!open || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [open, totalSlides]);

  // Do not render modal if profile is 100% complete AND no payment pending
  if (!open || !merchant || (isProfileComplete && !isPaymentPending)) {
    return null;
  }

  const handleClose = () => {
    sessionStorage.setItem("complete_profile_modal_dismissed", "true");
    setOpen(false);
  };

  const handleGoToProfile = () => {
    handleClose();
    router.push("/merchant/profile?edit=true");
  };

  const handleGoToBilling = () => {
    handleClose();
    router.push("/merchant/billing?autoPay=true");
  };

  // Dynamic color mappings for health gauge ring & status badge based on profile health score
  const strokeColor =
    health.percentage >= 85
      ? "#10b981" // Green for 85%+
      : health.percentage >= 50
        ? "#ea580c" // Orange for 50%-84%
        : "#ef4444"; // Red for < 50%

  const badgeBg =
    health.percentage >= 85
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : health.percentage >= 50
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans text-left">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Complete Your Partner Profile</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {merchant.businessName || "Merchant Partner"} • Ranchi Store
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Slider Controls Header */}
        {totalSlides > 1 && (
          <div className="bg-slate-100/80 px-5 py-2 flex items-center justify-between border-b border-slate-200/80 text-xs">
            <span className="font-bold text-slate-700 text-[11px]">
              Slide {currentSlide + 1} of {totalSlides}:{" "}
              {currentSlide === 0 ? "Profile Health Score" : "Subscription Billing Setup"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(0)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  currentSlide === 0
                    ? "bg-white border-slate-300 shadow-2xs font-bold text-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-700"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1">
                <span
                  onClick={() => setCurrentSlide(0)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    currentSlide === 0 ? "w-4 bg-blue-600" : "bg-slate-300"
                  }`}
                />
                <span
                  onClick={() => setCurrentSlide(1)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    currentSlide === 1 ? "w-4 bg-blue-600" : "bg-slate-300"
                  }`}
                />
              </div>

              <button
                onClick={() => setCurrentSlide(1)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  currentSlide === 1
                    ? "bg-white border-slate-300 shadow-2xs font-bold text-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-700"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Slide Content */}
        <div className="p-6 space-y-5">
          {currentSlide === 0 ? (
            /* SLIDE 1: PROFILE HEALTH & COUNTER */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Circular Health Gauge & Score */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      strokeWidth="3.5"
                      strokeDasharray={`${health.percentage}, 100`}
                      strokeLinecap="round"
                      stroke={strokeColor}
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-extrabold text-slate-900 leading-none">
                      {health.percentage}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      Health
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-bold ${badgeBg}`}>
                      {health.percentage < 50
                        ? "Basic Profile"
                        : health.percentage < 85
                          ? "Good Progress"
                          : "Verified Store"}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-600">
                      {health.completedCount} / {health.totalCount} Fields
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold leading-snug">
                    {health.percentage < 50
                      ? "Your store profile is incomplete. Complete all fields to boost search rank & customer trust."
                      : health.percentage < 85
                        ? "Great job! A few key store details remain. Add logo & banner for 100% health."
                        : "Your store profile is almost 100% verified. Keep details updated!"}
                  </p>
                </div>
              </div>

              {/* Missing Fields List */}
              {health.missingFields.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Remaining Fields to Fill ({health.missingFields.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {health.missingFields.map((fieldName, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-[11px] font-medium bg-blue-50/90 text-blue-700 border border-blue-200/90 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors"
                      >
                        <span>+</span>
                        <span>{fieldName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  onClick={handleGoToProfile}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-10 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Complete Profile Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto text-xs font-bold text-slate-700 border-slate-300 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded-xl h-10 px-4 cursor-pointer transition-colors"
                >
                  Remind Me Later
                </Button>
              </div>
            </div>
          ) : (
            /* SLIDE 2: PAYMENT & SUBSCRIPTION SETUP */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    Chosen Plan: {planName}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-bold">
                    Payment Pending
                  </Badge>
                </div>

                <p className="text-xs text-blue-800 font-medium">
                  You selected the <strong>{planName}</strong> plan. Complete your subscription billing setup to unlock unlimited campaign features &amp; expired offer revivals.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">
                  Features Unlocked Upon Payment:
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Up to 15 Active Offer Listings &amp; Campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Expired Offer Revivals &amp; Push Notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Founding Partner 12-Month Rate Guarantee</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  onClick={handleGoToBilling}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-10 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Payment Now</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto text-xs font-bold text-slate-700 border-slate-300 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded-xl h-10 px-4 cursor-pointer transition-colors"
                >
                  Remind Me Later
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
