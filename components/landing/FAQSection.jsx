"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOME_FAQS } from "@/utils/home-data";

export function FaqSection() {
  return (
    <section className="py-16 px-4 max-w-3xl mx-auto w-full animate-fade-in-up stagger-1">
      <h2 className="text-2xl font-bold font-heading text-brand-navy text-center tracking-tight mb-8">
        Frequently Asked Questions
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full bg-brand-bg border border-brand-border rounded-xl shadow-sm animate-fade-in-scale"
      >
        {HOME_FAQS.map((faq, idx) => (
          <AccordionItem key={idx} value={`faq-${idx}`}>
            <AccordionTrigger className="p-5 font-heading font-bold text-sm text-brand-navy hover:no-underline transition-all">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 text-xs text-brand-subtext leading-relaxed border-t border-brand-border/60 pt-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
