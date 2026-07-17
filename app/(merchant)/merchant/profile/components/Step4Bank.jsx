import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, User, FileText, Upload } from "lucide-react";

export default function Step4Bank({
  formData,
  setFormData,
  handleImageUpload,
  uploadingCheque,
}) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-5">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-brand-blue" />
        <span>4. Settlement Bank Particulars &amp; Documentation</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <User className="w-3.5 h-3.5 text-brand-blue" />
            <span>Bank Account Legal Holder Name</span>
          </Label>
          <Input
            type="text"
            placeholder="Legal name in bank passbook"
            value={formData.bankDetails.holderName}
            onChange={(e) => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, holderName: e.target.value }
            })}
            className="text-xs focus-visible:ring-brand-blue"
            required
          />
        </div>

        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <CreditCard className="w-3.5 h-3.5 text-brand-blue" />
            <span>Account Typology</span>
          </Label>
          <Select
            value={formData.bankDetails.accountType}
            onValueChange={(val) => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, accountType: val }
            })}
          >
            <SelectTrigger className="text-xs h-9 border-brand-border shadow-none text-brand-navy font-semibold">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent className="bg-brand-bg border border-brand-border">
              <SelectItem value="current" className="text-xs text-brand-navy">Current Account</SelectItem>
              <SelectItem value="savings" className="text-xs text-brand-navy">Savings Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <CreditCard className="w-3.5 h-3.5 text-brand-blue" />
            <span>Core Account Serial Number</span>
          </Label>
          <Input
            type="text"
            maxLength={18}
            placeholder="9 to 18 digits account number"
            value={formData.bankDetails.accountNumber}
            onChange={(e) => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
            })}
            className="text-xs focus-visible:ring-brand-blue font-mono"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <CreditCard className="w-3.5 h-3.5 text-brand-blue" />
            <span>IFSC Code Number</span>
          </Label>
          <Input
            type="text"
            maxLength={11}
            placeholder="11 characters (e.g. HDFC0000123)"
            value={formData.bankDetails.ifsc}
            onChange={(e) => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, ifsc: e.target.value.toUpperCase() }
            })}
            className="text-xs focus-visible:ring-brand-blue font-mono uppercase"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <FileText className="w-3.5 h-3.5 text-brand-blue" />
            <span>Upload Cancelled Cheque / Account Passbook</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-5 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-28 overflow-hidden">
            {formData.bankDetails.chequeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formData.bankDetails.chequeImage} alt="Cancelled Cheque" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-2" />
                <span className="text-[10px] text-brand-subtext font-semibold">
                  {uploadingCheque ? "Uploading..." : "Upload cancelled cheque (PDF or Image)"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "bankDetails.chequeImage")}
              disabled={uploadingCheque}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
