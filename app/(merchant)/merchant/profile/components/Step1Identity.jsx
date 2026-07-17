import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUPON_CATEGORIES } from "@/utils/constants";
import { Store, Link2, Briefcase, User, Phone, Mail } from "lucide-react";

export default function Step1Identity({ formData, setFormData, handleBusinessNameChange }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-5">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <Store className="w-4 h-4 text-brand-blue" />
        <span>1. Business Logical Identity &amp; Categorization</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Store className="w-3.5 h-3.5 text-brand-blue" />
            <span>Legal Entity Corporate Name</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. Jajodia Food & Beverage Pvt Ltd"
            value={formData.businessName}
            onChange={handleBusinessNameChange}
            className="text-xs focus-visible:ring-brand-blue"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Link2 className="w-3.5 h-3.5 text-brand-blue" />
            <span>Consumer Trade Brand Name</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. The Beans Cafe"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })}
            className="text-xs focus-visible:ring-brand-blue"
            required
          />
        </div>

        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
            <span>Business Constitution Type</span>
          </Label>
          <Select
            value={formData.constitution}
            onValueChange={(val) => setFormData({ ...formData, constitution: val })}
          >
            <SelectTrigger className="text-xs h-9 border-brand-border shadow-none text-brand-navy font-semibold">
              <SelectValue placeholder="Constitution" />
            </SelectTrigger>
            <SelectContent className="bg-brand-bg border border-brand-border">
              <SelectItem value="proprietorship" className="text-xs text-brand-navy">Proprietorship</SelectItem>
              <SelectItem value="partnership" className="text-xs text-brand-navy">Partnership</SelectItem>
              <SelectItem value="llp" className="text-xs text-brand-navy">LLP</SelectItem>
              <SelectItem value="pvt_ltd" className="text-xs text-brand-navy">Pvt Ltd</SelectItem>
              <SelectItem value="others" className="text-xs text-brand-navy">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Store className="w-3.5 h-3.5 text-brand-blue" />
            <span>Primary Core Category Alignment</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger className="text-xs h-9 border-brand-border shadow-none text-brand-navy font-semibold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-brand-bg border-brand-border">
              {COUPON_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs text-brand-navy capitalize">
                  {cat.replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <User className="w-3.5 h-3.5 text-brand-blue" />
            <span>Authorized Liaison Name</span>
          </Label>
          <Input
            type="text"
            placeholder="Liaison Name"
            value={formData.liaisonName}
            onChange={(e) => setFormData({ ...formData, liaisonName: e.target.value })}
            className="text-xs focus-visible:ring-brand-blue"
          />
        </div>

        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
            <span>Liaison Designation</span>
          </Label>
          <Select
            value={formData.liaisonDesignation}
            onValueChange={(val) => setFormData({ ...formData, liaisonDesignation: val })}
          >
            <SelectTrigger className="text-xs h-9 border-brand-border shadow-none text-brand-navy font-semibold">
              <SelectValue placeholder="Designation" />
            </SelectTrigger>
            <SelectContent className="bg-brand-bg border border-brand-border">
              <SelectItem value="owner" className="text-xs text-brand-navy">Owner</SelectItem>
              <SelectItem value="partner" className="text-xs text-brand-navy">Partner</SelectItem>
              <SelectItem value="manager" className="text-xs text-brand-navy">Manager</SelectItem>
              <SelectItem value="others" className="text-xs text-brand-navy">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Phone className="w-3.5 h-3.5 text-brand-blue" />
            <span>Operational Liaison Phone</span>
          </Label>
          <Input
            type="text"
            placeholder="10-digit mobile number"
            value={formData.liaisonPhone}
            onChange={(e) => setFormData({ ...formData, liaisonPhone: e.target.value })}
            className="text-xs focus-visible:ring-brand-blue"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Mail className="w-3.5 h-3.5 text-brand-blue" />
            <span>Communication Email</span>
          </Label>
          <Input
            type="email"
            placeholder="email@brand.com"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="text-xs focus-visible:ring-brand-blue"
            required
          />
        </div>
      </div>
    </div>
  );
}
