"use client";

import dynamicImport from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// Defer static loads of heavy below-the-fold and modal overlay components
const ConfirmationModal = dynamicImport(() => import("@/components/shared/modals/ConfirmationModal"), {
  ssr: false,
});

const Testimonials = dynamicImport(() =>
  import("../Testimonials").then((mod) => mod.Testimonials || mod.default),
);
const FaqSection = dynamicImport(() =>
  import("../FAQSection").then((mod) => mod.FaqSection || mod.default),
);
const LatestArticles = dynamicImport(() =>
  import("../LatestArticles").then((mod) => mod.LatestArticles || mod.default),
);
const RevivalPromo = dynamicImport(() =>
  import("../RevivalPromo").then((mod) => mod.RevivalPromo || mod.default),
);

const LocationPromptModal = dynamicImport(
  () =>
    import("@/components/shared/modals/LocationPromptModal").then(
      (mod) => mod.default || mod.LocationPromptModal,
    ),
  { ssr: false },
);
const PopupBannerModal = dynamicImport(
  () =>
    import("./PopupBannerModal").then(
      (mod) => mod.PopupBannerModal || mod.default,
    ),
  { ssr: false },
);
const InterestSheet = dynamicImport(
  () =>
    import("./InterestSheet").then((mod) => mod.InterestSheet || mod.default),
  { ssr: false },
);
const InterestBanner = dynamicImport(
  () =>
    import("./InterestBanner").then(
      (mod) => mod.InterestBanner || mod.default,
    ),
  { ssr: false },
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
import DealsOfTheDay from "./DealsOfTheDay";
// Component page sections
import LeadingTaglineBar from "./LeadingTaglineBar";
import NewsletterSubscription from "./NewsletterSubscription";
import TrendingOffer from "./TrendingOffer";

export function HomeClient({
  initialCoupons = [],
  latestCoupons = [],
  popularMerchants = [],
  banners = [],
  affiliateProducts = [],
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

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text w-full">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Container — Full-width Hero with 3-6px spacing */}
      <main className="w-full px-1 sm:px-1.5 pt-1 sm:pt-1.5 pb-1">
        {/* 4. Split Hero Section */}
        <section
          className="g-main-banner main__banner__div w-full"
          data-toppicks-show="True"
        >
          <HeroSection banners={banners} />
        </section>
      </main>

      {/* Decorative tagline bar — spans full screen width naturally */}
      <LeadingTaglineBar />

      {/* Main Container */}
      <main className="w-full px-2.5 sm:px-4 md:px-5 py-2 space-y-6 sm:space-y-8">
        {/* 8. Popular Offers of the Day */}
        <PopularOffers coupons={initialCoupons} />

        {/* 9. Popular Stores (with Store of the Month) */}
        <PopularStores merchants={popularMerchants} />
      </main>

      {/* Full-bleed Edge-to-Edge Sections */}
      <RevivalPromo />

      {/* Main Container */}
      <main className="w-full px-2.5 sm:px-4 md:px-5 py-2 space-y-6 sm:space-y-8">
        {/* 11. Trending Offer Banner */}
        <TrendingOffer banners={banners} />

        {/* 12. Deals of the Day / Affiliate Products */}
        <DealsOfTheDay affiliateProducts={affiliateProducts} />

        {/* 20. Latest Articles carousel */}
        <LatestArticles />
      </main>

      {/* 23. FAQ Section — full width on mobile */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-4 mb-2">
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



      {/* Popup Banner Modal */}
      {isMounted && <PopupBannerModal banners={banners} />}

      {/* Geolocation Prompt Modal */}
      {isMounted && <LocationPromptModal />}
    </div>
  );
}

export default HomeClient;
