"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data?.plans || json?.plans || null;
    },
  });

  const plans = useMemo(() => {
    if (Array.isArray(plansData) && plansData.length > 0) {
      return plansData
        .filter((p) => p.active !== false)
        .map((p) => {
          const numPrice =
            typeof p.priceMonthly === "number"
              ? p.priceMonthly
              : Number(p.priceText?.replace(/[^0-9]/g, "")) || 0;
          const numYearly =
            typeof p.priceYearly === "number" ? p.priceYearly : numPrice * 10;
          return {
            id: p.id,
            name: p.name,
            badge: p.badge || "",
            priceMonthly: numPrice,
            priceYearly: numYearly,
            priceText:
              p.priceText ||
              (numPrice === 0 ? "₹0" : `₹${numPrice.toLocaleString("en-IN")}`),
            originalPrice: p.originalPrice || "",
            priceSuffix: p.priceSuffix || "/ month",
            buttonText: p.buttonText || "Select Plan",
            footerNote: p.footerNote || "",
            theme: p.theme || "blue",
            popular:
              p.badge?.toLowerCase().includes("popular") || p.theme === "amber",
            bestValue:
              p.badge?.toLowerCase().includes("best") || p.theme === "indigo",
            desc: p.subCaption || p.desc || "",
            features: p.features || [],
          };
        });
    }

    return [];
  }, [plansData]);

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

  // 5. Fetch live payment history from /api/payments
  const { data: paymentHistoryData, refetch: refetchPaymentHistory } = useQuery(
    {
      queryKey: ["merchant-payment-history"],
      queryFn: async () => {
        const res = await fetch("/api/payments");
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
      },
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  );

  // Live real-time invoice history fetched directly from MongoDB via /api/payments
  const invoices = useMemo(() => {
    if (
      !paymentHistoryData?.payments ||
      paymentHistoryData.payments.length === 0
    ) {
      return [];
    }

    return paymentHistoryData.payments.map((p, idx) => {
      const d = new Date(p.createdAt || p.paidAt || Date.now());
      const monthStr = d.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
      const invId = p.gatewayOrderId
        ? `INV-${p.gatewayOrderId.slice(-8).toUpperCase()}`
        : `INV-${1000 + idx}`;
      const totalRupees = Math.round(p.amount / 100);
      const baseRupees = Math.round(totalRupees / 1.18);
      const gstRupees = totalRupees - baseRupees;

      const invoiceGstin = p.metadata?.gstin || merchant?.gstin;
      const gstInvoiceCode = invoiceGstin
        ? `GSTIN-${invoiceGstin}-${invId}`
        : "N/A (B2C Receipt)";

      return {
        id: invId,
        date: d.toISOString().split("T")[0],
        period: monthStr,
        plan: p.description || p.type || "Growth Partner Plan",
        basePrice: `₹${baseRupees.toLocaleString("en-IN")}.00`,
        gstBreakdown: `₹${gstRupees.toLocaleString("en-IN")}.00 (18% GST)`,
        amount: `₹${totalRupees.toLocaleString("en-IN")}.00`,
        status: p.status === "CAPTURED" ? "Paid" : p.status,
        gstInvoice: gstInvoiceCode,
      };
    });
  }, [merchant, paymentHistoryData]);

  const handleOpenUpgrade = (plan) => {
    setSelectedPlan(plan);
    setSelectedAddOn(null);
    setIsCheckoutOpen(true);
  };

  const handleOpenAddOn = (addOn) => {
    setSelectedAddOn(addOn);
    setSelectedPlan(null);
    setIsCheckoutOpen(true);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !plans || plans.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get("autoPay") === "true" ||
      urlParams.get("payNow") === "true"
    ) {
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
    toast.loading("Creating secure Razorpay order...", { id: "rzp-direct" });

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Razorpay SDK script failed to load. Please check your internet connection.",
        );
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
          gstin: gstin?.trim()?.toUpperCase() || "",
        }),
      });

      const orderJson = await res.json();
      toast.dismiss("rzp-direct");

      if (!res.ok || !orderJson.data?.orderId) {
        throw new Error(
          orderJson.message || "Failed to create Razorpay Order ID.",
        );
      }

      const { orderId, amount, currency, keyId } = orderJson.data;

      // Close modal before launching native Razorpay popup
      setIsCheckoutOpen(false);

      // 2. Open official Razorpay Native Popup window
      const options = {
        key: keyId || "rzp_live_TITo8u45hFpoaE",
        amount: amount || totalPrice * 100,
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
          toast.loading("Verifying Razorpay transaction...", {
            id: "rzp-verify",
          });
          try {
            const verifyRes = await fetch("/api/payments/verify-signature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderId,
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
              throw new Error(
                verifyJson.message || "Payment verification failed.",
              );
            }

            queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
            queryClient.invalidateQueries({
              queryKey: ["merchant-coupons-count"],
            });
            queryClient.invalidateQueries({
              queryKey: ["merchant-campaigns-count"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["merchant-payment-history"],
            });
            await refetchPaymentHistory();

            toast.success(
              verifyJson.message ||
                "Payment verified! Plan activated successfully.",
              {
                id: "rzp-verify",
                duration: 5000,
              },
            );
          } catch (err) {
            toast.error(err.message || "Payment verification failed.", {
              id: "rzp-verify",
            });
          } finally {
            setIsRazorpayLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsRazorpayLoading(false);
            toast.error("Razorpay payment cancelled.");
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

  const handleSimulateDevPayment = async () => {
    const planObj = selectedPlan;
    const addOnObj = selectedAddOn;

    setIsRazorpayLoading(true);
    toast.loading("Processing instant dev test payment...", { id: "dev-pay" });

    try {
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          plan: planObj?.id,
          cycle: billingCycle,
          type: planObj ? "subscription" : "addon",
          addOnId: addOnObj?.id,
          gstin: gstin?.trim()?.toUpperCase() || "",
        }),
      });

      const orderJson = await createRes.json();
      if (!createRes.ok || !orderJson.data?.orderId) {
        throw new Error(orderJson.message || "Failed to create order");
      }

      const orderId = orderJson.data.orderId;
      const paymentId = `pay_simulated_${Date.now()}`;

      const verifyRes = await fetch("/api/payments/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: "",
          plan: planObj?.id,
          cycle: billingCycle,
          type: planObj ? "subscription" : "addon",
          addOnId: addOnObj?.id,
        }),
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(
          verifyJson.message || "Failed to verify simulated payment.",
        );
      }

      toast.dismiss("dev-pay");
      toast.success(
        verifyJson.message || "Payment verified! Plan activated successfully.",
        { duration: 5000 },
      );
      setIsCheckoutOpen(false);

      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons-count"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns-count"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-payment-history"] });
    } catch (err) {
      toast.dismiss("dev-pay");
      toast.error(err.message || "Dev payment failed.");
    } finally {
      setIsRazorpayLoading(false);
    }
  };

  const basePrice = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.priceYearly
      : selectedPlan.priceMonthly
    : selectedAddOn?.price || 0;

  const gst = parseFloat((basePrice * 0.18).toFixed(2));
  const totalPrice = Math.round(basePrice + gst);

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
            isPaymentCompleted={
              merchant?.paymentStatus === "completed" ||
              merchant?.subscriptionStatus === "active" ||
              (merchant?.planExpiry &&
                new Date(merchant.planExpiry).getTime() > Date.now())
            }
            isLoading={isLoadingPlans || !plansData}
          />

          <AddOnsGrid addOns={addOns} onOpenAddOn={handleOpenAddOn} />

          <BillingHistoryTable invoices={invoices} />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            selectedPlan={selectedPlan}
            selectedAddOn={selectedAddOn}
            billingCycle={billingCycle}
            basePrice={basePrice}
            gst={gst}
            totalPrice={totalPrice}
            gstin={gstin}
            setGstin={setGstin}
            onPayWithRazorpay={() =>
              triggerRazorpayDirect(selectedPlan, selectedAddOn)
            }
            onSimulatePayment={handleSimulateDevPayment}
            isPending={isRazorpayLoading}
          />
        </div>
      </DashboardLayout>
    );
  }
