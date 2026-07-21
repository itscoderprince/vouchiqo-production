"use client";

import { Lock, Plus, RefreshCw, Rocket, Tag } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ACTIONS = [
  {
    id: "post-offer",
    label: "+ Post New Offer",
    href: "/merchant/coupons/new",
    icon: Plus,
    color: "bg-[#0f172a] hover:bg-slate-800 text-white",
    locked: false,
  },
  {
    id: "post-deal",
    label: "+ Post New Deal",
    href: "/merchant/coupons/new?type=deal",
    icon: Tag,
    color: "bg-[#0f172a] hover:bg-slate-800 text-white",
    locked: false,
  },
  {
    id: "campaign",
    label: "Launch Campaign",
    href: "/merchant/campaigns",
    icon: Rocket,
    color: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700",
    lockedOnStarter: true,
  },
  {
    id: "revive",
    label: "Revive Expired Offers",
    href: "/merchant/coupons?status=expired",
    icon: RefreshCw,
    color: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700",
    lockedOnStarter: true,
  },
];

export default function QuickActionsCard({ plan = "starter" }) {
  const isStarter = plan === "starter";

  return (
    <Card className="border-[#e2e8f0] shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Quick Actions
        </CardTitle>
        <CardDescription className="text-[11px] font-semibold mt-0.5">
          Common tasks to manage your listings
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const isLocked = isStarter && action.lockedOnStarter;

            if (isLocked) {
              return (
                <div
                  key={action.id}
                  className="relative flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed text-xs font-bold select-none"
                  title="Upgrade to unlock"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{action.label}</span>
                  <Lock className="w-3 h-3 ml-auto shrink-0 opacity-60" />
                </div>
              );
            }

            return (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${action.color}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{action.label}</span>
              </Link>
            );
          })}
        </div>

        {isStarter && (
          <p className="mt-3 text-[10px] text-slate-400 font-semibold text-center">
            Campaign &amp; Revival tools require{" "}
            <Link href="/merchant/billing" className="text-[#e85d04] underline underline-offset-2 font-bold">
              Growth plan or above
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
