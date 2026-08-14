"use client";

import {
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  Store,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationBell = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch 100% REAL database activities (Coupons, Merchants, Notifications)
  useEffect(() => {
    let isCancelled = false;

    async function fetchRealActivities() {
      try {
        setLoading(true);
        const [resCoupons, resMerchants, resNotifs] = await Promise.all([
          fetch("/api/coupons?limit=5").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/merchants?limit=5").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/notifications").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (isCancelled) return;

        const dbCoupons = resCoupons?.data?.coupons || resCoupons?.coupons || [];
        const dbMerchants = resMerchants?.data?.merchants || resMerchants?.merchants || [];
        const dbNotifs = resNotifs?.data?.notifications || resNotifs?.notifications || [];

        const realList = [];

        // 1. Map real DB notifications if any
        if (Array.isArray(dbNotifs)) {
          dbNotifs.forEach((n) => {
            realList.push({
              id: `notif_${n._id}`,
              title: n.title || "Notification Update",
              message: n.message || n.content || "Check out latest offers.",
              time: formatRelativeTime(n.createdAt),
              createdAt: new Date(n.createdAt || Date.now()).getTime(),
              type: "notification",
              unread: !n.read,
              href: n.link || "/deals",
            });
          });
        }

        // 2. Map real DB coupons added recently
        if (Array.isArray(dbCoupons)) {
          dbCoupons.forEach((c) => {
            const brandName = c.merchantId?.businessName || "Partner Brand";
            const codeText = c.code ? `Code: ${c.code}` : "Special Offer";
            realList.push({
              id: `coupon_${c._id}`,
              title: `${brandName} Added New Code`,
              message: `${c.title || "Exclusive Offer"}. ${codeText}`,
              time: formatRelativeTime(c.createdAt),
              createdAt: new Date(c.createdAt || Date.now()).getTime(),
              type: "coupon",
              unread: true,
              href: `/deals/${c._id}`,
            });
          });
        }

        // 3. Map real DB merchants joined recently
        if (Array.isArray(dbMerchants)) {
          dbMerchants.forEach((m) => {
            realList.push({
              id: `merchant_${m._id}`,
              title: "New Partner Store",
              message: `${m.businessName} is now live on Vouchiqo!`,
              time: formatRelativeTime(m.createdAt),
              createdAt: new Date(m.createdAt || Date.now()).getTime(),
              type: "brand",
              unread: false,
              href: `/brand/${m.slug}`,
            });
          });
        }

        // Sort combined list by newest first and take top 5
        realList.sort((a, b) => b.createdAt - a.createdAt);
        const top5Real = realList.slice(0, 5);

        setActivities(top5Real);
      } catch (err) {
        console.error("Error fetching real activity notifications:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchRealActivities();

    return () => {
      isCancelled = true;
    };
  }, []);

  const unreadCount = activities.filter((n) => n.unread).length;

  const markAllRead = () => {
    setActivities((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setActivities([]);
  };

  const markAsRead = (id) => {
    setActivities((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "coupon":
        return <Tag className="w-3.5 h-3.5 text-blue-600" />;
      case "brand":
        return <Store className="w-3.5 h-3.5 text-emerald-600" />;
      case "notification":
        return <Bell className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-full transition-colors cursor-pointer bg-transparent border-0 outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-[22px] w-[22px]" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white text-[9.5px] font-bold h-[17px] w-[17px] flex items-center justify-center rounded-full border-2 border-white shadow-2xs">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] rounded-xl bg-white p-0 border border-slate-200 shadow-2xl z-50 mr-4 flex flex-col overflow-hidden text-left font-sans">
        {/* Simple Non-Bold Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Recent Activities
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[9px] font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                {unreadCount} New
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-normal">Top 5</span>
        </div>

        {/* Scrollable Compact 5 Real Activities List */}
        <ScrollArea className="max-h-72 w-full flex-grow">
          {loading ? (
            <div className="p-6 text-center text-xs font-normal text-slate-400">
              Loading recent activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center px-4">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center mb-1.5 border border-slate-100">
                <Bell className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs font-normal text-slate-500">
                No recent activity updates yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {activities.map((act) => (
                <Link
                  key={act.id}
                  href={act.href || "#"}
                  onClick={() => markAsRead(act.id)}
                  className={`p-3 flex items-start gap-3 transition-colors cursor-pointer group ${
                    act.unread
                      ? "bg-blue-50/30 hover:bg-blue-50/60"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Activity Type Icon */}
                  <div className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-300 transition-colors mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {act.title}
                      </span>
                      {act.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-tight line-clamp-2">
                      {act.message}
                    </p>
                    <div className="text-[9.5px] text-slate-400 font-normal pt-0.5">
                      {act.time}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        {activities.length > 0 && (
          <div className="flex items-center justify-end gap-3 px-3.5 py-2 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <button
              onClick={markAllRead}
              type="button"
              className="text-[10.5px] font-normal text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 border-0 bg-transparent py-0.5"
              title="Mark all as read"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Read All</span>
            </button>
            <button
              onClick={clearAll}
              type="button"
              className="text-[10.5px] font-normal text-slate-400 hover:text-red-500 cursor-pointer flex items-center gap-1 border-0 bg-transparent py-0.5"
              title="Clear all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
