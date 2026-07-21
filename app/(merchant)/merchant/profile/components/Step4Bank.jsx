"use client";

import { CreditCard, FileText, Upload, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Step4Bank({
  formData,
  setFormData,
  handleImageUpload,
  uploadingCheque,
}) {
  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>4. Settlement Bank Particulars &amp; Documentation</span>
        </h3>
        <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
          Step 4 of 4
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account Holder Name */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <User className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Bank Account Legal Holder Name</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Legal name in bank passbook"
            value={formData.bankDetails.holderName}
            onChange={(e) =>
              setFormData({
                ...formData,
                bankDetails: {
                  ...formData.bankDetails,
                  holderName: e.target.value,
                },
              })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
            required
          />
        </div>

        {/* Account Type */}
        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <CreditCard className="w-3.5 h-3.5 text-purple-600 mr-0.5" />
            <span>Account Typology</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Select
            value={formData.bankDetails.accountType || "current"}
            onValueChange={(val) =>
              setFormData({
                ...formData,
                bankDetails: { ...formData.bankDetails, accountType: val },
              })
            }
          >
            <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              <SelectItem value="current">Current Account</SelectItem>
              <SelectItem value="savings">Savings Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Account Number */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
            <span>Core Account Serial Number</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="text"
            maxLength={18}
            placeholder="9 to 18 digits account number"
            value={formData.bankDetails.accountNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                bankDetails: {
                  ...formData.bankDetails,
                  accountNumber: e.target.value,
                },
              })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono font-bold"
            required
          />
        </div>

        {/* IFSC Code */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Bank IFSC Code</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="text"
            maxLength={11}
            placeholder="e.g. HDFC0000123"
            value={formData.bankDetails.ifsc}
            onChange={(e) =>
              setFormData({
                ...formData,
                bankDetails: {
                  ...formData.bankDetails,
                  ifsc: e.target.value.toUpperCase(),
                },
              })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
            required
          />
        </div>
      </div>
    </Card>
  );
}
