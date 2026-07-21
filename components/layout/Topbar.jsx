"use client";

import { Bell, ChevronDown, LogOut, Search, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import UserDropdown from "./UserDropdown";

export default function Topbar({ title = "Dashboard", user: propUser = null }) {
  const { user: authUser, logout } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Fetch real database claims and redemptions to generate actual notifications
  const fetchRealNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const list = [];

      // 1. Fetch claims
      const claimsRes = await fetch("/api/claims?status=active");
      let activeClaims = [];
      if (claimsRes.ok) {
        const payload = await claimsRes.json();
        activeClaims = payload.data?.claims || [];
        for (const c of activeClaims) {
          const brandName =
            c.couponId?.merchantId?.businessName ||
            c.couponId?.merchantId?.name ||
            "Premium Partner";
          list.push({
            id: `claim-${c._id}`,
            message: `You claimed a ${brandName} offer: "${c.couponId?.title || "Coupon"}"`,
            time: new Date(c.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
            read: false,
            timestamp: new Date(c.createdAt).getTime(),
          });
        }
      }

      // 2. Fetch savings redemptions
      const savingsRes = await fetch("/api/users/savings");
      if (savingsRes.ok) {
        const payload = await savingsRes.json();
        const data = payload.data || {};
        const transactions = data.recentTransactions || [];
        for (const tx of transactions) {
          list.push({
            id: `redeem-${tx.date}-${tx.code}`,
            message: `You saved ₹${tx.amountSaved} by redeeming a ${tx.brand} coupon (Code: ${tx.code})`,
            time: tx.date,
            read: true,
            timestamp: new Date(tx.date).getTime(),
          });
        }

        // Generate milestone unlocked notifications dynamically
        const totalSaved = data.kpis?.totalSavedAllTime || 0;
        if (totalSaved >= 50) {
          list.push({
            id: "milestone-50",
            message: "Unlocked Savings Milestone: First Saving ₹50+! 🎉",
            time: "Recently",
            read: false,
            timestamp: Date.now() - 3600000,
          });
        }
        if (totalSaved >= 500) {
          list.push({
            id: "milestone-500",
            message: "Unlocked Savings Milestone: ₹500 Saved! 🌟",
            time: "Recently",
            read: false,
            timestamp: Date.now() - 7200000,
          });
        }
        if (totalSaved >= 1000) {
          list.push({
            id: "milestone-1000",
            message: "Unlocked Savings Milestone: ₹1,000 Saved! 🏆",
            time: "Recently",
            read: false,
            timestamp: Date.now() - 10800000,
          });
        }
      }

      // Sort notifications by timestamp descending (newest first)
      list.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(list);
    } catch (err) {
      console.error("Error generating real notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && authUser) {
      fetchRealNotifications();
    }
  }, [mounted, authUser]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchVal.trim()) {
      router.push(`/brands?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchVal.trim()) {
      router.push(`/brands?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const user =
    mounted && authUser
      ? {
          name: authUser.name,
          role: authUser.role,
          image: authUser.image,
        }
      : propUser;

  return (
    <header className="h-[60px] bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left section: Sidebar Trigger and title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-brand-text hover:text-brand-blue" />
        <h1 className="text-base font-semibold text-slate-800 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right section: Search input & User actions */}
      <div className="flex items-center gap-4">
        {/* Search, less rounding (rounded-md) */}
        <div className="hidden sm:flex items-center bg-brand-surface border border-brand-border rounded-md px-2.5 py-1.5 w-60 h-8">
          <Search
            className="w-3.5 h-3.5 text-brand-subtext mr-2 cursor-pointer hover:text-brand-blue"
            onClick={handleSearchClick}
          />
          <Input
            type="text"
            placeholder="Quick search dashboard..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="border-0 bg-transparent text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-brand-subtext text-brand-text shadow-none"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-brand-text hover:text-brand-blue p-2 rounded-md hover:bg-brand-surface transition-all cursor-pointer h-8 w-8 border-0 bg-transparent shadow-none"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-gradient rounded-full"></span>
            )}
          </Button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                <div className="flex justify-between items-center px-3.5 pb-2 border-b border-slate-100 dark:border-zinc-850">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[8px] font-bold text-blue-600 hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-[10px] leading-snug border-b border-slate-50 dark:border-zinc-900/60 last:border-0 hover:bg-slate-50/50 transition-colors ${
                          !notif.read
                            ? "bg-blue-50/[0.15] font-semibold text-slate-800 dark:text-zinc-200"
                            : "text-slate-500 font-light"
                        }`}
                      >
                        <p>{notif.message}</p>
                        <span className="block text-[8px] text-slate-400 mt-1">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] text-slate-400 select-none">
                      No active alerts or notifications.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-brand-border"></div>

        {/* Profile Dropdown Container */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
