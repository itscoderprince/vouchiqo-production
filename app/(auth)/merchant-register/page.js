import { MerchantOnboardingWizard } from "@/features/auth/components/merchant-onboarding-wizard";

export const metadata = {
  title: "Merchant Onboarding | Vouchiqo",
  description:
    "Complete 6-section merchant onboarding application for Ranchi and Jharkhand.",
};

export default function MerchantRegisterPage() {
  return <MerchantOnboardingWizard />;
}
