import { Image, ImageIcon, Link2, MapPin, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Step2Location({
  formData,
  setFormData,
  handleImageUpload,
  uploadingShop,
  uploadingLogo,
  uploadingBanner,
}) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-5">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-blue" />
        <span>2. Visuals, Location &amp; Coordination</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2 md:col-span-1">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Image className="w-3.5 h-3.5 text-brand-blue" />
            <span>Shop Photograph</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-2 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-32 overflow-hidden">
            {formData.shopImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.shopImage}
                alt="Shop Front"
                className="max-w-full max-h-full object-contain rounded-md"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-2" />
                <span className="text-[10px] text-brand-subtext font-semibold">
                  {uploadingShop ? "Uploading..." : "Upload Shop Front"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "shopImage")}
              disabled={uploadingShop}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Image className="w-3.5 h-3.5 text-brand-blue" />
            <span>Store Logo</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-4 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-32 overflow-hidden">
            {formData.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.logo}
                alt="Logo"
                className="max-w-[75%] max-h-[75%] object-contain"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-2" />
                <span className="text-[10px] text-brand-subtext font-semibold">
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "logo")}
              disabled={uploadingLogo}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Image className="w-3.5 h-3.5 text-brand-blue" />
            <span>Cover Banner</span>
          </Label>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-2 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-32 overflow-hidden">
            {formData.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.banner}
                alt="Cover Banner"
                className="w-full h-full object-contain rounded-md"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-2" />
                <span className="text-[10px] text-brand-subtext font-semibold">
                  {uploadingBanner ? "Uploading..." : "Upload Cover"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "banner")}
              disabled={uploadingBanner}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 font-sans">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            <span>Regional Launch Hub City</span>
          </Label>
          <Select
            value={formData.regionalHubCity}
            onValueChange={(val) =>
              setFormData({ ...formData, regionalHubCity: val })
            }
          >
            <SelectTrigger className="text-xs h-9 border-brand-border shadow-none text-brand-navy font-semibold">
              <SelectValue placeholder="Select Hub City" />
            </SelectTrigger>
            <SelectContent className="bg-brand-bg border border-brand-border">
              <SelectItem value="ranchi" className="text-xs text-brand-navy">
                Ranchi
              </SelectItem>
              <SelectItem
                value="jamshedpur"
                className="text-xs text-brand-navy"
              >
                Jamshedpur
              </SelectItem>
              <SelectItem value="dhanbad" className="text-xs text-brand-navy">
                Dhanbad
              </SelectItem>
              <SelectItem value="bokaro" className="text-xs text-brand-navy">
                Bokaro
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <Link2 className="w-3.5 h-3.5 text-brand-blue" />
            <span>Google Maps Location Hyperlink</span>
          </Label>
          <Input
            type="url"
            placeholder="https://maps.google.com/?q=..."
            value={formData.gmapsLink}
            onChange={(e) =>
              setFormData({ ...formData, gmapsLink: e.target.value })
            }
            className="text-xs focus-visible:ring-brand-blue"
            required
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            <span>Storefront Physical Address</span>
          </Label>
          <Textarea
            placeholder="Flat/Plot No, Floor, Building Name, Commercial Area, Pincode"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="text-xs min-h-[70px] focus-visible:ring-brand-blue"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            <span>Store City</span>
          </Label>
          <Input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="text-xs focus-visible:ring-brand-blue"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase mb-1">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            <span>Store State</span>
          </Label>
          <Input
            type="text"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="text-xs focus-visible:ring-brand-blue"
          />
        </div>
      </div>
    </div>
  );
}
