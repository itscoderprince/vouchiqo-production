"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { calculateProfileHealth } from "@/app/(merchant)/merchant/dashboard/components/CompleteProfileModal";

const MerchantLockContext = createContext({
  isProfileIncomplete: false,
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
  const isProfileIncomplete = isMerchant && Boolean(merchant) && Boolean(health) && health.percentage < 100;

  useEffect(() => {
    if (!isMerchant || !merchant) return;

    if (isProfileIncomplete) {
      if (!hasInitialized) {
        setIsModalOpen(true);
        setHasInitialized(true);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [isMerchant, merchant, isProfileIncomplete, hasInitialized]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <MerchantLockContext.Provider
      value={{
        isProfileIncomplete,
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
