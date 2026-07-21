"use client";

import {
  Bell,
  Check,
  Flame,
  Globe,
  Mail,
  Send,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddOnsTab() {
  // Email Blast State
  const [emailHeadline, setEmailHeadline] = useState("🔥 Flat 20% Off Summer Blast Offer!");
  const [emailBody, setEmailBody] = useState("Exclusive deals valid this week at Marbella Tiles & Sanitary Ranchi.");

  // Push Notification State (9am - 9pm IST validation)
  const [pushText, setPushText] = useState("🔥 Special Deal Alert! Claim your 20% discount code now on Vouchiqo!");
  const [pushSendTime, setPushSendTime] = useState("10:30");

  // Ticker Slots State (3 max limit)
  const [tickerSlots, setTickerSlots] = useState([
    { id: 1, name: "Marbella Tiles Summer Sale", merchant: "Marbella Tiles", active: true },
    { id: 2, name: "Burger House BOGO Deal", merchant: "Burger House", active: true },
    { id: 3, name: "JewelCraft Diwali Offer", merchant: "JewelCraft Ranchi", active: true },
  ]);

  const handleSchedulePush = () => {
    const hour = parseInt(pushSendTime.split(":")[0], 10);
    if (hour < 9 || hour >= 21) {
      toast.error("Push notifications are restricted to 9:00 AM – 9:00 PM IST window.");
      return;
    }
    toast.success(`Push notification scheduled via MSG91 Template 8 for ${pushSendTime} IST!`);
  };

  const handleSendTestEmail = () => {
    toast.success("Test email blast sent via SendGrid Template E-9 to admin!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      {/* 1. DEDICATED EMAIL BLAST (₹799) */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dedicated Email Blast (₹799)
            </h3>
          </div>
          <Badge className="bg-blue-50 text-blue-700 font-bold border-0 text-[10px]">
            SendGrid E-9
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Email Campaign Headline</Label>
            <Input
              type="text"
              value={emailHeadline}
              onChange={(e) => setEmailHeadline(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-medium"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Email Body Copy</Label>
            <Textarea
              rows={3}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="bg-white border-slate-200 text-xs rounded-xl font-medium"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSendTestEmail} variant="outline" className="text-xs font-bold rounded-xl h-8">
              Send Test Email
            </Button>
            <Button size="sm" onClick={() => toast.success("Email blast scheduled!")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 rounded-xl cursor-pointer">
              Schedule Blast
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. PUSH NOTIFICATION (₹599) */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Push Notification (₹599)
            </h3>
          </div>
          <Badge className="bg-orange-50 text-orange-700 font-bold border-0 text-[10px]">
            MSG91 Template 8
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Push Text (Max 100 chars)</Label>
            <Input
              type="text"
              maxLength={100}
              value={pushText}
              onChange={(e) => setPushText(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-medium"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Send Time (9:00 AM – 9:00 PM IST)</Label>
            <Input
              type="time"
              value={pushSendTime}
              onChange={(e) => setPushSendTime(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-mono font-bold"
            />
          </div>
          <Button size="sm" onClick={handleSchedulePush} className="bg-[#e85d04] hover:bg-orange-600 text-white font-bold text-xs h-8 rounded-xl cursor-pointer">
            Schedule MSG91 Push
          </Button>
        </div>
      </Card>

      {/* 3. HOMEPAGE TICKER PRIORITY (₹999 / 3 DAYS) */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4 md:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Homepage Ticker Priority Slots (Max 3 Active Slots)
            </h3>
          </div>
          <Badge className="bg-amber-50 text-amber-800 font-bold border-0 text-xs">
            {tickerSlots.length} / 3 Occupied
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tickerSlots.map((slot, idx) => (
            <div key={slot.id} className="p-3.5 border border-amber-200/80 rounded-2xl bg-amber-50/40 space-y-1">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                Priority Slot #{idx + 1}
              </span>
              <span className="text-xs font-bold text-slate-900 block">{slot.name}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{slot.merchant}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
