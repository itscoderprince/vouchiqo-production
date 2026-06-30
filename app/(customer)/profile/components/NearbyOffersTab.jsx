"use client";

import { MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NearbyOffersTab() {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-6 text-left">
      <div className="space-y-1.5">
        <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider">
          Nearby Deals Map
        </h3>
        <p className="text-xs text-brand-subtext leading-normal">
          Explore local deals around Ranchi, Patna, and Delhi. Filter stores by
          distance and view locations instantly.
        </p>
      </div>

      {/* Custom visual mockup card for Map redirect */}
      <div className="border border-brand-border rounded-xl overflow-hidden bg-brand-surface p-6 text-center space-y-5 max-w-xl mx-auto shadow-sm">
        <div className="w-14 h-14 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-full flex items-center justify-center mx-auto">
          <MapIcon className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-brand-navy">
            Interactive Leaflet Map View
          </h4>
          <p className="text-[10px] text-brand-subtext max-w-xs mx-auto leading-normal">
            Toggle dynamic radius filters (1km, 3km, 5km) and discover exclusive
            local physical store coupons.
          </p>
        </div>
        <Button
          asChild
          className="btn-primary py-2 px-5 text-xs font-bold h-auto border-0 cursor-pointer text-white shadow-none hover:bg-brand-blue/90"
        >
          <a href="/nearby-offers">Launch Map Explorer →</a>
        </Button>
      </div>
    </div>
  );
}
