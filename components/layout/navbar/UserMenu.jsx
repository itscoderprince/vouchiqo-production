"use client";

import {
  LayoutDashboard,
  LogOut,
  Store,
  Ticket,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import LocationPromptModal from "@/components/shared/modals/LocationPromptModal";
import { OnboardingModal } from "@/features/auth/components/onboarding-modal";
import { signOut, useSession } from "@/lib/auth-client";

export const UserMenu = () => {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Effective role — starts from session, may be upgraded to "merchant" after DB check
  const [effectiveRole, setEffectiveRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve the effective role: session role is the primary source but may be
  // stale (Better Auth caches cookies for 5 min). If session says "customer",
  // verify against /api/merchants/me to catch newly-registered merchants.
  useEffect(() => {
    if (!mounted || !session?.user) return;

    const sessionRole = session?.user?.role || "customer";

    if (sessionRole === "admin" || sessionRole === "merchant") {
      setEffectiveRole(sessionRole);
      return;
    }

    const isMerchantFlag =
      typeof window !== "undefined" &&
      sessionStorage.getItem("vouchiqo_is_merchant") === "true";

    if (isMerchantFlag) {
      setEffectiveRole("merchant");
    }

    // Session says customer — do a quick DB check in case they just registered
    // as a merchant and the session cookie hasn't refreshed yet
    fetch("/api/merchants/me")
      .then((r) => {
        if (r.ok) {
          setEffectiveRole("merchant");
          if (typeof window !== "undefined") {
            sessionStorage.setItem("vouchiqo_is_merchant", "true");
          }
        } else if (!isMerchantFlag) {
          setEffectiveRole("customer");
        }
      })
      .catch(() => {
        if (!isMerchantFlag) {
          setEffectiveRole("customer");
        }
      });
  }, [mounted, session]);

  // Customer onboarding check — only run for CONFIRMED customers
  // We wait until effectiveRole is fully resolved (not null) to avoid the
  // race condition where merchants briefly see the customer onboarding modal.
  useEffect(() => {
    if (!mounted || !session?.user) return;

    // effectiveRole is null while the async DB check is in flight — wait for it
    if (effectiveRole === null) return;

    // Only show onboarding to confirmed customers
    if (effectiveRole === "admin" || effectiveRole === "merchant") return;

    const storageKey = `vouchiqo_onboarded_${session.user.id}`;

    const checkOnboarding = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const profile = json.data?.profile;
            setUserProfile(profile);

            const hasGender = !!profile?.gender;
            const hasInterests =
              Array.isArray(profile?.interests) &&
              profile.interests.length >= 2;

            if (profile?.isOnboarded && hasGender && hasInterests) {
              localStorage.setItem(storageKey, "true");
            } else {
              setShowOnboarding(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
      }
    };

    checkOnboarding();
  }, [mounted, session, effectiveRole]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async (e) => {
    e.preventDefault();
    setOpen(false);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully!");
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Render a consistent loading skeleton during SSR and initial client hydration
  if (!mounted || isPending) {
    return (
      <div className="h-9 w-20 button-shimmer rounded-lg border border-slate-300/40 shrink-0" />
    );
  }

  // Guest State: Render Sign In Button
  if (!session) {
    return (
      <Link
        href="/login"
        className="h-9 text-[13px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg px-4 flex items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-200 hover:shadow-sm"
      >
        <User className="h-3.5 w-3.5" />
        Login
      </Link>
    );
  }

  // Use effectiveRole (DB-verified) if resolved, fall back to session role
  const role = effectiveRole ?? session.user.role ?? "customer";

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            icon: LayoutDashboard,
            label: "Admin Dashboard",
            href: "/admin/dashboard",
          },
          { icon: Users, label: "Manage Users", href: "/admin/users" },
          {
            icon: Store,
            label: "Manage Merchants",
            href: "/admin/approvals/merchants",
          },
        ];
      case "merchant":
        return [
          {
            icon: LayoutDashboard,
            label: "Merchant Dashboard",
            href: "/merchant/dashboard",
          },
          {
            icon: Store,
            label: "Application Status",
            href: "/merchant/application-status",
          },
          { icon: Ticket, label: "Manage Offers", href: "/merchant/coupons" },
          { icon: User, label: "My Profile", href: "/merchant/profile" },
        ];
      default:
        return [
          { icon: User, label: "My Profile", href: "/profile" },
          { icon: Ticket, label: "My Offers", href: "/customer/claimed" },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Role badge shown in dropdown header
  const roleBadgeLabel =
    role === "admin" ? "Admin" : role === "merchant" ? "Merchant" : "Customer";
  const roleBadgeColor =
    role === "admin"
      ? "bg-purple-100 text-purple-700"
      : role === "merchant"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full transition-all focus:outline-none cursor-pointer flex items-center justify-center p-0.5 border-2 ${
          open
            ? "border-[#2563eb] bg-[#eff6ff]"
            : "border-transparent hover:border-gray-200"
        }`}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {session.user.image ? (
          // biome-ignore lint/performance/noImgElement: user avatar img
          <img
            src={session.user.image}
            alt={session.user.name || "User profile"}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-[#f1f5f9] text-[#475569] font-bold text-[11px] flex items-center justify-center uppercase">
            {getInitials(session.user.name)}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-hidden text-left">
          {/* User Profile Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-[#f8fafc]">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-[12px] font-black text-brand-navy truncate">
                {session.user.name || "Member"}
              </p>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${roleBadgeColor}`}
              >
                {roleBadgeLabel}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold truncate">
              {session.user.email}
            </p>
          </div>

          {/* Menu Items */}
          {menuItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          initialGender={userProfile?.gender || ""}
          initialInterests={userProfile?.interests || []}
          onSaveComplete={() => {
            setShowOnboarding(false);
            if (session?.user?.id) {
              localStorage.setItem(
                `vouchiqo_onboarded_${session.user.id}`,
                "true",
              );
            }
          }}
        />
      )}

      {mounted && <LocationPromptModal />}
    </div>
  );
};

export default UserMenu;
