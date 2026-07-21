"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CampaignsHeader({
  campaignsCount,
  isPro,
  planName,
  onCreateClick,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Campaigns
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Bundle multiple offers into a coordinated promo push.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="bg-[#e85d04] hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Campaign</span>
        </Button>
      </div>

      {/* Allowance Progress Card */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>
            {campaignsCount} of {isPro ? "Unlimited" : "4"} annual campaigns used
          </span>
          <span className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
            {planName ? `${planName.toUpperCase()} plan` : "PRO plan"}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#e85d04] h-full rounded-full transition-all duration-500"
            style={{
              width: isPro ? "25%" : `${Math.min(100, (campaignsCount / 4) * 100)}%`,
            }}
          />
        </div>
      </Card>
    </>
  );
}
