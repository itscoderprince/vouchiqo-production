"use client";

import { Plus } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800 tracking-tight">
            My Campaigns
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Bundle multiple offers into a coordinated promotional push.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xs shadow-[#F72853]/25 cursor-pointer transition-all border-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Campaign</span>
        </Button>
      </div>

      {/* Allowance Progress Card */}
      <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 space-y-2 font-sans">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>
            {campaignsCount} of {isPro ? "Unlimited" : "4"} annual campaigns
            used
          </span>
          <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
            {planName ? `${planName.toUpperCase()} Plan` : "STARTER Plan"}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#F72853] h-full rounded-full transition-all duration-500"
            style={{
              width: isPro
                ? "25%"
                : `${Math.min(100, (campaignsCount / 4) * 100)}%`,
            }}
          />
        </div>
      </Card>
    </>
  );
}
