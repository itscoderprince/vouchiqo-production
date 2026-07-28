"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ApplicationTracker } from "@/components/merchant/application-tracker";

export default function MerchantApplicationStatusPage() {
  return (
    <DashboardLayout
      title="Application Tracking & Verification"
      user={{ name: "Merchant Partner", role: "merchant" }}
    >
      <ApplicationTracker />
    </DashboardLayout>
  );
}

