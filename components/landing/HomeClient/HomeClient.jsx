"use client";

import { Loader2 } from "lucide-react";
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
const MerchantCTA = dynamicImport(() =>
  import("../MerchantCTA").then((mod) => mod.MerchantCTA),
);
const PartnerBrands = dynamicImport(() =>
  import("../PartnerBrands").then((mod) => mod.PartnerBrands),
);

// Layout elements
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { useInterests } from "@/hooks/use-interests";

import { useSession } from "@/lib/auth-client";
// Core components & hooks
import { HeroSection } from "../HeroSection";
import PopularOffers from "../PopularOffers";
import PopularStores from "../PopularStores";
import { DUMMY_TAB_COUPONS } from "./constants";
import DealsOfTheDay from "./DealsOfTheDay";
import InterestBanner from "./InterestBanner";
import InterestSheet from "./InterestSheet";
// Component page sections
import LeadingTaglineBar from "./LeadingTaglineBar";
import NewsletterSubscription from "./NewsletterSubscription";
import PopularCategories from "./PopularCategories";
import TodayTopCoupons from "./TodayTopCoupons";
import TrendingOffer from "./TrendingOffer";
import VouchiqoCollections from "./VouchiqoCollections";

export function HomeClient({ initialCoupons = [], latestCoupons = [] }) {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

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
            return category.includes("travel") || category.includes("hotel");
          case "recharge":
            return (
              category.includes("recharge") ||
              category.includes("utility") ||
              title.includes("recharge")
            );
          case "fashion":
            return (
              category.includes("fashion") ||
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
          case "ott":
            return (
              category.includes("ott") ||
              category.includes("entertainment") ||
              title.includes("ott") ||
              title.includes("prime") ||
              title.includes("tv")
            );
          default:
            return true;
        }
      })
      .slice(0, 12);

    // Fallback to high-quality dummy coupons if database returns empty for this tab
    if (dbFiltered.length === 0) {
      return DUMMY_TAB_COUPONS[couponTab] || [];
    }

    return dbFiltered;
  }, [couponTab, initialCoupons, latestCoupons]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 4. Split Hero Section */}
        <section
          className="g-main-banner main__banner__div"
          data-toppicks-show="True"
        >
          <HeroSection />
        </section>
      </main>

      {/* Decorative tagline bar — spans full screen width naturally */}
      <LeadingTaglineBar />

      {/* Main Container */}
      <main className="container mx-auto px-4 py-6 space-y-12 max-w-7xl">
        {/* 8. Popular Offers of the Day */}
        <PopularOffers coupons={initialCoupons} />

        {/* 9. Popular Stores (with Store of the Month) */}
        <PopularStores />

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

        {/* 13. GrabOn Collections Grid */}
        <VouchiqoCollections />



        {/* 17. Popular Categories Grid (High-density 29 links) */}
        <PopularCategories />

        {/* 19. Subscribe Now newsletter card */}
        <NewsletterSubscription />

        {/* 20. Trending Partner Brands Grid */}
        <PartnerBrands />

        {/* 22. Merchant CTA */}
        <MerchantCTA />

        {/* 23. FAQ Section */}
        <FaqSection />
      </main>

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
    </div>
  );
}

export default HomeClient;
