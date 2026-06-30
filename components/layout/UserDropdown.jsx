"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

export default function UserDropdown({
  user,
  isMobile = false,
  onMobileClose = null,
}) {
  const router = useRouter();

  if (!user) return null;

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
          <div>
            <h4 className="text-sm font-bold text-white">{user.name}</h4>
            <p className="text-[10px] text-slate-300 capitalize">{user.role}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 pl-2 text-left">
          <Link
            href={`/${user.role}/dashboard`}
            onClick={onMobileClose}
            className="text-sm font-medium hover:text-slate-300 transition-colors"
          >
            Dashboard
          </Link>
          {user.role === "merchant" && (
            <>
              <Link
                href="/merchant/coupons/new"
                onClick={onMobileClose}
                className="text-sm font-medium hover:text-slate-300 transition-colors"
              >
                Create Coupon
              </Link>
              <Link
                href="/merchant/analytics"
                onClick={onMobileClose}
                className="text-sm font-medium hover:text-slate-300 transition-colors"
              >
                Analytics
              </Link>
            </>
          )}
          {user.role === "admin" && (
            <>
              <Link
                href="/admin/approvals/merchants"
                onClick={onMobileClose}
                className="text-sm font-medium hover:text-slate-300 transition-colors"
              >
                Merchant Approvals
              </Link>
              <Link
                href="/admin/users"
                onClick={onMobileClose}
                className="text-sm font-medium hover:text-slate-300 transition-colors"
              >
                Manage Users
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={async () => {
              if (onMobileClose) onMobileClose();
              await signOut();
              router.push("/");
            }}
            className="text-sm font-semibold text-brand-error text-left hover:text-red-400 transition-colors border-0 bg-transparent p-0 w-full cursor-pointer"
          >
            Sign Out
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
          className="flex items-center gap-2 focus:outline-none cursor-pointer group"
        >
          <Avatar className="h-8 w-8 border border-brand-border group-hover:border-brand-blue/30 transition-colors">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-brand-blue text-white font-bold text-xs uppercase">
              {user.name ? user.name[0] : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-brand-text leading-none group-hover:text-brand-blue transition-colors">
              {user.name}
            </span>
            <span className="text-[10px] text-brand-subtext capitalize leading-none mt-1">
              {user.role}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-brand-subtext group-hover:text-brand-blue transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-brand-bg text-brand-text border-brand-border"
      >
        <DropdownMenuLabel className="font-semibold text-brand-navy">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/${user.role}/dashboard`}
            className="flex items-center gap-2 cursor-pointer w-full text-brand-text hover:text-brand-navy"
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        {user.role === "merchant" && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/coupons/new"
                className="flex items-center gap-2 cursor-pointer w-full text-brand-text hover:text-brand-navy"
              >
                Create Coupon
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/merchant/analytics"
                className="flex items-center gap-2 cursor-pointer w-full text-brand-text hover:text-brand-navy"
              >
                Analytics
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {user.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/approvals/merchants"
                className="flex items-center gap-2 cursor-pointer w-full text-brand-text hover:text-brand-navy"
              >
                Merchant Approvals
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 cursor-pointer w-full text-brand-text hover:text-brand-navy"
              >
                Manage Users
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="text-brand-error focus:text-brand-error focus:bg-brand-error/10 cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
