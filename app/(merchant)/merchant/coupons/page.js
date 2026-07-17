"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Edit,
  HelpCircle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const router = useRouter();
  const deleteMutation = useDeleteCoupon();

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
  const { data: couponsData = [], isLoading: loadingCoupons } = useQuery({
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

  const isLoading = loadingMerchant || loadingCoupons;

  // Filter coupons based on search query and status filter selection
  const filteredCoupons = couponsData.filter((coupon) => {
    const matchesSearch = coupon.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || coupon.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Compute live statistics for summary cards
  const totalCouponsCount = couponsData.length;
  const activeCouponsCount = couponsData.filter(
    (c) => c.status === "active",
  ).length;
  const expiredCouponsCount = couponsData.filter(
    (c) => c.status === "expired",
  ).length;

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage")
      return `${coupon.discountValue}% OFF`;
    if (coupon.discountType === "fixed") return `₹${coupon.discountValue} OFF`;
    return "Freebie";
  };

  return (
    <DashboardLayout
      title="My Coupons"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-6 text-left font-sans">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCouponsCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                All posted deals in your account
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {activeCouponsCount}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Deals currently live and claimable
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Expired Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">
                {expiredCouponsCount}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Deals past their expiration date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-brand-bg border border-brand-border text-xs rounded-lg h-10 px-3 font-semibold text-brand-navy shadow-none focus:ring-0 w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-brand-bg border border-brand-border">
                <SelectItem value="all" className="text-xs font-semibold">
                  All Status
                </SelectItem>
                <SelectItem value="active" className="text-xs font-semibold">
                  Active
                </SelectItem>
                <SelectItem value="expired" className="text-xs font-semibold">
                  Expired
                </SelectItem>
                <SelectItem value="pending" className="text-xs font-semibold">
                  Pending
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Link
            href="/merchant/coupons/new"
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-none w-full sm:w-auto justify-center rounded-lg border-0 h-10 font-bold cursor-pointer"
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
                              <span className="text-[10px] text-brand-subtext uppercase font-bold mt-0.5 font-mono">
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
                                  : coupon.status === "pending"
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    : "bg-brand-error/10 text-brand-error hover:bg-brand-error/10"
                              }`}
                            >
                              {coupon.status === "active"
                                ? <CheckCircle2 className="w-3 h-3" />
                                : coupon.status === "pending"
                                  ? <HelpCircle className="w-3 h-3" />
                                  : <XCircle className="w-3 h-3" />}
                              <span className="capitalize">
                                {coupon.status}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="p-4 text-brand-subtext">
                            {new Date(coupon.expiresAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
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
                                onClick={() => setDeleteId(coupon._id)}
                                disabled={deleteMutation.isPending}
                                className="w-8 h-8 rounded-lg text-brand-subtext hover:text-brand-error hover:bg-brand-surface cursor-pointer shadow-none disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coupon and disable any active customer claims.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMutation.mutate(deleteId, {
                  onSettled: () => setDeleteId(null),
                });
              }}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
