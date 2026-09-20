"use client";

import dynamicImport from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Defer static loads of heavy below-the-fold and modal overlay components
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

// Layout elements
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { useInterests } from "@/hooks/use-interests";
import { useSession } from "@/lib/auth-client";
// Core components
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

  const handleSaveInterests = async (interestsList) => {
    try {
      await saveInterests(interestsList);
      toast.success("Preferences updated successfully!");
      setIsPrefSheetOpen(false);
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
        {/* Popular Offers of the Day */}
        <PopularOffers coupons={initialCoupons} />

        {/* Popular Stores (with Store of the Month) */}
        <PopularStores merchants={popularMerchants} />
      </main>

      {/* Full-bleed Edge-to-Edge Sections */}
      <RevivalPromo />

      {/* Main Container */}
      <main className="w-full px-2.5 sm:px-4 md:px-5 py-2 space-y-6 sm:space-y-8">
        {/* Trending Offer Banner */}
        <TrendingOffer banners={banners} />

        {/* Deals of the Day / Affiliate Products */}
        <DealsOfTheDay affiliateProducts={affiliateProducts} />

        {/* Latest Articles carousel */}
        <LatestArticles />
      </main>

      {/* FAQ Section — full width on mobile */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-4 mb-2">
        <FaqSection />
      </div>

      {/* Subscribe Now — full width, flush to footer */}
      <NewsletterSubscription />

      {/* Footer */}
      <Footer />

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
