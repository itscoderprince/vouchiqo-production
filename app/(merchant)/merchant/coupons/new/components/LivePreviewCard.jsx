"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Gift,
  Image as ImageIcon,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LivePreviewCard({
  formData = {},
  merchant = {},
  selectedCategoryLabel = "Food & Dining",
}) {
  const offerType = formData.offerType || "code";
  const discountType = formData.discountType || "% Off";
  const val = formData.discountValue;

  // Calculate pricing savings for deal mode
  const origPrice = Number(formData.originalPrice);
  const salePrice = Number(formData.salePrice);
  const hasDealPrices = origPrice > 0 && salePrice > 0 && origPrice > salePrice;
  const dealSavings = hasDealPrices ? origPrice - salePrice : 0;
  const dealSavingsPct = hasDealPrices ? Math.round((dealSavings / origPrice) * 100) : 0;

  // Format main discount display text
  let discountDisplay = "SPECIAL OFFER";
  if (offerType === "deal") {
    if (salePrice > 0) discountDisplay = `₹${salePrice} DEAL`;
    else discountDisplay = "SPECIAL DEAL";
  } else if (discountType === "% Off" && val) {
    discountDisplay = `${val}% OFF`;
  } else if (discountType === "Flat ₹ Off" && val) {
    discountDisplay = `FLAT ₹${val} OFF`;
  } else if (discountType === "BOGO") {
    discountDisplay = "BOGO — BUY 1 GET 1";
  } else if (discountType === "Free Gift") {
    discountDisplay = "FREE GIFT IN-STORE";
  } else if (val) {
    discountDisplay = `${val}`.toUpperCase();
  }

  const validDaysList = Array.isArray(formData.validDays) && formData.validDays.length > 0
    ? formData.validDays.map((d) => d.slice(0, 3)).join(", ")
    : null;

  return (
    <Card className="border-slate-200/90 shadow-md rounded-2xl bg-white p-3.5 space-y-3 text-left font-sans relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-blue-600" /> Live Offer Preview
        </span>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-extrabold px-1.5 py-0.5"
          >
            2:1 Banner Ratio
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5"
          >
            Live Preview
          </Badge>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-xs">
        {/* Banner Image Container with exact 2:1 Aspect Ratio (800x400px) */}
        <div className="w-full aspect-[2/1] bg-slate-900 relative flex items-end p-3 overflow-hidden">
          {formData.image ? (
            <img
              src={formData.image}
              alt="Offer Banner Preview"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
              <div className="text-center p-3">
                <ImageIcon className="w-7 h-7 text-blue-400/40 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-slate-400 block">
                  800×400 Banner Image Preview
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  (Upload 2:1 horizontal image in Section 2)
                </span>
              </div>
            </div>
          )}

          {/* Gradient Overlay for Readable Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <Badge className="bg-blue-600 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 border-0 shadow-sm">
              {offerType === "code" ? "SMART CODE" : offerType === "deal" ? "DIRECT DEAL" : "SPECIAL GIFT"}
            </Badge>
            <span className="text-white text-[10px] font-extrabold bg-slate-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
              {merchant?.businessName || "Store Name"}
            </span>
          </div>

          {/* Bottom Floating Ratio Indicator */}
          <div className="relative z-10 flex items-center justify-between w-full text-white text-[9px] font-bold">
            <span className="bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase text-slate-300">
              2:1 Ratio
            </span>
            <span className="text-emerald-400 font-extrabold">VERIFIED MERCHANT</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3.5 space-y-3">
          {/* Headline & Description */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
              {formData.headline || "Flat 20% off on all Italian Marble Tiles"}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium mt-1 line-clamp-2 leading-relaxed">
              {formData.shortDescription ||
                "Get 20% discount on total invoice amount for all premium tiles."}
            </p>
          </div>

          {/* Offer Mechanics / Pricing Card */}
          {offerType === "code" && (
            <div className="flex items-center justify-between p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-600 font-bold text-[11px]">
                  CODE:{" "}
                  <span className="font-mono text-slate-900 font-black uppercase text-xs tracking-wider bg-white px-1.5 py-0.5 rounded border border-blue-200">
                    {formData.code || "SAVE20"}
                  </span>
                </span>
              </div>
              <span className="text-blue-700 font-black text-xs bg-white px-2 py-0.5 rounded-lg border border-blue-200/80 shadow-2xs">
                {discountDisplay}
              </span>
            </div>
          )}

          {offerType === "deal" && (
            <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> In-Store Offer Price:
                </span>
                <span className="text-emerald-700 font-black text-sm">
                  ₹{salePrice || 1499}
                </span>
              </div>
              {origPrice > 0 && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Regular MRP: <span className="line-through text-slate-400">₹{origPrice}</span></span>
                  {hasDealPrices && (
                    <span className="text-emerald-700 font-extrabold bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                      Save ₹{dealSavings} ({dealSavingsPct}% OFF)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {offerType === "special" && (
            <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-purple-900 text-[11px]">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-purple-600" /> {formData.specialOfferType || "Special Offer / Gift"}
                </span>
                <span className="text-purple-700 font-black text-[10px] bg-white px-1.5 py-0.5 rounded border border-purple-200">
                  {formData.redemptionMethod?.slice(0, 18) || "In-Store Offer"}
                </span>
              </div>
              {formData.offerDetails && (
                <p className="text-[10px] text-purple-950 font-medium line-clamp-2">
                  {formData.offerDetails}
                </p>
              )}
            </div>
          )}

          {/* Min Order Value & Max Cap Restrictions */}
          {(formData.minOrderValue || formData.maxCap) && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[10px] font-bold text-slate-700">
              {formData.minOrderValue ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Min Purchase: <span className="text-slate-900 font-extrabold">₹{formData.minOrderValue}</span>
                </span>
              ) : <span />}
              {formData.maxCap ? (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Max Cap: <span className="text-slate-900 font-extrabold">₹{formData.maxCap}</span>
                </span>
              ) : null}
            </div>
          )}

          {/* Validity Period & Timing Details */}
          {(formData.startDate || formData.endDate || formData.validHours || validDaysList) && (
            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[10px] space-y-1.5">
              {(formData.startDate || formData.endDate) && (
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3 text-blue-600" /> Validity:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today"}
                    {" – "}
                    {formData.endDate ? new Date(formData.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "31 Aug 2026"}
                  </span>
                </div>
              )}
              {validDaysList && (
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span className="text-slate-400">Valid Days:</span>
                  <span className="font-extrabold text-blue-800 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                    {validDaysList}
                  </span>
                </div>
              )}
              {formData.validHours && (
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-blue-600" /> Store Hours:
                  </span>
                  <span className="font-bold text-blue-700">
                    {formData.validHours}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Demographic & Category Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3 h-3 text-blue-600" />
              {merchant?.address?.city || "Ranchi"} (In-Store)
            </span>
            <span className="text-slate-900 font-extrabold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
              <Tag className="w-3 h-3 text-blue-600" />
              {selectedCategoryLabel}
            </span>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 rounded-xl shadow-sm cursor-default flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Get In-Store Claim Code</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
