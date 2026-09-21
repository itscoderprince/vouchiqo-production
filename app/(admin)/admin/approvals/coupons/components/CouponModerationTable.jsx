import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CouponModerationTable({
  coupons,
  actionLoading,
  onApprove,
  onRejectClick,
}) {
  const getDiscountDisplay = (coupon) => {
    const val = coupon.rawDiscountValue || coupon.discountValue;
    const isNum = val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
    if (coupon.offerType === "deal" && coupon.salePrice) return `\u20b9${coupon.salePrice} Deal`;
    if (coupon.discountType === "percentage" && isNum) return `${val}% OFF`;
    if (coupon.discountType === "fixed" && isNum) return `\u20b9${val} OFF`;
    if (coupon.specialOfferType) return coupon.specialOfferType;
    if (typeof val === "string" && val.trim() && !isNum) return val;
    return "FREE GIFT";
  };

  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <Table className="w-full text-xs">
          <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
            <TableRow className="hover:bg-transparent border-b border-brand-border">
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Merchant / Brand
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Offer Title
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Discount Value
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Redemption Rules
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Expiry Date
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                Moderation Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
            {coupons.map((coupon) => (
              <TableRow
                key={coupon._id}
                className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
              >
                <TableCell className="p-4 font-bold text-brand-navy h-auto">
                  {coupon.merchantId?.businessName || "Unknown Merchant"}
                  <span className="block text-[10px] text-brand-subtext font-bold uppercase mt-0.5">
                    Plan: {coupon.merchantId?.plan || "starter"}
                  </span>
                </TableCell>
                <TableCell className="p-4">
                  <div className="font-bold text-brand-text">
                    {coupon.title}
                  </div>
                  {coupon.description && (
                    <div className="text-[10px] text-brand-subtext mt-0.5 line-clamp-1">
                      {coupon.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="p-4 text-brand-blue font-bold">
                  {getDiscountDisplay(coupon)}
                </TableCell>
                <TableCell className="p-4 text-brand-subtext max-w-[200px] truncate">
                  Code:{" "}
                  <code className="bg-brand-surface px-1.5 py-0.5 rounded font-bold text-brand-navy">
                    {coupon.code}
                  </code>
                </TableCell>
                <TableCell className="p-4 text-brand-subtext">
                  {new Date(coupon.expiresAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="icon"
                      disabled={actionLoading}
                      onClick={() => onApprove(coupon._id)}
                      className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                      title="Approve & Publish"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      disabled={actionLoading}
                      onClick={() => onRejectClick(coupon._id)}
                      className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                      title="Reject Offer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-brand-border">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-brand-navy text-[12px] truncate">
                  {coupon.merchantId?.businessName || "Unknown Merchant"}
                </p>
                <p className="text-[10px] text-brand-subtext font-bold uppercase mt-0.5">
                  Plan: {coupon.merchantId?.plan || "starter"}
                </p>
              </div>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-surface border border-brand-border px-2 py-0.5 rounded shrink-0">
                {getDiscountDisplay(coupon)}
              </span>
            </div>

            <div>
              <p className="font-bold text-brand-text text-[11px]">{coupon.title}</p>
              {coupon.description && (
                <p className="text-[10px] text-brand-subtext mt-0.5 line-clamp-2">{coupon.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-brand-subtext flex-wrap">
              <span>Code: <code className="bg-brand-surface px-1 py-0.5 rounded font-bold text-brand-navy">{coupon.code}</code></span>
              <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => onApprove(coupon._id)}
                className="flex-1 bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 h-8 rounded-lg transition-all cursor-pointer shadow-none font-semibold text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => onRejectClick(coupon._id)}
                className="flex-1 bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 h-8 rounded-lg transition-all cursor-pointer shadow-none font-semibold text-xs gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}