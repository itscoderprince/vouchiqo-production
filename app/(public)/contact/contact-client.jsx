"use client";

import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
    toast.success("Support request sent successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full flex-grow grid grid-cols-1 md:grid-cols-5 gap-12 items-start animate-fade-in-up">
        {/* Left Side: Contact Info */}
        <section className="md:col-span-2 space-y-8 animate-slide-in-left">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold font-heading text-brand-navy tracking-tight leading-tight">
              Get in touch
            </h1>
            <p className="text-xs text-brand-subtext leading-relaxed font-medium">
              Have questions about claim verification, coupon revival, or
              partner billing plans? Fill out the form or reach out via our
              direct channels.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-lg border border-brand-border/40">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Email Address
                </h3>
                <p className="text-sm font-semibold text-brand-text">
                  support@vouchiqo.com
                </p>
                <p className="text-[10px] text-brand-subtext">
                  Estimated reply within 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-lg border border-brand-border/40">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Call Support
                </h3>
                <p className="text-sm font-semibold text-brand-text">
                  +1 (555) 839-2910
                </p>
                <p className="text-[10px] text-brand-subtext">
                  Mon-Fri from 9:00 AM to 5:00 PM EST
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-lg border border-brand-border/40">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Headquarters
                </h3>
                <p className="text-sm font-semibold text-brand-text">
                  Vouchiqo Technologies Corp.
                </p>
                <p className="text-[10px] text-brand-subtext">
                  100 Broadway St, New York, NY 10005
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Form Panel */}
        <section className="md:col-span-3 bg-brand-bg border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-scale stagger-1">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-brand-success mx-auto animate-float" />
              <h2 className="text-xl font-bold font-heading text-brand-navy">
                Thank you for reaching out!
              </h2>
              <p className="text-xs text-brand-subtext max-w-sm mx-auto leading-relaxed">
                Your support request has been received. One of our support
                representatives will contact you shortly via email at{" "}
                <span className="font-semibold text-brand-text">
                  {formData.email}
                </span>
                .
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                  });
                }}
                className="btn-primary text-xs py-2.5 px-6 border-0 h-auto cursor-pointer shadow-none"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Full Name <span className="text-brand-error">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-brand-border bg-brand-surface text-xs h-10 px-3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Email Address <span className="text-brand-error">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-brand-border bg-brand-surface text-xs h-10 px-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Subject
                </label>
                <Input
                  type="text"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="border-brand-border bg-brand-surface text-xs h-10 px-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Message Details <span className="text-brand-error">*</span>
                </label>
                <Textarea
                  required
                  rows={5}
                  placeholder="Describe your issue or questions in detail..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="border-brand-border bg-brand-surface text-xs p-3 focus-visible:ring-offset-0"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-xs py-3 border-0 h-auto cursor-pointer shadow-none flex items-center justify-center gap-2"
              >
                <span>
                  {loading ? "Submitting ticket..." : "Submit Support Request"}
                </span>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
