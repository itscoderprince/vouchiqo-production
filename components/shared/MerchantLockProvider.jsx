"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { calculateProfileHealth } from "@/app/(merchant)/merchant/dashboard/components/CompleteProfileModal";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { qk } from "@/lib/query-keys";

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
  const queryClient = useQueryClient();

  // Real-time: When admin approves/rejects the merchant, immediately refresh the profile
  // so the lock state updates without waiting for the stale time to expire.
  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, (data) => {
    if (data?.status) {
      queryClient.invalidateQueries({ queryKey: qk.merchant.profile() });
      queryClient.invalidateQueries({ queryKey: qk.merchant.applicationStatus() });
    }
  });

  const health = isMerchant && merchant ? calculateProfileHealth(merchant) : null;

  const isPending = isMerchant && Boolean(merchant) && merchant.status === "pending";
  const isRejected = isMerchant && Boolean(merchant) && merchant.status === "rejected";
  const isApproved = isMerchant && Boolean(merchant) && merchant.status === "approved";
  const isPaused = isMerchant && Boolean(merchant) && merchant.subscriptionStatus === "paused";
  const isSubscriptionCancelled = isMerchant && Boolean(merchant) && merchant.subscriptionStatus === "cancelled";

  // Profile is only "incomplete" (from a blocking perspective) if the merchant is NOT yet approved.
  // Once admin approves a merchant, they should never be blocked by profile completion again --
  // admin approval is the canonical gate. Approved merchants can always access their dashboard.
  const isProfileIncomplete =
    isMerchant &&
    Boolean(merchant) &&
    Boolean(health) &&
    !isApproved &&
    !health.isCoreComplete &&
    health.percentage < 100;

  // Approved merchants are only locked if subscription is paused/cancelled.
  // Pending/rejected merchants are always locked until approval.
  const isLocked =
    isMerchant &&
    Boolean(merchant) &&
    (isProfileIncomplete || !isApproved || isPaused || isSubscriptionCancelled);

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
      // Merchant is now unlocked (e.g. just got approved or completed profile) -- close modal.
      setIsModalOpen(false);
      setHasInitialized(false); // Reset so next state change can re-evaluate correctly
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