"use client";

import {
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  Store,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const DEFAULT_RECENT_ACTIVITIES = [
  {
    id: "act_1",
    title: "Zomato Added New Code",
    message: "Get flat 50% OFF using ZOMATO50 on your next order.",
    time: "2 mins ago",
    type: "coupon",
    unread: true,
    href: "/brand/zomato",
  },
  {
    id: "act_2",
    title: "New Partner Store",
    message: "Milton Kitchenware is now a verified partner store.",
    time: "45 mins ago",
    type: "brand",
    unread: true,
    href: "/brand/milton",
  },
  {
    id: "act_3",
    title: "Coupon Expiring Soon",
    message: "Your claimed code SAVENEW15 expires in 2 hours.",
    time: "1 hour ago",
    type: "expiring",
    unread: false,
    href: "/customer/claimed",
  },
  {
    id: "act_4",
    title: "Reward Points Earned!",
    message: "You earned +10 savings points for active engagement.",
    time: "3 hours ago",
    type: "reward",
    unread: false,
    href: "/customer/savings",
  },
  {
    id: "act_5",
    title: "Adidas Exclusive Deal",
    message: "Adidas offers 20% off on winter arrivals with code ADI20.",
    time: "5 hours ago",
    type: "deal",
    unread: false,
    href: "/brand/adidas",
  },
];

export const NotificationBell = () => {
  const [activities, setActivities] = useState(DEFAULT_RECENT_ACTIVITIES);

  // Fetch real notifications from DB API on mount
  useEffect(() => {
    let isCancelled = false;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        const rawList = data?.data?.notifications || data?.notifications || [];
        if (!isCancelled && Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.slice(0, 5).map((n, idx) => ({
            id: n._id || `db_notif_${idx}`,
            title: n.title || "New Update",
            message: n.message || n.content || "Check out latest offers.",
            time: n.createdAt ? `${Math.max(1, Math.floor((Date.now() - new Date(n.createdAt)) / 60000))}m ago` : "Just now",
            type: n.type || "coupon",
            unread: !n.read,
            href: n.link || "/deals",
          }));
          setActivities(formatted);
        }
      } catch (err) {
        // Fallback to default recent activities
      }
    }
    loadNotifications();
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
      case "expiring":
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case "reward":
        return <Award className="w-3.5 h-3.5 text-purple-600" />;
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

        {/* Scrollable Compact 5 Activities List */}
        <ScrollArea className="max-h-72 w-full flex-grow">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center px-4">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center mb-1.5 border border-slate-100">
                <Bell className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs font-normal text-slate-500">
                No recent activity updates.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {activities.slice(0, 5).map((act) => (
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
