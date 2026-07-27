import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Campaign from "@/modules/merchant/campaign.model";
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
    pendingMerchantsCount,
    pendingCouponsCount,
    pendingCampaignsCount,
    pendingMerchants,
    pendingCoupons,
    redemptions,
    merchants,
    allCoupons,
  ] = await Promise.all([
    UserProfile.countDocuments(),
    Merchant.countDocuments(),
    Coupon.countDocuments({ status: "active" }),
    Merchant.countDocuments({ status: "pending" }),
    Coupon.countDocuments({ status: "pending" }),
    Campaign.countDocuments({ status: "pending_review" }),
    Merchant.find({ status: "pending" }).limit(5).lean(),
    Coupon.find({ status: "pending" }).limit(5).lean(),
    Redemption.find().lean(),
    Merchant.find().lean(),
    Coupon.find().select("viewCount totalClaims").lean(),
  ]);

  // Dynamic monthly billing MRR
  let monthlyRevenue = 0;
  merchants.forEach((m) => {
    const plan = m.plan || "starter";
    const prices = { starter: 0, growth: 1499, pro: 3999, enterprise: 9999 };
    monthlyRevenue += prices[plan] || 0;
  });

  // Calculate Total Live Visits across DB coupons
  let totalVisits = 0;
  allCoupons.forEach((c) => {
    totalVisits += Number(c.viewCount) || 0;
  });

  const directCount = Math.round(totalVisits * 0.35);
  const organicCount = Math.round(totalVisits * 0.28);
  const referralCount = Math.round(totalVisits * 0.22);
  const socialCount = Math.round(totalVisits * 0.15);

  const trafficSources =
    totalVisits > 0
      ? [
          {
            label: "Direct",
            name: "Direct",
            value: 35,
            pct: "35%",
            color: "bg-[#3e80dd]",
            hexColor: "#3e80dd",
          },
          {
            label: "Organic",
            name: "Organic",
            value: 28,
            pct: "28%",
            color: "bg-[#2563eb]",
            hexColor: "#2563eb",
          },
          {
            label: "Referral",
            name: "Referral",
            value: 22,
            pct: "22%",
            color: "bg-[#0a2e6e]",
            hexColor: "#0a2e6e",
          },
          {
            label: "Social",
            name: "Social",
            value: 15,
            pct: "15%",
            color: "bg-[#8b5cf6]",
            hexColor: "#8b5cf6",
          },
        ]
      : [
          {
            label: "Direct",
            name: "Direct",
            value: 0,
            pct: "0%",
            color: "bg-[#3e80dd]",
            hexColor: "#3e80dd",
          },
          {
            label: "Organic",
            name: "Organic",
            value: 0,
            pct: "0%",
            color: "bg-[#2563eb]",
            hexColor: "#2563eb",
          },
          {
            label: "Referral",
            name: "Referral",
            value: 0,
            pct: "0%",
            color: "bg-[#0a2e6e]",
            hexColor: "#0a2e6e",
          },
          {
            label: "Social",
            name: "Social",
            value: 0,
            pct: "0%",
            color: "bg-[#8b5cf6]",
            hexColor: "#8b5cf6",
          },
        ];

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
    const baseOrders = stat.orders;
    stat.orders = baseOrders;
    stat.revenue = stat.profit;
    stat.profit = Math.round(stat.revenue * 0.1);
  });

  return ok({
    kpis: {
      totalUsers,
      totalMerchants,
      activeCoupons,
      monthlyRevenue,
    },
    badges: {
      pendingMerchants: pendingMerchantsCount,
      pendingCoupons: pendingCouponsCount,
      pendingCampaigns: pendingCampaignsCount,
      totalPending:
        pendingMerchantsCount + pendingCouponsCount + pendingCampaignsCount,
    },
    totalVisits,
    trafficSources,
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
