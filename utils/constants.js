// ─────────────────────────────────────────────
// User Roles
// ─────────────────────────────────────────────
export const ROLES = {
  CUSTOMER: "customer",
  MERCHANT: "merchant",
  ADMIN: "admin",
};

// ─────────────────────────────────────────────
// Coupon
// ─────────────────────────────────────────────
export const COUPON_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  PAUSED: "paused",
  EXPIRED: "expired",
  DELETED: "deleted",
};

export const DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  FREEBIE: "freebie",
};

export const COUPON_CATEGORIES = [
  "fashion",
  "food",
  "electronics",
  "beauty",
  "travel",
  "home",
  "home-improvement",
  "fitness",
  "education",
  "kids-baby",
  "jewellery",
  "automotive",
  "entertainment",
  "grocery",
  "finance",
  "others",
];

export function normalizeCategory(raw) {
  if (!raw) return "food";
  const lower = String(raw).toLowerCase().trim();

  if (COUPON_CATEGORIES.includes(lower)) return lower;

  if (lower.includes("food") || lower.includes("dining") || lower.includes("restaurant") || lower.includes("caf")) return "food";
  if (lower.includes("fashion") || lower.includes("cloth")) return "fashion";
  if (lower.includes("auto") || lower.includes("car") || lower.includes("vehicle")) return "automotive";
  if (lower.includes("electr") || lower.includes("gadget")) return "electronics";
  if (lower.includes("beauty") || lower.includes("well") || lower.includes("salon")) return "beauty";
  if (lower.includes("travel") || lower.includes("hotel") || lower.includes("hospitality")) return "travel";
  if (lower.includes("improvement")) return "home-improvement";
  if (lower.includes("home") || lower.includes("living")) return "home";
  if (lower.includes("fit") || lower.includes("health") || lower.includes("gym")) return "fitness";
  if (lower.includes("edu") || lower.includes("course") || lower.includes("school")) return "education";
  if (lower.includes("kid") || lower.includes("baby")) return "kids-baby";
  if (lower.includes("jewel") || lower.includes("gold")) return "jewellery";
  if (lower.includes("game") || lower.includes("entertain")) return "entertainment";
  if (lower.includes("groc") || lower.includes("essential")) return "grocery";
  if (lower.includes("finan") || lower.includes("insur")) return "finance";

  return "others";
}

// ─────────────────────────────────────────────
// Claim
// ─────────────────────────────────────────────
export const CLAIM_STATUS = {
  ACTIVE: "active",
  REDEEMED: "redeemed",
  EXPIRED: "expired",
};

// ─────────────────────────────────────────────
// Merchant
// ─────────────────────────────────────────────
export const MERCHANT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

// ─────────────────────────────────────────────
// Revival
// ─────────────────────────────────────────────
export const REVIVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// ─────────────────────────────────────────────
// HTTP Status Codes
// ─────────────────────────────────────────────
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

// ─────────────────────────────────────────────
// Razorpay Plan IDs & Subscription Matrix (Task 6)
// ─────────────────────────────────────────────
export const RAZORPAY_PLANS = {
  GROWTH_MONTHLY: "vouchiqo_growth_monthly",
  GROWTH_ANNUAL: "vouchiqo_growth_annual",
  PRO_MONTHLY: "vouchiqo_pro_monthly",
  PRO_ANNUAL: "vouchiqo_pro_annual",
};

