"use client";

import { Briefcase, Link2, Mail, Phone, Store, User } from "lucide-react";
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

const CATEGORIES = [
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "food", label: "Food & Dining" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "home", label: "Home & Living" },
  { id: "home-improvement", label: "Home Improvement" },
  { id: "fitness", label: "Fitness & Healthcare" },
  { id: "education", label: "Education & Courses" },
  { id: "kids-baby", label: "Kids & Baby Products" },
  { id: "jewellery", label: "Jewellery & Accessories" },
  { id: "automotive", label: "Automobile & Auto Services" },
  { id: "entertainment", label: "Gaming & Entertainment" },
  { id: "grocery", label: "Grocery & Essentials" },
  { id: "finance", label: "Finance & Insurance" },
];

export default function Step1Identity({
  formData,
  setFormData,
  handleBusinessNameChange,
}) {
  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-600" />
          <span>1. Business Logical Identity &amp; Categorization</span>
        </h3>
        <Badge variant="outline" className="text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
          Required Step 1 of 4
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Legal Entity Corporate Name */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Store className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Legal Entity Corporate Name</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. Burger House Pvt Ltd"
            value={formData.businessName}
            onChange={handleBusinessNameChange}
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
            required
          />
        </div>

        {/* Consumer Trade Brand Name */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Link2 className="w-3.5 h-3.5 text-orange-600 mr-0.5" />
            <span>Consumer Trade Brand Name</span>
            <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional)</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. Burger House"
            value={formData.slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
              })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
          />
        </div>

        {/* Business Constitution Type */}
        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Briefcase className="w-3.5 h-3.5 text-purple-600 mr-0.5" />
            <span>Business Constitution Type</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Select
            value={formData.constitution || "proprietorship"}
            onValueChange={(val) =>
              setFormData({ ...formData, constitution: val })
            }
          >
            <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
              <SelectValue placeholder="Constitution" />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              <SelectItem value="proprietorship">Proprietorship</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="llp">LLP</SelectItem>
              <SelectItem value="pvt_ltd">Pvt Ltd</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Core Category Alignment */}
        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Store className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
            <span>Primary Core Category Alignment</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Select
            value={formData.category || "food"}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Authorized Liaison Name */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <User className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Authorized Liaison Name</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. Test Liaison Officer"
            value={formData.liaisonName}
            onChange={(e) =>
              setFormData({ ...formData, liaisonName: e.target.value })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
            required
          />
        </div>

        {/* Liaison Designation */}
        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Briefcase className="w-3.5 h-3.5 text-slate-600 mr-0.5" />
            <span>Liaison Designation</span>
            <span className="text-slate-400 font-normal text-[11px] normal-case ml-1">(Optional)</span>
          </Label>
          <Select
            value={formData.liaisonDesignation || "owner"}
            onValueChange={(val) =>
              setFormData({ ...formData, liaisonDesignation: val })
            }
          >
            <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs h-10 px-3.5 font-bold text-slate-800">
              <SelectValue placeholder="Designation" />
            </SelectTrigger>
            <SelectContent className="z-[300]">
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Operational Liaison Phone */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Phone className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
            <span>Operational Liaison Phone</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="tel"
            placeholder="9876543210"
            value={formData.liaisonPhone}
            onChange={(e) =>
              setFormData({ ...formData, liaisonPhone: e.target.value })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
            required
          />
        </div>

        {/* Communication Email */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Mail className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
            <span>Communication Email</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </Label>
          <Input
            type="email"
            placeholder="hello@burgerhouse.com"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            className="bg-white border-slate-200 text-xs h-10 rounded-xl font-medium"
            required
          />
        </div>
      </div>
    </Card>
  );
}
