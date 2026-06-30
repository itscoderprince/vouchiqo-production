"use client";

import { Check, Store, X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MerchantApprovals() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingMerchants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/merchants?status=pending");
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setMerchants(json.data.merchants || []);
      }
    } catch (err) {
      console.error("Error fetching pending merchants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  const handleAction = async (merchantId, action) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";
      const res = await fetch("/api/admin/merchants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, status }),
      });
      if (res.ok) {
        setMerchants((prev) => prev.filter((m) => m._id !== merchantId));
      }
    } catch (err) {
      console.error("Error reviewing merchant:", err);
    }
  };

  return (
    <DashboardLayout
      title="Merchant Approvals"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
        Merchant Signup Review Queue
      </h2>

      {loading ? (
        <div className="bg-brand-bg border border-brand-border rounded-xl p-8 text-center text-brand-subtext font-semibold shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
          <span>Loading pending applications...</span>
        </div>
      ) : merchants.length > 0
        ? <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto flex-1">
              <Table className="w-full text-xs">
                <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
                  <TableRow className="hover:bg-transparent border-b border-brand-border">
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Brand Details
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Contact Info
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Registered Location
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                      Submitted Date
                    </TableHead>
                    <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                      Moderation Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
                  {merchants.map((merchant) => (
                    <TableRow
                      key={merchant._id}
                      className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                    >
                      <TableCell className="p-4 h-auto">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-navy">
                            {merchant.businessName}
                          </span>
                          {merchant.website && (
                            <a
                              href={merchant.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-blue hover:underline font-bold mt-0.5"
                            >
                              {merchant.website.replace("https://", "").replace("http://", "")}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">{merchant.contactEmail || "No email"}</TableCell>
                      <TableCell className="p-4">
                        {merchant.location
                          ? `${merchant.location.city || ""}, ${merchant.location.country || "IN"}`
                          : "IN"}
                      </TableCell>
                      <TableCell className="p-4 text-brand-subtext">
                        {merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : "Pending"}
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="icon"
                            onClick={() => handleAction(merchant._id, "approve")}
                            className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            onClick={() => handleAction(merchant._id, "reject")}
                            className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        : <EmptyState
            icon={Store}
            title="No pending merchants"
            description="Excellent work. All merchant application submissions have been reviewed and approved."
          />}
    </DashboardLayout>
  );
}
