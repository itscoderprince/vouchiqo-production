import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { MerchantOnboardingWizard } from "@/features/auth/components/merchant-onboarding-wizard";

export const metadata = {
  title: "Merchant Onboarding | Vouchiqo",
  description:
    "Complete 6-section merchant onboarding application for Ranchi and Jharkhand.",
};

export default function MerchantRegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-2 sm:py-4 px-2 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto">
        <MerchantOnboardingWizard />
      </main>
      <Footer />
    </div>
  );
}
