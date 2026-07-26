"use client";

import { Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showError, showSuccess } from "@/lib/toast";

/**
 * EditCampaignModal — Modal dialog for editing an existing campaign.
 */
export default function EditCampaignModal({
  open,
  onOpenChange,
  campaign = null,
  onSaveSuccess,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("flash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || "");
      setType(campaign.type || "flash");
    }
  }, [campaign]);

  if (!campaign) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showError("Campaign name is required");

    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns?id=${campaign._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });

      const json = await res.json();
      if (json.success || json.status === "success") {
        showSuccess("Campaign updated successfully!");
        onSaveSuccess?.();
        onOpenChange(false);
      } else {
        showError(json.message || "Failed to update campaign.");
      }
    } catch (err) {
      showError("Error saving campaign updates.");
    }
    setLoading(false);
  };

  const typeOptions = [
    { value: "flash", label: "Flash Sale (2hrs - 48hrs)" },
    { value: "festival", label: "Festival — Festival Campaign (3 - 7 days)" },
    { value: "new-user", label: "Target — New Customer Acquisition" },
    { value: "seasonal", label: "Tag — Seasonal Clearance" },
    { value: "loyalty", label: "Users — Loyalty / Returning Customer" },
    { value: "bundle", label: "Trophy — Bundle / BOGO Campaign" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 text-left shadow-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader className="space-y-1 pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Edit Campaign Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Update the details for "{campaign.name}"
            </DialogDescription>
          </DialogHeader>

          <FormInput
            name="campaignName"
            label="Campaign Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Diwali Flash Mega Clearance"
            required
          />

          <FormSelect
            name="campaignType"
            label="Campaign Format"
            options={typeOptions}
            value={type}
            onValueChange={setType}
            required
          />

          <DialogFooter className="pt-3 border-t border-slate-100 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-xl shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-blue-500/20"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
