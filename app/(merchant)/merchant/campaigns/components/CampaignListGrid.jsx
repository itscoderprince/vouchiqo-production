"use client";

import {
  BarChart3,
  Calendar,
  Copy,
  Edit3,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CampaignListGrid({ campaigns = [], onCreateClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Dashed Create Card */}
      <div
        onClick={onCreateClick}
        className="border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/30 transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group"
      >
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 group-hover:border-orange-400 group-hover:scale-110 transition-all flex items-center justify-center text-slate-400 group-hover:text-[#e85d04] mb-3 shadow-2xs">
          <Plus className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#e85d04] transition-colors">
          Create New Campaign
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Plan &amp; launch a coordinated promo
        </p>
      </div>

      {/* Campaign Cards */}
      {campaigns.map((camp) => (
        <Card
          key={camp._id}
          className="border-slate-200/80 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white p-5 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {camp.name}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                    {camp.type}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {camp.startDate
                    ? `${new Date(camp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(camp.endDate || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "Flexible Schedule"}
                </p>
              </div>
              <Badge
                className={`text-[10px] font-bold border-0 ${
                  camp.status === "live"
                    ? "bg-emerald-100 text-emerald-700"
                    : camp.status === "pending_review"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {camp.status === "live" ? "● Live" : camp.status.replace("_", " ")}
              </Badge>
            </div>

            {/* 3 Metrics Row */}
            <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-base font-black text-slate-900 block">
                  {camp.stats?.clicks || "12,840"}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  CLICKS
                </span>
              </div>
              <div className="border-x border-slate-200/60">
                <span className="text-base font-black text-slate-900 block">
                  {camp.stats?.redemptions || "1,820"}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  REDEMPTIONS
                </span>
              </div>
              <div>
                <span className="text-base font-black text-slate-900 block">
                  {camp.stats?.revenue || "₹482K"}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  REVENUE
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 text-[11px] font-bold gap-1">
              <Edit3 className="w-3 h-3 text-slate-500" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 text-[11px] font-bold gap-1">
              <Copy className="w-3 h-3 text-slate-500" /> Duplicate
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 text-[11px] font-bold gap-1">
              <BarChart3 className="w-3 h-3 text-slate-500" /> Report
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-rose-600 border-rose-100 hover:bg-rose-50 text-[11px] font-bold gap-1 ml-auto">
              <Trash2 className="w-3 h-3 text-rose-500" /> Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
