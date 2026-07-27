"use client";

import {
  AlertTriangle,
  CheckCircle,
  Edit2,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function getOfferTableColumns({
  onApprove,
  onReject,
  onEdit,
  onDelete,
  isApproving,
}) {
  return [
    {
      key: "title",
      header: "Offer & Merchant",
      accessorKey: "title",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{row.title}</span>
            {row.isFeatured && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
              >
                Featured
              </Badge>
            )}
            {row.isHot && (
              <Badge
                variant="outline"
                className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px]"
              >
                🔥 Hot
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {row.merchantId?.businessName ||
              row.merchantName ||
              "Unknown Merchant"}{" "}
            • Category: <span className="capitalize">{row.category}</span>
          </p>
        </div>
      ),
    },
    {
      key: "code",
      header: "Discount & Code",
      accessorKey: "code",
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-emerald-500 text-sm">
            {row.discountType === "percentage"
              ? `${row.discountValue}% OFF`
              : `₹${row.discountValue} OFF`}
          </div>
          <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono border">
            {row.code}
          </code>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status / Verification",
      accessorKey: "status",
      cell: (row) => {
        let statusBg = "bg-muted text-muted-foreground";

        if (row.status === "active")
          statusBg = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        else if (row.status === "pending")
          statusBg = "bg-amber-500/10 text-amber-500 border-amber-500/20";
        else if (row.status === "paused")
          statusBg = "bg-rose-500/10 text-rose-500 border-rose-500/20";

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={`capitalize text-xs font-semibold ${statusBg}`}
              >
                {row.status}
              </Badge>
              {row.isVerified ? (
                <ShieldCheck
                  className="h-4 w-4 text-emerald-500"
                  title="Verified Listing"
                />
              ) : (
                <AlertTriangle
                  className="h-4 w-4 text-amber-500"
                  title="Unverified Listing"
                />
              )}
            </div>
            {row.rejectionReason && (
              <p className="text-[11px] text-rose-500 truncate max-w-[180px]">
                Reason: {row.rejectionReason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "stats",
      header: "Stats",
      accessorKey: "usesCount",
      cell: (row) => (
        <div className="text-xs space-y-0.5 text-muted-foreground">
          <div>
            Claims:{" "}
            <strong className="text-foreground">{row.usesCount || 0}</strong> /{" "}
            {row.usageLimit || "∞"}
          </div>
          <div>
            Views:{" "}
            <strong className="text-foreground">{row.viewsCount || 0}</strong>
          </div>
        </div>
      ),
    },
    {
      key: "expiresAt",
      header: "Expiry",
      accessorKey: "expiresAt",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.expiresAt
            ? new Date(row.expiresAt).toLocaleDateString()
            : "No expiration"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessorKey: "_id",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 gap-1 px-2"
                onClick={() => onApprove(row._id)}
                disabled={isApproving}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1 px-2"
                onClick={() => onReject(row)}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(row)}
            title="Edit Offer"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            onClick={() => onDelete(row)}
            title="Delete Offer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
