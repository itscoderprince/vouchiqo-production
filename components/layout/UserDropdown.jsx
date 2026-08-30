"use client";

import {
  Bookmark,
  ChevronDown,
  Home,
  IndianRupee,
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
  const { logout } = useUser();
  const { isLocked, openModal } = useMerchantLock();

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
        .then((r) =>
          setEffectiveRole(r.ok ? "merchant" : user?.role || "customer"),
        )
        .catch(() => setEffectiveRole(user?.role || "customer"));
    }
  }, [user?.role, pathname]);

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  if (isMobile) {
    return (
      <div className="space-y-3 font-sans text-left">
        <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <Avatar className="h-9 w-9 rounded-xl border border-slate-200 shrink-0">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-rose-50 text-[#F72853] font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-left min-w-0 flex-1">
            <h4 className="text-xs font-medium text-slate-800 truncate">
              {user.name}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {user.email || `${effectiveRole}@vouchiqo.com`}
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
          className="flex items-center gap-1.5 focus:outline-none cursor-pointer group select-none p-0.5 rounded-xl hover:bg-slate-50 transition-colors border-0 bg-transparent"
        >
          <Avatar className="h-8 w-8 rounded-full border border-slate-200 group-hover:border-rose-200 transition-colors shrink-0 shadow-2xs">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-rose-50 text-[#F72853] font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
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
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-rose-50 text-[#F72853] font-medium text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left min-w-0 flex-1 leading-tight">
              <span className="text-xs font-medium text-slate-900 truncate">
                {user.name || "Aditya Kumar"}
              </span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                {user.email || "user@vouchiqo.com"}
              </span>
              <div className="mt-1">
                <span className="bg-rose-50 text-[#F72853] border border-rose-200/70 text-[8px] font-medium px-1.5 py-0.2 rounded-full inline-block">
                  {effectiveRole.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Customer view */}
        {(!effectiveRole || effectiveRole === "customer") && (
          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=savings"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <IndianRupee className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Savings Hub</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=saved"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <Bookmark className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Saved Offers</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=wallet"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <Wallet className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Cashback Wallet</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=nearby"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Nearby Offers</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile?tab=settings"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {/* Merchant view */}
        {effectiveRole === "merchant" && (
          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/dashboard"
                onClick={(e) =>
                  handleMerchantNavClick(e, "/merchant/dashboard")
                }
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Merchant Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/profile"
                onClick={(e) => handleMerchantNavClick(e, "/merchant/profile")}
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Business Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/coupons/new"
                onClick={(e) =>
                  handleMerchantNavClick(e, "/merchant/coupons/new")
                }
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <Tag className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Post New Listing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/analytics"
                onClick={(e) =>
                  handleMerchantNavClick(e, "/merchant/analytics")
                }
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <TrendingUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Analytics</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {/* Admin view */}
        {effectiveRole === "admin" && (
          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem asChild>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/approvals/merchants"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Merchant Approvals</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/users"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-700 hover:text-slate-900 hover:bg-rose-50/50 rounded-xl px-2.5 py-1.5 group transition-colors"
              >
                <Users className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F72853] transition-colors shrink-0" />
                <span>Manage Users</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <DropdownMenuItem asChild>
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-normal text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-2.5 py-1.5 group transition-colors"
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
