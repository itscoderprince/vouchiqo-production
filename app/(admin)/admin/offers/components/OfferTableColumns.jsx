"use client";

import {
  AlertTriangle,
  CheckCircle,
  Edit2,
  Eye,
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
  onViewDetails,
  isApproving,
}) {
  return [
    {
      key: "title",
      header: "Offer & Merchant",
      accessorKey: "title",
      cell: (row) => (
        <div className="space-y-0.5 py-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-slate-900 text-xs">{row.title}</span>
            {row.isFeatured && (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-medium px-1.5 py-0.2 rounded">
                Featured
              </span>
            )}
            {row.isHot && (
              <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-medium px-1.5 py-0.2 rounded">
                🔥 Hot
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 font-normal">
            {row.merchantId?.businessName ||
              row.merchantName ||
              "Merchant Partner"}{" "}
            • <span className="capitalize">{row.category || "General"}</span>
          </p>
        </div>
      ),
    },
    {
      key: "code",
      header: "Discount & Code",
      accessorKey: "code",
      cell: (row) => (
        <div className="space-y-0.5 py-0.5">
          <div className="font-medium text-emerald-800 text-xs">
            {row.discountType === "percentage"
              ? `${row.discountValue}% OFF`
              : `₹${row.discountValue} OFF`}
          </div>
          <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/90 font-mono border border-slate-300 text-slate-800 shadow-2xs inline-block">
            {row.code || "AUTO-APPLY"}
          </code>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status / Verification",
      accessorKey: "status",
      cell: (row) => {
        let statusBg = "bg-slate-100 text-slate-700 border-slate-300";

        if (row.status === "active")
          statusBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
        else if (row.status === "pending")
          statusBg = "bg-amber-50 text-amber-700 border-amber-200";
        else if (row.status === "paused")
          statusBg = "bg-rose-50 text-rose-700 border-rose-200";

        return (
          <div className="space-y-0.5 py-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`capitalize text-[10px] font-medium px-2 py-0.5 rounded-md border shadow-2xs inline-block ${statusBg}`}
              >
                {row.status}
              </span>
              {row.isVerified ? (
                <ShieldCheck
                  className="h-3.5 w-3.5 text-emerald-600"
                  title="Verified Listing"
                />
              ) : (
                <AlertTriangle
                  className="h-3.5 w-3.5 text-amber-500"
                  title="Unverified Listing"
                />
              )}
            </div>
            {row.rejectionReason && (
              <p className="text-[10px] text-rose-600 font-normal truncate max-w-[180px]">
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
        <div className="text-[11px] space-y-0.5 text-slate-600 font-normal py-0.5">
          <div>
            Claims:{" "}
            <span className="font-medium text-slate-900">{row.usesCount || 0}</span> /{" "}
            {row.usageLimit || "∞"}
          </div>
          <div>
            Views:{" "}
            <span className="font-medium text-slate-900">{row.viewsCount || row.viewCount || 0}</span>
          </div>
        </div>
      ),
    },
    {
      key: "expiresAt",
      header: "Expiry",
      accessorKey: "expiresAt",
      cell: (row) => (
        <span className="text-[11px] text-slate-600 font-normal py-0.5 block">
          {row.expiresAt || row.expiryDate
            ? new Date(row.expiresAt || row.expiryDate).toLocaleDateString()
            : "No expiration"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessorKey: "_id",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {onViewDetails && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(row)}
              className="h-7 px-2.5 gap-1 text-[11px] font-medium border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs"
            >
              <Eye className="h-3 w-3" />
              <span>Audit</span>
            </Button>
          )}

          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 font-medium rounded-lg cursor-pointer shadow-2xs gap-1"
                onClick={() => onApprove(row._id)}
                disabled={isApproving}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                title="Reject Offer"
                className="h-7 w-7 p-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-lg cursor-pointer shadow-2xs shrink-0"
                onClick={() => onReject(row)}
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 flex items-center justify-center border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs shrink-0"
            onClick={() => onEdit(row)}
            title="Edit Offer"
          >
            <Edit2 className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="h-7 w-7 p-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-lg cursor-pointer shadow-2xs shrink-0"
            onClick={() => onDelete(row)}
            title="Delete Offer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
