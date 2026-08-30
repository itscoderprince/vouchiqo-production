"use client";

import { Bell, BellOff, ChevronDown, LogOut, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRealtime } from "@/hooks/use-realtime";
import { useUser } from "@/hooks/use-user";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import UserDropdown from "./UserDropdown";

export default function Topbar({ title = "Dashboard", user: propUser = null }) {
  const { user: authUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // Push notification toggle inside the notification dropdown
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    requestPermission: enablePush,
    unsubscribe: disablePush,
  } = usePushNotifications({ userId: authUser?.id });

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Fetch real database notifications
  const fetchRealNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        const raw = json.data?.notifications || (Array.isArray(json.data) ? json.data : []);
        const formatted = raw.map((item) => ({
          id: item._id || item.id,
          message: item.message || item.title,
          time: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recently",
          read: Boolean(item.isRead || item.read),
          timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
        }));
        formatted.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Error fetching notifications for topbar:", err);
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

  // Real-time Socket.IO Listeners for Topbar Bell Badge Updates
  useRealtime(SOCKET_EVENTS.NOTIFICATION_NEW, () => {
    fetchRealNotifications();
  });

  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    fetchRealNotifications();
  });

  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, () => {
    fetchRealNotifications();
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    fetchRealNotifications();
  });

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

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayRole = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/merchant")
      ? "merchant"
      : authUser?.role || propUser?.role || "customer";

  const user =
    mounted && authUser
      ? {
          name: authUser.name,
          role: displayRole,
          image: authUser.image,
        }
      : propUser
        ? {
            ...propUser,
            role: displayRole,
          }
        : {
            name: "Merchant",
            role: displayRole,
          };

  return (
    <header className="h-14 sm:h-[60px] bg-white border-b border-slate-200 shadow-xs flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40 font-sans">
      {/* Left section: Sidebar Trigger (Hamburger) and title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <SidebarTrigger className="text-slate-700 hover:text-[#F72853]" />
        <h1 className="text-[13.5px] sm:text-base font-medium text-slate-800 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right section: Search input & User actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-60 h-8">
          <Search
            className="w-3.5 h-3.5 text-slate-400 mr-2 cursor-pointer hover:text-[#F72853]"
            onClick={handleSearchClick}
          />
          <Input
            type="text"
            placeholder="Quick search dashboard..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="border-0 bg-transparent text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-slate-400 text-slate-800 shadow-none"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-slate-600 hover:text-[#F72853] p-1.5 rounded-lg hover:bg-rose-50/60 transition-all cursor-pointer h-8 w-8 border-0 bg-transparent shadow-none"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F72853] rounded-full animate-pulse"></span>
            )}
          </Button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                <div className="flex justify-between items-center px-3.5 pb-2 border-b border-slate-100 dark:border-zinc-850">
                  <span className="text-[10px] font-medium text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[9px] font-normal text-[#F72853] hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {/* Push notification toggle */}
                  {pushSupported && (
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        {pushSubscribed ? (
                          <Bell className="w-2.5 h-2.5 text-blue-600" />
                        ) : (
                          <BellOff className="w-2.5 h-2.5" />
                        )}
                        Push alerts
                      </span>
                      {pushPermission === "denied" ? (
                        <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Blocked in browser
                        </span>
                      ) : pushSubscribed ? (
                        <button
                          type="button"
                          onClick={disablePush}
                          disabled={pushLoading}
                          className="text-[9px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {pushLoading ? "..." : "Active · Turn off"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={enablePush}
                          disabled={pushLoading}
                          className="text-[9px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {pushLoading ? "..." : "Enable"}
                        </button>
                      )}
                    </div>
                  )}

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