export const SUBSCRIPTION_MATRIX = {
  starter: {
    name: "Starter (Free)",
    priceMonthly: 0,
    priceYearly: 0,
    razorpayPlanId: null, // Free plan (no Razorpay plan needed)
    activeListingsLimit: 3,
    campaignsLimit: 0, // Campaign Manager disabled
    revivalCredits: 0,
    apiAccess: false,
    supportSla: "72hr email",
  },
  growth: {
    name: "Growth Partner",
    priceMonthly: 1499,
    priceYearly: 14900,
    razorpayPlanId: {
      monthly: RAZORPAY_PLANS.GROWTH_MONTHLY,
      yearly: RAZORPAY_PLANS.GROWTH_ANNUAL,
    },
    activeListingsLimit: 15,
    campaignsLimit: 1, // 1/quarter
    revivalCredits: 0, // Add-on only
    apiAccess: false,
    supportSla: "48hr email",
  },
  pro: {
    name: "Pro Partner",
    priceMonthly: 3999,
    priceYearly: 39990,
    razorpayPlanId: {
      monthly: RAZORPAY_PLANS.PRO_MONTHLY,
      yearly: RAZORPAY_PLANS.PRO_ANNUAL,
    },
    activeListingsLimit: 999, // Unlimited
    campaignsLimit: 4, // 4/year
    revivalCredits: 50, // 50/month
    featuredSlotDays: 2,
    pushNotifications: 1,
    apiAccess: false,
    supportSla: "24hr priority",
  },
  enterprise: {
    name: "Enterprise Partner",
    priceMonthly: null, // Custom
    priceYearly: null, // Negotiable / Manual Invoice
    razorpayPlanId: null, // Manual invoice
    activeListingsLimit: 999, // Unlimited
    campaignsLimit: 999, // Unlimited
    revivalCredits: 999999, // Unlimited
    apiAccess: "Full Read/Write",
    supportSla: "4hr dedicated",
  },
};

export const ADDONS_PRICING = [
  {
    id: "revival_pack",
    name: "Expired Offer Revival Pack",
    price: 499,
    unit: "25 revivals",
  },
  {
    id: "campaign_boost",
    name: "Flash Campaign Boost",
    price: 799,
    unit: "Single campaign",
  },
  {
    id: "featured_slot",
    name: "Homepage Featured Slot",
    price: 999,
    unit: "3 days",
  },
  {
    id: "push_notification",
    name: "Push Notification",
    price: 599,
    unit: "Single send",
  },
  {
    id: "festival_package",
    name: "Festival Campaign Package",
    price: 2999,
    unit: "All channels + teaser",
  },
  {
    id: "analytics_report",
    name: "Performance Analytics Report",
    price: 799,
    unit: "Deep report PDF",
  },
  {
    id: "email_blast",
    name: "Dedicated Email Blast",
    price: 799,
    unit: "Send to category subscribers",
  },
  {
    id: "ticker_priority",
    name: "Homepage Ticker Priority",
    price: 999,
    unit: "3-day window",
  },
];
export const REDIS_TTL = {
  SESSION: 86400, // 24 hours
  OTP: 300, // 5 minutes
  RATE_LIMIT: 60, // 1 minute
  FEATURED: 300, // 5 minutes
  TRENDING: 120, // 2 minutes
  REDEEM_LOCK: 10, // 10 seconds
  BANNERS: 300, // 5 minutes
  PAYMENT_LOCK: 30, // 30 seconds distributed lock for payment processing
  PAYMENT_INTENT: 1800, // 30 minutes intent cache
  PAYMENT_STATE: 86400, // 24 hours state cache
};

export const REDIS_KEYS = {
  FEATURED_DEALS: "home:featured",
  TRENDING_DEALS: "home:trending",
  BANNERS: "home:banners",
  rateLimit: (ip, route) => `rl:${ip}:${route}`,
  redeemLock: (couponId, userId) => `redeem:lock:${couponId}:${userId}`,
  otp: (userId) => `otp:${userId}`,
  paymentLock: (orderId) => `payment:lock:${orderId}`,
  paymentIntent: (idempotencyKey) => `payment:intent:${idempotencyKey}`,
  paymentState: (orderId) => `payment:state:${orderId}`,
};

// ─────────────────────────────────────────────
// Queues
// ─────────────────────────────────────────────
export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  COUPONS: "coupons",
  REVIVALS: "revivals",
};

export const JOB_NAMES = {
  SEND_EMAIL: "send-email",
  RECORD_VIEW: "record-view",
  RECORD_IMPRESSION: "record-impression",
  RECORD_CLICK: "record-click",
  RECORD_COPY_CODE: "record-copy-code",
  RECORD_STORE_VIEW: "record-store-view",
  RECORD_BANNER_CLICK: "record-banner-click",
  RECORD_UNIQUE_CODE_GEN: "record-unique-code-gen",
  EXPIRE_COUPON: "expire-coupon",
  CHECK_REVIVALS: "check-expired",
};
