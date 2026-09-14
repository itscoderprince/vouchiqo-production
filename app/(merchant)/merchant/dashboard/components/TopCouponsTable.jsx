"use client";

import { Edit2, Pause, Play, Tag, Ticket, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, StatusBadge } from "@/components/shared/data";
import { ConfirmDeleteModal } from "@/components/shared/modals";
import { showSuccess } from "@/lib/toast";

export default function TopCouponsTable({ coupons: initialCoupons = [] }) {
  const [couponsList, setCouponsList] = useState(initialCoupons);

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
        <span className="font-medium text-slate-800 truncate block max-w-[180px]">
          {row?.title || "Offer Listing"}
        </span>
      ),
    },
    {
      key: "code",
      header: "Code",
      cell: (row) => (
        <span className="font-mono text-[11px] font-medium text-slate-600 flex items-center gap-1">
          <Ticket className="w-3 h-3 text-slate-400" />
          {row?.code || "N/A"}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (row) => (
        <span className="text-[11px] font-medium text-[#F72853] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 font-sans">
          {row?.discount || "Offer"}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1 font-sans">
          <Tag className="w-2.5 h-2.5 text-slate-400" />
          {row?.category || "General"}
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-700 font-normal">
          {(Number(row?.clicks ?? row?.views) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "redemptions",
      header: "Redemptions",
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-slate-800">
          {(Number(row?.redemptions) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "successRate",
      header: "Success %",
      sortable: true,
      cell: (row) => {
        const rate = Number(row?.successRate ?? row?.conversion) || 0;
        return (
          <span
            className={`font-medium ${rate >= 10 ? "text-emerald-600" : rate >= 5 ? "text-blue-600" : "text-slate-500"}`}
          >
            {rate}%
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row?.status || "active"} size="sm" />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/merchant/coupons/${row.id || row._id}`}
            className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Edit Coupon"
          >
            <Edit2 className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={() => handleToggleStatus(row.id || row._id)}
            className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {row.status === "active" ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </button>
          <button
            type="button"
            onClick={() => confirmDelete(row)}
            className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col text-left font-sans">
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3 bg-slate-50/40">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
            Top Performing Offers
          </h3>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
            Your best listings ranked by redemptions and engagement
          </p>
        </div>
        <Link
          href="/merchant/coupons"
          className="text-xs font-medium text-[#F72853] hover:underline underline-offset-2 shrink-0"
        >
          View all →
        </Link>
      </div>
      <div className="p-3.5 sm:p-4 pt-2">
        <DataTable
          columns={columns}
          data={couponsList}
          searchable={false}
          defaultPageSize={5}
          emptyState={
            <div className="space-y-1.5 py-6 text-center">
              <p className="text-xs text-slate-500 font-normal">
                No active coupons found yet.
              </p>
              <Link
                href="/merchant/coupons/new"
                className="text-xs font-medium text-[#F72853] hover:underline underline-offset-2 inline-block"
              >
                + Post your first coupon
              </Link>
            </div>
          }
        />
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={couponToDelete?.code || couponToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
