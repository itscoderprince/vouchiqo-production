"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
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

export default function RecentOrdersAndActivity({
  recentRedemptions,
  recentClaims = [],
  recentActivities,
}) {
  const [activeTab, setActiveTab] = useState("redemptions"); // "redemptions" | "claims"

  const displayList = activeTab === "redemptions" ? recentRedemptions : recentClaims;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Recent Orders / Claims List (2/3 width) */}
      <Card className="col-span-full xl:col-span-8 border-[#e2e8f0] shadow-sm">
        <CardHeader className="pb-3 border-b border-[#f1f5f9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {activeTab === "redemptions" ? "Recent Orders (Redemptions)" : "Recent Coupon Claims"}
            </CardTitle>
            <CardDescription className="text-[11px] font-semibold mt-0.5">
              {activeTab === "redemptions"
                ? "Latest redeemed transactions from your store"
                : "Latest customer claims & saved codes from your store"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Tab Switched Header */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("redemptions")}
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded cursor-pointer transition-all ${
                  activeTab === "redemptions"
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Redemptions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("claims")}
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded cursor-pointer transition-all ${
                  activeTab === "claims"
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Claims ({recentClaims.length})
              </button>
            </div>

            <Link
              href="/merchant/coupons"
              className="text-xs font-bold text-[#3e80dd] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full text-xs">
              <TableHeader className="bg-[#f8fafc] border-b border-brand-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                    Customer
                  </TableHead>
                  <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                    {activeTab === "redemptions" ? "Order ID" : "Claim ID"}
                  </TableHead>
                  <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                    Product
                  </TableHead>
                  <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="p-4 text-slate-500 font-bold uppercase tracking-wider text-right">
                    {activeTab === "redemptions" ? "Amount" : "Promo Code"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-brand-border font-semibold text-slate-700">
                {displayList.length > 0 ? (
                  displayList.map((tx, idx) => (
                    <TableRow
                      key={idx}
                      className="hover:bg-[#f8fafc]/50 transition-colors border-b border-[#f1f5f9] last:border-b-0"
                    >
                      <TableCell className="p-4 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${tx.bg} text-white flex items-center justify-center font-bold text-[10px] shadow-sm`}
                        >
                          {tx.initials}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-slate-800">
                            {tx.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {tx.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 font-mono text-[10px] text-slate-500">
                        {tx.id}
                      </TableCell>
                      <TableCell className="p-4 text-slate-600 font-bold">
                        {tx.product}
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge
                          className={`rounded px-2.5 py-0.5 border-0 text-[9px] font-bold shadow-none ${
                            tx.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : tx.status === "Claimed"
                                ? "bg-indigo-100 text-indigo-800"
                                : tx.status === "Processing"
                                  ? "bg-slate-950 text-white"
                                  : tx.status === "Pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`p-4 text-right text-slate-900 font-bold ${activeTab === "claims" ? "font-mono uppercase tracking-wider text-indigo-600" : ""}`}>
                        {tx.amount}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-8 text-slate-400 font-medium">
                      No recent {activeTab === "redemptions" ? "coupon redemptions" : "claims"} found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline (1/3 width) */}
      <Card className="col-span-full xl:col-span-4 border-[#e2e8f0] shadow-sm">
        <CardHeader className="pb-3 border-b border-[#f1f5f9] flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-[11px] font-semibold mt-0.5">
              Latest events from your store
            </CardDescription>
          </div>
          <Link
            href="/merchant/analytics"
            className="text-xs font-bold text-[#3e80dd] hover:underline flex items-center gap-0.5"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-4 px-5">
          <div className="space-y-5">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${act.bg} ${act.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="flex-grow space-y-0.5 text-xs text-left">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-slate-800">
                          {act.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                No recent store activities recorded.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
