"use client";

import {
  AlertTriangle,
  Bookmark,
  History,
  MapPin,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
// Layout & Global Components
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import ActivityTab from "./components/ActivityTab";
import NearbyOffersTab from "./components/NearbyOffersTab";
import SavedDealsTab from "./components/SavedDealsTab";
// Modular Tab Components
import SavingsTab from "./components/SavingsTab";
import SettingsTab from "./components/SettingsTab";
import WalletTab from "./components/WalletTab";

const DONUT_COLORS = [
  "#2563eb",
  "#1E4FAF",
  "#2563eb",
  "#FFB020",
  "#A855F7",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
];

// Simple client-side CSS Confetti particles generator
function ConfettiOverlay({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => {
        const left = Math.random() * 100;
        const size = Math.random() * 8 + 6;
        const delay = Math.random() * 3;
        const duration = Math.random() * 2 + 2;
        const rotation = Math.random() * 360;
        const color =
          DONUT_COLORS[Math.floor(Math.random() * DONUT_COLORS.length)];

        return (
          <div
            key={i}
            className="absolute top-[-20px] rounded-sm opacity-90 animate-fall"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              transform: `rotate(${rotation}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function ProfileContent() {
  const { user: authUser } = useUser();
  const [activeTab, setActiveTab] = useState("savings");
  const [loading, setLoading] = useState(true);
  const [savingsData, setSavingsData] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    interests: [],
    emailNotifications: true,
    smsNotifications: false,
    expiryAlerts: true,
  });
  const [savedClaims, setSavedClaims] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Confetti triggering state
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [copiedShareCard, setCopiedShareCard] = useState(false);

  // Selected Saved coupon modal state
  const [selectedSavedCoupon, setSelectedSavedCoupon] = useState(null);

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Load Tab from URL Parameter dynamically
  useEffect(() => {
    const validTabs = [
      "savings",
      "saved",
      "wallet",
      "activity",
      "nearby",
      "settings",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync activeTab to URL search params
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("tab", tabName);
      window.history.pushState({}, "", url);
    }
  };

  // Main data load
  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch Savings / redemptions
      const savingsRes = await fetch("/api/users/savings");
      if (savingsRes.ok) {
        const payload = await savingsRes.json();
        if (payload.success) {
          setSavingsData(payload.data);
          checkAndTriggerConfetti(payload.data.milestones);
        }
      }

      // Fetch User settings profile
      const userRes = await fetch("/api/users");
      if (userRes.ok) {
        const payload = await userRes.json();
        if (payload.success) {
          const { user, profile } = payload.data;
          setProfileData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || user.phoneNumber || "",
            city: profile?.location?.city || "",
            state: profile?.location?.state || "",
            interests: profile?.interests || [],
            emailNotifications: profile?.emailNotifications ?? true,
            smsNotifications: profile?.smsNotifications ?? false,
            expiryAlerts: profile?.expiryAlerts ?? true,
          });
        }
      }

      // Fetch active saved claims
      const claimsRes = await fetch("/api/claims?status=active");
      if (claimsRes.ok) {
        const payload = await claimsRes.json();
        if (payload.success) {
          const mapped = (payload.data.claims || []).map((claim) => ({
            ...claim.couponId,
            claimId: claim._id,
          }));
          setSavedClaims(mapped);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync profile data.");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only load profile data on initial mount
  useEffect(() => {
    loadData();
  }, []);

  const checkAndTriggerConfetti = (milestones) => {
    try {
      const celebrated = JSON.parse(
        localStorage.getItem("vouchiqo_celebrated_milestones") || "[]",
      );
      const newlyUnlocked = [];
      milestones.forEach((m) => {
        if (m.achieved && !celebrated.includes(m.id)) {
          newlyUnlocked.push(m.id);
        }
      });
      if (newlyUnlocked.length > 0) {
        setTriggerConfetti(true);
        localStorage.setItem(
          "vouchiqo_celebrated_milestones",
          JSON.stringify([...celebrated, ...newlyUnlocked]),
        );
        setTimeout(() => setTriggerConfetti(false), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          location: {
            city: profileData.city,
            state: profileData.state,
            country: "IN",
          },
          interests: profileData.interests,
          emailNotifications: profileData.emailNotifications,
          smsNotifications: profileData.smsNotifications,
          expiryAlerts: profileData.expiryAlerts,
        }),
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success) {
          toast.success("Profile saved!");
          loadData(); // reload
        } else {
          toast.error(payload.message || "Failed to update profile.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Remove saved coupon claim
  const handleRemoveClaim = async (e, claimId) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmRemove = window.confirm("Remove this coupon from bookmarks?");
    if (!confirmRemove) return;
    try {
      const res = await fetch(`/api/claims/${claimId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Bookmark removed.");
        setSavedClaims(savedClaims.filter((c) => c.claimId !== claimId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Claim/Redeem from Saved Tab
  const handleRedeemConfirm = async (couponId) => {
    const couponObj = savedClaims.find((c) => c._id === couponId);
    if (!couponObj || !couponObj.claimId) throw new Error("Claim ID not found");

    const res = await fetch("/api/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId: couponObj.claimId, couponId: couponId }),
    });

    if (res.ok) {
      const payload = await res.json();
      if (payload.success) {
        toast.success("Voucher claimed!");
        loadData();
        return payload.data.couponCode;
      }
    }
    throw new Error("Failed to redeem coupon.");
  };

  const handleShareSavings = () => {
    const saved = savingsData?.kpis?.totalSavedMonth || 0;
    const shareText = `I saved ₹${saved.toLocaleString("en-IN")} this month using Vouchiqo! 🔴 Find verified coupon codes and save. https://vouchiqo.com`;
    navigator.clipboard.writeText(shareText);
    setCopiedShareCard(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedShareCard(false), 3000);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!savingsData || !savingsData.recentTransactions) return;
    const headers = [
      "Date",
      "Brand",
      "Coupon Code",
      "Original Price",
      "Discount Applied",
      "Amount Paid",
      "Amount Saved",
      "Category",
    ];
    const rows = savingsData.recentTransactions.map((t) => [
      t.date,
      t.brand,
      t.code,
      t.originalPrice,
      t.discountApplied,
      t.amountPaid,
      t.amountSaved,
      t.category,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((val) => `"${val.replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Vouchiqo_Savings_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Shopping preference tag
  const handleInterestToggle = (category) => {
    const isSel = profileData.interests.includes(category);
    const nextInterests = isSel
      ? profileData.interests.filter((c) => c !== category)
      : [...profileData.interests, category];
    setProfileData({ ...profileData, interests: nextInterests });
  };

  const profileUsername = authUser?.name ? authUser.name.split(" ")[0] : "User";

  if (loading && !savingsData) {
    return (
      <DashboardLayout
        title={`${profileUsername} Profile`}
        user={authUser || { name: "User", role: "customer" }}
      >
        <DashboardSkeleton mode="profile" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${profileUsername} Profile`}
      user={
        authUser || {
          name: profileData.name || "Sarah Jenkins",
          role: "customer",
        }
      }
    >
      <ConfettiOverlay active={triggerConfetti} />

      {/* Tabs removed to use Sidebar Navigation instead */}

      {/* TAB CONTENT PANEL */}
      <div className="space-y-6 pt-2">
        {activeTab === "savings" && savingsData && (
          <SavingsTab
            savingsData={savingsData}
            handleShareSavings={handleShareSavings}
            copiedShareCard={copiedShareCard}
            handleExportCSV={handleExportCSV}
          />
        )}

        {activeTab === "saved" && (
          <SavedDealsTab
            savedClaims={savedClaims}
            handleRemoveClaim={handleRemoveClaim}
            setSelectedSavedCoupon={setSelectedSavedCoupon}
          />
        )}

        {activeTab === "wallet" && <WalletTab />}

        {activeTab === "activity" && <ActivityTab />}

        {activeTab === "nearby" && <NearbyOffersTab />}

        {activeTab === "settings" && (
          <SettingsTab
            profileData={profileData}
            setProfileData={setProfileData}
            savingSettings={savingSettings}
            handleSaveSettings={handleSaveSettings}
            setShowDeleteModal={setShowDeleteModal}
            handleInterestToggle={handleInterestToggle}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedSavedCoupon && (
        <ConfirmationModal
          coupon={selectedSavedCoupon}
          onClose={() => setSelectedSavedCoupon(null)}
          onConfirm={handleRedeemConfirm}
        />
      )}

      {/* Account deletion modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-4 animate-fade-in-scale">
          <div className="bg-white border border-brand-border rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-brand-error/15 text-brand-error flex items-center justify-center mx-auto border border-brand-error/30">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-brand-navy">
                Delete Account?
              </h3>
              <p className="text-xs text-brand-subtext leading-relaxed">
                This will permanently delete your user profile and wipe all
                tracked savings. This action is irreversible.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="btn-tertiary flex-1 py-2 text-xs font-bold border-brand-border h-auto cursor-pointer shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  toast.error("Action restricted in demo.");
                  setShowDeleteModal(false);
                }}
                className="bg-brand-error hover:bg-red-700 text-white flex-1 py-2 text-xs font-bold border-0 h-auto cursor-pointer shadow-none"
              >
                Delete Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function ProfileHub() {
  return (
    <Suspense fallback={<DashboardSkeleton mode="profile" />}>
      <ProfileContent />
    </Suspense>
  );
}
