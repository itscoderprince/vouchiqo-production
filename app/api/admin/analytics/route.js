import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import Redemption from "@/modules/redemption/redemption.model";
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
    redemptions,
    merchants,
  ] = await Promise.all([
    UserProfile.countDocuments(),
    Merchant.countDocuments(),
    Coupon.countDocuments({ status: "active" }),
    Merchant.find({ status: "pending" }).limit(5).lean(),
    Coupon.find({ status: "pending" }).limit(5).lean(),
    Redemption.find().lean(),
    Merchant.find().lean(),
  ]);

  // Dynamic monthly billing MRR
  let monthlyRevenue = 0;
  merchants.forEach((m) => {
    const plan = m.plan || "starter";
    const prices = { starter: 0, growth: 1499, pro: 3999, enterprise: 9999 };
    monthlyRevenue += prices[plan] || 0;
  });

  // Build dynamic trendData based on real redemptions
  const currentYear = new Date().getFullYear();
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(i);
    const label = date.toLocaleString("en-US", { month: "short" });
    return {
      label,
      revenue: 0,
      orders: 0,
      profit: 0,
    };
  });

  redemptions.forEach((r) => {
    const rDate = new Date(r.createdAt || r.updatedAt || Date.now());
    if (rDate.getFullYear() === currentYear) {
      const month = rDate.getMonth();
      trendData[month].orders += 1;
      trendData[month].profit += Math.round(r.savingsAmount || 0);
    }
  });

  trendData.forEach((stat) => {
    // Show true data from redemptions without baseline padding
    const baseOrders = stat.orders;
    stat.orders = baseOrders;
    // Revenue is the total savings amount generated for customers
    stat.revenue = stat.profit;
    // Profit is Vouchiqo's commission cut (10% of savings generated)
    stat.profit = Math.round(stat.revenue * 0.1);
  });

  return ok({
    kpis: {
      totalUsers,
      totalMerchants,
      activeCoupons,
      monthlyRevenue,
    },
    trendData,
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
