"use client";

import { FileCheck, FileText, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Step3KYC({ formData, setFormData }) {
  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>3. Financial Accounting &amp; Statutory KYC</span>
        </h3>
        <Badge variant="outline" className="text-[10px] font-bold bg-purple-50 text-purple-700 border-purple-200">
          Step 3 of 4
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Primary Identity Document Selection */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <FileCheck className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Primary Identity Document Type</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Select
            value={formData.docType || "GST Registration Certificate"}
            onValueChange={(val) => setFormData({ ...formData, docType: val })}
          >
            <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              <SelectItem value="GST Registration Certificate">GST Registration Certificate (Preferred)</SelectItem>
              <SelectItem value="Udyam / MSME Certificate">Udyam / MSME Registration Certificate</SelectItem>
              <SelectItem value="Trade Licence">Trade Licence (Municipal Corporation)</SelectItem>
              <SelectItem value="Shop & Establishment Act">Shop &amp; Establishment Act Registration</SelectItem>
              <SelectItem value="Owner PAN Card">PAN Card of Business Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PAN Input */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Permanent Account Number (PAN)</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="text"
            maxLength={10}
            placeholder="10-digit alphanumeric (e.g. ABCDE1234F)"
            value={formData.pan}
            onChange={(e) =>
              setFormData({ ...formData, pan: e.target.value.toUpperCase() })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
            required
          />
        </div>

        {/* GSTIN Input */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
              <span>GST Identification Number (GSTIN)</span>
              <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional if Exempt)</span>
            </Label>
            <Input
              type="text"
              maxLength={15}
              placeholder="15-digit alphanumeric (e.g. 22AAAAA1111A1Z1)"
              value={formData.gstin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gstin: e.target.value.toUpperCase(),
                })
              }
              disabled={formData.isGstExempt}
              className="bg-white border-slate-200 text-xs h-10 rounded-xl font-mono uppercase font-bold"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer select-none">
            <Checkbox
              id="gst-exempt"
              checked={formData.isGstExempt}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isGstExempt: !!checked,
                  gstin: checked ? "" : formData.gstin,
                })
              }
            />
            <span className="text-xs text-slate-700 font-semibold leading-relaxed">
              I certify that my commercial enterprise is currently unregistered under the Indian GST regime as an exempt micro-merchant (turnover under ₹40 Lakhs).
            </span>
          </label>
        </div>
      </div>
    </Card>
  );
}
