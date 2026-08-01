"use client";

import { AlertTriangle, ArrowRight, Lock, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CompleteProfileModal from "@/app/(merchant)/merchant/dashboard/components/CompleteProfileModal";
import PaymentPendingModal from "@/app/(merchant)/merchant/dashboard/components/PaymentPendingModal";
import { AppSidebar } from "@/components/layout/AppSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Topbar from "@/components/layout/Topbar";
import MerchantTour from "@/components/merchant/tour/MerchantTour";
import {
  MerchantLockProvider,
  useMerchantLock,
} from "@/components/shared/MerchantLockProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";

function MerchantLockModalRenderer() {
  const pathname = usePathname();
  const { isModalOpen, closeModal, merchant } = useMerchantLock();

  if (pathname.startsWith("/merchant/profile")) {
    return null;
  }

  return (
    <>
      <CompleteProfileModal
        merchant={merchant}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      <PaymentPendingModal merchant={merchant} />
    </>
  );
}

function MerchantPageLockOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { isProfileIncomplete, health, openModal } = useMerchantLock();

  if (!isProfileIncomplete || pathname.startsWith("/merchant/profile")) {
    return null;
  }

  return (
    <div
      onClick={openModal}
      className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all animate-in fade-in duration-300 select-none overflow-hidden"
    >
      <div className="max-w-md w-full bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700 shadow-xs">
          <Lock className="w-8 h-8 text-slate-700" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Dashboard Content Locked
            </h3>
            <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">
              {health?.percentage || 0}% Complete
            </Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Your store profile is currently incomplete. Complete all 15 required details to unlock your listings, analytics, and partner controls.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={(e) => {
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              if (typeof window !== "undefined") {
                if (window.location.pathname === "/merchant/profile") {
                  window.location.href = "/merchant/profile?edit=true";
                } else {
                  router.push("/merchant/profile?edit=true");
                }
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-11 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>Complete Profile Now</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ title, user, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoaded, isLoggedIn, user: authUser } = useUser();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Verify admin access — no DB check needed, admin role is always explicit
    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        router.push("/");
      }
      return;
    }

    // Verify merchant access with stale-session tolerance.
    // Better Auth caches the session cookie, so a newly registered merchant
    // may still have role:"customer" in client session briefly.
    // We check sessionStorage & /api/merchants/me before any redirect.
    if (pathname.startsWith("/merchant")) {
      const isRegisteredMerchant =
        typeof window !== "undefined" &&
        sessionStorage.getItem("vouchiqo_is_merchant") === "true";

      if (role === "merchant" || role === "admin" || isRegisteredMerchant) return;

      // Session says "customer" — verify against DB before redirecting
      if (authUser?.id || authUser?.email) {
        fetch("/api/merchants/me")
          .then((r) => {
            if (r.ok) {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("vouchiqo_is_merchant", "true");
              }
            } else if (!isRegisteredMerchant) {
              router.push("/customer/dashboard");
            }
          })
          .catch(() => {
            // Network error — be permissive, don't redirect
          });
      } else if (!isRegisteredMerchant) {
        router.push("/customer/dashboard");
      }
    }
  }, [isLoaded, isLoggedIn, role, authUser?.id, authUser?.email, pathname, router]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600" />
      </div>
    );
  }

  const isMerchant = pathname.startsWith("/merchant");

  return (
    <MerchantLockProvider isMerchant={isMerchant}>
      <TooltipProvider>
        <SidebarProvider style={{ "--sidebar-width": "250px" }}>
          <div className="min-h-screen flex bg-white text-slate-900 font-sans w-full pb-14 md:pb-0">
            <AppSidebar />
            <SidebarInset className="bg-white flex-1 flex flex-col min-w-0 font-sans">
              <Topbar title={title} user={user} />

              {/* Plan Expiry / Notice Alert Banner for Merchants (Hidden when already on billing page) */}
              {isMerchant && !pathname?.startsWith("/merchant/billing") && showBanner && (
                <div className="bg-blue-50/80 border-b border-blue-200/60 px-4 py-2.5 flex items-center justify-between text-xs font-normal text-blue-900 font-sans">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
                    <span>
                      <strong>Founding Merchant Program Active:</strong> Your
                      14-day free trial on Growth Partner plan is active.{" "}
                      <strong>11 days remaining</strong> — Rate lock guaranteed
                      for 6 months.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      onClick={() => router.push("/merchant/billing")}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-[10px] font-medium cursor-pointer px-2.5 py-0.5 shadow-xs"
                    >
                      Manage Subscription
                    </Badge>
                    <button
                      type="button"
                      onClick={() => setShowBanner(false)}
                      className="text-blue-700 hover:text-blue-900 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <main className="p-4 space-y-6 w-full grow bg-white relative">
                {isMerchant && <MerchantPageLockOverlay />}
                {children}
              </main>
            </SidebarInset>
          </div>

          {/* Interactive Guided Tour for Merchants */}
          {isMerchant && <MerchantTour />}

          {/* Mobile Bottom Tab Bar (5 Tabs) */}
          <MobileBottomNav />

          {/* Global Controlled Merchant Complete Profile Modal */}
          {isMerchant && <MerchantLockModalRenderer />}
        </SidebarProvider>
      </TooltipProvider>
    </MerchantLockProvider>
  );
}


