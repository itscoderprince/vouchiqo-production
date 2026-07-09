"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useDeleteCoupon } from "@/hooks/use-coupons";

const TableSkeleton = () => (
  <TableRow className="animate-pulse border-b border-brand-border">
    <TableCell className="p-4">
      <div className="h-4 bg-slate-200 rounded w-48"></div>
    </TableCell>
    <TableCell className="p-4">
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </TableCell>
    <TableCell className="p-4">
      <div className="h-4 bg-slate-200 rounded w-10"></div>
    </TableCell>
    <TableCell className="p-4">
      <div className="h-4 bg-slate-200 rounded w-10"></div>
    </TableCell>
    <TableCell className="p-4">
      <div className="h-5 bg-slate-200 rounded-full w-16"></div>
    </TableCell>
    <TableCell className="p-4">
      <div className="h-4 bg-slate-200 rounded w-24"></div>
    </TableCell>
    <TableCell className="p-4 text-right">
      <div className="h-8 bg-slate-200 rounded w-16 ml-auto"></div>
    </TableCell>
  </TableRow>
);

export default function MerchantCoupons() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const deleteMutation = useDeleteCoupon();

  const mockCoupons = [
    {
      _id: "c1",
      title: "50% off next 5 food orders",
      discountType: "percentage",
      discountValue: 50,
      totalClaims: 124,
      totalRedemptions: 98,
      status: "active",
      expiresAt: "2026-12-31",
    },
    {
      _id: "c4",
      title: "Free Delivery on orders above $30",
      discountType: "freebie",
      totalClaims: 160,
      totalRedemptions: 116,
      status: "active",
      expiresAt: "2026-11-30",
    },
    {
      _id: "c-expired",
      title: "BOGO on dinner courses",
      discountType: "percentage",
      discountValue: 100,
      totalClaims: 82,
      totalRedemptions: 60,
      status: "expired",
      expiresAt: "2026-05-15",
    },
  ];

  // 1. Fetch current merchant profile
  const { data: merchant, isLoading: loadingMerchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await fetch("/api/merchants/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  // 2. Fetch merchant coupons
  const { data: couponsData, isLoading: loadingCoupons } = useQuery({
    queryKey: ["merchant-coupons", merchant?._id],
    queryFn: async () => {
      if (!merchant?._id) return [];
      const res = await fetch(
        `/api/coupons?merchantId=${merchant._id}&allDates=true`,
      );
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const json = await res.json();
      return json.data?.coupons || [];
    },
    enabled: !!merchant?._id,
  });

  const couponsList = merchant?._id ? couponsData || [] : mockCoupons;
  const isLoading = loadingMerchant || (!!merchant?._id && loadingCoupons);

  const filteredCoupons = couponsList.filter((coupon) =>
    coupon.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage")
      return `${coupon.discountValue}% OFF`;
    if (coupon.discountType === "fixed") return `$${coupon.discountValue} OFF`;
    return "Freebie";
  };

  return (
    <DashboardLayout
      title="My Coupons"
      user={{
        name: merchant?.businessName || "Zomato Partner",
        role: "merchant",
      }}
    >
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <InputGroup className="bg-brand-bg border border-brand-border rounded-lg h-10 px-1 w-full sm:w-60 shadow-none">
          <InputGroupAddon>
            <Search className="w-4 h-4 text-brand-subtext" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search my coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs placeholder-brand-subtext h-full"
          />
        </InputGroup>

        <Link
          href="/merchant/coupons/new"
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-none w-full sm:w-auto justify-center rounded-lg border-0 h-auto font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </Link>
      </div>

      {/* Table list */}
      <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto flex-1">
          <Table className="w-full text-xs">
            <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
              <TableRow className="hover:bg-transparent border-b border-brand-border">
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Coupon Detail
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Discount
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Claims
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Redemptions
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Status
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Expiry Date
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
              {isLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <TableSkeleton key={idx} />
                  ))
                : filteredCoupons.length > 0
                  ? filteredCoupons.map((coupon, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                      >
                        <TableCell className="p-4 h-auto">
                          <div className="flex flex-col">
                            <span className="font-bold text-brand-navy">
                              {coupon.title}
                            </span>
                            <span className="text-[10px] text-brand-subtext uppercase font-bold mt-0.5">
                              ID: {coupon._id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-brand-blue font-bold">
                          {formatDiscount(coupon)}
                        </TableCell>
                        <TableCell className="p-4">
                          {coupon.totalClaims || 0}
                        </TableCell>
                        <TableCell className="p-4">
                          {coupon.totalRedemptions || 0}
                        </TableCell>
                        <TableCell className="p-4">
                          <Badge
                            variant={
                              coupon.status === "active"
                                ? "success"
                                : "destructive"
                            }
                            className={`rounded-full text-[10px] font-bold py-0.5 px-2 border-0 shadow-none gap-1 ${
                              coupon.status === "active"
                                ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/10"
                                : "bg-brand-error/10 text-brand-error hover:bg-brand-error/10"
                            }`}
                          >
                            {coupon.status === "active"
                              ? <CheckCircle2 className="w-3 h-3" />
                              : <XCircle className="w-3 h-3" />}
                            <span className="capitalize">{coupon.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 text-brand-subtext">
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/merchant/coupons/${coupon._id}`)
                              }
                              className="w-8 h-8 rounded-lg text-brand-subtext hover:text-brand-blue hover:bg-brand-surface cursor-pointer shadow-none"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this coupon?",
                                  )
                                ) {
                                  deleteMutation.mutate(coupon._id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="w-8 h-8 rounded-lg text-brand-subtext hover:text-brand-error hover:bg-brand-surface cursor-pointer shadow-none disabled:opacity-50"
                            >
                              {deleteMutation.isPending
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : <TableRow>
                      <TableCell
                        colSpan={7}
                        className="p-8 text-center text-brand-subtext font-semibold"
                      >
                        No coupons found. Click "Create Coupon" to add your
                        first offer.
                      </TableCell>
                    </TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
