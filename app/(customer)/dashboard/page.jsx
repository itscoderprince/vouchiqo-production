"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/feedback/LoadingSpinner";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { useUser } from "@/hooks/use-user";

export default function DashboardRootRedirect() {
  const router = useRouter();
  const { user, role, isLoaded } = useUser();

  const isRegisteredMerchant =
    typeof window !== "undefined" &&
    sessionStorage.getItem("vouchiqo_is_merchant") === "true";

  const shouldCheckMerchant =
    isLoaded &&
    Boolean(user) &&
    role !== "admin" &&
    role !== "merchant" &&
    !isRegisteredMerchant;

  const {
    data: merchantProfile,
    isFetched: isMerchantFetched,
  } = useMerchantProfile({
    enabled: shouldCheckMerchant,
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/login?callbackUrl=/merchant/dashboard");
      return;
    }

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    if (role === "merchant" || isRegisteredMerchant) {
      router.replace("/merchant/dashboard");
      return;
    }

    if (shouldCheckMerchant && isMerchantFetched) {
      if (merchantProfile) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("vouchiqo_is_merchant", "true");
        }
        router.replace("/merchant/dashboard");
      } else {
        router.replace("/customer/dashboard");
      }
    }
  }, [
    user,
    role,
    isLoaded,
    isRegisteredMerchant,
    shouldCheckMerchant,
    isMerchantFetched,
    merchantProfile,
    router,
  ]);

  return <LoadingSpinner text="Loading dashboard..." center />;
}
