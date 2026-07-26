"use client";

import {
  Ban,
  Building2,
  Download,
  RefreshCw,
  Search,
  UserCheck,
} from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable, StatusBadge } from "@/components/shared/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const MERCHANT_STATUS_COLORS = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-700",
};

export default function UserManagement() {
  const queryClient = useQueryClient();

  // Socket.IO Real-time listeners for live user updates
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  });
  // ── Filters ──────────────────────────────────────────────
  const [role, setRole] = useState("");
  const [merchantStatus, setMerchantStatus] = useState("");
  const [isActive, setIsActive] = useState("");
  const [rawSearch, setRawSearch] = useState("");

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

  // Reset merchantStatus when role switches away from "merchant"
  const handleRoleChange = (val) => {
    setRole(val === "all" ? "" : val);
    if (val !== "merchant") setMerchantStatus("");
  };

  // ── Data (TanStack Query) ─────────────────────────────────
  const filters = {
    role,
    isActive,
    merchantStatus: role === "merchant" ? merchantStatus : "",
    search: debouncedSearch,
  };

  const { data: users = [], isFetching } = useAdminUsers(filters);
  const { mutate: toggleStatus } = useToggleUserStatus();
  const { mutate: exportSubs, isPending: exporting } = useExportSubscribers();

  // ── Newsletter CSV export ────────────────────────────────
  const handleExport = () => {
    exportSubs(undefined, {
      onSuccess: (subs) => {
        if (!subs?.length) return alert("No subscribers to export.");
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
          download: `vouchiqo_newsletter_${new Date().toISOString().split("T")[0]}.csv`,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
    });
  };

  // ── Table columns ────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "User & Business",
        sortable: true,
        cell: (user) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
              {user.name}
              {user.businessName && (
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-bold py-0 px-1.5 border">
                  <Building2 className="w-2.5 h-2.5 mr-0.5" />
                  {user.businessName}
                </Badge>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {user.email}
            </span>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        cell: (user) => (
          <Badge
            className={`text-[9px] font-bold py-0.5 px-2 uppercase tracking-wider border-0 shadow-none ${
              user.role === "merchant"
                ? "bg-purple-100 text-purple-800"
                : user.role === "admin"
                  ? "bg-slate-900 text-white"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {user.role}
          </Badge>
        ),
      },
      {
        key: "activity",
        header: "Merchant / Activity",
        cell: (user) => {
          if (user.role === "merchant") {
            return (
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="font-semibold text-slate-800">
                  {user.businessName || "Merchant Partner"}
                </span>
                <StatusBadge status={user.merchantStatus || "no_profile"} size="sm" />
                {user.merchantPlan && (
                  <span className="text-[9px] text-slate-400 capitalize">
                    Plan: {user.merchantPlan}
                  </span>
                )}
              </div>
            );
          }
          return (
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-emerald-700">
                ₹{user.totalSavings || 0} saved
              </span>
              <span className="text-[10px] text-slate-400">
                {user.couponsSaved || 0} claimed offers
              </span>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        header: "Registered",
        sortable: true,
        cell: (user) => (
          <span className="text-slate-500 font-medium text-xs">
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
        cell: (user) =>
          user.role === "customer"
            ? <Badge
                className={`rounded-md font-bold text-[9px] px-1.5 py-0.5 border ${
                  user.emailNotifications !== false
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                {user.emailNotifications !== false ? "Subscribed" : "Opted-out"}
              </Badge>
            : <span className="text-slate-400">—</span>,
      },
      {
        key: "isActive",
        header: "Status",
        sortable: true,
        cell: (user) => (
          <Badge
            className={`rounded-full text-[9px] font-bold py-0.5 px-2 border-0 shadow-none ${
              user.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {user.isActive ? "Active" : "Suspended"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "right",
        cell: (user) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleStatus({ authId: user.authId, isActive: user.isActive })
            }
            className={`text-xs py-1 px-3 font-bold flex items-center gap-1.5 justify-center ml-auto h-7 cursor-pointer rounded-xl ${
              user.isActive
                ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {user.isActive
              ? <Ban className="w-3.5 h-3.5" />
              : <UserCheck className="w-3.5 h-3.5" />}
            {user.isActive ? "Suspend" : "Activate"}
          </Button>
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
      <div className="space-y-4 text-left font-sans w-full pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Platform User Profiles &amp; Merchant Accounts
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Manage user roles, merchant accounts, savings, and access status
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 flex items-center gap-1.5 font-bold rounded-xl cursor-pointer border-0 shadow-md shadow-blue-500/20 transition-all"
          >
            {exporting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
            Export Newsletter CSV
          </Button>
        </div>

        {/* ── Single-row filter toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search name, email or business…"
              value={rawSearch}
              onChange={handleSearchChange}
              className={`pl-8 text-xs h-9 rounded-xl border-slate-200 bg-white transition-opacity ${isSearchStale ? "opacity-70" : "opacity-100"}`}
            />
          </div>

          {/* Role filter */}
          <Select value={role || "all"} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl border-slate-200 bg-white font-semibold shrink-0">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="merchant">Merchants</SelectItem>
            </SelectContent>
          </Select>

          {/* Merchant status — only visible when role = merchant */}
          {role === "merchant" && (
            <Select
              value={merchantStatus || "all"}
              onValueChange={(v) => setMerchantStatus(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl border-slate-200 bg-white font-semibold shrink-0">
                <SelectValue placeholder="All Merchants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Merchants</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Active status */}
          <Select
            value={isActive || "all"}
            onValueChange={(v) => setIsActive(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl border-slate-200 bg-white font-semibold shrink-0">
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
            <RefreshCw className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
          )}
        </div>

        {/* Table — content transitions smoothly; table structure never unmounts */}
        <Card className="border-slate-200/80 shadow-2xs rounded-2xl bg-white overflow-hidden text-left p-4">
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
              emptyState={
                debouncedSearch || role || merchantStatus || isActive
                  ? "No users match your current filters."
                  : "No user or merchant profiles found."
              }
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
