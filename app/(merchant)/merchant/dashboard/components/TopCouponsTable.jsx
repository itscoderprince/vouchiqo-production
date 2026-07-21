"use client";

import { Edit2, Pause, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TopCouponsTable({ coupons = [] }) {
  return (
    <Card className="border-[#e2e8f0] shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Top Performing Coupons
          </CardTitle>
          <CardDescription className="text-[11px] font-semibold mt-0.5">
            Your best listings ranked by redemptions
          </CardDescription>
        </div>
        <Link
          href="/merchant/coupons"
          className="text-xs font-bold text-[#3e80dd] hover:underline underline-offset-2 shrink-0"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full text-xs">
            <TableHeader className="bg-[#f8fafc] border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">Coupon</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">Code</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">Category</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-right">Clicks</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-right">Redemptions</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-right">Success %</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {coupons.length > 0 ? (
                coupons.map((coupon, idx) => (
                  <TableRow key={coupon.id ?? idx} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="p-4 font-bold text-slate-800 max-w-[200px]">
                      <span className="truncate block">{coupon.title}</span>
                    </TableCell>
                    <TableCell className="p-4 font-mono text-[10px] text-slate-500 uppercase">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        {coupon.category}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-right">{coupon.clicks.toLocaleString()}</TableCell>
                    <TableCell className="p-4 text-right font-bold text-slate-900">{coupon.redemptions.toLocaleString()}</TableCell>
                    <TableCell className="p-4 text-right">
                      <span className={`font-bold ${coupon.successRate >= 10 ? "text-emerald-600" : coupon.successRate >= 5 ? "text-amber-600" : "text-slate-500"}`}>
                        {coupon.successRate}%
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <Badge
                        className={`rounded px-2.5 py-0.5 border-0 text-[9px] font-bold shadow-none ${
                          coupon.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : coupon.status === "Paused"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/merchant/coupons/${coupon.id}/edit`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Pause/Resume"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center p-12 text-slate-400 font-medium">
                    <div className="space-y-2">
                      <p>No coupons yet.</p>
                      <Link
                        href="/merchant/coupons/new"
                        className="text-[#3e80dd] font-bold underline underline-offset-2 text-xs"
                      >
                        + Post your first coupon
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
