"use client";

import {
  AlertTriangle,
  Loader2,
  PauseCircle,
  PlusCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  adminFetchLiveCampaigns,
  adminReviewCampaign,
} from "@/lib/api-helpers";

export default function AdminLiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState("");

  // Button API Loading States
  const [isPausing, setIsPausing] = useState(false);
  const [isUpdatingCap, setIsUpdatingCap] = useState(false);
  const [endingId, setEndingId] = useState(null);

  // Pause Modal State
  const [pauseCampaign, setPauseCampaign] = useState(null);
  const [pauseReason, setPauseReason] = useState("");

  // Increase Cap Modal State
  const [capCampaign, setCapCampaign] = useState(null);
  const [newCapValue, setNewCapValue] = useState("");

  const fetchLiveCampaigns = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminFetchLiveCampaigns();
      setCampaigns(data);
      setLastRefreshed(new Date().toLocaleTimeString("en-IN"));
    } catch (err) {
      console.error("Error fetching live campaigns:", err);
      if (!silent) toast.error("Failed to load live campaigns.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveCampaigns();
    const interval = setInterval(() => {
      fetchLiveCampaigns(true);
      toast.success("Live metrics auto-refreshed", { id: "live-auto-refresh" });
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchLiveCampaigns]);

  const handleConfirmPause = useCallback(async () => {
    if (!pauseReason.trim() || pauseReason.trim().length < 20) {
      toast.error(
        "Pause requires a mandatory reason of at least 20 characters!",
      );
      return;
    }
    const targetId = pauseCampaign._id || pauseCampaign.id;
    try {
      setIsPausing(true);
      await adminReviewCampaign(targetId, {
        status: "paused",
        pauseReason,
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === targetId || c.id === targetId
            ? { ...c, status: "paused" }
            : c,
        ),
      );
      toast.success("Campaign paused successfully.");
      setPauseCampaign(null);
      setPauseReason("");
    } catch (err) {
      toast.error(err.message || "Failed to pause campaign.");
    } finally {
      setIsPausing(false);
    }
  }, [pauseCampaign, pauseReason]);

  const handleConfirmIncreaseCap = useCallback(async () => {
    const currentCap =
      capCampaign?.offerDetails?.redemptionLimit ||
      capCampaign?.capLimit ||
      500;
    if (!newCapValue || Number(newCapValue) <= currentCap) {
      toast.error("New cap must be greater than current cap!");
      return;
    }
    const targetId = capCampaign._id || capCampaign.id;
    try {
      setIsUpdatingCap(true);
      await adminReviewCampaign(targetId, {
        capLimit: Number(newCapValue),
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === targetId || c.id === targetId
            ? {
                ...c,
                capLimit: Number(newCapValue),
                offerDetails: {
                  ...c.offerDetails,
                  redemptionLimit: Number(newCapValue),
                },
              }
            : c,
        ),
      );
      toast.success(`Cap limit increased to ${newCapValue}!`);
      setCapCampaign(null);
      setNewCapValue("");
    } catch (err) {
      toast.error(err.message || "Failed to update cap limit.");
    } finally {
      setIsUpdatingCap(false);
    }
  }, [capCampaign, newCapValue]);

  const handleEndNow = useCallback(async (id) => {
    try {
      setEndingId(id);
      await adminReviewCampaign(id, { status: "ended" });
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === id || c.id === id ? { ...c, status: "ended" } : c,
        ),
      );
      toast.error("Campaign ended immediately.");
    } catch (err) {
      toast.error(err.message || "Failed to end campaign.");
    } finally {
      setEndingId(null);
    }
  }, []);

  const liveList = useMemo(() => {
    return campaigns.map((c) => {
      const redemptions = c.redemptions || c.totalRedemptions || 0;
      const capLimit = c.offerDetails?.redemptionLimit || c.capLimit || 1000;
      const impressions = c.impressions || c.totalImpressions || 0;
      const clicks = c.clicks || c.totalClicks || 0;
      const convRate =
        impressions > 0
          ? `${((redemptions / impressions) * 100).toFixed(1)}%`
          : "0.0%";

      const alerts = [];
      const capPercent = Math.min(
        100,
        Math.round((redemptions / capLimit) * 100),
      );
      if (capPercent >= 80) {
        alerts.push(
          `${capPercent}% Cap Reached (${redemptions} / ${capLimit})`,
        );
      }
      if (impressions > 500 && redemptions / impressions < 0.05) {
        alerts.push("Conversion Rate below threshold (< 5%)");
      }

      return {
        ...c,
        id: c._id || c.id,
        merchantName:
          c.merchantId?.businessName || c.merchant || "Merchant Partner",
        impressions,
        clicks,
        redemptions,
        capLimit,
        conversionRate: convRate,
        capPercent,
        alerts,
        displayStatus: c.status ? c.status.toUpperCase() : "LIVE",
      };
    });
  }, [campaigns]);

  return (
    <DashboardLayout
      title="Live Campaign Monitoring"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#e85d04]" /> Live Campaign
              Monitoring
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Auto-refreshes every 2 minutes • Real-time cap alerts, pause
              controls &amp; cap booster.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              Last Refreshed: {lastRefreshed || "Just now"}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => fetchLiveCampaigns(false)}
              className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 mr-1" />
                : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Live Campaign Cards Grid */}
        {loading
          ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="p-6 space-y-4 rounded-2xl bg-white border-slate-200"
                >
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          : liveList.length === 0
            ? <Card className="p-12 text-center border-slate-200 rounded-2xl bg-white space-y-2">
                <Zap className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  No Active Live Campaigns
                </h3>
                <p className="text-xs text-slate-400">
                  There are currently no live campaigns active in the system.
                </p>
              </Card>
            : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-semibold">
                {liveList.map((c) => {
                  const isEnding = endingId === c.id;
                  return (
                    <Card
                      key={c.id}
                      className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold border-0 uppercase">
                              {c.displayStatus} • {c.type || "flash"}
                            </Badge>
                            <h3 className="font-bold text-slate-900 text-base leading-snug mt-1">
                              {c.name || "Live Campaign"}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {c.merchantName}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            ⏳ Live Now
                          </span>
                        </div>

                        {/* Auto-Triggered System Alerts */}
                        {c.alerts.length > 0 && (
                          <div className="space-y-1">
                            {c.alerts.map((alt, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-900 flex items-center gap-1.5"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{alt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* KPI Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                          <div className="p-2.5 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 font-semibold block text-[10px]">
                              Impressions
                            </span>
                            <span className="font-black text-slate-900">
                              {c.impressions.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 font-semibold block text-[10px]">
                              Clicks
                            </span>
                            <span className="font-black text-slate-900">
                              {(Number(c?.clicks) || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 font-semibold block text-[10px]">
                              Redemptions
                            </span>
                            <span className="font-black text-slate-900">
                              {(Number(c?.redemptions) || 0).toLocaleString()} / {c?.capLimit || "∞"}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 font-semibold block text-[10px]">
                              Conversion Rate
                            </span>
                            <span className="font-black text-emerald-600">
                              {c.conversionRate}
                            </span>
                          </div>
                        </div>

                        {/* Cap Status Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>Cap Status</span>
                            <span>
                              {c.capPercent}% ({c.redemptions}/{c.capLimit})
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#e85d04] h-full rounded-full transition-all"
                              style={{ width: `${c.capPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Admin Control Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                        {c.status?.toLowerCase() !== "ended" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPauseCampaign(c)}
                              className="text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50 rounded-xl flex-1 cursor-pointer"
                            >
                              <PauseCircle className="w-3.5 h-3.5 mr-1" /> Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCapCampaign(c);
                                setNewCapValue(String(c.capLimit + 500));
                              }}
                              className="text-xs font-bold text-blue-700 border-blue-300 hover:bg-blue-50 rounded-xl flex-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5 mr-1" /> + Cap
                            </Button>
                            <Button
                              size="sm"
                              disabled={isEnding}
                              onClick={() => handleEndNow(c.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              {isEnding
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                : null}
                              <span>End Now</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>}

        {/* PAUSE CAMPAIGN MODAL */}
        <Dialog
          open={!!pauseCampaign}
          onOpenChange={() => !isPausing && setPauseCampaign(null)}
        >
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-bold text-amber-900">
                Pause Live Campaign
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Provide mandatory pause reason (min 20 characters).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold text-slate-800">
                Pause Reason *
              </Label>
              <Textarea
                rows={3}
                placeholder="e.g. Paused temporarily due to counter billing queue overload."
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                className="bg-white border-slate-200 text-xs rounded-xl"
              />
              <span className="text-[10px] text-amber-700 font-medium block text-right">
                {pauseReason.length}/20 min chars required
              </span>
            </div>
            <DialogFooter className="pt-4 flex gap-2">
              <Button
                variant="outline"
                disabled={isPausing}
                onClick={() => setPauseCampaign(null)}
                className="text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                disabled={isPausing}
                onClick={handleConfirmPause}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
              >
                {isPausing
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  : null}
                <span>Confirm Pause</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* INCREASE CAP MODAL */}
        <Dialog
          open={!!capCampaign}
          onOpenChange={() => !isUpdatingCap && setCapCampaign(null)}
        >
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-bold text-slate-900">
                Increase Campaign Redemption Cap
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Current Cap: {capCampaign?.capLimit} claims
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold text-slate-800">
                New Total Cap Limit *
              </Label>
              <Input
                type="number"
                value={newCapValue}
                onChange={(e) => setNewCapValue(e.target.value)}
                className="bg-white border-slate-200 text-xs h-10 rounded-xl font-bold"
              />
            </div>
            <DialogFooter className="pt-4 flex gap-2">
              <Button
                variant="outline"
                disabled={isUpdatingCap}
                onClick={() => setCapCampaign(null)}
                className="text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                disabled={isUpdatingCap}
                onClick={handleConfirmIncreaseCap}
                className="bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                {isUpdatingCap
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  : null}
                <span>Update Cap Limit</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
