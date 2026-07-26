"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import AddOnsGrid from "./components/AddOnsGrid";
import BillingHistoryTable from "./components/BillingHistoryTable";
import CheckoutModal from "./components/CheckoutModal";
import CurrentPlanCard from "./components/CurrentPlanCard";
import PlanComparisonGrid from "./components/PlanComparisonGrid";

export default function MerchantSubscription() {
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddOn, setSelectedAddOn] = useState(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [gstin, setGstin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay_upi");

  // 1. Fetch live merchant profile from DB
  const { data: merchant, isLoading: isLoadingMerchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  // 2. Fetch live coupons from DB to calculate active listings count
  const { data: coupons = [] } = useQuery({
    queryKey: ["merchant-coupons-count"],
    queryFn: async () => {
      const res = await fetch("/api/coupons?merchant=me");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.coupons || (Array.isArray(json.data) ? json.data : []);
    },
  });

  // 3. Fetch live campaigns from DB to calculate campaigns used count
  const { data: campaigns = [] } = useQuery({
    queryKey: ["merchant-campaigns-count"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/merchants/me/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Upgrade payment failed.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons-count"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns-count"] });
      toast.success(
        selectedPlan
          ? `Upgraded to ${selectedPlan.name} successfully!`
          : "Add-on purchased successfully!",
      );
      setCheckoutStep(3);
    },
    onError: (err) => {
      toast.error(err.message || "Payment simulation failed.");
    },
  });

  const plans = useMemo(
    () => [
      {
        id: "starter",
        name: "Starter Free",
        priceMonthly: 0,
        priceYearly: 0,
        desc: "Zero subscription fee to start — ideal for micro businesses testing digital listings.",
        features: [
          "Up to 3 active offer listings",
          "Vouchiqo Verified badge standard",
          "Basic CPM views & claims KPI cards",
          "Campaign Manager (Add-on only)",
          "Expired Coupon Revival (Locked)",
          "72-hour email support SLA",
        ],
      },
      {
        id: "growth",
        name: "Growth Partner",
        priceMonthly: 1499,
        priceYearly: 14990,
        popular: true,
        desc: "Full analytics + campaigns. Know exactly which customers came from Vouchiqo.",
        features: [
          "Up to 15 active offer listings",
          "1 Active Campaign at a time",
          "Standard Analytics & CSV performance exports",
          "Campaign Manager 4-step wizard",
          "Community verification credentials",
          "48-hour priority email support",
        ],
      },
      {
        id: "pro",
        name: "Pro Partner",
        priceMonthly: 3999,
        priceYearly: 39990,
        bestValue: true,
        desc: "Unlimited listings, Expired Offer Revival, push notifications & priority placement.",
        features: [
          "Unlimited active offer listings",
          "4 Simultaneous Active Campaigns",
          "50 Expired Offer Revival credits/month included",
          "Homepage Featured Slot (2 days/month included)",
          "Push Notification (1 send/month included)",
          "Deep Advanced Analytics & Heatmaps",
          "Read-only Webhook API Coupon validation",
          "24-hour priority support SLA",
        ],
      },
      {
        id: "enterprise",
        name: "Enterprise Partner",
        priceMonthly: 9999,
        priceYearly: 99990,
        desc: "Custom multi-location scale with dedicated manager & full R/W API access.",
        features: [
          "Unlimited active offer listings",
          "Unlimited Simultaneous Campaigns",
          "Unlimited Expired Offer Revivals",
          "Unlimited Targeted Push Notifications",
          "Custom Homepage Featured Slot Allocation",
          "Dedicated Account Manager",
          "4-hour dedicated support SLA",
          "Full Read/Write API Integration",
        ],
      },
    ],
    [],
  );

  const addOns = [
    {
      id: "revival_pack",
      name: "Expired Offer Revival Pack",
      price: 499,
      unit: "/ 25 revivals",
      desc: "Add 25 Expired Coupon Revival processing credits to your account.",
    },
    {
      id: "campaign_boost",
      name: "Flash Campaign Boost",
      price: 799,
      unit: "/ campaign",
      desc: "Spotlight placement, ticker priority + dedicated email & push alert per campaign.",
    },
    {
      id: "ticker_featured",
      name: "Homepage Featured Slot",
      price: 999,
      unit: "/ 3 days",
      desc: "Your offer pins first in the Hot Deals ticker and banner slot for 3 consecutive days.",
    },
    {
      id: "push_notification",
      name: "Targeted Push Notification",
      price: 599,
      unit: "/ send",
      desc: "Instant push alert send targeted directly to users interested in your category.",
    },
    {
      id: "festival_package",
      name: "Festival Campaign Package",
      price: 2999,
      unit: "/ event",
      desc: "Full 7-day festival event promotion (pre-teaser banner, email blast & social sharing).",
    },
    {
      id: "analytics_report",
      name: "Performance Analytics Report",
      price: 799,
      unit: "/ report",
      desc: "Deep monthly PDF analytical report with ROI and customer conversion breakdown.",
    },
  ];

  const currentPlanId = merchant?.plan || "starter";
  const planExpiry = merchant?.planExpiry;
  const revivalCredits = merchant?.revivalCredits || 0;

  // Live calculated metrics from DB documents
  const activeListingsCount = useMemo(() => {
    if (coupons.length > 0) {
      return coupons.filter((c) => c.status === "active").length;
    }
    return merchant?.totalCoupons || 0;
  }, [coupons, merchant]);

  const campaignsUsedCount = useMemo(() => {
    return campaigns.length;
  }, [campaigns]);

  const planListingsLimit =
    currentPlanId === "starter" ? 3 : currentPlanId === "growth" ? 15 : 999;
  const planCampaignsLimit =
    currentPlanId === "starter" ? 0 : currentPlanId === "growth" ? 1 : 4;

  // Dynamically generated invoice history based on merchant DB registration date and active plan
  const invoices = useMemo(() => {
    const merchantCreatedAt = merchant?.createdAt
      ? new Date(merchant.createdAt)
      : new Date();
    const now = new Date();
    const diffMonths = Math.max(
      1,
      (now.getFullYear() - merchantCreatedAt.getFullYear()) * 12 +
        (now.getMonth() - merchantCreatedAt.getMonth()) +
        1,
    );

    const planObj = plans.find((p) => p.id === currentPlanId) || plans[0];
    const basePlanPrice =
      billingCycle === "yearly" ? planObj.priceYearly : planObj.priceMonthly;

    return Array.from({ length: Math.min(diffMonths, 12) }).map((_, idx) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - idx);
      const monthStr = d.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
      const invId = `INV-${d.getFullYear()}-${(1000 + idx).toString().slice(-4)}`;
      const baseAmount = currentPlanId === "starter" ? 0 : basePlanPrice;
      const gstAmount = Math.round(baseAmount * 0.18);
      const totalAmount = baseAmount + gstAmount;

      return {
        id: invId,
        date: d.toISOString().split("T")[0],
        period: monthStr,
        plan: planObj.name,
        amount: `₹${totalAmount.toLocaleString("en-IN")}.00`,
        status: "Paid",
        gstInvoice: merchant?.gstin
          ? `GSTIN-${merchant.gstin}-${invId}`
          : `GSTIN-27AABCU9603R1ZM-${invId}`,
      };
    });
  }, [merchant, currentPlanId, billingCycle, plans]);

  if (isLoadingMerchant) {
    return (
      <DashboardLayout title="Billing & Plans" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const handleOpenUpgrade = (plan) => {
    setSelectedPlan(plan);
    setSelectedAddOn(null);
    setCheckoutStep(1);
    setIsCheckoutOpen(true);
  };

  const handleOpenAddOn = (addOn) => {
    setSelectedAddOn(addOn);
    setSelectedPlan(null);
    setCheckoutStep(1);
    setIsCheckoutOpen(true);
  };

  const executePayment = () => {
    setCheckoutStep(2);
    setTimeout(() => {
      if (selectedPlan) {
        upgradeMutation.mutate({
          type: "subscription",
          plan: selectedPlan.id,
          cycle: billingCycle,
          gstin,
          paymentMethod,
        });
      } else if (selectedAddOn) {
        upgradeMutation.mutate({
          type: "addon",
          addOnId: selectedAddOn.id,
          gstin,
          paymentMethod,
        });
      }
    }, 1500);
  };

  const basePrice = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.priceYearly
      : selectedPlan.priceMonthly
    : selectedAddOn?.price || 0;

  const gst = parseFloat((basePrice * 0.18).toFixed(2));
  const totalPrice = basePrice + gst;

  return (
    <DashboardLayout
      title="Subscription & Billing"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-4 text-left font-sans w-full pb-8">
        <div data-tour="billing-plan">
          <CurrentPlanCard
            merchant={merchant}
            currentPlanId={currentPlanId}
            plans={plans}
            billingCycle={billingCycle}
            planExpiry={planExpiry}
            revivalCredits={revivalCredits}
            activeListingsCount={activeListingsCount}
            planListingsLimit={planListingsLimit}
            campaignsUsedCount={campaignsUsedCount}
            planCampaignsLimit={planCampaignsLimit}
            onOpenUpgrade={handleOpenUpgrade}
          />
        </div>

        <PlanComparisonGrid
          plans={plans}
          currentPlanId={currentPlanId}
          billingCycle={billingCycle}
          setBillingCycle={setBillingCycle}
          onOpenUpgrade={handleOpenUpgrade}
        />

        <AddOnsGrid addOns={addOns} onOpenAddOn={handleOpenAddOn} />

        <BillingHistoryTable invoices={invoices} />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          checkoutStep={checkoutStep}
          setCheckoutStep={setCheckoutStep}
          selectedPlan={selectedPlan}
          selectedAddOn={selectedAddOn}
          billingCycle={billingCycle}
          basePrice={basePrice}
          gst={gst}
          totalPrice={totalPrice}
          gstin={gstin}
          setGstin={setGstin}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          executePayment={executePayment}
          isPending={upgradeMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
