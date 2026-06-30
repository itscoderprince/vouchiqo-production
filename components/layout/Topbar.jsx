"use client";

import { Bell, ChevronDown, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

export default function Topbar({ title = "Dashboard", user: propUser = null }) {
  const { user: authUser } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user =
    mounted && authUser
      ? {
          name: authUser.name,
          role: authUser.role,
        }
      : propUser;
  return (
    <header className="h-[72px] bg-brand-bg border-b border-brand-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      {/* Left section: Sidebar Trigger and title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-brand-text hover:text-brand-blue" />
        <h1 className="text-lg font-bold font-heading text-brand-navy tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right section: Search input & User actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 w-60">
          <Search className="w-4 h-4 text-brand-subtext mr-2" />
          <Input
            type="text"
            placeholder="Quick search dashboard..."
            className="border-0 bg-transparent text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-brand-subtext text-brand-text shadow-none"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-brand-text hover:text-brand-blue p-2 rounded-full hover:bg-brand-surface transition-all cursor-pointer h-9 w-9 border-0 bg-transparent shadow-none"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gradient rounded-full"></span>
        </Button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-brand-border"></div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
            {user?.name ? user.name[0] : <User className="w-4 h-4" />}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-brand-text group-hover:text-brand-blue transition-colors">
              {user?.name || "Premium User"}
            </span>
            <span className="text-[10px] text-brand-subtext uppercase font-semibold">
              {user?.role || "Customer"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-brand-subtext group-hover:text-brand-text transition-colors" />
        </div>
      </div>
    </header>
  );
}
