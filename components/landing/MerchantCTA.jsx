import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export const MerchantCTA = React.memo(function MerchantCTA() {
  return (
    <section className="bg-brand-surface text-brand-text py-16 px-4 border-t border-brand-border text-center relative overflow-hidden animate-fade-in-scale">
      <div className="max-w-2xl mx-auto space-y-6 relative z-10 animate-fade-in-up">
        <h2 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight leading-tight">
          Grow Your Business With Vouchiqo
        </h2>
        <p className="text-sm text-brand-subtext leading-relaxed max-w-md mx-auto">
          Stop losing checkouts to broken discount boxes. List verified
          campaigns, manage subscription structures, and track real-time
          conversion rates.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="btn-primary text-xs py-2.5 px-6 border-0 h-auto cursor-pointer shadow-none"
          >
            <Link href="/merchant-register">
              Create Merchant Account
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="btn-tertiary text-xs py-2.5 px-6 cursor-pointer shadow-none h-auto"
          >
            <Link href="/merchant/dashboard">Learn Partner Benefits</Link>
          </Button>
        </div>
      </div>
    </section>
  );
});
