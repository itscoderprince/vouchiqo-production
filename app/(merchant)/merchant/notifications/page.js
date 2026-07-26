"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchantNotifications } from "@/hooks/use-merchant-notifications";

function getNotificationIcon(type, category) {
  if (type === "Listing Approved" || type === "coupon_approved" || type === "merchant_approved") {
    return { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  }
  if (type === "Listing Rejected" || type === "coupon_rejected" || type === "merchant_rejected") {
    return { icon: XCircle, color: "text-rose-600 bg-rose-50 border-rose-200" };
  }
  if (type === "Expiring Soon" || type === "coupon_expiring") {
    return { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" };
  }
  if (type === "Billing confirmed" || category === "billing") {
    return { icon: CreditCard, color: "text-purple-600 bg-purple-50 border-purple-200" };
  }
  if (type === "Milestone reached" || type === "coupon_redeemed") {
    return { icon: Trophy, color: "text-amber-500 bg-amber-50 border-amber-200" };
  }
  if (type === "Action Required") {
    return { icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200" };
  }
  if (category === "campaign" || type === "Campaign ended" || type === "campaign_submitted" || type === "campaign_approved") {
    return { icon: Zap, color: "text-orange-600 bg-orange-50 border-orange-200" };
  }
  return { icon: Bell, color: "text-blue-600 bg-blue-50 border-blue-200" };
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function MerchantNotifications() {
  const [activeTab, setActiveTab] = useState("all");

  // Fetch live merchant profile from DB
  const { data: merchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  // Use real-time socket + DB notifications hook
  const {
    notifications: dbNotifications,
    unreadCount,
    isLoading,
    markItemRead,
    markAllRead,
    isConnected,
  } = useMerchantNotifications(merchant?.authId);

  // Normalize DB notification items
  const notifications = useMemo(() => {
    return dbNotifications.map((item) => {
      const { icon, color } = getNotificationIcon(item.type, item.category);
      return {
        id: item._id || item.id,
        title: item.title,
        message: item.message,
        type: item.type || "Notification",
        category: item.category || "system",
        icon,
        iconColor: color,
        time: formatRelativeTime(item.createdAt),
        read: Boolean(item.isRead || item.read),
      };
    });
  }, [dbNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !n.read;
      return n.category === activeTab;
    });
  }, [notifications, activeTab]);

  return (
    <DashboardLayout
      title="Notifications & Alerts"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-4 text-left font-sans w-full max-w-[1100px] mx-auto pb-8">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Merchant Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-blue-600 text-white font-bold text-[9px] rounded-full px-2 py-0.5 border-0">
                    {unreadCount} Unread
                  </Badge>
                )}
                {isConnected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Live Socket
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Real-time WebSocket alerts for approvals, campaigns, reports &amp; billing from live database
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => markAllRead()}
            disabled={unreadCount === 0}
            className="text-xs h-8 font-bold rounded-xl border-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-slate-700 hover:bg-slate-50 shadow-none"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>Mark All as Read</span>
          </Button>
        </div>

        {/* 5 TABS: All, Unread, System, Campaign, Billing */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 flex flex-wrap gap-1 justify-start h-auto w-full sm:w-auto">
            <TabsTrigger
              value="all"
              className="text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer"
            >
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer"
            >
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer"
            >
              System &amp; Verification
            </TabsTrigger>
            <TabsTrigger
              value="campaign"
              className="text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer"
            >
              Campaigns &amp; Reports
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer"
            >
              Billing &amp; Invoices
            </TabsTrigger>
          </TabsList>

          <div className="pt-3">
            <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-10 flex items-center justify-center text-slate-500 text-xs font-medium gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading live notifications from DB...</span>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => markItemRead(item.id)}
                      className={`p-3.5 sm:p-4 flex items-start gap-3 transition-all cursor-pointer hover:bg-blue-50/30 ${
                        !item.read ? "bg-blue-50/40" : "bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl border shrink-0 ${item.iconColor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {item.title}
                            {!item.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                            )}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {item.time}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          {item.message}
                        </p>

                        <div className="pt-0.5 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold border-slate-200 text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md"
                          >
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={Bell}
                    title="No Notifications Found"
                    description="No live notifications exist in this category right now. Real-time Socket.IO alerts and approvals will appear here automatically."
                  />
                </div>
              )}
            </Card>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
