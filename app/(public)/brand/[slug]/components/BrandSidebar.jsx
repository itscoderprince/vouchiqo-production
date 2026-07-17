"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useMemo, useState } from "react";

/**
 * Brand sidebar: about store, FAQ accordion, contact details, share widget.
 */
export default function BrandSidebar({ merchant, copiedLink, onShare }) {
  const faqs = useMemo(() => {
    const brand = merchant.businessName || "this brand";
    return [
      {
        q: `How do I apply a discount coupon for ${brand}?`,
        a: `Select a verified coupon from our page, click 'Get Coupon Code' to copy it, then paste it into the coupon/promo code entry box on ${brand}'s official website during checkout.`,
      },
      {
        q: `Are all coupons on Vouchiqo verified?`,
        a: `Yes! Every discount code and offer listed on Vouchiqo is manually checked and verified by our deal hunters daily to ensure you always get working discounts.`,
      },
      {
        q: `What can I do if a coupon has expired?`,
        a: `If a coupon has expired, you can vote to revive it by clicking 'Revive Coupon'. Our team monitors these requests and reaches out to ${brand} to secure new active promotional offers.`,
      },
    ];
  }, [merchant.businessName]);

  return (
    <div className="lg:col-span-4 space-y-6 text-left">
      {/* About store */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
          About {merchant.businessName}
        </h3>
        <p className="text-[13px] text-[#6b7280] leading-relaxed">
          {merchant.longDescription ||
            merchant.description ||
            "No description provided for this brand storefront."}
        </p>
        {merchant.website && (
          <a
            href={merchant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs font-extrabold text-[#3e80dd] hover:underline flex items-center gap-1"
          >
            <span>Visit Official Store Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
        <FaqAccordion faqs={faqs} />
      </div>

      {/* Contact Details */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
          Store Location &amp; Contact
        </h3>
        <div className="space-y-3 text-xs text-[#4b5563] font-semibold">
          <div className="flex gap-2">
            <MapPin className="w-4 h-4 text-[#3e80dd] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[#6b7280]">
              {merchant.location?.address && `${merchant.location.address}, `}
              {merchant.location?.city ? (
                <>
                  {merchant.location.city},{" "}
                  {merchant.location.state || "Jharkhand"}
                  {merchant.location?.pincode &&
                    `, ${merchant.location.pincode}`}
                </>
              ) : (
                "Ranchi, Jharkhand, India"
              )}
            </p>
          </div>
          {merchant.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#3e80dd] flex-shrink-0" />
              <span className="text-[#6b7280]">{merchant.contactPhone}</span>
            </div>
          )}
          {merchant.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#3e80dd] flex-shrink-0" />
              <span className="text-[#6b7280]">{merchant.contactEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Share widget */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
          Share {merchant.businessName} Offers
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            type="button"
            className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 border-0 cursor-pointer transition-colors"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#2f855a]" />
                <span className="text-[#2f855a]">Copied Link</span>
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
    </div>
  );
}

/** Internal FAQ accordion component */
function FaqAccordion({ faqs }) {
  const [expandedFaq, setExpandedFaq] = useState(0);

  return (
    <>
      <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
        Frequently Asked Questions
      </h3>
      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isExpanded = expandedFaq === idx;
          return (
            <div
              key={idx}
              className="border-b border-[#f1f5f9] last:border-0 pb-3 last:pb-0"
            >
              <button
                onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                type="button"
                className="w-full flex justify-between items-start text-left font-bold text-[13px] text-[#191f2e] hover:text-[#3e80dd] transition-colors border-0 bg-transparent cursor-pointer p-0"
              >
                <span className="pr-4">{faq.q}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#6b7280]" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#6b7280]" />
                )}
              </button>
              {isExpanded && (
                <p className="text-xs text-[#6b7280] leading-relaxed mt-2 pl-1 font-medium">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
