import PlatformSetting from "@/modules/admin/settings.model";
import Redemption from "@/modules/redemption/redemption.model";
import CustomerRevival from "@/modules/revival/customer-revival.model";
import Revival from "@/modules/revival/revival.model";

// Helper function to format relative timestamps
function getRelativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Fetch all platform settings as a key-value object map.
 * Returns default objects if not yet configured in the database.
 */
export async function getPlatformSettings() {
  const settings = await PlatformSetting.find().lean();

  const settingsMap = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  // Calculate live delta stats from database requests
  const [
    totalCustomerRevivals,
    totalMerchantRevivals,
    approvedCustomerRevivals,
    approvedMerchantRevivals,
  ] = await Promise.all([
    CustomerRevival.countDocuments(),
    Revival.countDocuments(),
    CustomerRevival.countDocuments({ status: "approved" }),
    Revival.countDocuments({ status: "approved" }),
  ]);

  const liveTotalRequests = totalCustomerRevivals + totalMerchantRevivals;
  const liveApprovedRequests =
    approvedCustomerRevivals + approvedMerchantRevivals;

  // Provide system defaults for clean fallback
  let dbStats = settingsMap.revival_stats;
  if (!dbStats) {
    dbStats = {
      totalRequests: 5240,
      thisMonthRequests: 142,
      recoveredAmount: 1250000,
      successRate: 94.2,
    };
  }

  // Combine baseline admin stats with real database deltas
  settingsMap.revival_stats = {
    totalRequests: dbStats.totalRequests + liveTotalRequests,
    thisMonthRequests: dbStats.thisMonthRequests + liveTotalRequests,
    recoveredAmount: dbStats.recoveredAmount + liveApprovedRequests * 1500, // ₹1,500 average recovered savings
    successRate:
      liveTotalRequests > 0
        ? Number(
            (
              ((dbStats.totalRequests * (dbStats.successRate / 100) +
                liveApprovedRequests) /
                (dbStats.totalRequests + liveTotalRequests)) *
              100
            ).toFixed(1),
          )
        : dbStats.successRate,
  };

  // Fetch latest 3 redemptions to generate live social proof testimonials
  const latestRedemptions = await Redemption.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("merchantId")
    .lean();

  const liveSocialProofs = latestRedemptions.map((r) => {
    const brand = r.merchantId?.businessName || "Partner Store";
    const dateText = r.createdAt ? getRelativeTime(r.createdAt) : "Just now";
    return {
      user: `Member ${r.userId.slice(-4).toUpperCase()} from Ranchi`,
      brand,
      offer:
        r.discountType === "percentage"
          ? `${r.discountValue}% OFF`
          : `Saved ₹${r.savingsAmount || 150}`,
      date: dateText,
      text: `Successfully saved ₹${r.savingsAmount || 150} by redeeming coupon code "${r.couponCode}" at ${brand}.`,
    };
  });

  const baseSocialProof = settingsMap.social_proof || [
    {
      user: "Anish S. from Ranchi",
      brand: "Marbella Tiles & Sanitary",
      offer: "Saved ₹5,400 on home flooring tiles",
      date: "2 days ago",
      text: "Vouchiqo helped reactivate the flat ₹5,000 discount. Marbella Ranchi approved it immediately after receiving the request batch.",
    },
    {
      user: "Sarah J. from Delhi",
      brand: "Starbucks Coffee",
      offer: "Revived Buy 1 Get 1 Free Espresso",
      date: "5 days ago",
      text: "Requested Starbucks BOGO revival. Within 48 hours, Vouchiqo updated the code to active, and I redeemed it in-store.",
    },
    {
      user: "Rohan D. from Bangalore",
      brand: "Notion Premium Team Plan",
      offer: "Recovered $100 SaaS Workspace Credits",
      date: "1 week ago",
      text: "Our team credits coupon had expired. Vouchiqo contacted Notion's merchant partnership team, and they re-enabled it for our domain!",
    },
  ];

  settingsMap.social_proof = [...liveSocialProofs, ...baseSocialProof].slice(
    0,
    5,
  );

  if (!settingsMap.categories) {
    settingsMap.categories = [
      { id: "food", name: "Food & Dining", slug: "food", active: true },
      {
        id: "fashion",
        name: "Fashion & Apparel",
        slug: "fashion",
        active: true,
      },
      {
        id: "electronics",
        name: "Electronics",
        slug: "electronics",
        active: true,
      },
      { id: "beauty", name: "Beauty & Wellness", slug: "beauty", active: true },
      { id: "travel", name: "Travel & Hotels", slug: "travel", active: true },
      { id: "fitness", name: "Fitness & Gym", slug: "fitness", active: true },
      { id: "home", name: "Home decor", slug: "home", active: true },
      {
        id: "entertainment",
        name: "Entertainment",
        slug: "entertainment",
        active: true,
      },
      {
        id: "services",
        name: "Local services",
        slug: "services",
        active: true,
      },
      { id: "other", name: "Others", slug: "other", active: true },
    ];
  }

  return settingsMap;
}

/**
 * Save or update a single platform setting value.
 *
 * @param {string} key
 * @param {any} value
 */
export async function savePlatformSetting(key, value) {
  if (!key) throw new Error("Setting key is required");

  const setting = await PlatformSetting.findOneAndUpdate(
    { key },
    { $set: { value } },
    { new: true, upsert: true },
  );

  return setting;
}
