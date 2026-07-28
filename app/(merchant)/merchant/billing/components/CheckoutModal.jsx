"use client";

import { ArrowRight, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  selectedAddOn,
  billingCycle,
  basePrice,
  gst,
  totalPrice,
  gstin,
  setGstin,
  onPayWithRazorpay,
  isPending,
}) {
  const productName = selectedPlan
    ? `${selectedPlan.name} (${billingCycle})`
    : selectedAddOn?.name || "Partner Add-On";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-3xl p-6 text-left font-sans shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="font-heading text-base font-extrabold text-slate-900 flex justify-between items-center w-full tracking-tight">
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Razorpay Checkout</span>
            </span>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
              256-Bit SSL Encrypted
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium">
            Review order breakdown &amp; proceed directly to Razorpay Live Gateway.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Summary Breakdown Box */}
          <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Selected Package:</span>
              <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {productName}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Base Price:</span>
              <span className="font-bold">₹{basePrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>GST (18% Tax):</span>
              <span className="font-bold">₹{gst.toLocaleString("en-IN")}</span>
            </div>

            <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center font-black text-sm">
              <span className="text-slate-900">Total Amount Payable:</span>
              <span className="text-blue-600 text-base">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Optional Business GSTIN input */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">
              Business GSTIN for Tax Credit (Optional)
            </Label>
            <Input
              type="text"
              placeholder="e.g. 27AABCU9603R1ZM"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase"
            />
          </div>

          {/* Security & Features Checklist */}
          <div className="space-y-1.5 text-[11px] text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instant Razorpay Payment Activation</span>
            </div>
            <ul className="space-y-1 text-slate-600 pl-5 list-disc">
              <li>Supports Google Pay, PhonePe, Paytm UPI &amp; Cards</li>
              <li>Instant plan activation &amp; zero setup fee</li>
            </ul>
          </div>

          {/* Direct Razorpay Activation Button */}
          <Button
            onClick={onPayWithRazorpay}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-11 shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching Razorpay Gateway...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{totalPrice.toLocaleString("en-IN")} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
