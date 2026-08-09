"use client";

import {
  Ban,
  Download,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/shared/data";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import {
  useAdminUsers,
  useExportSubscribers,
  useToggleUserStatus,
} from "@/hooks/use-admin";

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
  const [rawSearch, setRawSearch] = useState("");

  const [deleteAuthId, setDeleteAuthId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Defer the search so keystrokes don't block the UI
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
    isActive,
    search: debouncedSearch,
  };

  const { data: users = [], isFetching, refetch } = useAdminUsers(filters);
  const { mutate: toggleStatus } = useToggleUserStatus();
  const { mutate: exportSubs, isPending: exporting } = useExportSubscribers();

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
            "Customer account and all associated records deleted permanently in depth!",
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

  // ── Colorful Row Background Separator Callback ──────────────────────
  const getCustomerRowColor = (row, index) => {
    const rowStyles = [
      "bg-blue-100/70 hover:bg-blue-100/90 border-l-4 border-l-blue-600 border-b border-blue-200/90 transition-all text-slate-900",
      "bg-emerald-100/70 hover:bg-emerald-100/90 border-l-4 border-l-emerald-600 border-b border-emerald-200/90 transition-all text-slate-900",
      "bg-amber-100/70 hover:bg-amber-100/90 border-l-4 border-l-amber-600 border-b border-amber-200/90 transition-all text-slate-900",
      "bg-purple-100/70 hover:bg-purple-100/90 border-l-4 border-l-purple-600 border-b border-purple-200/90 transition-all text-slate-900",
      "bg-indigo-100/70 hover:bg-indigo-100/90 border-l-4 border-l-indigo-600 border-b border-indigo-200/90 transition-all text-slate-900",
      "bg-rose-100/70 hover:bg-rose-100/90 border-l-4 border-l-rose-600 border-b border-rose-200/90 transition-all text-slate-900",
    ];
    return rowStyles[index % rowStyles.length];
  };

  // ── Table columns ────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Customer & Email",
        sortable: true,
        cell: (user) => (
          <div className="flex items-center gap-2.5 py-0.5">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs overflow-hidden border border-blue-200 shrink-0">
              {(user.name?.[0] || user.email?.[0] || "C").toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-slate-900 text-xs block leading-snug">
                {user.name || "Customer User"}
              </span>
              <span className="text-[11px] text-slate-600 font-normal">
                {user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        cell: () => (
          <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block bg-blue-50 text-blue-700 border-blue-200">
            CUSTOMER
          </span>
        ),
      },
      {
        key: "activity",
        header: "Savings & Claims",
        cell: (user) => (
          <div className="flex flex-col text-xs py-0.5">
            <span className="font-medium text-emerald-800 text-[11px]">
              ₹{user.totalSavings || 0} saved
            </span>
            <span className="text-[10px] text-slate-600 font-normal">
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
          <span className="text-slate-600 font-normal text-xs">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
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
            className={`px-2 py-0.5 text-[10px] font-medium rounded-md border shadow-2xs inline-block ${
              user.emailNotifications !== false
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
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
            className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block ${
              user.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
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
          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toggleStatus({ authId: user.authId, isActive: user.isActive })
              }
              className={`h-7 px-2.5 text-[11px] font-medium flex items-center gap-1 justify-center cursor-pointer rounded-lg shadow-2xs border ${
                user.isActive
                  ? "border-amber-300 text-amber-700 bg-white hover:bg-amber-50"
                  : "border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50"
              }`}
            >
              {user.isActive
                ? <Ban className="w-3 h-3" />
                : <UserCheck className="w-3 h-3" />}
              {user.isActive ? "Suspend" : "Activate"}
            </Button>

            <Button
              size="sm"
              variant="destructive"
              title="Delete Customer Account & Data"
              className="h-7 w-7 p-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-lg cursor-pointer shadow-2xs shrink-0"
              onClick={() => setDeleteAuthId(user.authId || user._id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
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
      <div className="space-y-3 font-sans w-full pb-12 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Customer User Directory
              </h1>
              <LiveIndicator label="Real-time Customer Directory" />
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
              Manage registered customer shopper accounts, savings, redemptions, and account access status.
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="self-start sm:self-auto gap-1.5 h-7 px-2.5 text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-2xs shrink-0"
          >
            {exporting
              ? <RefreshCw className="w-3 h-3 animate-spin" />
              : <Download className="w-3 h-3" />}
            <span>Export Newsletter CSV</span>
          </Button>
        </div>

        {/* ── Single-row filter toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search customer name or email…"
              value={rawSearch}
              onChange={handleSearchChange}
              className={`pl-8 text-[11px] h-7 rounded-lg border-slate-200 bg-white transition-opacity ${isSearchStale ? "opacity-70" : "opacity-100"}`}
            />
          </div>

          {/* Active status */}
          <Select
            value={isActive || "all"}
            onValueChange={(v) => setIsActive(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[130px] h-7 text-[11px] rounded-lg border-slate-200 bg-white font-medium shrink-0">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Active Only</SelectItem>
              <SelectItem value="false">Suspended Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Fetching spinner */}
          {isFetching && (
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
          )}
        </div>

        {/* Table Container — Full width edge-to-edge */}
        <div className="w-full overflow-x-auto">
          <div
            className="transition-opacity duration-200"
            style={{ opacity: isFetching ? 0.55 : 1 }}
          >
            <DataTable
              columns={columns}
              data={users}
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
    </DashboardLayout>
  );
}
