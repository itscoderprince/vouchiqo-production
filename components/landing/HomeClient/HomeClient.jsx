"use client";

import dynamicImport from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// Defer static loads of heavy below-the-fold and modal overlay components
const ConfirmationModal = dynamicImport(
  () => import("@/components/shared/ConfirmationModal"),
  { ssr: false },
);

const HowItWorks = dynamicImport(() =>
  import("../HowItWorks").then((mod) => mod.HowItWorks),
);
const Testimonials = dynamicImport(() =>
  import("../Testimonials").then((mod) => mod.Testimonials),
);
const FaqSection = dynamicImport(() =>
  import("../FAQSection").then((mod) => mod.FaqSection),
);
const LatestArticles = dynamicImport(() =>
  import("../LatestArticles").then((mod) => mod.LatestArticles),
);

// Layout elements
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { useInterests } from "@/hooks/use-interests";
import { useLocation } from "@/hooks/use-location";
import { useSession } from "@/lib/auth-client";
// Core components & hooks
import { HeroSection } from "../HeroSection";
import PopularOffers from "../PopularOffers";
import PopularStores from "../PopularStores";
import { DUMMY_TAB_COUPONS } from "./constants";
import DealsOfTheDay from "./DealsOfTheDay";
import InterestBanner from "./InterestBanner";
import InterestSheet from "./InterestSheet";
import LocationPromptModal from "@/components/shared/LocationPromptModal";
// Component page sections
import LeadingTaglineBar from "./LeadingTaglineBar";
import NewsletterSubscription from "./NewsletterSubscription";
import TodayTopCoupons from "./TodayTopCoupons";
import TrendingOffer from "./TrendingOffer";

