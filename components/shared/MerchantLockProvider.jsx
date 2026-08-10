"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { calculateProfileHealth } from "@/app/(merchant)/merchant/dashboard/components/CompleteProfileModal";

const MerchantLockContext = createContext({
  isProfileIncomplete: false,
  isPending: false,
  isRejected: false,
  isApproved: false,
  isLocked: false,
  health: null,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  merchant: null,
});

export function MerchantLockProvider({ children, isMerchant }) {
  const { data: merchant } = useMerchantProfile({ enabled: Boolean(isMerchant) });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const health = isMerchant && merchant ? calculateProfileHealth(merchant) : null;
  const isProfileIncomplete =
    isMerchant && Boolean(merchant) && Boolean(health) && health.percentage < 100;
  const isPending = isMerchant && Boolean(merchant) && merchant.status === "pending";
  const isRejected = isMerchant && Boolean(merchant) && merchant.status === "rejected";
  const isApproved = isMerchant && Boolean(merchant) && merchant.status === "approved";
  const isPaused = isMerchant && Boolean(merchant) && merchant.subscriptionStatus === "paused";
  const isSubscriptionCancelled = isMerchant && Boolean(merchant) && merchant.subscriptionStatus === "cancelled";
  const isLocked = isMerchant && Boolean(merchant) && (isProfileIncomplete || !isApproved || isPaused || isSubscriptionCancelled);

  useEffect(() => {
    if (!isMerchant || !merchant) return;

    if (isLocked) {
      if (!hasInitialized) {
        const isExcludedPage =
          typeof window !== "undefined" &&
          (window.location.pathname.startsWith("/merchant/profile") ||
            window.location.pathname.startsWith("/merchant/application-status"));
        if (!isExcludedPage) {
          setIsModalOpen(true);
        }
        setHasInitialized(true);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [isMerchant, merchant, isLocked, hasInitialized]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <MerchantLockContext.Provider
      value={{
        isProfileIncomplete,
        isPending,
        isRejected,
        isApproved,
        isPaused,
        isSubscriptionCancelled,
        isLocked,
        health,
        isModalOpen,
        openModal,
        closeModal,
        merchant,
      }}
    >
      {children}
    </MerchantLockContext.Provider>
  );
}

export function useMerchantLock() {
  return useContext(MerchantLockContext);
}
