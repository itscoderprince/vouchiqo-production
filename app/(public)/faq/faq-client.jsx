"use client";

import {
  ArrowRight,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "General",
      icon: HelpCircle,
      q: "How does Vouchiqo verify coupon codes?",
      a: "We work directly with verified merchants. Code validity keys are integrated with their web stores. We also track client-side checkout conversion logs to ensure no stale discount codes exist.",
    },
    {
      category: "General",
      icon: HelpCircle,
      q: "Is Vouchiqo free to use for customers?",
      a: "Absolutely! Vouchiqo is completely free for members to discover, claim, and save coupons. Merchants pay a small monthly subscription to list campaign dashboards.",
    },
    {
      category: "Revival",
      icon: ShieldCheck,
      q: "What is the Expired Coupon Revival System?",
      a: "If a specific offer has expired, customers can submit a revival vote. When a threshold is met, the system alerts the merchant, offering them conversion projections to incentivize reactivating the deal.",
    },
    {
      category: "Revival",
      icon: ShieldCheck,
      q: "How long does a Coupon Revival take?",
      a: "It depends on the merchant. Once a coupon reaches its revival request threshold, we notify the partner brand automatically. Typically, active merchants respond or reactivate deals within 2 to 5 business days.",
    },
    {
      category: "Merchants",
      icon: CreditCard,
      q: "How do I list my business on Vouchiqo?",
      a: "You can create a Merchant Account via our registration portal. Once your business profile is reviewed and approved by our admin team, you will get access to the merchant dashboard to create campaigns.",
    },
    {
      category: "Merchants",
      icon: CreditCard,
      q: "What billing plans are available for merchants?",
      a: "We offer Growth, Enterprise, and Custom billing plans tailored to your conversion volume. Visit the Merchant Portal or contact our sales team to find the best package for your business.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-brand-navy text-white py-16 px-4 text-center relative overflow-hidden animate-fade-in-scale">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading tracking-tight leading-tight text-white">
            How can we help you?
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Search our Help Center or browse common questions about verified
            discount codes, revival rules, and partner billing.
          </p>

          {/* Search bar */}
          <div className="bg-brand-bg rounded-lg shadow-lg max-w-md mx-auto p-1.5 flex items-center border border-brand-border text-brand-text">
            <Search className="w-4 h-4 text-brand-subtext ml-2 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search help topics or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-brand-text placeholder-brand-subtext font-medium p-0 pl-2 h-auto shadow-none"
            />
          </div>
        </div>
      </section>

      {/* FAQ Accordion Grid */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow animate-fade-in-up stagger-1">
        {filteredFaqs.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            className="w-full bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden"
          >
            {filteredFaqs.map((faq, idx) => {
              const Icon = faq.icon;
              return (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border-b border-brand-border last:border-0"
                >
                  <AccordionTrigger className="p-5 font-heading font-bold text-sm text-brand-navy hover:no-underline hover:bg-brand-surface/40 transition-all text-left flex justify-between items-center">
                    <span className="flex items-center gap-3">
                      <span className="p-1.5 rounded-md bg-brand-blue/5 text-brand-blue">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{faq.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 text-xs text-brand-subtext leading-relaxed border-t border-brand-border/60 pt-4 bg-brand-surface/20">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center py-16 bg-brand-bg border border-brand-border rounded-xl p-8">
            <HelpCircle className="w-12 h-12 text-brand-subtext mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-navy mb-1">
              No matching questions found
            </h3>
            <p className="text-xs text-brand-subtext max-w-xs mx-auto mb-4">
              Try searching with general terms like "coupon", "revival", or
              "payment".
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              className="btn-primary text-xs py-2 px-4 border-0 h-auto cursor-pointer shadow-none"
            >
              Clear Search Query
            </Button>
          </div>
        )}

        {/* Support CTA card */}
        <div className="mt-12 bg-brand-navy text-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-md">
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <h3 className="text-lg font-bold font-heading flex items-center justify-center md:justify-start gap-2">
              <MessageSquare className="w-5 h-5 text-brand-warning" />
              <span>Still have questions?</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              Can't find the answers you're looking for? Reach out to our
              dedicated support team and we will get back to you shortly.
            </p>
          </div>
          <Button
            asChild
            className="btn-primary text-xs py-2.5 px-6 border-0 h-auto cursor-pointer shadow-none relative z-10"
          >
            <Link href="/contact">
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
