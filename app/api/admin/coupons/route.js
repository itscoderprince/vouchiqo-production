import { connectDB } from "@/lib/mongodb";
import {
  listAllCoupons,
  updateCouponModerationState,
} from "@/modules/admin/admin.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coupons
 * List all coupons regardless of status. Admin only.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listAllCoupons(searchParams);
  return ok(result);
});

/**
 * PUT /api/admin/coupons
 * Set featured/hot/verified flags on a coupon. Admin only.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { couponId, isFeatured, isHot, isVerified, status, rejectionReason } =
    await request.json();

  const update = {};
  if (isFeatured !== undefined) update.isFeatured = isFeatured;
  if (isHot !== undefined) update.isHot = isHot;
  if (isVerified !== undefined) update.isVerified = isVerified;
  if (status !== undefined) update.status = status;
  if (rejectionReason !== undefined) update.rejectionReason = rejectionReason;

  const coupon = await updateCouponModerationState(couponId, update);
  return ok(coupon, "Coupon updated successfully");
});
