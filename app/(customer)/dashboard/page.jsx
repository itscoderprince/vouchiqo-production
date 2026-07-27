"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/feedback/LoadingSpinner";
import { useUser } from "@/hooks/use-user";

export default function DashboardRootRedirect() {
  const router = useRouter();
  const { user, role, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/login?callbackUrl=/merchant/dashboard");
      return;
    }

    const isRegisteredMerchant =
      typeof window !== "undefined" &&
      sessionStorage.getItem("vouchiqo_is_merchant") === "true";

    if (role === "admin") {
      router.replace("/admin/dashboard");
    } else if (role === "merchant" || isRegisteredMerchant) {
      router.replace("/merchant/dashboard");
    } else {
      fetch("/api/merchants/me")
        .then((r) => {
          if (r.ok) {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("vouchiqo_is_merchant", "true");
            }
            router.replace("/merchant/dashboard");
          } else {
            router.replace("/customer/dashboard");
          }
        })
        .catch(() => {
          router.replace("/customer/dashboard");
        });
    }
  }, [user, role, isLoaded, router]);

  return <LoadingSpinner text="Loading dashboard..." center />;
}
