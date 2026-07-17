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
  "other",
];

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
// Redis
// ─────────────────────────────────────────────
export const REDIS_TTL = {
  SESSION: 86400, // 24 hours
  OTP: 300, // 5 minutes
  RATE_LIMIT: 60, // 1 minute
  FEATURED: 300, // 5 minutes
  TRENDING: 120, // 2 minutes
  REDEEM_LOCK: 10, // 10 seconds
  BANNERS: 300, // 5 minutes
};

export const REDIS_KEYS = {
  FEATURED_DEALS: "home:featured",
  TRENDING_DEALS: "home:trending",
  BANNERS: "home:banners",
  rateLimit: (ip, route) => `rl:${ip}:${route}`,
  redeemLock: (couponId, userId) => `redeem:lock:${couponId}:${userId}`,
  otp: (userId) => `otp:${userId}`,
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
  EXPIRE_COUPON: "expire-coupon",
  CHECK_REVIVALS: "check-expired",
};
