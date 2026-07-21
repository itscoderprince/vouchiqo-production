"use client";

import { Bell, Clock, Mail, Share2, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function StepPromotion({
  campaignData,
  setCampaignData,
  targetAudiences,
  onBack,
  onNext,
}) {
  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Promotion Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Schedule dates using Shadcn DatePicker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Start Date *
            </Label>
            <DatePicker
              value={campaignData.startDate}
              onChange={(val) => setCampaignData({ ...campaignData, startDate: val })}
              placeholder="Select start date"
              iconColor="text-blue-600"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Clock className="w-3.5 h-3.5 text-rose-600" /> End Date *
            </Label>
            <DatePicker
              value={campaignData.endDate}
              onChange={(val) => setCampaignData({ ...campaignData, endDate: val })}
              placeholder="Select end date"
              iconColor="text-rose-600"
            />
          </div>
        </div>

        {/* Channel Toggle Cards */}
        <div className="space-y-3">
          {/* Homepage Featured Slot */}
          <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Homepage Featured Slot</span>
                <span className="text-[11px] text-slate-500 font-medium">Pin your campaign to Vouchiqo homepage ticker</span>
              </div>
            </div>
            <Switch
              checked={campaignData.featuredSlot}
              onCheckedChange={(val) => setCampaignData({ ...campaignData, featuredSlot: val })}
            />
          </div>

          {/* Push Notification */}
          <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Push Notification</span>
                <span className="text-[11px] text-slate-500 font-medium">Alert Vouchiqo app &amp; web users</span>
              </div>
            </div>
            <Switch
              checked={campaignData.pushNotification}
              onCheckedChange={(val) => setCampaignData({ ...campaignData, pushNotification: val })}
            />
          </div>

          {/* Newsletter Inclusion */}
          <div className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Newsletter Inclusion</span>
                <span className="text-[11px] text-slate-500 font-medium">Feature in next Vouchiqo category email blast</span>
              </div>
            </div>
            <Switch
              checked={campaignData.newsletterInclusion}
              onCheckedChange={(val) => setCampaignData({ ...campaignData, newsletterInclusion: val })}
            />
          </div>

          {/* Social Sharing */}
          <div className="p-4 border border-slate-200/80 rounded-2xl space-y-3 bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Social Sharing</span>
                  <span className="text-[11px] text-slate-500 font-medium">Generate a public campaign page link</span>
                </div>
              </div>
              <Switch
                checked={campaignData.socialSharing}
                onCheckedChange={(val) => setCampaignData({ ...campaignData, socialSharing: val })}
              />
            </div>
            {campaignData.socialSharing && (
              <Input
                type="text"
                readOnly
                value={`https://vouchiqo.com/c/${campaignData.name ? campaignData.name.toLowerCase().replace(/\s+/g, "-") : "your-campaign"}`}
                className="bg-slate-50 border-slate-200 font-mono text-[11px] text-slate-600 h-9 rounded-xl"
              />
            )}
          </div>
        </div>

        {/* Target Audience Radio Pills Row */}
        <div className="space-y-2 pt-2">
          <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Target Audience
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {targetAudiences.map((aud) => {
              const isSelected = campaignData.audience === aud.id;
              return (
                <label
                  key={aud.id}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    isSelected
                      ? "bg-orange-50/70 border-[#e85d04] text-slate-900 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    checked={isSelected}
                    onChange={() => setCampaignData({ ...campaignData, audience: aud.id })}
                    className="accent-[#e85d04] w-3.5 h-3.5"
                  />
                  <span>{aud.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 3 Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-slate-700 border-slate-200 text-xs font-bold rounded-xl"
        >
          &lt; Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#e85d04] hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer"
        >
          Next &gt;
        </Button>
      </div>
    </Card>
  );
}
