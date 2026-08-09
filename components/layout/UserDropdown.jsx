"use client";

import {
  Bookmark,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
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
  const { logout } = useUser();
  const { isProfileIncomplete, openModal } = useMerchantLock();

  if (!user) return null;

  const [effectiveRole, setEffectiveRole] = useState(
    pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/merchant")
        ? "merchant"
        : user.role || "customer",
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
        .then((r) => setEffectiveRole(r.ok ? "merchant" : user?.role || "customer"))
        .catch(() => setEffectiveRole(user?.role || "customer"));
    }
  }, [user?.role, pathname]);

  const handleLogoutAction = async () => {
    if (onMobileClose) onMobileClose();
    await logout();
  };

  const handleMerchantNavClick = (e, url) => {
    if (effectiveRole === "merchant" && isProfileIncomplete) {
      if (!url || !url.startsWith("/merchant/profile")) {
        e.preventDefault();
        e.stopPropagation();
        if (onMobileClose) onMobileClose();
        openModal();
      }
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-brand-blue text-white font-bold text-sm uppercase">
              {user.name ? user.name[0] : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">{user.name}</h4>
            <p className="text-[10px] text-slate-300 capitalize">{user.role}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pl-2 text-left">
          {/* Customer links */}
          {(!effectiveRole || effectiveRole === "customer") && (
            <>
              <Link
                href="/profile?tab=savings"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/profile?tab=saved"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Saved Coupons</span>
              </Link>
              <Link
                href="/profile?tab=wallet"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <Wallet className="w-4 h-4 text-slate-400" />
                <span>My Wallet</span>
              </Link>
              <Link
                href="/profile?tab=nearby"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Nearby Offers</span>
              </Link>
              <Link
                href="/profile?tab=settings"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </Link>
            </>
          )}

          {/* Merchant view */}
          {effectiveRole === "merchant" && (
            <>
              <Link
                href="/merchant/dashboard"
                onClick={(e) => {
                  handleMerchantNavClick(e, "/merchant/dashboard");
                  if (!isProfileIncomplete && onMobileClose) onMobileClose();
                }}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Merchant Dashboard</span>
              </Link>
              <Link
                href="/merchant/profile"
                onClick={(e) => {
                  handleMerchantNavClick(e, "/merchant/profile");
                  if (onMobileClose) onMobileClose();
                }}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/merchant/coupons/new"
                onClick={(e) => {
                  handleMerchantNavClick(e, "/merchant/coupons/new");
                  if (!isProfileIncomplete && onMobileClose) onMobileClose();
                }}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Create Offer</span>
              </Link>
              <Link
                href="/merchant/analytics"
                onClick={(e) => {
                  handleMerchantNavClick(e, "/merchant/analytics");
                  if (!isProfileIncomplete && onMobileClose) onMobileClose();
                }}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span>Analytics</span>
              </Link>
            </>
          )}

          {/* Admin links */}
          {effectiveRole === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Admin Dashboard</span>
              </Link>
              <Link
                href="/admin/approvals/merchants"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Merchant Approvals</span>
              </Link>
              <Link
                href="/admin/users"
                onClick={onMobileClose}
                className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Manage Users</span>
              </Link>
            </>
          )}

          <hr className="border-white/10 my-1" />

          <Link
            href="/"
            onClick={onMobileClose}
            className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Go to Homepage</span>
          </Link>

          <button
            type="button"
            onClick={handleLogoutAction}
            className="flex items-center gap-2 text-sm font-semibold text-brand-error text-left hover:text-red-400 transition-colors border-0 bg-transparent p-0 w-full cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4 text-brand-error" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 focus:outline-none cursor-pointer group select-none"
        >
          <Avatar className="h-8 w-8 border border-brand-border group-hover:border-brand-blue/30 transition-colors shrink-0">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-brand-blue text-white font-bold text-xs uppercase">
              {user.name ? user.name[0] : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-brand-text leading-none group-hover:text-brand-blue transition-colors mb-0.5">
              {user.name}
            </span>
            <span className="text-[9px] text-brand-subtext capitalize font-semibold leading-none">
              {effectiveRole}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-brand-subtext group-hover:text-brand-blue transition-colors ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-brand-bg text-brand-text border-brand-border shadow-xl rounded-xl p-1.5"
      >
        <DropdownMenuLabel className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider px-2.5 py-2">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-brand-border" />

        {/* Customer view */}
        {(!effectiveRole || effectiveRole === "customer") && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=savings"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <LayoutDashboard className="h-4 w-4 text-brand-blue" />
                <span>Savings Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=saved"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <Bookmark className="h-4 w-4 text-brand-blue" />
                <span>Saved Offers</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=wallet"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <Wallet className="h-4 w-4 text-brand-blue" />
                <span>Vouchiqo Wallet</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=nearby"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <MapPin className="h-4 w-4 text-brand-blue" />
                <span>Nearby Offers</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=settings"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <Settings className="h-4 w-4 text-brand-blue" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* Merchant view */}
        {effectiveRole === "merchant" && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/dashboard"
                onClick={(e) => handleMerchantNavClick(e, "/merchant/dashboard")}
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <LayoutDashboard className="h-4 w-4 text-brand-blue" />
                <span>Merchant Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/profile"
                onClick={(e) => handleMerchantNavClick(e, "/merchant/profile")}
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <User className="h-4 w-4 text-brand-blue" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/coupons/new"
                onClick={(e) => handleMerchantNavClick(e, "/merchant/coupons/new")}
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <Tag className="h-4 w-4 text-brand-blue" />
                <span>Create Offer</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/analytics"
                onClick={(e) => handleMerchantNavClick(e, "/merchant/analytics")}
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <TrendingUp className="h-4 w-4 text-brand-blue" />
                <span>Analytics</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}


        {/* Admin view */}
        {user.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <LayoutDashboard className="h-4 w-4 text-brand-blue" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/approvals/merchants"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <ShieldCheck className="h-4 w-4 text-brand-blue" />
                <span>Merchant Approvals</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
              >
                <Users className="h-4 w-4 text-brand-blue" />
                <span>Manage Users</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="bg-brand-border" />
        <DropdownMenuItem asChild>
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer w-full text-xs font-bold text-brand-text hover:text-brand-navy hover:bg-slate-50 rounded-lg px-2.5 py-2"
          >
            <Home className="h-4 w-4 text-brand-subtext" />
            <span>Go to Homepage</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-brand-border" />
        <DropdownMenuItem
          onClick={handleLogoutAction}
          className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-error focus:text-brand-error focus:bg-brand-error/10 rounded-lg px-2.5 py-2"
        >
          <LogOut className="h-4 w-4 text-brand-error" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
