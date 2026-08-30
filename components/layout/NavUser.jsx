"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Zap,
} from "lucide-react";
import Link from "next/link";
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

export function NavUser({ user, role = "admin" }) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { logout } = useUser();
  const isCollapsed = state === "collapsed";
  const isMerchant = role === "merchant";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "VK";

  const profileLink = isMerchant
    ? "/merchant/profile"
    : role === "admin"
      ? "/admin/dashboard"
      : "/profile";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu className="font-sans">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full cursor-pointer transition-colors text-slate-800 hover:bg-slate-50 data-[state=open]:bg-slate-100/80 border border-slate-200/80 rounded-xl p-2 bg-slate-50/50 shadow-2xs"
            >
              <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-slate-200">
                <AvatarImage
                  src={user?.image || user?.avatar}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="rounded-lg font-medium text-xs bg-rose-50 text-[#F72853]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                    <span className="truncate font-medium text-sm text-slate-800">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-[11px] text-slate-400 font-normal">
                      {user?.email || "user@vouchiqo.com"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[240px] min-w-56 rounded-xl p-1.5 shadow-xl font-sans"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-xs">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage
                    src={user?.image || user?.avatar}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="rounded-lg font-medium text-xs bg-rose-50 text-[#F72853]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                  <span className="truncate font-medium text-slate-800">
                    {user?.name || "User"}
                  </span>
                  <span className="truncate text-[11px] text-slate-400 font-normal">
                    {user?.email || "user@vouchiqo.com"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            {isMerchant && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/merchant/billing"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 text-xs font-normal text-[#F72853] hover:text-[#df1c44] cursor-pointer"
                    >
                      <Zap className="h-4 w-4 text-[#F72853]" />
                      Upgrade Plan
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={profileLink}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-xs font-normal text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <BadgeCheck className="h-4 w-4 text-slate-400" />
                  Account Profile
                </Link>
              </DropdownMenuItem>
              {isMerchant && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/merchant/billing"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 text-xs font-normal text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      Billing &amp; Subscriptions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/merchant/notifications"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 text-xs font-normal text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Bell className="h-4 w-4 text-slate-400" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (isMobile) setOpenMobile(false);
                await logout();
              }}
              className="flex items-center gap-2 text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer font-normal"
            >
              <LogOut className="h-4 w-4 text-rose-600" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
