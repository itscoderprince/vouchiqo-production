"use client";

import {
  Calendar as CalendarIcon,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import {
  adminFetchScheduledCampaigns,
  adminReviewCampaign,
} from "@/lib/api-helpers";

const FESTIVAL_DATES = [
  {
    name: "Diwali Grand Fest",
    date: "2026-11-01",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    name: "Dussehra Mega Sale",
    date: "2026-10-12",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    name: "Holi Colours Offer",
    date: "2026-03-04",
    color: "bg-[#e85d04]/10 text-[#e85d04] border-orange-200",
  },
  {
    name: "Eid Festive Specials",
    date: "2026-03-20",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

export default function AdminCampaignCalendarPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // API Loading State
  const [isSaving, setIsSaving] = useState(false);

  // Form states inside adjustment modal
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editCountdown, setEditCountdown] = useState(true);
  const [editTeaser, setEditTeaser] = useState(true);
  const [editTeaserHeadline, setEditTeaserHeadline] = useState("");

  const fetchScheduled = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetchScheduledCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error("Error loading scheduled campaigns:", err);
      toast.error("Failed to load scheduled campaign calendar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  const handleOpenAdjust = useCallback((cmp) => {
    setSelectedCampaign(cmp);
    const startStr = cmp.startDate
      ? new Date(cmp.startDate).toISOString().split("T")[0]
      : cmp.timing?.startDate
        ? new Date(cmp.timing.startDate).toISOString().split("T")[0]
        : "";
    const endStr = cmp.endDate
      ? new Date(cmp.endDate).toISOString().split("T")[0]
      : cmp.timing?.endDate
        ? new Date(cmp.timing.endDate).toISOString().split("T")[0]
        : "";

    setEditStartDate(startStr);
    setEditEndDate(endStr);
    setEditCountdown(cmp.timing?.hasCountdownTimer ?? true);
    setEditTeaser(cmp.timing?.hasPreTeaser ?? true);
    setEditTeaserHeadline(cmp.timing?.preTeaserHeadline || cmp.headline || "");
    setIsAdjustModalOpen(true);
  }, []);

  const handleSaveSchedule = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedCampaign) return;

      const targetId = selectedCampaign._id || selectedCampaign.id;
      try {
        setIsSaving(true);
        await adminReviewCampaign(targetId, {
          scheduleDate: editStartDate,
          endDate: editEndDate,
          timing: {
            startDate: new Date(`${editStartDate}T10:00:00`),
            endDate: new Date(`${editEndDate}T23:59:59`),
            hasCountdownTimer: editCountdown,
            hasPreTeaser: editTeaser,
            preTeaserHeadline: editTeaserHeadline,
          },
        });

        setCampaigns((prev) =>
          prev.map((c) =>
            c._id === targetId || c.id === targetId
              ? {
                  ...c,
                  startDate: `${editStartDate}T10:00`,
                  endDate: `${editEndDate}T23:59`,
                  timing: {
                    ...c.timing,
                    hasCountdownTimer: editCountdown,
                    hasPreTeaser: editTeaser,
                    preTeaserHeadline: editTeaserHeadline,
                  },
                }
              : c,
          ),
        );
        toast.success("Campaign launch schedule & teaser updated!");
        setIsAdjustModalOpen(false);
      } catch (err) {
        toast.error(err.message || "Failed to update campaign schedule.");
      } finally {
        setIsSaving(false);
      }
    },
    [
      selectedCampaign,
      editStartDate,
      editEndDate,
      editCountdown,
      editTeaser,
      editTeaserHeadline,
    ],
  );

  const formattedCampaigns = useMemo(() => {
    return campaigns.map((c) => ({
      ...c,
      id: c._id || c.id,
      merchantName:
        c.merchantId?.businessName || c.merchant || "Merchant Partner",
      startFormatted: c.startDate
        ? new Date(c.startDate).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : c.timing?.startDate
          ? new Date(c.timing.startDate).toLocaleString("en-IN", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—",
      endFormatted: c.endDate
        ? new Date(c.endDate).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : c.timing?.endDate
          ? new Date(c.timing.endDate).toLocaleString("en-IN", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—",
      hasCountdown: c.timing?.hasCountdownTimer ?? c.hasCountdownTimer ?? true,
      hasPreTeaser: c.timing?.hasPreTeaser ?? c.hasPreTeaser ?? false,
      teaserHeadline: c.timing?.preTeaserHeadline || c.teaserHeadline || "",
    }));
  }, [campaigns]);

  return (
    <DashboardLayout
      title="Campaign Calendar & Scheduling"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-[#e85d04]" /> Campaign
              Scheduling &amp; Calendar
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Go-live date/time pickers, countdown timers, pre-launch teasers
              &amp; automatic cron scheduler.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 border-0">
              Cron Scheduler Active (Auto-Launch Enabled)
            </Badge>
          </div>
        </div>

        {/* Flagged Festival Dates Banner */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Flagged National
            Festival Campaign Dates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FESTIVAL_DATES.map((fest) => (
              <div
                key={fest.name}
                className={`p-3 rounded-xl border text-xs font-bold ${fest.color} flex justify-between items-center`}
              >
                <span>{fest.name}</span>
                <span className="font-mono text-[11px]">{fest.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Scheduled Campaigns List */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Scheduled Campaigns Queue
            </h3>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={fetchScheduled}
              className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 mr-1" />
                : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
              <span>Refresh</span>
            </Button>
          </div>

          {loading
            ? <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 border border-slate-200 rounded-2xl space-y-2"
                  >
                    <Skeleton className="h-5 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                ))}
              </div>
            : formattedCampaigns.length === 0
              ? <div className="p-8 text-center text-xs text-slate-400">
                  No scheduled campaigns found in the calendar queue.
                </div>
              : <div className="space-y-4">
                  {formattedCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {c.name || "Scheduled Campaign"}
                          </h4>
                          <Badge className="bg-blue-100 text-blue-800 text-[9px] font-bold">
                            {c.merchantName}
                          </Badge>
                          {c.hasCountdown && (
                            <Badge className="bg-orange-100 text-orange-800 text-[9px] font-bold">
                              Countdown Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Go-Live:{" "}
                          <strong className="text-slate-900 font-mono">
                            {c.startFormatted}
                          </strong>{" "}
                          • End:{" "}
                          <strong className="text-slate-900 font-mono">
                            {c.endFormatted}
                          </strong>
                        </p>
                        {c.hasPreTeaser && (
                          <span className="text-[11px] font-semibold text-purple-700 block">
                            🔮 Pre-Teaser: &quot;{c.teaserHeadline}&quot;
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleOpenAdjust(c)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                      >
                        Adjust Launch Schedule &amp; Teaser
                      </Button>
                    </div>
                  ))}
                </div>}
        </Card>

        {/* ADJUST SCHEDULE MODAL */}
        <Dialog
          open={isAdjustModalOpen}
          onOpenChange={() => !isSaving && setIsAdjustModalOpen(false)}
        >
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-bold text-slate-900">
                Adjust Launch Schedule
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Adjust launch time up to 2 hours before automated launch.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveSchedule} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">
                  Go-Live Launch Date *
                </Label>
                <DatePicker
                  value={editStartDate}
                  onChange={setEditStartDate}
                  placeholder="Select launch date"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">
                  End Expiry Date *
                </Label>
                <DatePicker
                  value={editEndDate}
                  onChange={setEditEndDate}
                  placeholder="Select end date"
                />
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCountdown}
                    onChange={(e) => setEditCountdown(e.target.checked)}
                    className="accent-[#e85d04]"
                  />
                  <span>Activate Countdown Timer on Offer Card</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editTeaser}
                    onChange={(e) => setEditTeaser(e.target.checked)}
                    className="accent-[#e85d04]"
                  />
                  <span>Activate Festival Pre-Launch Teaser Banner</span>
                </label>
              </div>

              {editTeaser && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-800">
                    Pre-Launch Teaser Headline (Max 60 Chars) *
                  </Label>
                  <Input
                    type="text"
                    maxLength={60}
                    value={editTeaserHeadline}
                    onChange={(e) => setEditTeaserHeadline(e.target.value)}
                    placeholder="e.g. 🔥 Pre-Diwali Deals Unlocking Soon!"
                    className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                  />
                </div>
              )}

              <DialogFooter className="pt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  {isSaving
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    : null}
                  <span>Save Schedule</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
