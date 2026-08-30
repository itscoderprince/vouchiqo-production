"use client";

import {
  Flame,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Store,
  Ticket,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { signOut, useSession } from "@/lib/auth-client";
import { useLenis } from "@/components/shared/SmoothScrollProvider";
import LocationSelector from "../LocationSelector";
import Logo from "./Logo";

const MOBILE_NAV_LINKS = [
  { href: "/brands", icon: Store, label: "Brands" },
  { href: "/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/campaigns", icon: Flame, label: "Trending" },
  { href: "/nearby-offers", icon: MapPin, label: "Nearby Map" },
];

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const lenis = useLenis();

  // Robust background scroll lock and Lenis stop/start when drawer is open
  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }
    return () => {
      lenis?.start();
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    };
  }, [isOpen, lenis]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vouchiqo_is_merchant");
      }
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.replace("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="md:hidden relative">
      {/* Burger Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-700 hover:text-gray-900 transition cursor-pointer bg-transparent border-0"
        aria-label="Open mobile menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop Blur Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Full-Width Mobile Drawer */}
      {isOpen && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 w-full h-full bg-white shadow-2xl z-[60] flex flex-col animate-slide-in-right overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            {/* Logo left */}
            <Logo />
            {/* Close button right */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer bg-transparent border-0"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Location Selector (Fetched and selected inline) */}
          <div className="bg-slate-50/20">
            <LocationSelector
              inDrawer={true}
              onMobileSelect={() => setIsOpen(false)}
            />
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-2 flex flex-col">
            {MOBILE_NAV_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-[14px] font-semibold text-slate-700 hover:bg-[#eff6ff] hover:text-[#2563eb] active:bg-[#dbeafe] transition-all border-b border-slate-100/50"
              >
                <Icon className="h-4.5 w-4.5 stroke-[1.8] text-slate-400 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Sign In / Profile Section */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            {session ? (
              <div className="space-y-3.5">
                {/* Profile menu links for mobile */}
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-200/60">
                  <Link
                    href={
                      session.user.role === "merchant"
                        ? "/merchant/profile"
                        : "/profile"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-semibold text-blue-600 bg-blue-50/50 border border-blue-100/50 rounded-lg hover:bg-blue-100/40 transition-all"
                  >
                    <User className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href={
                      session.user.role === "merchant"
                        ? "/merchant/coupons"
                        : "/customer/claimed"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-semibold text-blue-600 bg-blue-50/50 border border-blue-100/50 rounded-lg hover:bg-blue-100/40 transition-all"
                  >
                    <Ticket className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>My Offers</span>
                  </Link>
                </div>

                <div className="flex items-center gap-3 px-2">
                  {session.user.image ? (
                    // biome-ignore lint/performance/noImgElement: user avatar img
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center uppercase">
                      {session.user.name?.slice(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-1">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 text-[12px] font-bold rounded-lg transition-colors border-0 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-[13px] font-semibold rounded-lg transition-all shadow-sm"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
