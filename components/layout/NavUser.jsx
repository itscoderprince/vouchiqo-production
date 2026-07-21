"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

export function NavUser({ user, role = "admin" }) {
  const { state } = useSidebar();
  const { logout } = useUser();
  const isCollapsed = state === "collapsed";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "V";

  const formattedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  return (
    <div className="flex items-center w-full justify-between gap-2">
      <SidebarMenuButton
        asChild
        size="lg"
        className="flex-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <Link href="/profile" className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold overflow-hidden">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User Avatar"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initials
            )}
          </div>
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
              <span className="truncate font-semibold text-sidebar-foreground">
                {user?.name || "User"}
              </span>
              <span className="truncate text-[10px] text-sidebar-foreground/60 uppercase font-medium">
                {formattedRole}
              </span>
            </div>
          )}
        </Link>
      </SidebarMenuButton>

      {!isCollapsed && (
        <button
          type="button"
          onClick={async () => {
            await logout();
          }}
          aria-label="Log out"
          title="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors border-0 bg-transparent cursor-pointer shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
