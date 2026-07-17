"use client";

import { Bell, Heart, MapPin, Phone, Save, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

const TRENDING_CATEGORIES = [
  "Food & Dining",
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Beauty & Skincare",
  "Travel & Hotels",
  "Health & Fitness",
  "Home & Décor",
  "SaaS & Productivity",
  "Local Services",
  "Other Deals",
];

export default function SettingsTab({
  profileData,
  setProfileData,
  savingSettings,
  handleSaveSettings,
  setShowDeleteModal,
  handleInterestToggle,
}) {
  const [phoneError, setPhoneError] = useState("");

  // Strip leading country code if user pastes full number like +919876543210 or 09876543210
  const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const normalized = normalizePhone(e.target.value);
    setProfileData({ ...profileData, phone: normalized });
    if (normalized.length > 0 && normalized.length < 10) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
    } else {
      setPhoneError("");
    }
  };

  const handleFormSubmit = (e) => {
    const ph = profileData.phone;
    if (ph && ph.length !== 10) {
      e.preventDefault();
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (ph && !/^[6-9]\d{9}$/.test(ph)) {
      e.preventDefault();
      setPhoneError("Number must start with 6, 7, 8, or 9.");
      return;
    }
    handleSaveSettings(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 w-full text-left">
      {/* Personal Details */}
      <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm space-y-4">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-1.5">
          <User className="w-4 h-4 text-brand-blue" />
          <span>Personal Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-brand-text">
              Full Name
            </Label>
            <Input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="bg-brand-surface border-brand-border text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-brand-text">
              Email Address
            </Label>
            <Input
              type="email"
              value={profileData.email}
              disabled
              className="bg-brand-surface opacity-60 text-xs cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-text">
              <Phone className="w-3.5 h-3.5 text-brand-blue" />
              Phone Number
            </Label>
            <InputGroup
              className={`bg-brand-surface border rounded-lg h-10 px-1 ${
                phoneError ? "border-red-400" : "border-brand-border"
              }`}
            >
              <InputGroupAddon>
                <span className="text-xs font-bold text-brand-subtext select-none">
                  +91
                </span>
              </InputGroupAddon>
              <InputGroupInput
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={profileData.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                className="text-xs h-full tracking-wider"
              />
            </InputGroup>
            {phoneError && (
              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                {phoneError}
              </p>
            )}
            <p className="text-[9px] text-brand-subtext">
              10-digit mobile number without country code (e.g. 9876543210)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-brand-text">
                City
              </Label>
              <InputGroup className="bg-brand-surface border border-brand-border rounded-lg h-10 px-1">
                <InputGroupAddon>
                  <MapPin className="w-3.5 h-3.5 text-brand-subtext" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Ranchi"
                  value={profileData.city}
                  onChange={(e) =>
                    setProfileData({ ...profileData, city: e.target.value })
                  }
                  className="text-xs h-full"
                />
              </InputGroup>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-brand-text">
                State
              </Label>
              <Input
                type="text"
                placeholder="Jharkhand"
                value={profileData.state}
                onChange={(e) =>
                  setProfileData({ ...profileData, state: e.target.value })
                }
                className="bg-brand-surface border-brand-border text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interest categories selection */}
      <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm space-y-4">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-brand-blue" />
          <span>Trending Categories</span>
        </h3>
        <p className="text-[10px] text-brand-subtext">
          Toggle trending shopping categories below to filter and sort your
          Homepage feed.
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDING_CATEGORIES.map((cat) => {
            const isSel = profileData.interests.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleInterestToggle(cat)}
                className={`text-[9px] font-bold py-1.5 px-3 rounded-full border cursor-pointer transition-all ${
                  isSel
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "bg-transparent border-brand-border text-brand-subtext hover:border-brand-navy"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification settings */}
      <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm space-y-4">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-brand-blue" />
          <span>Notification Settings</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-text block font-heading">
                Email Alerts
              </span>
              <span className="text-[9px] text-brand-subtext">
                Weekly campaigns update notification.
              </span>
            </div>
            <Checkbox
              checked={profileData.emailNotifications}
              onCheckedChange={(c) =>
                setProfileData({
                  ...profileData,
                  emailNotifications: !!c,
                })
              }
            />
          </div>
          <hr className="border-brand-border/60" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-text block font-heading">
                SMS Confirmation
              </span>
              <span className="text-[9px] text-brand-subtext">
                Receive instant claim vouchers via SMS.
              </span>
            </div>
            <Checkbox
              checked={profileData.smsNotifications}
              onCheckedChange={(c) =>
                setProfileData({ ...profileData, smsNotifications: !!c })
              }
            />
          </div>
          <hr className="border-brand-border/60" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-text block font-heading">
                Expiry warnings
              </span>
              <span className="text-[9px] text-brand-subtext">
                Notify 24 hours prior to coupon expiry.
              </span>
            </div>
            <Checkbox
              checked={profileData.expiryAlerts}
              onCheckedChange={(c) =>
                setProfileData({ ...profileData, expiryAlerts: !!c })
              }
            />
          </div>
        </div>
      </div>

      {/* Account deletion warning */}
      <div className="bg-brand-bg border border-brand-border rounded-md p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs font-bold text-brand-text block font-heading">
            Delete Account
          </span>
          <span className="text-[9px] text-brand-subtext">
            Permanently wipe credentials and savings records.
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs font-bold border-brand-error text-brand-error hover:bg-brand-error/5 flex items-center gap-1 px-3 h-9 cursor-pointer shadow-none"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </Button>
      </div>

      <Button
        type="submit"
        disabled={savingSettings}
        className="btn-primary w-full py-3 text-xs font-bold border-0 h-auto cursor-pointer shadow-md text-white flex items-center justify-center gap-1.5 hover:bg-brand-blue/90"
      >
        <Save className="w-4 h-4" />
        <span>{savingSettings ? "Saving Settings..." : "Save Settings"}</span>
      </Button>
    </form>
  );
}
