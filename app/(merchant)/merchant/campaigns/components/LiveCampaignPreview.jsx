"use client";

import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LiveCampaignPreview({ campaignData, merchantName }) {
  return (
    <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#e85d04]" /> Live Deal Card Preview
          </span>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-bold">
            Live Preview
          </Badge>
        </div>

        {/* Live Card Container */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
          {/* Banner header image or fallback gradient */}
          <div
            className="h-32 bg-slate-900 relative flex items-end p-4 bg-cover bg-center"
            style={{
              backgroundImage: campaignData.bannerUrl
                ? `url(${campaignData.bannerUrl})`
                : "linear-gradient(to right, #0f172a, #1e293b)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="relative z-10 flex items-center justify-between w-full">
              <Badge className="bg-[#e85d04] text-white font-bold text-[9px] uppercase px-2 py-0.5 border-0">
                {campaignData.type?.toUpperCase()}
              </Badge>
              <span className="text-white text-[10px] font-bold bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                {merchantName || "Store Name"}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3.5">
            {/* Title & Sub-headline */}
            <div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {campaignData.headline || campaignData.name || "🔥 Flat 20% off all orders during Summer Sale"}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                {campaignData.subHeadline || campaignData.description || "Valid on all in-store billing. Show claim code at counter."}
              </p>
            </div>

            {/* Promo Code & Discount Pill */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold">
                Code: <span className="font-mono text-slate-900 font-bold uppercase">{campaignData.code || "SAVE20"}</span>
              </span>
              <span className="text-[#e85d04] font-black">
                {campaignData.discountValue ? `${campaignData.discountValue}% OFF` : "SPECIAL DEAL"}
              </span>
            </div>

            {/* Live Urgency Countdown Widget */}
            {campaignData.hasCountdownTimer && (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-amber-900 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Ends In:
                </span>
                <span className="font-mono text-amber-900 text-[11px]">23h : 59m : 45s</span>
              </div>
            )}

            {/* Attached Listings Badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-semibold">
              <span>Attached Offers:</span>
              <span className="text-slate-800 font-bold">{campaignData.couponIds?.length || 0} listings</span>
            </div>

            {/* Action button preview */}
            <Button className="w-full bg-slate-900 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs cursor-default">
              Get In-Store Claim Code
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
