import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { COUPON_STATUS } from "@/utils/constants";

/**
 * GET /api/coupons/ticker
 * Returns coupons sorted by priority for the Hot Deals Ticker bar:
 * 1. PRIORITY 1 — isFeatured === true (Featured Slot / manually pinned)
 * 2. PRIORITY 2 — Enterprise plan merchant coupons
 * 3. PRIORITY 3 — Pro plan merchant coupons (sorted by claims/redemptions desc)
 * 4. PRIORITY 4 — Growth plan merchant coupons (sorted by claims desc)
 * 5. PRIORITY 5 — Starter plan merchant coupons
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "15", 10);

  // Fetch active coupons
  const coupons = await Coupon.find({
    status: COUPON_STATUS.ACTIVE,
    expiresAt: { $gt: new Date() },
  })
    .populate("merchantId", "businessName slug logo plan")
    .lean();

  const getPriority = (coupon) => {
    if (coupon.isFeatured) return 1;
    const plan = coupon.merchantId?.plan || "starter";
    if (plan === "enterprise") return 2;
    if (plan === "pro") return 3;
    if (plan === "growth") return 4;
    return 5;
  };

  coupons.sort((a, b) => {
    const pA = getPriority(a);
    const pB = getPriority(b);

    // Sort by priority tier ascending (1 is highest priority)
    if (pA !== pB) return pA - pB;

    // Sub-sort by performance: total claims desc
    const claimsA = a.totalClaims || 0;
    const claimsB = b.totalClaims || 0;
    if (claimsA !== claimsB) return claimsB - claimsA;

    // Finally sort by newest first
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const tickerCoupons = coupons.slice(0, limit);

  return ok({ coupons: tickerCoupons });
});