export function HomeClient({
  initialCoupons = [],
  latestCoupons = [],
  popularMerchants = [],
  banners = [],
}) {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { city } = useLocation();

  const { data: session } = useSession();
  const user = session?.user;
  const {
    interests: savedInterests,
    saveInterests,
    syncing: updatingPrefs,
  } = useInterests();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isPrefSheetOpen, setIsPrefSheetOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSelect, setLocationSelect] = useState("All Locations");

  const [feedTab, setFeedTab] = useState("all");

  // Interest banner state
  const [showInterestBanner, setShowInterestBanner] = useState(false);

  // Today's Top Coupons filtering state
  const [couponTab, setCouponTab] = useState("most-used");

  // Mount logic
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync selectedInterests state with savedInterests when the preferences sheet opens
  useEffect(() => {
    if (isPrefSheetOpen) {
      setSelectedInterests(savedInterests || []);
    }
  }, [isPrefSheetOpen, savedInterests]);

  // Show interest banner for anonymous visitors or if user hasn't set preferences yet
  useEffect(() => {
    if (isMounted) {
      const bannerDismissed =
        localStorage.getItem("interests-banner-dismissed") === "true";
      if (
        !bannerDismissed &&
        (!user || (savedInterests && savedInterests.length === 0))
      ) {
        // Show after 3 seconds delay
        const timer = setTimeout(() => setShowInterestBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isMounted, user, savedInterests]);

  const handleDismissInterestsBanner = () => {
    localStorage.setItem("interests-banner-dismissed", "true");
    setShowInterestBanner(false);
  };

  const handleSaveInterests = async (interestsList) => {
    try {
      await saveInterests(interestsList);
      toast.success("Preferences updated successfully!");
      setIsPrefSheetOpen(false);
      setShowInterestBanner(false);
      localStorage.setItem("interests-banner-dismissed", "true");
    } catch (error) {
      toast.error("Failed to update preferences. Please try again.");
    }
  };

  // Filter today's top coupons tab
  const filteredTabCoupons = useMemo(() => {
    const allCoupons = [...initialCoupons, ...latestCoupons];

    // Deduplicate by ID
    const uniqueCoupons = [];
    const seenIds = new Set();
    for (const c of allCoupons) {
      if (!seenIds.has(c._id)) {
        seenIds.add(c._id);
        uniqueCoupons.push(c);
      }
    }

    if (couponTab === "most-used") {
      return uniqueCoupons.slice(0, 12);
    }

    const dbFiltered = uniqueCoupons
      .filter((c) => {
        const category = c.category?.toLowerCase() || "";
        const title = c.title?.toLowerCase() || "";

        switch (couponTab) {
          case "travel":
            return (
              category.includes("travel") ||
              category.includes("hotel") ||
              category.includes("hospitality")
            );
          case "fashion":
            return (
              category.includes("fashion") ||
              category.includes("clothing") ||
              category.includes("apparel") ||
              title.includes("fashion")
            );
          case "food":
            return (
              category.includes("food") ||
              category.includes("dining") ||
              title.includes("food") ||
              title.includes("pizza")
            );
          case "electronics":
            return (
              category.includes("electronics") ||
              category.includes("gadget") ||
              title.includes("laptop") ||
              title.includes("soundbar")
            );
          case "beauty":
            return (
              category.includes("beauty") ||
              category.includes("wellness") ||
              category.includes("skincare")
            );
          case "home":
            return (
              category.includes("home") ||
              category.includes("living") ||
              category.includes("furniture")
            );
          case "home-improvement":
            return (
              category.includes("home-improvement") ||
              category.includes("improvement") ||
              category.includes("tiles") ||
              category.includes("hardware")
            );
          case "fitness":
            return (
              category.includes("fitness") ||
              category.includes("health") ||
              category.includes("healthcare") ||
              category.includes("gym")
            );
          case "education":
            return (
              category.includes("education") ||
              category.includes("course") ||
              category.includes("coaching") ||
              category.includes("learning")
            );
          case "kids-baby":
            return (
              category.includes("kids") ||
              category.includes("baby") ||
              category.includes("toy")
            );
          case "jewellery":
            return (
              category.includes("jewel") ||
              category.includes("accessories") ||
              category.includes("watch")
            );
          case "automotive":
            return (
              category.includes("automotive") ||
              category.includes("car") ||
              category.includes("auto") ||
              category.includes("service")
            );
          case "entertainment":
            return (
              category.includes("entertainment") ||
              category.includes("game") ||
              category.includes("gaming") ||
              category.includes("show")
            );
          case "grocery":
            return (
              category.includes("grocery") ||
              category.includes("essential") ||
              category.includes("food")
            );
          case "finance":
            return (
              category.includes("finance") ||
              category.includes("insurance") ||
              category.includes("loan") ||
              category.includes("bank")
            );
          default:
            return true;
        }
      })
      .slice(0, 12);

    const isRanchi =
      city?.toLowerCase() === "ranchi" || city?.toLowerCase() === "jharkhand";
    let result =
      dbFiltered.length > 0 ? dbFiltered : DUMMY_TAB_COUPONS[couponTab] || [];

    // 1. Tag elevated/local coupons
    result = result.map((coupon) => {
      const isHomeImprovement =
        coupon.category === "home-improvement" || coupon.category === "home";
      const isMarbella =
        coupon.merchantId?.businessName?.toLowerCase().includes("marbella") ||
        coupon.title?.toLowerCase().includes("marbella");
      const isLocalMerchant =
        coupon.merchantId?.city?.toLowerCase() === "ranchi" ||
        coupon.merchantId?.city?.toLowerCase() === "jharkhand" ||
        isMarbella;

      return {
        ...coupon,
        isLocal: isLocalMerchant || (isRanchi && isHomeImprovement),
      };
    });

    // 2. Sort/Reorder:
    // Priority A: if isRanchi is true, elevate coupons where isLocal is true
    // Priority B: if user has savedInterests, elevate coupons whose category is in savedInterests
    result = [...result].sort((a, b) => {
      if (isRanchi) {
        if (a.isLocal && !b.isLocal) return -1;
        if (!a.isLocal && b.isLocal) return 1;
      }

      const aHasInterest = savedInterests?.includes(a.category);
      const bHasInterest = savedInterests?.includes(b.category);
      if (aHasInterest && !bHasInterest) return -1;
      if (!aHasInterest && bHasInterest) return 1;

      return 0;
    });

    return result;
  }, [couponTab, initialCoupons, latestCoupons, city, savedInterests]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="w-full px-4 md:px-8 pt-6 pb-2">
        {/* 4. Split Hero Section */}
        <section
          className="g-main-banner main__banner__div"
          data-toppicks-show="True"
        >
          <HeroSection banners={banners} />
        </section>
      </main>

      {/* Decorative tagline bar — spans full screen width naturally */}
      <LeadingTaglineBar />

      {/* Main Container */}
      <main className="w-full px-1 md:px-8 py-2 space-y-12">
        {/* 8. Popular Offers of the Day */}
        <PopularOffers coupons={initialCoupons} />

        {/* 9. Popular Stores (with Store of the Month) */}
        <PopularStores merchants={popularMerchants} />

        {/* 10. Today's Top Coupons & Offers */}
        <TodayTopCoupons
          couponTab={couponTab}
          setCouponTab={setCouponTab}
          filteredTabCoupons={filteredTabCoupons}
        />

        {/* 11. Trending Offer Banner */}
        <TrendingOffer />

        {/* 12. Deals of the Day (Product retail grid) */}
        <DealsOfTheDay />

        {/* 20. Latest Articles carousel */}
        <LatestArticles />
      </main>

      {/* 23. FAQ Section — full width on mobile */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-8 py-6 mb-4">
        <FaqSection />
      </div>

      {/* Subscribe Now — full width, flush to footer */}
      <NewsletterSubscription />

      {/* 24. Footer */}
      <Footer />

      {/* Confirmation/Claim Modal Overlay */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={async (_id) => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return `VOUCH-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`;
          }}
        />
      )}

      {/* Personalisation Preferences slide-in Sheet panel */}
      {isMounted && user && (
        <InterestSheet
          isOpen={isPrefSheetOpen}
          onOpenChange={setIsPrefSheetOpen}
          updatingPrefs={updatingPrefs}
          selectedInterests={selectedInterests}
          setSelectedInterests={setSelectedInterests}
          handleSaveInterests={handleSaveInterests}
        />
      )}

      {/* Interest Capture Banner (for anonymous visitors) */}
      {isMounted && (
        <InterestBanner
          show={showInterestBanner}
          onDismiss={handleDismissInterestsBanner}
          selectedInterests={selectedInterests}
          setSelectedInterests={setSelectedInterests}
          handleSaveInterests={handleSaveInterests}
        />
      )}

      {/* Geolocation Prompt Modal */}
      {isMounted && <LocationPromptModal />}
    </div>
  );
}

export default HomeClient;
