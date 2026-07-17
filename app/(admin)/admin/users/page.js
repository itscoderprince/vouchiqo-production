"use client";

import { Ban, RefreshCw, Search, Download } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  adminFetchUsers,
  adminToggleUserStatus,
  adminExportSubscribers,
} from "@/lib/api-helpers";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminFetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (authId, isActive) => {
    try {
      await adminToggleUserStatus(authId, isActive);
      setUsers((prev) =>
        prev.map((u) =>
          u.authId === authId ? { ...u, isActive: !isActive } : u,
        ),
      );
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  const handleNewsletterExport = async () => {
    try {
      setExporting(true);
      const subs = await adminExportSubscribers();
      if (subs.length === 0) {
        alert("No subscribers found to export.");
        return;
      }

      // Build CSV string
      const headers = ["Name", "Email", "Date Joined"];
      const rows = subs.map((sub) => {
        const name = (sub.name || "User").replace(/"/g, '""');
        const email = sub.email || "";
        const date = sub.createdAt
          ? new Date(sub.createdAt).toLocaleDateString()
          : "—";
        return `"${name}","${email}","${date}"`;
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `vouchiqo_newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting newsletter subscribers:", err);
      alert("Error generating subscriber export CSV.");
    } finally {
      setExporting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout
      title="User Management"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider">
          Platform User Profiles
        </h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <InputGroup className="bg-brand-bg border border-brand-border rounded-lg h-10 px-1 w-full sm:w-60 shadow-none flex-grow sm:flex-grow-0">
            <InputGroupAddon>
              <Search className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs placeholder-brand-subtext h-full"
            />
          </InputGroup>

          <Button
            onClick={handleNewsletterExport}
            disabled={exporting}
            className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs h-10 px-4 flex items-center gap-1.5 font-bold rounded-lg cursor-pointer border-0 shadow-none"
          >
            {exporting
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            <span>Export Newsletter CSV</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto flex-1">
          <Table className="w-full text-xs">
            <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
              <TableRow className="hover:bg-transparent border-b border-brand-border">
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  User Profile
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Role
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Joined
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Email Notifications
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Coupons Saved
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Status
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                  Access Controls
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
              {loading
                ? <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="p-8 text-center text-brand-subtext font-semibold h-auto"
                    >
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
                      <span>Loading registered users...</span>
                    </TableCell>
                  </TableRow>
                : filteredUsers.length === 0
                  ? <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={7}
                        className="p-8 text-center text-brand-subtext font-semibold h-auto"
                      >
                        No users found matching search query.
                      </TableCell>
                    </TableRow>
                  : filteredUsers.map((u, idx) => (
                      <TableRow
                        key={u.authId || idx}
                        className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                      >
                        <TableCell className="p-4 flex flex-col h-auto">
                          <span className="font-bold text-brand-navy">
                            {u.name}
                          </span>
                          <span className="text-[10px] text-brand-subtext font-bold mt-0.5">
                            {u.email}
                          </span>
                        </TableCell>
                        <TableCell className="p-4 capitalize">
                          <span className="text-brand-navy font-bold uppercase text-[10px]">
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="p-4 text-brand-subtext font-semibold">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </TableCell>
                        <TableCell className="p-4">
                          {u.role === "customer"
                            ? <Badge
                                variant="outline"
                                className={`rounded font-bold text-[9px] px-1.5 py-0.5 border ${
                                  u.emailNotifications !== false
                                    ? "bg-brand-success/5 text-brand-success border-brand-success/20 animate-none"
                                    : "bg-slate-500/5 text-slate-500 border-slate-500/20 animate-none"
                                }`}
                              >
                                {u.emailNotifications !== false
                                  ? "Subscribed"
                                  : "Unsubscribed"}
                              </Badge>
                            : <span className="text-brand-subtext">—</span>}
                        </TableCell>
                        <TableCell className="p-4">
                          {u.role === "customer"
                            ? <Badge
                                variant="outline"
                                className="rounded font-bold text-[9px] px-1.5 py-0.5 border bg-brand-blue/5 text-brand-blue border-brand-blue/20"
                              >
                                {u.couponsSaved || 0} Saved
                              </Badge>
                            : <span className="text-brand-subtext">—</span>}
                        </TableCell>
                        <TableCell className="p-4">
                          <Badge
                            variant={u.isActive ? "success" : "destructive"}
                            className={`rounded-full text-[10px] font-bold py-0.5 px-2 border-0 shadow-none ${
                              u.isActive
                                ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
                                : "bg-brand-error/10 text-brand-error hover:bg-brand-error/10"
                            }`}
                          >
                            {u.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(u.authId, u.isActive)
                            }
                            className={`text-xs py-1.5 px-4 font-bold flex items-center gap-1.5 justify-center ml-auto h-auto cursor-pointer shadow-none ${
                              u.isActive
                                ? "border-brand-error/30 text-brand-error hover:bg-brand-error/5 hover:text-brand-error"
                                : "border-brand-success/30 text-brand-success hover:bg-brand-success/5 hover:text-brand-success"
                            }`}
                          >
                            {u.isActive
                              ? <Ban className="w-3.5 h-3.5" />
                              : <RefreshCw className="w-3.5 h-3.5" />}
                            <span>{u.isActive ? "Suspend" : "Activate"}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
