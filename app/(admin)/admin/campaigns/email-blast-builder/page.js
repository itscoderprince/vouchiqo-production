"use client";

import {
  ArrowLeft,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Mail,
  Send,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EmailBlastBuilderPage() {
  const [headline, setHeadline] = useState(
    "Pre-Diwali Grand Renovation Sale — Flat 20% OFF!",
  );
  const [description, setDescription] = useState(
    "Get 20% discount on all imported Italian marble slabs & bath fittings. Exclusive pre-booking for Diwali home upgrades.",
  );
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
  );
  const [offerCode, setOfferCode] = useState("MARBLE20");
  const [scheduledTime, setScheduledTime] = useState("2026-07-25T10:00");
  const [targetCategory, setTargetCategory] = useState(
    "Home Improvement & Living",
  );
  const [adminTestEmail, setAdminTestEmail] = useState("admin@vouchiqo.com");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSendTestCopy = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      toast.success(
        `Test copy sent to ${adminTestEmail} via SendGrid Template E-9!`,
      );
    }, 1200);
  };

  const handleScheduleSendGridCampaign = () => {
    toast.success(
      "SendGrid campaign scheduled successfully using Template E-9!",
    );
  };

  return (
    <DashboardLayout
      title="Dedicated Email Blast Builder (Template E-9)"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="p-1.5 h-auto rounded-xl">
              <Link href="/admin/campaigns/queue">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" /> Dedicated Email
                  Blast Builder (₹799 Add-On)
                </h1>
                <Badge className="bg-blue-100 text-blue-800 text-[9px] font-bold border-0">
                  SendGrid Template E-9
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Targeting opt-in subscribers in{" "}
                <strong>{targetCategory}</strong> • Default send = Campaign
                Go-Live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSendTestCopy}
              disabled={isSendingTest}
              className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 mr-1 text-[#e85d04]" />
              <span>
                {isSendingTest
                  ? "Sending Test..."
                  : "Send Test Copy to My Email"}
              </span>
            </Button>

            <Button
              onClick={handleScheduleSendGridCampaign}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow-xs"
            >
              Schedule SendGrid Campaign →
            </Button>
          </div>
        </div>

        {/* 2-COLUMN BUILDER: LEFT (6 COLS - EDITABLE FIELDS), RIGHT (6 COLS - RENDERED HTML PREVIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: EDITABLE BUILDER FORM */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Email Content &amp; Schedule Settings
              </h3>

              {/* Pre-populated Headline (Editable) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />{" "}
                  Pre-Populated Campaign Headline *
                </Label>
                <Input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="bg-white border-slate-200 text-xs h-10 rounded-xl font-bold"
                />
              </div>

              {/* Pre-populated Description (Editable) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Campaign
                  Description Text *
                </Label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-slate-200 text-xs rounded-xl leading-relaxed"
                />
              </div>

              {/* Banner Image (Replaceable) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-600" /> Banner
                  Image URL (Replaceable)
                </Label>
                <Input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                />
              </div>

              {/* Offer Code */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Offer
                  Code / Deal Link *
                </Label>
                <Input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                  className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              {/* Scheduled Send Time (Default = Campaign Go-Live) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-rose-600" /> Scheduled Send
                  Time (Default = Campaign Go-Live) *
                </Label>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono font-medium"
                />
              </div>

              {/* Target Audience Opt-In Segment */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-semibold text-blue-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Target Segment: Opted-in subscribers in{" "}
                  <strong>{targetCategory}</strong> (~4,850 users)
                </span>
              </div>
            </Card>
          </div>

          {/* RIGHT: RENDERED HTML EMAIL PREVIEW BOX */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-blue-600" /> Rendered HTML Email
                  Preview (Template E-9)
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                  Live HTML Preview
                </Badge>
              </div>

              {/* Rendered HTML Email Container Mock */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-4 font-sans space-y-4">
                <div className="bg-[#1A3C5E] text-white p-4 rounded-xl text-center">
                  <h3 className="font-black text-lg tracking-tight">
                    Vouch<span className="text-[#e85d04]">iqo</span>
                  </h3>
                  <span className="text-[10px] text-white/70 block uppercase tracking-wider mt-0.5">
                    Exclusive Brand Partner Blast
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-3">
                  <h2 className="font-bold text-slate-900 text-base leading-snug">
                    {headline}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {description}
                  </p>

                  {bannerUrl && (
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-900 relative">
                      <img
                        src={bannerUrl}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 border-2 border-dashed border-[#e85d04] rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Use Promo Code At Counter
                    </span>
                    <span className="font-mono text-lg font-black text-[#e85d04]">
                      {offerCode}
                    </span>
                  </div>

                  <div className="pt-2 text-center">
                    <Button className="bg-[#e85d04] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-default w-full">
                      Claim Discount on Vouchiqo →
                    </Button>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400">
                  © 2026 Vouchiqo • You received this email because
                  you opted into {targetCategory} updates.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
