"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TestimonialEditor({
  testimonials,
  newTestimonial,
  setNewTestimonial,
  handleAddTestimonial,
  handleRemoveTestimonial,
}) {
  return (
    <Card className="bg-white border border-brand-border rounded-2xl shadow-sm">
      <CardHeader className="border-b border-brand-border pb-3.5">
        <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-blue" />
          <span>Social Proof Success Stories</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Create new Testimonial */}
        <div className="bg-brand-surface p-4 rounded-xl border border-brand-border/40 space-y-4 text-left">
          <h4 className="text-xs font-black text-brand-navy uppercase tracking-wider">
            Create New Testimonial Story
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
                User (Name & City)
              </label>
              <Input
                placeholder="e.g. Riya K. from Patna"
                value={newTestimonial.user}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    user: e.target.value,
                  })
                }
                className="bg-white text-xs border-brand-border h-9 shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
                Brand Name
              </label>
              <Input
                placeholder="e.g. Starbucks, Zomato"
                value={newTestimonial.brand}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    brand: e.target.value,
                  })
                }
                className="bg-white text-xs border-brand-border h-9 shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
                Savings Offer / Accomplishment
              </label>
              <Input
                placeholder="e.g. Saved ₹1,200 on family dining"
                value={newTestimonial.offer}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    offer: e.target.value,
                  })
                }
                className="bg-white text-xs border-brand-border h-9 shadow-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Testimonial Quote / Story
            </label>
            <Textarea
              placeholder="Tell the story of how they revived their coupon..."
              value={newTestimonial.text}
              onChange={(e) =>
                setNewTestimonial({
                  ...newTestimonial,
                  text: e.target.value,
                })
              }
              rows={2}
              className="bg-white text-xs border-brand-border shadow-none"
            />
          </div>

          <Button
            onClick={handleAddTestimonial}
            className="bg-brand-blue hover:bg-brand-blue/95 text-white text-xs font-bold h-9 px-5 border-0 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-none"
          >
            <Plus className="w-4 h-4" />
            <span>Save Testimonial</span>
          </Button>
        </div>

        {/* Testimonials List */}
        <div className="space-y-3">
          {Array.isArray(testimonials) && testimonials.length > 0 ? (
            testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-brand-border rounded-xl p-4 flex justify-between gap-4 items-start text-xs shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-brand-navy">
                      {t.brand}
                    </span>
                    <span className="text-[10px] text-brand-success font-bold bg-brand-success/5 border border-brand-success/15 px-1.5 py-0.5 rounded">
                      {t.offer}
                    </span>
                  </div>
                  <p className="text-brand-subtext font-semibold italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="text-[10px] font-bold text-slate-500">
                    — {t.user} | {t.date || "Just now"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTestimonial(idx)}
                  className="text-brand-subtext hover:text-brand-error w-8 h-8 rounded hover:bg-brand-surface flex-shrink-0 cursor-pointer shadow-none"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 border border-dashed border-brand-border rounded-xl">
              No testimonial stories added yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
