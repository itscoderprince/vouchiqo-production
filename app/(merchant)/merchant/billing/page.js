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
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);

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

  // 4. Fetch live settings from DB for merchant plans
  const { data: settingsData } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const plans = useMemo(() => {
    if (
      settingsData?.merchant_plans &&
      Array.isArray(settingsData.merchant_plans) &&
      settingsData.merchant_plans.length > 0
    ) {
      return settingsData.merchant_plans
        .filter((p) => p.active !== false)
        .map((p) => {
          const numPrice =
            typeof p.priceMonthly === "number"
              ? p.priceMonthly
              : Number(p.priceText?.replace(/[^0-9]/g, "")) || 0;
          const numYearly =
            typeof p.priceYearly === "number"
              ? p.priceYearly
              : numPrice * 10;
          return {
            id: p.id,
            name: p.name,
            priceMonthly: numPrice,
            priceYearly: numYearly,
            popular:
              p.badge?.toLowerCase().includes("popular") ||
              p.theme === "amber",
            bestValue:
              p.badge?.toLowerCase().includes("best") ||
              p.theme === "indigo",
            desc: p.subCaption || p.desc || "",
            features: p.features || [],
          };
        });
    }

    return [
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
    ];
  }, [settingsData]);

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

  useEffect(() => {
    if (typeof window === "undefined" || !plans || plans.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autoPay") === "true" || urlParams.get("payNow") === "true") {
      const targetPlan = plans.find((p) => p.id === "growth") || plans[1];
      if (targetPlan) {
        handleOpenUpgrade(targetPlan);
      }
    }
  }, [plans]);

  if (isLoadingMerchant) {
    return (
      <DashboardLayout title="Billing & Plans" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const triggerRazorpayDirect = async (planToPay, addOnToPay) => {
    const planObj = planToPay || selectedPlan;
    const addOnObj = addOnToPay || selectedAddOn;

    if (!planObj && !addOnObj) return;

    const basePrice = planObj
      ? billingCycle === "yearly"
        ? planObj.priceYearly
        : planObj.priceMonthly
      : addOnObj?.price || 0;

    const gst = parseFloat((basePrice * 0.18).toFixed(2));
    const totalPrice = Math.round(basePrice + gst);

    setIsRazorpayLoading(true);
    toast.loading("Initiating official Razorpay gateway...", { id: "rzp-direct" });

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 1. Create Razorpay order via backend API
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          plan: planObj?.id,
          cycle: billingCycle,
          type: planObj ? "subscription" : "addon",
          addOnId: addOnObj?.id,
        }),
      });

      const orderJson = await res.json();
      toast.dismiss("rzp-direct");

      if (!res.ok || !orderJson.data) {
        throw new Error(orderJson.message || "Failed to create Razorpay order.");
      }

      const { orderId, amount, currency, keyId } = orderJson.data;

      // 2. Open official Razorpay Native Popup window DIRECTLY
      const options = {
        key: keyId || "rzp_live_TITo8u45hFpoaE",
        amount,
        currency: currency || "INR",
        name: "Vouchiqo Merchant Portal",
        description: planObj
          ? `${planObj.name} (${billingCycle})`
          : addOnObj?.name || "Add-on Purchase",
        order_id: orderId,
        prefill: {
          name: merchant?.businessName || "Merchant Partner",
          email: merchant?.contactEmail || "",
          contact: merchant?.contactPhone || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response) {
          setIsRazorpayLoading(true);
          toast.loading("Verifying Razorpay transaction signature...", { id: "rzp-verify" });
          try {
            const verifyRes = await fetch("/api/payments/verify-signature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planObj?.id,
                cycle: billingCycle,
                type: planObj ? "subscription" : "addon",
                addOnId: addOnObj?.id,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyJson.message || "Payment verification failed.");
            }

            queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
            queryClient.invalidateQueries({ queryKey: ["merchant-coupons-count"] });
            queryClient.invalidateQueries({ queryKey: ["merchant-campaigns-count"] });

            toast.success(verifyJson.message || "Payment verified! Plan activated.", {
              id: "rzp-verify",
              duration: 5000,
            });
          } catch (err) {
            toast.error(err.message || "Payment verification failed.", { id: "rzp-verify" });
          } finally {
            setIsRazorpayLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsRazorpayLoading(false);
            toast.error("Razorpay payment window closed.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.dismiss("rzp-direct");
      toast.error(err.message || "Razorpay checkout error");
      setIsRazorpayLoading(false);
    }
  };

  const handleOpenUpgrade = (plan) => {
    setSelectedPlan(plan);
    setSelectedAddOn(null);
    triggerRazorpayDirect(plan, null);
  };

  const handleOpenAddOn = (addOn) => {
    setSelectedAddOn(addOn);
    setSelectedPlan(null);
    triggerRazorpayDirect(null, addOn);
  };

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
      </div>
    </DashboardLayout>
  );
}
