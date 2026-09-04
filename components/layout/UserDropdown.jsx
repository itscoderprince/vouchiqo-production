"use client";

import {
  Bookmark,
  Home,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";

export default function UserDropdown({
  user,
  isMobile = false,
  onMobileClose = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const { user: authUser, logout } = useUser();
  const { isLocked, openModal } = useMerchantLock();

  useEffect(() => {
    const updateSearch = () => {
      if (typeof window !== "undefined") {
        setCurrentSearch(window.location.search);
      }
    };
    updateSearch();
    window.addEventListener("popstate", updateSearch);
    const interval = setInterval(updateSearch, 200);
    return () => {
      window.removeEventListener("popstate", updateSearch);
      clearInterval(interval);
    };
  }, [pathname]);

  if (!user && !authUser) return null;

  const [effectiveRole, setEffectiveRole] = useState(
    pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/merchant")
        ? "merchant"
        : user?.role || authUser?.role || "customer",
  );

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setEffectiveRole("admin");
    } else if (pathname.startsWith("/merchant")) {
      setEffectiveRole("merchant");
    } else if (user?.role === "merchant" || user?.role === "admin") {
      setEffectiveRole(user.role);
    } else {
      fetch("/api/merchants/me")
        .then((r) =>
          setEffectiveRole(
            r.ok ? "merchant" : user?.role || authUser?.role || "customer",
          ),
        )
        .catch(() =>
          setEffectiveRole(user?.role || authUser?.role || "customer"),
        );
    }
  }, [user?.role, authUser?.role, pathname]);

  const handleLogoutAction = async () => {
    if (onMobileClose) onMobileClose();
    await logout();
  };

  const handleMerchantNavClick = (e, url) => {
    if (effectiveRole === "merchant" && isLocked) {
      if (
        !url ||
        (!url.startsWith("/merchant/profile") &&
          !url.startsWith("/merchant/application-status"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (onMobileClose) onMobileClose();
        openModal();
      }
    }
  };

  const isLinkActive = (url) => {
    const [targetPath, targetQuery] = url.split("?");
    const normalizedTarget = targetPath.replace(/\/$/, "");
    const normalizedCurrent = pathname.replace(/\/$/, "");

    if (normalizedCurrent !== normalizedTarget) return false;
    const searchParams = new URLSearchParams(currentSearch);

    if (!targetQuery) {
      return (
        !searchParams.get("tab") || normalizedTarget === "/customer/dashboard"
      );
    }

    const params = new URLSearchParams(targetQuery);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  const currentName = user?.name || authUser?.name || "User";
  const currentEmail = user?.email || authUser?.email || "";
  const currentImage =
    user?.image ||
    authUser?.image ||
    user?.logo ||
    user?.logoUrl ||
    authUser?.logo ||
    authUser?.logoUrl;

  const initials = currentName
    ? currentName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Per-role avatar styles
  const roleAvatarStyle =
    effectiveRole === "admin"
      ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white border-purple-300"
      : effectiveRole === "merchant"
        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-300"
        : "bg-slate-100 text-slate-800 border-slate-200";

  const renderAvatarFallback = () => {
    if (effectiveRole === "admin") {
      return (
        <AvatarFallback className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white stroke-[2.2]" />
        </AvatarFallback>
      );
    }
    if (effectiveRole === "merchant") {
      return (
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
          <Store className="w-4 h-4 text-white stroke-[2]" />
        </AvatarFallback>
      );
    }
    return (
      <AvatarFallback className="bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 uppercase flex items-center justify-center">
        {initials}
      </AvatarFallback>
    );
  };

  const customerLinks = [
    { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
    { title: "Savings Hub", url: "/profile?tab=savings", icon: IndianRupee },
    { title: "Saved Offers", url: "/profile?tab=saved", icon: Bookmark },
    { title: "Cashback Wallet", url: "/profile?tab=wallet", icon: Wallet },
    { title: "Nearby Offers", url: "/profile?tab=nearby", icon: MapPin },
    { title: "Profile Settings", url: "/profile?tab=settings", icon: Settings },
  ];

  if (isMobile) {
    return (
      <div className="space-y-3 font-sans text-left">
        <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <Avatar className="h-9 w-9 rounded-xl border border-slate-200 shrink-0">
            {currentImage ? (
              <AvatarImage src={currentImage} alt={currentName} />
            ) : null}
            {renderAvatarFallback()}
          </Avatar>
          <div className="text-left min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-800 truncate">
              {effectiveRole === "admin" ? "Super Admin" : currentName}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {currentEmail || `${effectiveRole}@vouchiqo.com`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutAction}
          className="flex items-center gap-2 text-xs font-normal text-rose-600 hover:text-rose-700 transition-colors border-0 bg-transparent p-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User menu"
          className="flex items-center justify-center focus:outline-none cursor-pointer select-none rounded-full transition-colors border-0 bg-transparent outline-none"
        >
          <Avatar
            className={`h-8 w-8 rounded-full border-2 shrink-0 shadow-sm transition-all ${
              effectiveRole === "admin"
                ? "border-purple-300 hover:border-purple-400"
                : effectiveRole === "merchant"
                  ? "border-blue-300 hover:border-blue-400"
                  : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {currentImage ? (
              <AvatarImage src={currentImage} alt={currentName} />
            ) : null}
            {renderAvatarFallback()}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-60 bg-white text-slate-800 border border-slate-200/90 shadow-xl rounded-2xl p-1.5 font-sans animate-in fade-in zoom-in-95 duration-100"
      >
        {/* User Card Header */}
        <DropdownMenuLabel className="p-2 font-normal select-none">
          <div className="flex items-center gap-2.5 text-left">
            <Avatar className="h-9 w-9 rounded-xl border border-slate-200 shrink-0">
              {currentImage ? (
                <AvatarImage src={currentImage} alt={currentName} />
              ) : null}
              {renderAvatarFallback()}
            </Avatar>
            <div className="flex flex-col text-left min-w-0 flex-1 leading-tight">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {effectiveRole === "admin" ? "Super Admin" : currentName}
              </span>
              {currentEmail ? (
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentEmail}
                </span>
              ) : null}
              <div className="mt-1">
                {effectiveRole === "admin" ? (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-purple-600" />{" "}
                    SUPER ADMIN
                  </span>
                ) : effectiveRole === "merchant" ? (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Store className="w-2.5 h-2.5 text-blue-600" /> MERCHANT
                    PARTNER
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <User className="w-2.5 h-2.5 text-slate-500" /> MEMBER
                  </span>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Customer view */}
        {(!effectiveRole || effectiveRole === "customer") && (
          <DropdownMenuGroup className="space-y-0.5">
            {customerLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.url);
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
                      active
                        ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-[#F72853]"
                          : "text-slate-400 group-hover:text-[#F72853]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        {/* Merchant view */}
        {effectiveRole === "merchant" && (
          <DropdownMenuGroup className="space-y-0.5">
            {[
              {
                title: "Merchant Dashboard",
                url: "/merchant/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Business Profile",
                url: "/merchant/profile",
                icon: User,
              },
              {
                title: "Post New Listing",
                url: "/merchant/coupons/new",
                icon: Tag,
              },
              {
                title: "Analytics",
                url: "/merchant/analytics",
                icon: TrendingUp,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.url);
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link
                    href={item.url}
                    onClick={(e) => handleMerchantNavClick(e, item.url)}
                    className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
                      active
                        ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-[#F72853]"
                          : "text-slate-400 group-hover:text-[#F72853]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        {/* Admin view */}
        {effectiveRole === "admin" && (
          <DropdownMenuGroup className="space-y-0.5">
            {[
              {
                title: "Admin Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Merchant Approvals",
                url: "/admin/approvals/merchants",
                icon: ShieldCheck,
              },
              {
                title: "Manage Users",
                url: "/admin/users",
                icon: Users,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.url);
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
                      active
                        ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-[#F72853]"
                          : "text-slate-400 group-hover:text-[#F72853]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <DropdownMenuItem asChild>
          <Link
            href="/"
            className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
              pathname === "/"
                ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
            }`}
          >
            <Home className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            <span>Go to Homepage</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <DropdownMenuItem
          onClick={handleLogoutAction}
          className="flex items-center gap-2.5 cursor-pointer text-xs font-normal text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-xl px-2.5 py-1.5 group transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
