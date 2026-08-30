"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  Smartphone,
  Monitor,
  Users,
  UserCheck,
  Send,
  RefreshCw,
  TestTube,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch } from "@/lib/fetcher";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useUser } from "@/hooks/use-user";

// ─── Preset templates ────────────────────────────────────────────────────────
const PRESETS = [
  {
    id: "new-product",
    label: "New deal",
    icon: "🏷️",
    title: "New deal just dropped!",
    body: "A fresh verified offer is live on Vouchiqo. Check it out before it expires.",
    category: "campaign",
  },
  {
    id: "announcement",
    label: "Announcement",
    icon: "📢",
    title: "Important update from Vouchiqo",
    body: "We have an important platform update you should know about.",
    category: "system",
  },
  {
    id: "blog",
    label: "Blog / Video",
    icon: "📝",
    title: "New content published",
    body: "We just published a new post. Click to read it now.",
    category: "general",
  },
  {
    id: "offer",
    label: "Special offer",
    icon: "⚡",
    title: "Limited-time special offer!",
    body: "An exclusive deal is available for a limited time. Grab it now!",
    category: "campaign",
  },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All devices" },
  { value: "users", label: "Registered users only" },
  { value: "guests", label: "Guest visitors only" },
];

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "campaign", label: "Campaign / Offer" },
  { value: "system", label: "System" },
  { value: "billing", label: "Billing" },
];

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconClass, loading }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">
          {loading ? (
            <span className="inline-block w-10 h-5 bg-slate-200 animate-pulse rounded" />
          ) : (
            (value ?? 0).toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Confirmation modal ──────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, form, stats, sending }) {
  if (!open) return null;

  const audienceLabel =
    AUDIENCE_OPTIONS.find((a) => a.value === form.audience)?.label ||
    form.audience;
  const estimated =
    form.audience === "all"
      ? stats?.activeDevices
      : form.audience === "users"
        ? stats?.registeredUsers
        : stats?.guestDevices;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Confirm broadcast
          </h3>
        </div>

        <div className="space-y-2 bg-slate-50 rounded-lg p-3 mb-4 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Title</span>
            <span className="font-medium text-slate-700 max-w-[60%] text-right truncate">
              {form.title}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Audience</span>
            <span className="font-medium text-slate-700">{audienceLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated devices</span>
            <span className="font-bold text-blue-600">
              ~{(estimated ?? 0).toLocaleString()}
            </span>
          </div>
          {form.url && (
            <div className="flex justify-between">
              <span className="text-slate-500">Click URL</span>
              <span className="font-medium text-slate-700 max-w-[60%] text-right truncate">
                {form.url}
              </span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mb-4">
          This will send a real push notification to all matching devices.
          This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 py-2 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {sending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                Send now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Live preview ─────────────────────────────────────────────────────────────
function NotificationPreview({ form, previewMode }) {
  const isMobile = previewMode === "mobile";

  return (
    <div
      className={`bg-slate-100 rounded-xl p-4 flex items-center justify-center transition-all duration-300 ${
        isMobile ? "min-h-[220px]" : "min-h-[180px]"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all ${
          isMobile ? "w-[280px]" : "w-[360px]"
        }`}
      >
        {/* Notification header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
          <img
            src="/navbarlogovouchiqo.webp"
            alt="Vouchiqo"
            className="w-4 h-4 rounded object-contain"
          />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
            Vouchiqo · now
          </span>
        </div>

        {/* Content */}
        <div className="p-3 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-800 truncate">
              {form.title || "Notification title"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
              {form.body || "Your notification message will appear here."}
            </p>
          </div>
        </div>

        {/* Banner image preview */}
        {form.image && (
          <div className="aspect-[2/1] w-full overflow-hidden border-t border-slate-100">
            <img
              src={form.image}
              alt="Banner preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPushNotificationsPage() {
  const { user } = useUser();
  const [previewMode, setPreviewMode] = useState("desktop");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Push notification hook for "test on this browser"
  const {
    isSupported,
    isSubscribed,
    token,
    loading: pushLoading,
    requestPermission,
  } = usePushNotifications({ userId: user?.id });

  const [form, setForm] = useState({
    title: "",
    body: "",
    url: "",
    image: "",
    category: "general",
    audience: "all",
  });

  const titleMax = 80;
  const bodyMax = 240;

  // Stats query
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-push-stats"],
    queryFn: () => apiFetch("/api/admin/push/stats").then((r) => r.data),
    staleTime: 30000,
    retry: 2,
  });

  function applyPreset(preset) {
    setForm((f) => ({
      ...f,
      title: preset.title,
      body: preset.body,
      category: preset.category,
    }));
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleTestOnBrowser() {
    if (!isSubscribed && !pushLoading) {
      await requestPermission();
    }
    if (!token) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          audience: "test",
          testToken: token,
          title: form.title || "Test notification",
          body: form.body || "This is a test from the Vouchiqo admin panel.",
        }),
      });
      const json = await res.json();
      setResult({
        ok: res.ok,
        message: res.ok
          ? `Test sent! (${json.data?.sent ?? 1} device)`
          : json.message || "Failed to send test",
      });
    } catch {
      setResult({ ok: false, message: "Network error sending test" });
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    if (!form.title || !form.body) return;
    setConfirmOpen(true);
  }

  async function confirmSend() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setConfirmOpen(false);
      setResult({
        ok: res.ok,
        message: res.ok
          ? `Sent to ${json.data?.sent ?? 0} device(s). ${json.data?.pruned ? `${json.data.pruned} stale tokens pruned.` : ""}`
          : json.message || "Failed to broadcast",
      });
      if (res.ok) {
        refetchStats();
        setForm((f) => ({ ...f, title: "", body: "", url: "", image: "" }));
      }
    } catch {
      setResult({ ok: false, message: "Network error during broadcast" });
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  }

  const canSend = form.title.trim().length > 0 && form.body.trim().length > 0;

  return (
    <DashboardLayout title="Push Notifications">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800">
              Push notification hub
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Compose and broadcast web push notifications to your subscribers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchStats()}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${statsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Result banner */}
        {result && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-[11px] font-medium border ${
              result.ok
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{result.message}</span>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="ml-auto text-current opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Active devices"
            value={stats?.activeDevices}
            icon={Bell}
            iconClass="bg-blue-50 text-blue-600"
            loading={statsLoading}
          />
          <StatCard
            label="Registered users"
            value={stats?.registeredUsers}
            icon={UserCheck}
            iconClass="bg-green-50 text-green-600"
            loading={statsLoading}
          />
          <StatCard
            label="Guest visitors"
            value={stats?.guestDevices}
            icon={Users}
            iconClass="bg-purple-50 text-purple-600"
            loading={statsLoading}
          />
          <StatCard
            label="Cleaned / revoked"
            value={stats?.revokedTokens}
            icon={BellOff}
            iconClass="bg-slate-100 text-slate-500"
            loading={statsLoading}
          />
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Left — compose form */}
          <div className="space-y-4">

            {/* Test on this browser */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Test on this browser
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {!isSupported
                    ? "Push not supported in this browser."
                    : isSubscribed
                      ? "Your device is subscribed. Click to send a test push."
                      : "Subscribe first, then send a test push to yourself."}
                </p>
              </div>
              <button
                id="push-test-btn"
                type="button"
                onClick={handleTestOnBrowser}
                disabled={!isSupported || sending || pushLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                {sending || pushLoading ? (
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <TestTube className="w-3 h-3" />
                )}
                {isSubscribed ? "Send test" : "Subscribe & test"}
              </button>
            </div>

            {/* Quick presets */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[11px] font-semibold text-slate-700 mb-3">
                Quick templates
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compose form */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              <p className="text-[11px] font-semibold text-slate-700">
                Compose notification
              </p>

              {/* Category + Audience row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="w-full text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-1">
                    Target audience
                  </label>
                  <div className="relative">
                    <select
                      value={form.audience}
                      onChange={(e) => handleFormChange("audience", e.target.value)}
                      className="w-full text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {AUDIENCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-medium text-slate-500">
                    Title
                  </label>
                  <span className={`text-[10px] ${form.title.length > titleMax ? "text-red-500" : "text-slate-400"}`}>
                    {form.title.length}/{titleMax}
                  </span>
                </div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value.slice(0, titleMax))}
                  placeholder="Notification title..."
                  className="w-full text-[12px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-medium text-slate-500">
                    Message
                  </label>
                  <span className={`text-[10px] ${form.body.length > bodyMax ? "text-red-500" : "text-slate-400"}`}>
                    {form.body.length}/{bodyMax}
                  </span>
                </div>
                <textarea
                  value={form.body}
                  onChange={(e) => handleFormChange("body", e.target.value.slice(0, bodyMax))}
                  placeholder="Your message to subscribers..."
                  rows={3}
                  className="w-full text-[12px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-[10px] font-medium text-slate-500 block mb-1">
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-2.5 h-2.5" />
                    Click destination URL
                  </span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => handleFormChange("url", e.target.value)}
                  placeholder="https://vouchiqo.com/offers"
                  className="w-full text-[12px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Banner image URL */}
              <div>
                <label className="text-[10px] font-medium text-slate-500 block mb-1">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-2.5 h-2.5" />
                    Banner image URL
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded font-normal">
                      2:1 ratio · 1024×512 px
                    </span>
                  </span>
                </label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => handleFormChange("image", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full text-[12px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Use a hosted image with public URL. Cloudinary recommended.
                </p>
              </div>

              {/* Send button */}
              <button
                id="push-broadcast-btn"
                type="button"
                onClick={handleSend}
                disabled={!canSend || sending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast push notification
              </button>
            </div>
          </div>

          {/* Right — live preview */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              {/* Preview mode toggle */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-700">
                  Live preview
                </p>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
                      previewMode === "desktop"
                        ? "bg-slate-800 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Monitor className="w-2.5 h-2.5" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
                      previewMode === "mobile"
                        ? "bg-slate-800 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Smartphone className="w-2.5 h-2.5" />
                    Mobile
                  </button>
                </div>
              </div>

              <NotificationPreview form={form} previewMode={previewMode} />

              {/* Banner aspect-ratio hint */}
              {form.image && (
                <div className="mt-3 aspect-[2/1] w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  <img
                    src={form.image}
                    alt="Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.parentElement.style.display = "none";
                    }}
                  />
                </div>
              )}
              {!form.image && (
                <div className="mt-3 aspect-[2/1] w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1">
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                  <p className="text-[10px] text-slate-400">
                    Banner image preview (2:1)
                  </p>
                </div>
              )}
            </div>

            {/* Audience summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-semibold text-slate-700 mb-2">
                Audience summary
              </p>
              {[
                { label: "Active devices", val: stats?.activeDevices },
                { label: "Registered users", val: stats?.registeredUsers },
                { label: "Guest visitors", val: stats?.guestDevices },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-700">
                    {statsLoading ? "—" : (val ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 flex justify-between text-[11px]">
                <span className="text-slate-500">Selected audience</span>
                <span className="font-bold text-blue-600">
                  {statsLoading
                    ? "—"
                    : (form.audience === "all"
                        ? stats?.activeDevices
                        : form.audience === "users"
                          ? stats?.registeredUsers
                          : stats?.guestDevices ?? 0
                      )?.toLocaleString() ?? 0}
                  {" "}device(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSend}
        form={form}
        stats={stats}
        sending={sending}
      />
    </DashboardLayout>
  );
}
