"use client";

import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  BrandLinksBar,
  getDisplayDomain,
  normalizeExternalUrl,
} from "@/components/shared/SocialLinks";
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
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
        <div>
          <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 mb-2.5">
            About {merchant.businessName}
          </h3>
          <p className="text-[12.5px] text-slate-600 leading-relaxed font-normal">
            {(() => {
              const text = merchant.longDescription || merchant.description;
              if (text && text.trim().length > 20 && !text.includes("sfsf")) {
                return text;
              }
              return `Welcome to ${merchant.businessName}! Explore the latest verified discount offers, promo codes, and exclusive store deals. Save more on every purchase with real, tested deals curated daily for you.`;
            })()}
          </p>
        </div>

        {/* Official Store Website Button */}
        {merchant.website && (
          <a
            href={normalizeExternalUrl(merchant.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 text-blue-700 text-xs font-semibold transition-all group shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Visit Official Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>
        )}

        {/* Official Social Media Channels */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Official Channels
          </span>
          <BrandLinksBar merchant={merchant} showWebsite={false} size="sm" />
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2.5">
          <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Operating Hours
          </h3>
          <span className={`text-[10.5px] font-normal ${openStatus.color}`}>
            ● {openStatus.label}
          </span>
        </div>
        <div className="space-y-1.5">
          {merchant.operatingHours ? (
            Object.entries(merchant.operatingHours).map(([day, hrs]) => {
              const isClosed = hrs?.closed === true || hrs?.isOpen === false;
              const openStr = hrs?.open || hrs?.openTime || "10:00 AM";
              const closeStr = hrs?.close || hrs?.closeTime || "08:00 PM";
              return (
                <div
                  key={day}
                  className="flex justify-between text-[11.5px] text-slate-500 font-normal"
                >
                  <span className="capitalize font-normal text-slate-700">
                    {day}
                  </span>
                  <span>
                    {isClosed ? "Closed" : `${openStr} – ${closeStr}`}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-[11.5px] text-slate-400 font-normal">
              Hours not specified
            </p>
          )}
        </div>
      </div>

      {/* Store Location */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 mb-2.5">
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

          {merchant.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <a
                href={normalizeExternalUrl(merchant.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate font-medium"
              >
                {getDisplayDomain(merchant.website) || "Official Website"}
              </a>
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
