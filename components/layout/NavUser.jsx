"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

export function NavUser({ user, role = "admin" }) {
  const { state } = useSidebar();
  const { logout } = useUser();
  const isCollapsed = state === "collapsed";

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AS";

  const formattedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  return (
    <div
      className={`flex items-center w-full ${isCollapsed ? "justify-center" : "gap-2"}`}
    >
      {/* Profile Card */}
      <Link
        href="/profile"
        className={`flex items-center transition-colors hover:bg-slate-50 overflow-hidden ${
          isCollapsed
            ? "justify-center p-1 rounded-full"
            : "flex-1 gap-3 rounded-lg px-2 py-2"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-bold text-white shadow-sm">
          {initials}
        </div>
        {!isCollapsed && (
          <div className="flex flex-1 flex-col text-left leading-tight min-w-0">
            <span className="text-sm font-semibold text-slate-800 truncate">
              {user.name || "Aigars S."}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate uppercase tracking-wider">
              {formattedRole}
            </span>
          </div>
        )}
      </Link>

      {/* Direct Logout Button */}
      {!isCollapsed && (
        <button
          type="button"
          onClick={async () => {
            await logout();
          }}
          aria-label="Log out"
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
