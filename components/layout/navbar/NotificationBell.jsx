"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Zomato Added New Code",
    message: "Get flat 50% OFF using ZOMATO50 on your next order.",
    time: "2 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Coupon Expiring",
    message: "Your claimed code SAVENEW15 expires in 2 hours.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Points Earned!",
    message: "Congratulations! You earned 10 points for your submission.",
    time: "4 hours ago",
    unread: false,
  },
  {
    id: 4,
    title: "Air India Deal Live",
    message: "The new Air India flight coupon is now approved and live.",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 5,
    title: "New Exclusive Adidas Code",
    message: "Adidas offers 20% off on winter arrivals with code ADI20.",
    time: "2 days ago",
    unread: false,
  },
];

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-1 text-gray-700 hover:text-brand-blue hover:bg-[#eff6ff] rounded-full transition-colors cursor-pointer bg-transparent border-0 outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-[22px] w-[22px]" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white text-[10px] font-bold h-[18px] w-[18px] flex items-center justify-center rounded-full border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 md:w-96 rounded-2xl bg-white p-0 border border-slate-100 shadow-xl z-50 mr-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-[#f8fafc] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-brand-navy">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eff6ff] text-brand-blue rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={markAllRead}
                type="button"
                className="text-[11px] font-semibold text-brand-blue hover:underline cursor-pointer flex items-center gap-1 border-0 bg-transparent"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read All
              </button>
              <button
                onClick={clearAll}
                type="button"
                className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-1 border-0 bg-transparent"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Notifications List */}
        <ScrollArea className="h-72 w-full">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-[13px] font-semibold text-slate-700">
                All caught up!
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No new notifications at this time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 flex flex-col gap-1 text-left transition-colors cursor-pointer select-none ${
                    notif.unread
                      ? "bg-[#eff6ff]/35 hover:bg-[#eff6ff]/60"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[13px] font-bold text-brand-navy">
                      {notif.title}
                    </span>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-[12px] text-slate-600 leading-snug">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
