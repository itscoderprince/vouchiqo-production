"use client";

import {
  Bell,
  CheckCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
  const [clearedIds, setClearedIds] = useState([]);
  const [readIds, setReadIds] = useState([]);

  // Load saved read/cleared notification state from localStorage
  useEffect(() => {
    try {
      const savedRead = JSON.parse(
        localStorage.getItem("vq_read_notifs") || "[]",
      );
      const savedCleared = JSON.parse(
        localStorage.getItem("vq_cleared_notifs") || "[]",
      );
      setReadIds(Array.isArray(savedRead) ? savedRead : []);
      setClearedIds(Array.isArray(savedCleared) ? savedCleared : []);
    } catch (_) {}
  }, []);

  // Fetch 100% REAL database activities (Coupons, Merchants, Notifications)
  useEffect(() => {
    let isCancelled = false;

    async function fetchRealActivities() {
      try {
        setLoading(true);
        const [resCoupons, resMerchants, resNotifs] = await Promise.all([
          fetch("/api/coupons?limit=8").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/merchants?limit=8").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/notifications").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (isCancelled) return;

        const dbCoupons =
          resCoupons?.data?.coupons || resCoupons?.coupons || [];
        const dbMerchants =
          resMerchants?.data?.merchants || resMerchants?.merchants || [];
        const dbNotifs =
          resNotifs?.data?.notifications || resNotifs?.notifications || [];

        const realList = [];

        // 1. Map real DB notifications if any
        if (Array.isArray(dbNotifs)) {
          dbNotifs.forEach((n) => {
            const id = `notif_${n._id}`;
            realList.push({
              id,
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
            const id = `coupon_${c._id}`;
            const brandName = c.merchantId?.businessName || "Partner Brand";
            const codeText = c.code ? `Code: ${c.code}` : "Special Offer";
            realList.push({
              id,
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
            const id = `merchant_${m._id}`;
            realList.push({
              id,
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

        // Sort strictly newest first (descending timestamp) and take top 6
        realList.sort((a, b) => b.createdAt - a.createdAt);

        // Deduplicate by ID
        const uniqueList = Array.from(
          new Map(realList.map((item) => [item.id, item])).values(),
        ).slice(0, 6);

        setActivities(uniqueList);
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

  // Filter out cleared notifications and apply read status
  const visibleActivities = activities
    .filter((act) => !clearedIds.includes(act.id))
    .map((act) => ({
      ...act,
      unread: act.unread && !readIds.includes(act.id),
    }));

  const unreadCount = visibleActivities.filter((n) => n.unread).length;

  const markAllRead = () => {
    const allIds = visibleActivities.map((a) => a.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(newReadIds);
    try {
      localStorage.setItem("vq_read_notifs", JSON.stringify(newReadIds));
    } catch (_) {}
    toast.success("All marked as read");
  };

  const clearAll = () => {
    const allIds = visibleActivities.map((a) => a.id);
    const newClearedIds = Array.from(new Set([...clearedIds, ...allIds]));
    setClearedIds(newClearedIds);
    try {
      localStorage.setItem("vq_cleared_notifs", JSON.stringify(newClearedIds));
    } catch (_) {}
    toast.success("Notifications cleared");
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      setReadIds(newReadIds);
      try {
        localStorage.setItem("vq_read_notifs", JSON.stringify(newReadIds));
      } catch (_) {}
    }
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

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[285px] sm:w-[300px] rounded-xl bg-white p-0 border border-slate-200 shadow-2xl z-[600] flex flex-col overflow-hidden text-left font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] font-semibold text-slate-800">
              Recent Activities
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[8.5px] font-bold bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                {unreadCount} New
              </span>
            )}
          </div>
          <span className="text-[9.5px] text-slate-400 font-medium">
            {visibleActivities.length} Latest
          </span>
        </div>

        {/* Scrollable Activities List with Compact Height */}
        <ScrollArea className="max-h-[250px] w-full overflow-y-auto">
          {loading ? (
            <div className="p-5 text-center text-[11px] font-normal text-slate-400">
              Loading recent activities...
            </div>
          ) : visibleActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-1.5 border border-slate-100">
                <Bell className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <p className="text-[11px] font-medium text-slate-600">
                No new notifications
              </p>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                You're all caught up with latest deals!
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {visibleActivities.map((act) => (
                <Link
                  key={act.id}
                  href={act.href || "#"}
                  onClick={() => markAsRead(act.id)}
                  className={`px-2.5 py-2 flex items-start gap-2.5 transition-colors cursor-pointer group ${
                    act.unread
                      ? "bg-blue-50/40 hover:bg-blue-50/70"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Activity Type Icon */}
                  <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-300 transition-colors mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {act.title}
                      </span>
                      {act.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 font-normal leading-snug line-clamp-2">
                      {act.message}
                    </p>
                    <div className="text-[9px] text-slate-400 font-normal pt-0.2">
                      {act.time}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Solid Visible Sticky Footer Actions */}
        {visibleActivities.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-100 bg-slate-50/90 shrink-0 z-10">
            <button
              onClick={clearAll}
              type="button"
              className="text-[10px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/60 px-1.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 border-0 bg-transparent"
              title="Clear all notifications"
            >
              <Trash2 className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
              <span>Clear</span>
            </button>

            <button
              onClick={markAllRead}
              type="button"
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 border-0 bg-transparent"
              title="Mark all as read"
            >
              <CheckCheck className="w-3 h-3 text-blue-600" />
              <span>Read All</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
