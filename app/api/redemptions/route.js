import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import {
  getMerchantRedemptions,
  getUserRedemptions,
  redeemCoupon,
} from "@/modules/redemption/redemption.service";
import { redeemSchema } from "@/modules/redemption/redemption.validation";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/redemptions
 * Get the authenticated user's (or merchant's) redemption history.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const { searchParams } = new URL(request.url);

  if (user.role === ROLES.MERCHANT) {
    const merchant = await Merchant.findOne({ authId: user.id });
    if (!merchant) return ok({ redemptions: [] });

    const result = await getMerchantRedemptions(merchant._id, searchParams);
    return ok(result);
  }

  const result = await getUserRedemptions(user.id, searchParams);
  return ok(result);
});

/**
 * POST /api/redemptions
 * Redeem a claimed coupon.
 *
 * Uses a Redis distributed lock to prevent race conditions.
 *
 * Body: { claimId: string, couponId: string }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  const body = await request.json();
  const { claimId, couponId } = redeemSchema.parse(body);

  const redemption = await redeemCoupon(user.id, claimId, couponId);
  return created(redemption, "Coupon redeemed successfully");
});
