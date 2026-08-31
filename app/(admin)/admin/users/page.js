"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  Download,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/shared/data";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAdminUsers,
  useExportSubscribers,
  useToggleUserStatus,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";

// 8 Distinct Colorful Row Palettes (Clearly visible without hover)
const ROW_COLOR_THEMES = [
  {
    row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900",
  },
  {
    row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900",
  },
  {
    row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900",
  },
  {
    row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900",
  },
  {
    row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900",
  },
  {
    row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900",
  },
  {
    row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900",
  },
  {
    row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900",
  },
];

export default function UserManagement() {
  const queryClient = useQueryClient();

  // Socket.IO Real-time listeners for live user updates
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  });

  // ── Filters — Customer Users Only ──────────────────────────────────────
  const [isActive, setIsActive] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [rawSearch, setRawSearch] = useState("");

  const [deleteAuthId, setDeleteAuthId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Defer search so keystrokes don't block the UI
  const search = useDeferredValue(rawSearch);

  // Debounced search ref to prevent re-fetching on every keystroke
  const debounceTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const handleSearchChange = (e) => {
    setRawSearch(e.target.value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => setDebouncedSearch(e.target.value),
      400,
    );
  };

  // Force role = "customer" to restrict Directory strictly to Customer Users
  const filters = {
    role: "customer",
    isActive: activeTab === "active" ? "true" : activeTab === "suspended" ? "false" : isActive,
    search: debouncedSearch,
  };

  const { data: users = [], isFetching, refetch } = useAdminUsers(filters);
  const { mutate: toggleStatus } = useToggleUserStatus();
  const { mutate: exportSubs, isPending: exporting } = useExportSubscribers();

  // Filter based on newsletter if subscriber tab is active
  const filteredUsers = useMemo(() => {
    if (activeTab === "subscribers") {
      return users.filter((u) => u.emailNotifications !== false);
    }
    return users;
  }, [users, activeTab]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const subscribers = users.filter((u) => u.emailNotifications !== false).length;
    const suspended = users.filter((u) => !u.isActive).length;
    return { total, active, subscribers, suspended };
  }, [users]);

  // ── Delete Customer Handler ──────────────────────────────────────────
  const handleDeleteUser = async () => {
    if (!deleteAuthId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?authId=${deleteAuthId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          json.message ||
            "Customer account and all associated records deleted permanently!",
        );
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
        refetch();
      } else {
        toast.error(
          json.error?.message || json.message || "Failed to delete customer user.",
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting customer user.");
    } finally {
      setIsDeleting(false);
      setDeleteAuthId(null);
    }
  };

  // ── Newsletter CSV export ────────────────────────────────────────────
  const handleExport = () => {
    exportSubs(undefined, {
      onSuccess: (subs) => {
        if (!subs?.length) return toast.error("No subscribers to export.");
        const headers = ["Name", "Email", "Date Joined"];
        const rows = subs.map(
          (s) =>
            `"${(s.name || "User").replace(/"/g, '""')}","${s.email || ""}","${
              s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"
            }"`,
        );
        const csv = `\uFEFF${[headers.join(","), ...rows].join("\n")}`;
        const url = URL.createObjectURL(
          new Blob([csv], { type: "text/csv;charset=utf-8;" }),
        );
        const a = Object.assign(document.createElement("a"), {
          href: url,
          download: `vouchiqo_subscribers_${new Date().toISOString().split("T")[0]}.csv`,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Subscriber CSV exported successfully!");
      },
    });
  };

  // ── Colorful Row Background Callback ────────────────────────────────
  const getCustomerRowColor = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  // ── Table columns ────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Customer & Email",
        sortable: true,
        cell: (user) => {
          const initials = (user.name || user.email || "CU")
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-2 py-0.5 min-w-[200px]">
              <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 text-[11.5px] leading-tight truncate">
                  {user.name || "Customer User"}
                </p>
                <p className="text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                  {user.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "role",
        header: "Role",
        cell: () => (
          <span className="px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border border-slate-300/90 shadow-2xs inline-block bg-white/95 text-slate-800">
            CUSTOMER
          </span>
        ),
      },
      {
        key: "activity",
        header: "Savings & Claims",
        cell: (user) => (
          <div className="flex flex-col text-xs py-0.5">
            <span className="font-medium text-emerald-800 text-[11px] leading-tight">
              ₹{user.totalSavings || 0} saved
            </span>
            <span className="text-[9.5px] text-slate-600 font-normal mt-0.5 leading-none">
              {user.couponsSaved || 0} claimed offers
            </span>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Registered",
        sortable: true,
        cell: (user) => (
          <span className="text-slate-600 font-normal text-[10.5px] whitespace-nowrap">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "emailNotifications",
        header: "Newsletter",
        cell: (user) => (
          <span
            className={`px-2 py-0.5 text-[9.5px] font-medium rounded-md border shadow-2xs inline-block ${
              user.emailNotifications !== false
                ? "bg-white/95 text-blue-700 border-blue-200"
                : "bg-white/95 text-slate-500 border-slate-200"
            }`}
          >
            {user.emailNotifications !== false ? "Subscribed" : "Opted-out"}
          </span>
        ),
      },
      {
        key: "isActive",
        header: "Status",
        sortable: true,
        cell: (user) => (
          <span
            className={`px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block ${
              user.isActive
                ? "bg-white/95 text-emerald-700 border-emerald-300"
                : "bg-white/95 text-rose-700 border-rose-300"
            }`}
          >
            {user.isActive ? "Active" : "Suspended"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "right",
        cell: (user) => (
          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
            {/* Suspend / Activate Tooltip Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggleStatus({ authId: user.authId, isActive: user.isActive })
                  }
                  className={`h-6.5 w-6.5 p-0 flex items-center justify-center rounded-md cursor-pointer shadow-2xs transition-colors shrink-0 ${
                    user.isActive
                      ? "border-amber-200 text-amber-700 bg-white hover:bg-amber-50"
                      : "border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50"
                  }`}
                >
                  {user.isActive ? <Ban className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  <span className="sr-only">
                    {user.isActive ? "Suspend User" : "Activate User"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                {user.isActive ? "Suspend User Account" : "Activate User Account"}
              </TooltipContent>
            </Tooltip>

            {/* Delete Tooltip Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => setDeleteAuthId(user.authId || user._id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete User</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                Delete Customer Permanently
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [toggleStatus],
  );

  const isSearchStale = rawSearch !== search;

  return (
    <DashboardLayout
      title="User Management"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Customer User Directory
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Manage registered customer shopper accounts, savings, redemptions, and account access status.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-2xs shrink-0"
              >
                {exporting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Export Newsletter CSV</span>
              </Button>
            </div>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card
              onClick={() => {
                setActiveTab("all");
                setIsActive("");
              }}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "all" && !isActive
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Customers
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.total}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => {
                setActiveTab("active");
                setIsActive("true");
              }}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "active" || isActive === "true"
                  ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Active Shoppers
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.active}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => {
                setActiveTab("subscribers");
                setIsActive("");
              }}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "subscribers"
                  ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Subscribers
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.subscribers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => {
                setActiveTab("suspended");
                setIsActive("false");
              }}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "suspended" || isActive === "false"
                  ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Suspended Accounts
                  </span>
                  <span className="text-base font-medium text-rose-700 mt-0.5 block leading-none">
                    {stats.suspended}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                  <Ban className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Card Container */}
          <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-3">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Search customer name or email…"
                  value={rawSearch}
                  onChange={handleSearchChange}
                  className={`pl-8 text-[11px] h-7.5 rounded-lg border-slate-200 bg-white transition-opacity ${
                    isSearchStale ? "opacity-70" : "opacity-100"
                  }`}
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none self-end sm:self-auto">
                {[
                  {
                    id: "all",
                    label: "All",
                    count: stats.total,
                    description: "View all registered customer accounts",
                  },
                  {
                    id: "active",
                    label: "Active",
                    count: stats.active,
                    description: "Filter to active shoppers with login access",
                  },
                  {
                    id: "subscribers",
                    label: "Subscribers",
                    count: stats.subscribers,
                    description: "Filter to customers subscribed to newsletter & emails",
                  },
                  {
                    id: "suspended",
                    label: "Suspended",
                    count: stats.suspended,
                    description: "Filter to suspended or blocked accounts",
                  },
                ].map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === "all" || tab.id === "subscribers") setIsActive("");
                          else if (tab.id === "active") setIsActive("true");
                          else if (tab.id === "suspended") setIsActive("false");
                        }}
                        className={cn(
                          "text-[10.5px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                          activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800 bg-transparent",
                        )}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={cn(
                            "text-[9px] px-1 rounded-full",
                            activeTab === tab.id
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-200/70 text-slate-600",
                          )}
                        >
                          {tab.count}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                      {tab.description}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full overflow-x-auto">
              <div
                className="transition-opacity duration-200"
                style={{ opacity: isFetching ? 0.55 : 1 }}
              >
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  loading={false}
                  searchable={false}
                  defaultPageSize={15}
                  getRowClassName={getCustomerRowColor}
                  emptyState={
                    debouncedSearch || isActive
                      ? "No customer accounts match your current search."
                      : "No registered customer accounts found."
                  }
                />
              </div>
            </div>
          </Card>

          {/* Confirm Delete Modal */}
          <ConfirmDeleteModal
            open={!!deleteAuthId}
            onOpenChange={(open) => !open && setDeleteAuthId(null)}
            title="Delete Customer Account & All Data"
            description="This action cannot be undone. This will permanently delete the customer account, all claimed coupons, redemptions, and user credentials from the database."
            onConfirm={handleDeleteUser}
            isPending={isDeleting}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
