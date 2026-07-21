"use client";

import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SidebarSection({
  merchant,
  openStatus,
  faqs,
  copiedLink,
  handleShare,
}) {
  const fontStyle = { fontFamily: "var(--font-inter), Inter, sans-serif" };

  return (
    <div className="lg:col-span-4 space-y-4 text-left" style={fontStyle}>
      {/* About store */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-50 mb-3">
          About {merchant.businessName}
        </h3>
        <p className="text-[13px] text-slate-600 leading-relaxed font-normal">
          {(() => {
            const text = merchant.longDescription || merchant.description;
            if (text && text.trim().length > 20 && !text.includes("sfsf")) {
              return text;
            }
            return `Welcome to ${merchant.businessName}! Explore the latest verified discount coupons, promo codes, and exclusive store offers. Save more on every purchase with real, tested deals curated daily for you.`;
          })()}
        </p>
        {merchant.website && (
          <a
            href={merchant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Visit official website
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Operating Hours */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-50 mb-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Operating Hours
          </h3>
          <span className={`text-[11px] font-medium ${openStatus.color}`}>
            ● {openStatus.label}
          </span>
        </div>
        <div className="space-y-1.5">
          {merchant.operatingHours ? (
            Object.entries(merchant.operatingHours).map(([day, hrs]) => (
              <div
                key={day}
                className="flex justify-between text-[12px] text-gray-500 font-normal"
              >
                <span className="capitalize font-medium text-gray-700">
                  {day}
                </span>
                <span>
                  {hrs.closed ? "Closed" : `${hrs.open} – ${hrs.close}`}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[12px] text-gray-400 font-normal">
              Hours not specified
            </p>
          )}
        </div>
      </div>

      {/* Store Location */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-50 mb-3">
          Location
        </h3>
        <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-100 bg-gray-50 mb-3">
          <iframe
            title="Store Map Location"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={
              merchant.location?.coordinates?.lat
                ? `https://maps.google.com/maps?q=${merchant.location.coordinates.lat},${merchant.location.coordinates.lng}&z=14&output=embed`
                : merchant.location?.city
                  ? `https://maps.google.com/maps?q=${encodeURIComponent(`${merchant.location.city}, ${merchant.location.state || "India"}`)}&z=13&output=embed`
                  : `https://maps.google.com/maps?q=23.3441,85.3096&z=13&output=embed`
            }
            allowFullScreen
          />
        </div>
        <div className="space-y-2 text-[12px] text-gray-500 font-normal">
          <div className="flex gap-2 items-start">
            <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {merchant.location?.address && `${merchant.location.address}, `}
              {merchant.location?.city
                ? `${merchant.location.city}, ${merchant.location.state || "Jharkhand"}${merchant.location?.pincode ? ` - ${merchant.location.pincode}` : ""}`
                : "Ranchi, Jharkhand, India"}
            </p>
          </div>

          {merchant.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>{merchant.contactPhone}</span>
            </div>
          )}

          {merchant.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>{merchant.contactEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-50 mb-1">
          FAQs
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border-b border-gray-50 last:border-0"
            >
              <AccordionTrigger className="text-left font-medium text-[13px] text-gray-800 hover:text-blue-600 hover:no-underline py-2.5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[12px] text-gray-500 leading-relaxed pb-3 font-normal">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Share */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-50 mb-3">
          Share Deals
        </h3>
        <button
          onClick={handleShare}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-[13px] font-medium py-2.5 px-4 rounded-lg border border-gray-200 cursor-pointer transition-colors text-gray-700 hover:text-blue-600"
        >
          {copiedLink ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Page Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
