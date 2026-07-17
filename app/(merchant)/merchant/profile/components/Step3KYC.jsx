import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, FileText } from "lucide-react";

export default function Step3KYC({ formData, setFormData }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-5">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-brand-blue" />
        <span>3. Financial Accounting &amp; Statutory KYC</span>
      </h3>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <FileText className="w-3.5 h-3.5 text-brand-blue" />
            <span>Permanent Account Number (PAN)</span>
          </Label>
          <Input
            type="text"
            maxLength={10}
            placeholder="10-digit alphanumeric (e.g. ABCDE1234F)"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
            className="text-xs focus-visible:ring-brand-blue font-mono uppercase"
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
              <FileText className="w-3.5 h-3.5 text-brand-blue" />
              <span>GST Identification Number (GSTIN)</span>
            </Label>
            <Input
              type="text"
              maxLength={15}
              placeholder="15-digit alphanumeric (e.g. 22AAAAA1111A1Z1)"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              disabled={formData.isGstExempt}
              className="text-xs focus-visible:ring-brand-blue font-mono uppercase"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1 border border-brand-border/40 p-3 bg-brand-surface rounded-lg">
            <Checkbox
              id="gst-exempt"
              checked={formData.isGstExempt}
              onCheckedChange={(checked) => setFormData({ ...formData, isGstExempt: !!checked, gstin: checked ? "" : formData.gstin })}
              className="w-4 h-4 rounded-sm border-brand-border"
            />
            <label
              htmlFor="gst-exempt"
              className="text-xs text-brand-subtext font-semibold select-none cursor-pointer leading-tight"
            >
              I certify that my commercial enterprise is currently unregistered under the Indian GST regime as an exempt micro-merchant.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
