import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import Notification from "@/modules/notification/notification.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/merchant/badges
 * Returns real-time sidebar badges & application status for the authenticated merchant.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  const merchant = await Merchant.findOne({
    $or: [
      { authId: user.id },
      ...(user.email ? [{ contactEmail: user.email.toLowerCase().trim() }] : []),
    ],
  }).lean();

  if (!merchant) {
    return ok({
      status: "not_submitted",
      totalCoupons: 0,
      activeCoupons: 0,
      expiredCoupons: 0,
      totalCampaigns: 0,
      unreadNotifications: 0,
    });
  }

  const [
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    totalCampaigns,
    unreadNotifications,
  ] = await Promise.all([
    Coupon.countDocuments({ merchantId: merchant._id }),
    Coupon.countDocuments({ merchantId: merchant._id, status: "active" }),
    Coupon.countDocuments({ merchantId: merchant._id, status: "expired" }),
    Campaign.countDocuments({ merchantId: merchant._id }),
    Notification.countDocuments({ userId: user.id, isRead: false }),
  ]);

  return ok({
    status: merchant.status || "approved",
    plan: merchant.plan || "starter",
    businessName: merchant.businessName,
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    totalCampaigns,
    unreadNotifications,
  });
});
