import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import UserProfile from "@/modules/user/user.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * Retrieve platform-level KPIs and pending system moderation tasks. Admin only.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const [
    totalUsers,
    totalMerchants,
    activeCoupons,
    pendingMerchants,
    pendingCoupons,
  ] = await Promise.all([
    UserProfile.countDocuments(),
    Merchant.countDocuments(),
    Coupon.countDocuments({ status: "active" }),
    Merchant.find({ status: "pending" }).limit(5).lean(),
    Coupon.find({ status: "pending" }).limit(5).lean(),
  ]);

  return ok({
    kpis: {
      totalUsers,
      totalMerchants,
      activeCoupons,
      monthlyRevenue: totalMerchants * 49.0, // standard $49.00/mo flat subscription rate
    },
    pendingActions: [
      ...pendingMerchants.map((m) => ({
        id: m._id.toString(),
        type: "Merchant",
        name: m.businessName,
        date: m.createdAt
          ? new Date(m.createdAt).toLocaleDateString()
          : "Today",
        status: "Pending approval",
      })),
      ...pendingCoupons.map((c) => ({
        id: c._id.toString(),
        type: "Coupon",
        name: c.title,
        date: c.createdAt
          ? new Date(c.createdAt).toLocaleDateString()
          : "Today",
        status: "Pending moderation",
      })),
    ],
  });
});
