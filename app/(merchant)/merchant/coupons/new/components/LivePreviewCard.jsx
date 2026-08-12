"use client";

import { Eye, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LivePreviewCard({
  formData,
  merchant,
  selectedCategoryLabel,
}) {
  const discountType = formData?.discountType || "% Off";
  const val = formData?.discountValue;

  let discountDisplay = "SPECIAL OFFER";
  if (formData.offerType === "deal" && formData.salePrice) {
    discountDisplay = `₹${formData.salePrice}`;
  } else if (discountType === "% Off" && val) {
    discountDisplay = `${val}% OFF`;
  } else if (discountType === "Flat ₹ Off" && val) {
    discountDisplay = `₹${val} OFF`;
  } else if (discountType === "BOGO") {
    discountDisplay = "BOGO DEAL";
  } else if (discountType === "Free Gift") {
    discountDisplay = "FREE GIFT";
  } else if (val) {
    discountDisplay = `${val}`.toUpperCase();
  }

  return (
    <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-3.5 space-y-3 text-left font-sans relative overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-blue-600" /> Live Offer Preview
        </span>
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200/80 text-[9px] font-bold py-0.5 px-2"
        >
          Live Preview
        </Badge>
      </div>

      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div
          className="h-24 bg-slate-900 relative flex items-end p-2.5 bg-cover bg-center"
          style={{
            backgroundImage: formData.image
              ? `url(${formData.image})`
              : "linear-gradient(to right, #0f172a, #1e293b)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          <div className="relative z-10 flex items-center justify-between w-full">
            <Badge className="bg-blue-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 border-0 shadow-2xs">
              {formData.offerType.toUpperCase()}
            </Badge>
            <span className="text-white text-[10px] font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
              {merchant?.businessName || "Store Name"}
            </span>
          </div>
        </div>

        <div className="p-3 space-y-2.5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
              {formData.headline || "Flat 20% off on all Italian Marble Tiles"}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-2">
              {formData.shortDescription ||
                "Get 20% discount on total invoice amount for all premium tiles."}
            </p>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">
              Code:{" "}
              <span className="font-mono text-slate-900 font-bold uppercase">
                {formData.code || "SAVE20"}
              </span>
            </span>
            <span className="text-blue-600 font-black text-xs">
              {discountDisplay}
            </span>
          </div>

          {(formData.validHours || formData.endDate) && (
            <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-[10px] space-y-1">
              {formData.endDate && (
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span className="text-slate-400">Valid Until:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(formData.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {formData.validHours && (
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span className="text-slate-400">Store Hours:</span>
                  <span className="font-bold text-blue-700">
                    {formData.validHours}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {merchant?.address?.city || "Ranchi"}
            </span>
            <span className="text-slate-700 font-bold flex items-center gap-1">
              <Tag className="w-3 h-3 text-blue-600" />
              {selectedCategoryLabel}
            </span>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 rounded-xl shadow-xs cursor-default">
            Get In-Store Claim Code
          </Button>
        </div>
      </div>
    </Card>
  );
}
