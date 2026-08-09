"use client";

import { Edit2, Pause, Play, Tag, Ticket, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, StatusBadge } from "@/components/shared/data";
import { ConfirmDeleteModal } from "@/components/shared/modals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { showSuccess } from "@/lib/toast";

export default function TopCouponsTable({ coupons: initialCoupons = [] }) {
  const [couponsList, setCouponsList] = useState(initialCoupons);

  // Sync state if initialCoupons prop changes
  useEffect(() => {
    setCouponsList(initialCoupons);
  }, [initialCoupons]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const handleToggleStatus = (id) => {
    const target = couponsList.find((c) => (c.id || c._id) === id);
    if (!target) return;

    const next = target.status === "active" ? "inactive" : "active";
    setCouponsList((prev) =>
      prev.map((c) => ((c.id || c._id) === id ? { ...c, status: next } : c)),
    );

    showSuccess(
      `Offer "${target.code}" ${next === "active" ? "resumed" : "paused"} successfully.`,
    );
  };

  const confirmDelete = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!couponToDelete) return;
    const targetId = couponToDelete.id || couponToDelete._id;
    setCouponsList((prev) => prev.filter((c) => (c.id || c._id) !== targetId));
    showSuccess(`Offer "${couponToDelete.code}" deleted.`);
    setCouponToDelete(null);
    setDeleteModalOpen(false);
  };

  /** @type {import("@/components/shared/data/DataTable").Column[]} */
  const columns = [
    {
      key: "title",
      header: "Offer",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-brand-text truncate block max-w-[160px]">
          {row.title}
        </span>
      ),
    },
    {
      key: "code",
      header: "Code",
      cell: (row) => (
        <span className="font-mono text-[10px] font-bold uppercase text-brand-navy flex items-center gap-1">
          <Ticket className="w-3 h-3" />
          {row.code}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (row) => (
        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 font-sans">
          {row.discount}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-surface text-brand-subtext flex items-center gap-1 font-sans">
          <Tag className="w-2.5 h-2.5" />
          {row.category}
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      cell: (row) => row.clicks.toLocaleString(),
    },
    {
      key: "redemptions",
      header: "Redemptions",
      sortable: true,
      cell: (row) => (
        <span className="font-bold">{row.redemptions.toLocaleString()}</span>
      ),
    },
    {
      key: "successRate",
      header: "Success %",
      sortable: true,
      cell: (row) => (
        <span
          className={`font-bold ${row.successRate >= 10 ? "text-emerald-600" : row.successRate >= 5 ? "text-blue-600" : "text-brand-subtext"}`}
        >
          {row.successRate}%
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/merchant/coupons/${row.id || row._id}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-surface text-brand-subtext hover:text-brand-blue transition-colors"
            title="Edit Coupon"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleToggleStatus(row.id || row._id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-brand-subtext hover:text-blue-600 transition-colors cursor-pointer"
          >
            {row.status === "active" ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => confirmDelete(row)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-brand-subtext hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 p-0 gap-0 text-left font-sans">
      <CardHeader className="px-4 py-3 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3 bg-slate-50/50 min-h-[48px]">
        <div>
          <CardTitle className="font-sans text-xs sm:text-[12px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
            Top Performing Offers
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Your best listings ranked by redemptions and engagement
          </CardDescription>
        </div>
        <Link
          href="/merchant/coupons"
          className="text-xs font-bold text-[#2563eb] hover:underline underline-offset-2 shrink-0"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-4 pt-3">
        <DataTable
          columns={columns}
          data={couponsList}
          searchable={false}
          defaultPageSize={5}
          emptyState={
            <div className="space-y-2">
              <p className="text-brand-subtext">No active coupons found.</p>
              <Link
                href="/merchant/coupons/new"
                className="text-brand-blue font-bold underline underline-offset-2 text-xs"
              >
                + Post your first coupon
              </Link>
            </div>
          }
        />
      </CardContent>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={couponToDelete?.code || couponToDelete?.title}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
