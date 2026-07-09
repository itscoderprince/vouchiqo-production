# VOUCHIQO — ARCHITECTURE & IMPLEMENTATION GUIDE
> Derived from: `SRD_Requirement_Phase_1.pdf` (v1.0, May 2026)
> Purpose: single source-of-truth for any code editor / AI coding assistant (Cursor, Claude Code, Copilot, Windsurf, etc.) to understand the full scope, structure, data model, and feature set of Vouchiqo **before writing code**.

---

## 0. How to use this document

- Read this file **fully** before generating or modifying code in this repo.
- Treat every item tagged `MUST` as in-scope for MVP. Items tagged `SHOULD` are nice-to-have. Items tagged `Phase 2` are explicitly out of scope for MVP — do not build them unless asked.
- Section 9 (Feature Status Tracker) has checkboxes. **Keep them updated** as features are implemented — this is how an editor/agent should determine "what already exists" vs "what's left to build" in this codebase.
- Section 5 (Data Model) and Section 6 (API Route Map) are the contract between frontend and backend. If you change a schema or route, update this file in the same commit.
- Anything marked **[DECISION NEEDED]** is not specified in the SRD and was inferred for architectural consistency — confirm with the project owner before treating it as final, or flag it explicitly in a PR.

---

## 1. Project Summary

**Vouchiqo** is a verified-coupon/savings platform for India with one core differentiator: an **Expired Offer Revival** flow — customers can request a merchant to regenerate a dead coupon code. It is a three-sided system:

1. **Customer platform** (public, SEO-critical) — browse/search/save verified offers.
2. **Merchant Portal** (`/merchant/*`) — authenticated dashboard where businesses post offers, run campaigns, pay for subscriptions, and manage revivals. **This is the revenue engine.**
3. **Admin Panel** (`/admin/*`) — internal ops console for the founder to approve merchants, verify offers, and manage the business.

All three share **one MongoDB database** and (per SRD) **one Express REST API**, with a single Next.js frontend serving all three surfaces under different route groups.

---

## 2. Confirmed Tech Stack (SRD Section 1.2)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **Next.js (React)** | SSR/SSG mandatory on all customer-facing pages for SEO. No CSR-only public pages. |
| Backend | **Node.js + Express** | RESTful API, documented via Postman collection. Decoupled from Next.js (not Next API routes). |
| Database | **MongoDB (Atlas)** | Multi-tenant merchant data isolation required in schema design. |
| Auth | **JWT + NextAuth.js** | Three *separate* auth flows: customer, merchant, admin. RBAC mandatory. |
| Payments | **Razorpay only** (not PhonePe) | Needed for recurring subscription billing. |
| File storage | Cloudinary **or** AWS S3 | Merchant logos, coupon images, banners. **[DECISION NEEDED: pick one before Sprint 1 — Cloudinary recommended for built-in image transforms.]** |
| Email | SendGrid | Transactional: OTP, approvals, expiry alerts, weekly digest. |
| Maps | Google Maps JavaScript API | Nearby Offers feature, GPS + manual location. |
| Push | Firebase Cloud Messaging (FCM) | Web push only for MVP. |
| Hosting | Hostinger VPS (4 vCPU / 8GB RAM / 100GB SSD) | NGINX reverse proxy, Let's Encrypt SSL, PM2. |
| Source control | GitHub (private repo) | Founder must be Owner/Admin from day 1. |

**[DECISION NEEDED]** Language: SRD doesn't specify JS vs TypeScript. Given multi-tenant RBAC, plan-gating, and a large schema surface, **TypeScript is strongly recommended** on both `apps/web` and `apps/api` — assume TS in all folder/file examples below unless told otherwise.

---

## 3. High-Level System Diagram

```
                         ┌───────────────────────────┐
                         │        Next.js App        │
                         │  (apps/web) — SSR/SSG      │
                         │                            │
                         │  /            (customer)   │
                         │  /deals, /deal/:slug       │
                         │  /brand/:name              │
                         │  /category/:name           │
                         │  /nearby-offers            │
                         │  /expired-coupon-revival   │
                         │  /auth/*, /profile         │
                         │                            │
                         │  /merchant/*  (portal)     │
                         │  /admin/*     (internal)   │
                         └─────────────┬──────────────┘
                                       │ REST (JSON) over HTTPS
                                       ▼
                         ┌───────────────────────────┐
                         │     Express REST API       │
                         │       (apps/api)           │
                         │                            │
                         │  /api/auth/*               │
                         │  /api/offers, /api/brands  │
                         │  /api/customer/*           │
                         │  /api/merchant/*           │
                         │  /api/admin/*              │
                         │  /api/webhooks/razorpay    │
                         └─────────────┬──────────────┘
                                       │
              ┌────────────────────────┼───────────────────────┐
              ▼                        ▼                       ▼
      ┌───────────────┐      ┌──────────────────┐    ┌───────────────────┐
      │ MongoDB Atlas  │      │ Razorpay API     │    │ SendGrid / FCM /   │
      │ (single DB,    │      │ (subs, webhooks) │    │ Cloudinary /       │
      │  tenant-scoped)│      │                  │    │ Google Maps        │
      └───────────────┘      └──────────────────┘    └───────────────────┘
```

**Key architectural rule (SRD 3.13 / Section 7):** every plan-gated feature (Revival, Campaigns, Analytics, API access, Homepage Featured) **must be enforced server-side** in Express middleware, never only hidden in the UI. The frontend hiding a button is a UX nicety, not a security boundary.

---

## 4. Repository Structure

**[DECISION NEEDED]** SRD doesn't mandate monorepo vs polyrepo. Recommended: **monorepo** (npm/pnpm workspaces) since frontend and backend ship together per milestone and share types.

```
vouchiqo/
├── apps/
│   ├── web/                              # Next.js app (all 3 surfaces)
│   │   ├── app/
│   │   │   ├── (customer)/
│   │   │   │   ├── page.tsx                        → /
│   │   │   │   ├── deals/page.tsx                  → /deals
│   │   │   │   ├── deal/[slug]/page.tsx             → /deal/:id
│   │   │   │   ├── brand/[brandSlug]/page.tsx       → /brand/:brandname
│   │   │   │   ├── category/[categorySlug]/page.tsx → /category/:categoryname
│   │   │   │   ├── deals/[city]/page.tsx            → /deals/[city-name]
│   │   │   │   ├── nearby-offers/page.tsx
│   │   │   │   ├── expired-coupon-revival/page.tsx
│   │   │   │   ├── auth/login/page.tsx
│   │   │   │   ├── auth/signup/page.tsx
│   │   │   │   └── profile/
│   │   │   │       ├── layout.tsx                  (tab nav: Saves/Wallet/Activity/Nearby/Settings)
│   │   │   │       ├── saves/page.tsx
│   │   │   │       ├── wallet/page.tsx
│   │   │   │       ├── activity/page.tsx
│   │   │   │       └── settings/page.tsx
│   │   │   ├── merchant/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── dashboard/
│   │   │   │       ├── layout.tsx                  (sidebar shell, plan badge, top header)
│   │   │   │       ├── page.tsx                    (overview / KPIs)
│   │   │   │       ├── post/page.tsx                (3 tabs: Coupon / Deal / Special Offer)
│   │   │   │       ├── listings/page.tsx
│   │   │   │       ├── listings/expired/page.tsx    (Revival management)
│   │   │   │       ├── analytics/page.tsx
│   │   │   │       ├── campaigns/page.tsx
│   │   │   │       ├── campaigns/[id]/edit/page.tsx
│   │   │   │       ├── subscription/page.tsx
│   │   │   │       ├── affiliate/page.tsx
│   │   │   │       ├── notifications/page.tsx
│   │   │   │       ├── settings/page.tsx            (5 sub-tabs)
│   │   │   │       └── support/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── page.tsx                        (dashboard)
│   │   │   │   ├── merchants/page.tsx
│   │   │   │   ├── merchants/[id]/page.tsx
│   │   │   │   ├── offers/verification/page.tsx
│   │   │   │   ├── revivals/page.tsx
│   │   │   │   ├── subscriptions/page.tsx
│   │   │   │   ├── content/page.tsx
│   │   │   │   └── users/page.tsx
│   │   │   ├── sitemap.xml/route.ts
│   │   │   └── robots.txt/route.ts
│   │   ├── components/
│   │   │   ├── customer/    (OfferCard, SearchBar, CategoryStrip, FlashDealsRail, FeaturedBrands, HowItWorks, TestimonialsCarousel, NearbyTeaser, NewsletterForm)
│   │   │   ├── merchant/    (Sidebar, KPICard, PlanBadge, PostListingForm/*, ListingsTable, CampaignCard, PlanComparisonCard, AddOnCard)
│   │   │   ├── admin/       (MerchantApprovalQueue, VerificationQueueRow, RevenueChart)
│   │   │   └── ui/          (shared primitives: Button, Modal, Badge, Tabs, Toast — see Section 8.4)
│   │   ├── lib/             (apiClient.ts, auth.ts, seo.ts, razorpayClient.ts, geolocation.ts)
│   │   ├── hooks/           (useAuth, useSavedOffers, usePlanGate, useDebouncedSearch)
│   │   ├── middleware.ts    (Next middleware: route protection for /merchant, /admin)
│   │   └── next.config.js
│   │
│   └── api/                              # Express backend
│       ├── src/
│       │   ├── config/       (db.ts, razorpay.ts, sendgrid.ts, cloudinary.ts, firebase.ts, env.ts)
│       │   ├── models/       (Mongoose schemas — see Section 5)
│       │   ├── routes/       (one router file per domain — see Section 6)
│       │   ├── controllers/
│       │   ├── middleware/   (auth.middleware.ts, rbac.middleware.ts, planGate.middleware.ts, rateLimiter.middleware.ts, errorHandler.ts, validate.middleware.ts)
│       │   ├── services/     (razorpay.service.ts, sendgrid.service.ts, revival.service.ts, seo.service.ts, upload.service.ts)
│       │   ├── jobs/         (cron: expiryReminder.job.ts, weeklyDigest.job.ts, subscriptionExpiryCheck.job.ts)
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared-types/         (TS interfaces shared by web + api: Offer, Merchant, User, Plan, etc.)
│
├── docs/
│   ├── ARCHITECTURE.md       (this file)
│   ├── API_POSTMAN_COLLECTION.json   (deliverable per SRD 6.5)
│   └── DB_SCHEMA.md
│
├── .env.example
└── package.json              (workspace root)
```

---

## 5. Data Model (MongoDB / Mongoose)

Multi-tenant isolation rule: every document owned by a merchant carries `merchantId`; every query from merchant-authenticated routes **must** filter by the authenticated merchant's own `merchantId` — enforced in middleware, not left to controller discipline.

### 5.1 `User` (customer)
```
_id, fullName, email (unique, indexed), passwordHash, mobile,
city, state, interests: [String],
authProvider: 'local' | 'google' | 'facebook', oauthId,
isEmailVerified: Boolean, otpCode, otpExpiresAt,
resetPasswordToken, resetPasswordExpiresAt,
notificationPrefs: { email: {...}, push: {...} },
role: 'customer',
createdAt, updatedAt
```

### 5.2 `Merchant`
```
_id, businessName, category, categoryTags: [String],
websiteUrl, gstNumber, businessType,
contactPerson: { name, designation },
businessEmail (unique, indexed), mobile, passwordHash,
status: 'pending' | 'active' | 'suspended' | 'rejected',
plan: 'starter' | 'growth' | 'pro' | 'enterprise',
planExpiresAt, trialEndsAt,
city, state, address, geo: { lat, lng },
logoUrl, description, socialLinks: {...},
twoFactorEnabled: Boolean,
apiKey, apiKeyRegeneratedAt,               // Pro/Enterprise only
razorpayCustomerId, razorpaySubscriptionId,
commissionModel: 'CPA' | 'CPA_CPC' | 'CPA_CPC_CPL' | 'custom',
bankDetails: { accountHolder, bankName, accountNumberMasked, ifsc },
createdAt, updatedAt

// Indexes: merchantId-style lookups, category, status, city+state (multi-tenant + Section 6.1)
```

### 5.3 `Offer` (unifies Coupon / Deal / Special Offer — `type` discriminates)
```
_id, merchantId (ref, indexed), type: 'coupon' | 'deal' | 'special_offer',
title, slug (unique, SEO), description, shortDescription, termsAndConditions, internalNote,

// coupon-specific
code, 

// deal-specific
dealUrl, dealImageUrl, originalPrice, salePrice,

// special-offer-specific
offerType: 'gift' | 'bogo' | 'loyalty' | 'referral' | 'bundle',
redemptionMethod: 'auto' | 'show_to_cashier' | 'enter_code' | 'visit_store',

discountType: 'percent' | 'flat' | 'free_shipping' | 'bogo',
discountValue, maxDiscountCap, minOrderValue,

categories: [ref Category], applicableFor: 'all' | 'new_users' | 'returning' | 'app_only',
geoRestriction: { allIndia: Boolean, states: [String] },
featuredOnHomepage: Boolean, includeInNewsletter: Boolean, campaignId (ref),

startAt, endAt, totalUsageLimit, perUserLimit, usageCount,

status: 'draft' | 'pending_review' | 'active' | 'paused' | 'expired' | 'rejected',
rejectionReason, verifiedAt, verifiedByAdminId,

clicks, redemptions, helpfulVotes: { up, down },
createdAt, updatedAt

// Indexes (SRD 6.1): merchantId, category, status, expiry_date(endAt), city (via merchant)
```

### 5.4 `Category`
```
_id, name, slug, emoji, parentCategoryId (optional, for sub-categories), isActive
```

### 5.5 `RevivalRequest`
```
_id, source: 'customer_form' | 'merchant_manual',
customerEmail, customerName,
brandRequested, merchantId (ref, resolved after matching),
originalOfferId (ref, optional), couponCodeRequested, customerNote,
status: 'new' | 'forwarded' | 'approved' | 'declined' | 'resolved',
revivalOption: 'keep_same_discount' | 'adjust_discount' | 'new_expiry',
newOfferId (ref, the regenerated live offer),
autoApproved: Boolean,
createdAt, resolvedAt
```

### 5.6 `RevivalStory` (admin-managed social proof feed, SRD 2.7)
```
_id, customerNameAnon, city, brand, amountSaved, timeAgoLabel, isActive, sortOrder
```

### 5.7 `Subscription`
```
_id, merchantId (ref), plan, billingCycle: 'monthly' | 'annual',
razorpaySubscriptionId, razorpayPlanId,
status: 'active' | 'expiring' | 'expired' | 'cancelled',
startedAt, currentPeriodEnd, prorationCreditsApplied,
createdAt
```

### 5.8 `Transaction` (billing history + GST invoices, SRD 3.9)
```
_id, merchantId (ref), type: 'subscription' | 'addon',
description, amount, gstAmount, totalAmount,
status: 'paid' | 'pending' | 'failed',
razorpayPaymentId, invoicePdfUrl, hsnCode,
createdAt
```

### 5.9 `AddOnPurchase`
```
_id, merchantId (ref),
addOnType: 'revival_pack' | 'campaign_boost' | 'homepage_slot' | 'push_notification' | 'festival_package' | 'analytics_report',
quantity, amount, purchasedAt, usageRemaining, expiresAt
```

### 5.10 `Campaign`
```
_id, merchantId (ref), name,
type: 'flash_sale' | 'festival' | 'seasonal' | 'new_user_drive' | 'clearance' | 'custom',
objective, description,
attachedOfferIds: [ref Offer],
promotionSettings: {
  homepageSlot: Boolean, pushNotification: { enabled, copy },
  newsletter: Boolean, targetAudience, socialShare: Boolean
},
status: 'draft' | 'scheduled' | 'live' | 'ended',
scheduledAt, launchedAt, endedAt,
stats: { clicks, redemptions, revenue },
createdAt
```

### 5.11 `CommissionEarning`
```
_id, merchantId (ref), listingOrCampaignId,
type: 'CPA' | 'CPC' | 'CPL', quantity, rate, earnings,
status: 'pending' | 'confirmed' | 'paid', periodMonth, createdAt
```

### 5.12 `MerchantNotification`
```
_id, merchantId (ref),
type: 'listing_approved' | 'expiring_soon' | 'listing_rejected' | 'weekly_report' | 'billing' | 'campaign_ended' | 'milestone' | 'action_required',
message, isRead: Boolean, createdAt
```

### 5.13 `SupportTicket`
```
_id, merchantId (ref), subject, message, attachmentUrl,
status: 'open' | 'in_progress' | 'resolved',
thread: [{ sender, text, createdAt }],
createdAt, updatedAt
```

### 5.14 `SavedOffer` (customer)
```
_id, userId (ref), offerId (ref), savedAt
```

### 5.15 `ActivityLog` (customer)
```
_id, userId (ref), type: 'offer_used' | 'offer_saved' | 'revival_submitted' | 'account_event', meta, createdAt
```

### 5.16 `NewsletterSubscriber`
```
_id, email (unique), city, subscribedAt, isActive
```

### 5.17 `AdminUser`
```
_id, email (unique), passwordHash, role: 'super_admin' | 'ops', createdAt
```

### 5.18 `PlatformContent` (SRD 4.6 — key/value content blocks)
```
_id, key: 'homepage_featured_merchants' | 'announcement_banner' | 'revival_feed' | 'category_config',
value: Mixed (JSON), updatedAt, updatedByAdminId
```

---

## 6. API Route Map (Express, `apps/api`)

All merchant/admin routes require JWT + role middleware. Plan-gated routes additionally run `planGate.middleware.ts` (see Section 7).

### 6.1 Auth
```
POST   /api/auth/customer/signup
POST   /api/auth/customer/login
POST   /api/auth/customer/google
POST   /api/auth/customer/facebook
POST   /api/auth/customer/verify-otp
POST   /api/auth/customer/resend-otp
POST   /api/auth/customer/forgot-password
POST   /api/auth/customer/reset-password

POST   /api/auth/merchant/register        (3-step payload)
POST   /api/auth/merchant/login
POST   /api/auth/merchant/forgot-password
POST   /api/auth/merchant/reset-password
POST   /api/auth/merchant/demo-login       (seeded read-only demo account)

POST   /api/auth/admin/login
```

### 6.2 Public / Customer-facing content
```
GET    /api/offers                 (filters: category, discountType, minDiscount, validity, newUsersOnly, brand, sort, page)
GET    /api/offers/:slug
POST   /api/offers/:id/save        (auth: customer)
DELETE /api/offers/:id/save        (auth: customer)
POST   /api/offers/:id/vote        (auth: customer)   body: { helpful: boolean }

GET    /api/brands
GET    /api/brands/:slug           (brand profile + active/expired offers)

GET    /api/categories
GET    /api/categories/:slug       (+ optional ?city=)

GET    /api/offers/nearby          (query: lat, lng, radiusKm)

POST   /api/revival-requests                (public form submit)
GET    /api/revival-requests/recent-stories (social proof feed)

POST   /api/newsletter/subscribe

GET    /api/homepage                (aggregated payload: flash deals, featured brands, testimonials, stats)
```

### 6.3 Customer account (auth required)
```
GET    /api/customer/profile
PATCH  /api/customer/profile
GET    /api/customer/saves
GET    /api/customer/activity
GET    /api/customer/wallet
PATCH  /api/customer/settings/notifications
DELETE /api/customer/account
```

### 6.4 Merchant dashboard (auth: merchant)
```
GET    /api/merchant/dashboard/overview

# Listings
POST   /api/merchant/listings
GET    /api/merchant/listings              (filters: status, type, category, sort)
GET    /api/merchant/listings/:id
PATCH  /api/merchant/listings/:id
DELETE /api/merchant/listings/:id
PATCH  /api/merchant/listings/bulk         (pause/delete/extend-expiry)

# Revival (plan-gated: Pro+, or add-on)
GET    /api/merchant/listings/expired
POST   /api/merchant/listings/:id/revive
GET    /api/merchant/revival-requests               (incoming from customers)
PATCH  /api/merchant/revival-requests/:id/approve
PATCH  /api/merchant/revival-requests/:id/decline
PATCH  /api/merchant/revival-requests/bulk
PUT    /api/merchant/revival-requests/auto-approval-rules   (Pro+)

# Analytics (locked on Starter)
GET    /api/merchant/analytics                     (query: range)
GET    /api/merchant/analytics/export.csv

# Campaigns (locked on Starter)
GET    /api/merchant/campaigns
POST   /api/merchant/campaigns
GET    /api/merchant/campaigns/:id
PATCH  /api/merchant/campaigns/:id
DELETE /api/merchant/campaigns/:id
POST   /api/merchant/campaigns/:id/launch

# Subscription & billing
GET    /api/merchant/subscription
POST   /api/merchant/subscription/upgrade          (creates Razorpay order/subscription)
POST   /api/merchant/subscription/addons/:addOnType/purchase
GET    /api/merchant/subscription/billing-history
GET    /api/merchant/subscription/invoices/:id.pdf
POST   /api/merchant/subscription/enterprise-enquiry

# Affiliate & commission
GET    /api/merchant/affiliate
PATCH  /api/merchant/affiliate/payout-details
POST   /api/merchant/affiliate/rate-change-request

# Notifications
GET    /api/merchant/notifications
PATCH  /api/merchant/notifications/:id/read
PATCH  /api/merchant/notifications/read-all

# Settings (5 tabs)
GET    /api/merchant/settings/business-profile
PATCH  /api/merchant/settings/business-profile
PATCH  /api/merchant/settings/security             (password, 2FA, sessions)
GET    /api/merchant/settings/sessions
DELETE /api/merchant/settings/sessions/:sessionId
PATCH  /api/merchant/settings/notification-prefs
GET    /api/merchant/settings/api-access           (Pro/Enterprise only)
POST   /api/merchant/settings/api-access/regenerate
PATCH  /api/merchant/settings/danger-zone/pause-listings
PATCH  /api/merchant/settings/danger-zone/deactivate
DELETE /api/merchant/settings/danger-zone/delete-account

# Support
GET    /api/merchant/support/tickets
POST   /api/merchant/support/tickets
GET    /api/merchant/support/tickets/:id
POST   /api/merchant/support/tickets/:id/reply
```

### 6.5 Admin (auth: admin, IP-whitelist recommended — SRD 6.2)
```
GET    /api/admin/dashboard

GET    /api/admin/merchants                (filters + search)
GET    /api/admin/merchants/pending
PATCH  /api/admin/merchants/:id/approve
PATCH  /api/admin/merchants/:id/reject
PATCH  /api/admin/merchants/:id/request-info
GET    /api/admin/merchants/:id            (full detail: profile, listings, subs, commissions, tickets, activity)
PATCH  /api/admin/merchants/:id/plan
PATCH  /api/admin/merchants/:id/suspend
PATCH  /api/admin/merchants/:id/revival-credits

GET    /api/admin/offers/verification-queue
PATCH  /api/admin/offers/:id/approve
PATCH  /api/admin/offers/:id/reject
PATCH  /api/admin/offers/bulk-approve

GET    /api/admin/revival-requests
PATCH  /api/admin/revival-requests/:id/forward
PATCH  /api/admin/revival-requests/:id/resolve

GET    /api/admin/subscriptions
GET    /api/admin/subscriptions/failed-payments
GET    /api/admin/addons/history
GET    /api/admin/payouts
PATCH  /api/admin/payouts/:id/mark-paid

GET    /api/admin/content/:key
PUT    /api/admin/content/:key             (homepage sections, banners, revival feed, categories)

GET    /api/admin/users
PATCH  /api/admin/users/:id/suspend
DELETE /api/admin/users/:id
GET    /api/admin/users/newsletter-subscribers.csv
```

### 6.6 Webhooks
```
POST   /api/webhooks/razorpay      (signature verification mandatory — SRD 6.2)
```

---

## 7. Auth, RBAC & Plan-Gating Design

### 7.1 Three independent auth domains
- **Customer**: NextAuth.js on the frontend (Google/Facebook OAuth + credentials provider that calls `/api/auth/customer/login`), session strategy = JWT, 24h expiry.
- **Merchant**: custom JWT issued directly by Express (`/api/auth/merchant/login`), stored in httpOnly cookie, 8h expiry + refresh token for "stay logged in".
- **Admin**: same pattern as merchant but separate secret/namespace, never shared with merchant tokens, and admin panel should sit behind an IP allowlist or extra password layer (SRD 6.2).

**[DECISION NEEDED]** Reconciling "JWT + NextAuth.js" from the SRD: NextAuth is naturally suited to the *customer* OAuth flow; merchant/admin panels are better served by a custom JWT/cookie layer talking straight to Express, since NextAuth sessions aren't designed for multi-role dashboards with 8h/24h differing expiries. Recommend documenting this split explicitly in the contract confirmation before development.

### 7.2 RBAC middleware (Express)
```ts
// middleware/rbac.middleware.ts
requireRole('customer' | 'merchant' | 'admin')
// verifies JWT signature + role claim + (for merchant) merchant.status === 'active'
```

### 7.3 Plan-gating middleware (server-enforced, SRD Section 7)
```ts
// middleware/planGate.middleware.ts
requirePlan(feature: 'revival' | 'campaigns' | 'analytics' | 'api_access' | 'homepage_featured')
// looks up req.merchant.plan against the feature matrix below
// on failure: 403 { message: "Feature not available on your current plan." }
```

**Plan feature matrix (SRD Section 7 — enforce exactly, on the server):**

| Feature | Starter | Growth | Pro | Enterprise |
|---|---|---|---|---|
| Active listings | 3 | 15 | Unlimited | Unlimited |
| Dashboard | ✗ | Basic | Advanced | Full suite |
| Analytics | ✗ | Standard | Deep | Custom |
| Campaign Manager | ✗ | 1/quarter | 4/year | Unlimited |
| Homepage Featured Slot | ✗ | ✗ | 2 days/mo | Custom |
| Push Notification | ✗ | ✗ | 1/month | Unlimited |
| Expired Offer Revival | ✗ | add-on only | 50/month | Unlimited |
| Read-only API | ✗ | ✗ | ✓ | Full R/W |
| Commission model | CPA only | CPA+CPC | CPA+CPC+CPL | Custom |
| Support SLA | 72hr email | 48hr email | 24hr priority | 4hr dedicated |
| 14-day free trial | — | ✓ | ✓ | — |

Razorpay plan IDs required: `vouchiqo_growth_monthly`, `vouchiqo_growth_annual`, `vouchiqo_pro_monthly`, `vouchiqo_pro_annual`. Starter = free (no Razorpay plan). Enterprise = manual invoice, no self-serve checkout. Mid-cycle upgrades must use Razorpay's proration — do not hand-roll proration math.

---

## 8. Feature Modules — In-Depth Breakdown

Each row: **Feature → Route(s) → Key components → Data touched → Notes**. Use this as the master checklist; check items off in Section 9 as they're built.

### 8.1 Customer Platform (SRD Section 2)

| Feature | Route | Components | Data | Notes |
|---|---|---|---|---|
| Homepage (hero, search, category strip, flash deals, featured brands, how-it-works, trending categories, testimonials, nearby teaser, app-download, for-merchants CTA, newsletter) | `/` | `HeroSection`, `SearchBar`, `CategoryStrip`, `FlashDealsRail`, `FeaturedBrands`, `HowItWorks`, `TrendingCategoriesGrid`, `TestimonialsCarousel`, `NearbyTeaser`, `AppDownloadCTA`, `ForMerchantsCTA`, `NewsletterForm` | `Offer` (featured/flash), `Merchant` (featured, min 16), platform stat aggregation | Must be SSR/SSG. Navy `#1A3C5E` hero, orange CTA. Countdown timer resets every 24h. |
| Deals browse | `/deals` | `FilterSidebar`, `SortDropdown`, `OfferCardGrid`, `ActiveFilterPills` | `Offer` (paginated/filtered) | **[DECISION NEEDED]** infinite scroll vs pagination — SRD leaves this to developer; pagination is simpler for SEO (crawlable page 2, 3…), recommended. |
| Offer Card (reusable) | used site-wide | `OfferCard` in `components/customer` | `Offer`, `SavedOffer` | Copy-to-clipboard with 2s "Copied!" state; save toggles login modal if unauthenticated; amber "expires in Xd" / red "Expired" badge logic. |
| Individual offer page | `/deal/[slug]` | `OfferDetailLeft`, `StickyCodeSidebar`, `SimilarOffers` | `Offer`, votes, comments | Slug format `brand-name-offer-title-coupon-code`. JSON-LD `Offer` schema required (Section 8.5 below). |
| Brand pages | `/brand/[brandSlug]` | `BrandHeader`, `OfferCardGrid`, `ExpiredOffersCollapsed` | `Merchant`, `Offer` (by merchant) | Expired section has "Request Revival" button → prefills revival form. |
| Category pages (+ city variant) | `/category/[categorySlug]`, `/category/[cat]-deals-[city]` | `CategoryHero`, `SubCategoryChips`, `OfferCardGrid` | `Category`, `Offer` | City+category URLs are the primary local-SEO driver — do not skip. |
| Nearby Offers | `/nearby-offers` | `NearbyDealList`, `GoogleMapPanel`, `LocationModal`, `DistanceFilter` | `Offer` + `Merchant.geo` | GPS permission → fallback manual Country/State/City/Locality picker. Ranchi/Jharkhand priority sort for Home Improvement category (SHOULD). Marker clustering required. |
| Expired Offer Revival (customer) | `/expired-coupon-revival` | `RevivalHero`, `HowRevivalWorks`, `RevivalRequestForm`, `RecentRevivalsFeed` | `RevivalRequest`, `RevivalStory` | On submit: DB write + email to merchant dashboard + confirmation email to customer. |
| Customer auth | `/auth/login`, `/auth/signup` | split-panel layout, OAuth buttons, OTP flow | `User` | OTP via email, resend after 60s. Forgot-password token expires 1h. |
| Customer profile | `/profile/*` (Saves / Wallet / Activity / Nearby / Settings tabs) | `ProfileTabs`, `SavedOffersGrid`, `WalletCard` (placeholder), `ActivityFeed`, `SettingsForm` | `SavedOffer`, `ActivityLog`, `User` | Wallet redemption button is UI-only ("Coming Soon") for MVP — no payout logic (Phase 2). |

### 8.2 Merchant Portal (SRD Section 3 — "if broken, Vouchiqo has no business model")

| Feature | Route | Components | Data | Notes |
|---|---|---|---|---|
| Merchant auth | `/merchant/login`, `/merchant/register` | `MerchantLoginForm`, `3-StepRegisterWizard`, `DemoLoginButton` | `Merchant` | Demo login = seeded read-only account with persistent yellow "DEMO" banner. Registration step 3 = plan selection (Starter/Growth/Pro/Enterprise cards). |
| Dashboard shell | `/merchant/dashboard/layout.tsx` | `Sidebar` (11 nav items), `TopHeaderBar`, `PlanExpiryBanner` | `Merchant` | Sidebar navy `#1A3C5E`; collapses to icon-rail on tablet, bottom tab bar (5 tabs) on mobile. |
| Dashboard overview | `/merchant/dashboard` | `KPICardRow` (4 cards), `PerformanceLineChart`, `TopCouponsTable`, `QuickActionsCard`, `PlanUsageCard`, `RecentActivityFeed`, `ContextualAlerts` | `Offer` aggregates, `Subscription` | Revival/Campaign quick actions locked+tooltip on Starter. |
| Post New Listing | `/merchant/dashboard/post` | `PostListingTabs` (Coupon / Deal / Special Offer), `LivePreviewPanel` | `Offer` (create, status=`pending_review`) | Live preview mirrors public `OfferCard` in real time as merchant types. "Submit for Review" → verification queue (admin). |
| Listings management | `/merchant/dashboard/listings` | `ListingsFilterBar`, `ListingsTable`, `BulkActionsToolbar` | `Offer` | Bulk pause/delete/extend-expiry. Expired sub-tab shows "Revive" (greyed on Starter/Growth per plan gate). |
| Revival management | `/merchant/dashboard/listings/expired` | `RevivalLockedCard` (Starter/Growth), `RevivalUsageBar` (Pro/Enterprise), `RevivalTable`, `ReviveModal`, `RevivalRequestsTab`, `AutoApprovalRulesToggle` | `RevivalRequest`, `Offer` | Plan gate at both UI and `requirePlan('revival')` middleware. Auto-approval rules engine is Pro+ only. |
| Analytics | `/merchant/dashboard/analytics` | `DateRangePicker`, `KPICards`, `ClicksVsRedemptionsChart`, `TopCouponsBarChart`, `TrafficSourceDonut`, `BestDaysBarChart`, `CouponPerformanceTable` | `Offer` aggregates | Starter = fully locked page. Audience Insights + Revival Stats sections are Pro+ (SHOULD). |
| Campaign Manager | `/merchant/dashboard/campaigns` | `CampaignList`, `CreateCampaignWizard` (4 steps) | `Campaign` | Starter fully locked. Step 4 launch options: Draft / Schedule / Launch Now. |
| Subscription & Billing | `/merchant/dashboard/subscription` | `CurrentPlanCard`, `PlanComparisonGrid`, `UpgradeModal` (3-step), `AddOnsGrid` (6 cards), `BillingHistoryTable` | `Subscription`, `Transaction`, `AddOnPurchase` | Razorpay checkout embedded in step 2 of upgrade modal. GST-formatted invoice PDFs mandatory. |
| Affiliate & Commission | `/merchant/dashboard/affiliate` | `CommissionModelCard`, `EarningsTable`, `PayoutDetailsCard` | `CommissionEarning`, `Merchant.bankDetails` | Affiliate network integration cards (Admitad, vCommission) are SHOULD only. |
| Notifications | `/merchant/dashboard/notifications` | `NotificationTabs`, `NotificationList` | `MerchantNotification` | Types: approved/expiring/rejected/report/billing/campaign-ended/milestone/action-required. |
| Settings | `/merchant/dashboard/settings` | 5-tab layout: `BusinessProfileTab`, `SecurityTab`, `NotificationPrefsTab`, `APIAccessTab` (Pro/Ent only), `DangerZoneTab` | `Merchant` | API Access tab must 403/hide for Starter/Growth. Delete Account requires type-to-confirm + 30-day recovery window messaging. |
| Help & Support | `/merchant/dashboard/support` | `SLABanner`, `QuickHelpAccordion`, `ContactForm`, `TicketHistoryTable` | `SupportTicket` | SLA text driven by `merchant.plan` (72/48/24/4 hr). |

### 8.3 Admin Panel (SRD Section 4 — "not optional")

| Feature | Route | Components | Data | Notes |
|---|---|---|---|---|
| Admin dashboard | `/admin` | KPI row, `RevenueTrendChart`, `MerchantGrowthChart`, `UserGrowthChart` | Aggregated across all collections | Pending approvals + coupons-awaiting-verification counts must be prominent (they're operational blockers). |
| Merchant management | `/admin/merchants`, `/admin/merchants/[id]` | `MerchantTable`, `PendingApprovalQueue`, `MerchantDetailView` | `Merchant`, related listings/subs/commissions/tickets | Approve → welcome email + activate. Reject → reason email. Admin can manually change plan/suspend/add revival credits. **Marbella pre-seeded account** (see Section 10 seed data) must exist per SRD 4.2. |
| Offer verification queue | `/admin/offers/verification` | `VerificationQueueTable`, `TestCodeLink`, bulk approve | `Offer` (status=`pending_review`) | "Test Code" opens merchant's live URL for manual QA before Approve & Publish. Priority queue for Pro/Enterprise submissions. |
| Revival request management | `/admin/revivals` | `RevivalRequestsTable` | `RevivalRequest` | Admin can forward to merchant or manually resolve after 48h of merchant non-response. |
| Subscription & revenue mgmt | `/admin/subscriptions` | `SubscriptionOverview`, `FailedPaymentAlerts`, `AddOnRevenueSummary`, `PayoutManagement` | `Subscription`, `Transaction`, `CommissionEarning` | MRR total displayed at top. Failed Razorpay payments need a retry + contact-merchant action. |
| Platform content mgmt | `/admin/content` | `HomepageSectionsEditor`, `RevivalFeedEditor`, `AnnouncementBannerEditor`, `CategoryManager` | `PlatformContent`, `Category`, `RevivalStory` | Controls which merchants appear in Featured Brands / homepage featured slot. |
| User management | `/admin/users` | `UserTable`, CSV export | `User`, `NewsletterSubscriber` | Delete = full data wipe (confirm GDPR-style deletion semantics with owner). |

### 8.4 Shared UI Component Library (`components/ui`)

These primitives are used across all three surfaces (customer, merchant, admin) and should be built once, styled with a shared theme (navy `#1A3C5E` / orange primary / teal category tags), and reused rather than re-implemented per page:

| Component | Used by | Notes |
|---|---|---|
| `Button` | everywhere | Variants: primary (orange), outline (white/navy), danger (red), locked (grey + lock icon for plan-gated actions) |
| `Modal` | offer copy modal, upgrade flow, revive modal, confirmation dialogs | Needs a "confirmation" sub-variant with type-to-confirm support (danger zone) |
| `Badge` / `Pill` | Verified badge, discount badge, status pills, plan badges | Color-coded by status: green=active/verified, amber=expiring/pending, red=expired/rejected, grey=draft/starter |
| `Tabs` | profile tabs, post-listing tabs, settings tabs, support tabs | Both top-tab and sidebar-tab layouts needed |
| `Toast` | "Copied!", save confirmations, form success/error | 2-second auto-dismiss for copy actions per SRD 2.2 |
| `ProgressBar` | plan usage bars (listings/campaigns/revival credits), password strength, registration wizard steps | |
| `DataTable` | listings, analytics, billing history, admin queues | Needs sortable columns, row actions, bulk-select checkbox column |
| `EmptyState` | "My Saves" empty state, no-results states | Illustration + CTA button pattern |
| `LockedFeatureCard` | Analytics/Campaigns/Revival on Starter plan | Explanation copy + Upgrade CTA — drives upsell, must be consistent everywhere a plan gate hides a feature |

---

## 9. Feature Status Tracker

> Update these checkboxes as implementation proceeds — this section is what tells an editor/agent "what already exists in this codebase" at a glance. Priorities are from SRD Section 9.

### High priority — must ship for MVP
- [ ] Homepage (all sections)
- [ ] Customer auth (signup/login/OAuth/OTP/forgot-password)
- [ ] Customer profile (saves + activity)
- [ ] Deals browse page (filters + grid)
- [ ] Individual offer page (copy-code + modal)
- [ ] Brand pages
- [ ] Category pages (incl. city+category SEO URLs)
- [ ] Nearby offers + Google Maps
- [ ] Expired Offer Revival — customer page + form
- [ ] Merchant auth (3-step register, login, first-login onboarding)
- [ ] Merchant dashboard shell
- [ ] Post New Listing (3 tabs + live preview)
- [ ] Listings management (CRUD)
- [ ] Merchant analytics (Growth+)
- [ ] Subscription & billing (4 plans + Razorpay upgrade flow)
- [ ] Add-ons purchase flow (6 add-ons)
- [ ] Billing history + GST invoice PDFs
- [ ] Revival management (merchant side)
- [ ] Campaign manager (basic, Growth+)
- [ ] Admin: merchant approval queue
- [ ] Admin: offer verification queue
- [ ] Admin: subscription & revenue management
- [ ] All 15 email notification types (Section 11)
- [ ] SEO: dynamic meta + JSON-LD on all public pages
- [ ] SEO: city+category URL pages
- [ ] XML sitemap auto-generation
- [ ] Full mobile responsiveness

### Medium priority — in MVP if timeline allows, else Phase 2
- [ ] Cashback wallet (placeholder UI only, no backend logic)
- [ ] Merchant account settings (all 5 tabs)
- [ ] Help & support ticketing
- [ ] Affiliate & commission tracking
- [ ] Merchant notification centre
- [ ] App-download "coming soon" + email capture
- [ ] City-specific deal pages `/deals/[city]`

### Low priority — explicitly Phase 2, do not build unless asked
- [ ] Audience insights in analytics (Pro+)
- [ ] Full read/write API access for Enterprise
- [ ] WhatsApp Business API integration
- [ ] Advanced push notification segmentation
- [ ] Cashback wallet real payout logic (fintech/banking integration)
- [ ] Native mobile app (iOS/Android)

---

## 10. Seed / Fixture Data Required (SRD 8.5)

- Marbella merchant account: business name "Marbella", category "Home Improvement — Tiles, Sanitary & Granite", location Ranchi/Jharkhand, login `marbellaranchi11@gmail.com`, plan Starter, category tags Tiles/Sanitary Ware/Granite/Flooring pre-selected.
- One seeded **demo merchant** account (read-only, pre-populated dashboard data, for the "Try Demo Dashboard" login button).
- Minimum 40 dummy coupons spread across all 16 categories.
- Minimum 16 featured brands with logos for the homepage Featured Brands row.
- Minimum 6 testimonials, minimum 5 Recent Revivals stories.

---

## 11. Email Notification Matrix (SRD 6.4 — all 15 required)

| Trigger | Recipient | Template purpose |
|---|---|---|
| Merchant registration submitted | Admin | New application review link |
| Merchant registration approved | Merchant | Welcome + dashboard login link |
| Merchant registration rejected | Merchant | Reason + reapply link |
| Offer submitted for review | Merchant | "Under review, live within 4h" |
| Offer approved & live | Merchant | View listing link |
| Offer rejected | Merchant | Reason + edit/resubmit link |
| Offer expiring in 3 days | Merchant | Renew/extend link |
| Subscription payment confirmed | Merchant | Invoice attached |
| Subscription payment failed | Merchant | Update payment method link |
| Revival request from customer | Merchant | Review request link |
| Customer OTP verification | Customer | 6-digit OTP, 10 min validity |
| Customer forgot password | Customer | Reset link, 1h validity |
| Revival request confirmation | Customer | "We'll update you in 48h" |
| Revival approved — fresh code | Customer | New code + new expiry |
| Weekly deals digest | Customer (opted-in) | Top 10 picks in their city |

All emails: HTML templates (not plain text), sent from `noreply@vouchiqo.com` / `merchant@vouchiqo.com` via SendGrid, branded with logo/colors/CTA buttons.

---

## 12. SEO Architecture (SRD Section 5 — non-negotiable)

| Page type | URL pattern | Title pattern |
|---|---|---|
| Homepage | `/` | `Best Verified Offers & Deals in India [Mon YYYY] — Vouchiqo` |
| All deals | `/deals` | `Today's Verified Offers & Deals — Vouchiqo` |
| Category | `/category/[name]-coupons-deals` | `[Category] Coupons & Deals [Mon YYYY] — Vouchiqo` |
| Brand | `/brand/[brandname]-coupons` | `[Brand] Coupon Codes [Mon YYYY] — Up to X% Off \| Vouchiqo` |
| Individual coupon | `/deal/[brand]-[title]-coupon` | `[Brand] [X% Off] Coupon Code [Mon YYYY] — Vouchiqo` |
| City deals | `/deals/[city-name]` | `Deals & Offers in [City] [Mon YYYY] — Vouchiqo` |
| City + category | `/category/[cat]-deals-[city]` | `[Category] Deals in [City] [Mon YYYY] — Vouchiqo` |
| Nearby offers | `/nearby-offers` | `Offers & Deals Near Me — Find Verified Offers Near [City] \| Vouchiqo` |
| Expired revival | `/expired-coupon-revival` | `Expired Offer? Revive It Free — Vouchiqo Revival` |

Mandatory implementation rules:
- Every public page SSR or SSG — **never client-rendered only**.
- Meta title/description generated dynamically per offer/brand/category from DB fields, including current month/year.
- JSON-LD `Offer` schema (name, description, discount, validFrom, validThrough, url, seller) on every coupon page.
- `/sitemap.xml` auto-regenerates on new coupon/brand/category creation; submit to Search Console.
- `/robots.txt` allows all public routes, disallows `/merchant`, `/admin`, `/auth`, `/profile`, `/api`.
- Canonical tags everywhere; paginated lists use `?page=2` with correct canonical handling.
- Open Graph + Twitter Card tags on all public pages.
- Dynamically generated `alt` text for every coupon image / brand logo / category image.

---

## 13. Security Checklist (SRD Section 6.2)

- [ ] bcrypt password hashing, ≥12 rounds, never logged in plaintext.
- [ ] JWT expiry: 24h customer / 8h merchant, with refresh-token flow.
- [ ] Rate limiting on all auth endpoints — 5 failed attempts → 15 min lockout.
- [ ] Server-side input sanitization on all endpoints — NoSQL injection + XSS prevention.
- [ ] HTTPS enforced; HTTP → HTTPS redirect.
- [ ] `/admin` behind IP allowlist or additional auth layer.
- [ ] Razorpay webhook signature verification on every callback — never trust unverified payment events.
- [ ] CORS locked to `vouchiqo.com` origin only.
- [ ] All plan-gated features re-checked server-side (see Section 7.3) — a hidden button is not a security control.

---

## 14. Performance & Responsive Design (SRD 6.1, 6.3)

- Core Web Vitals targets: LCP < 2.5s (mobile 4G), FID < 100ms, CLS < 0.1.
- `next/image` for all images — no raw `<img>` on customer-facing pages.
- API-level caching for coupon lists / category pages, invalidated on publish/update.
- Mongo indexes on: `merchantId`, `category`, `status`, `endAt` (expiry), `city`.
- Breakpoints: mobile < 768px, tablet 768–1024px, desktop > 1024px. Test explicitly at 375px (iPhone SE) and 390px.
- Merchant dashboard: sidebar → bottom tab bar on mobile; tables → card-list view; multi-column forms → single column.
- Touch targets ≥ 44×44px; no unintended horizontal scroll.

---

## 15. Environment Variables (`.env.example` — populate before Sprint 1)

```
# Database
MONGODB_URI=

# Auth
JWT_CUSTOMER_SECRET=
JWT_MERCHANT_SECRET=
JWT_ADMIN_SECRET=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# File storage (pick one — see Section 2 decision)
CLOUDINARY_URL=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Email
SENDGRID_API_KEY=
EMAIL_FROM_NOREPLY=noreply@vouchiqo.com
EMAIL_FROM_MERCHANT=merchant@vouchiqo.com

# Maps & Push
GOOGLE_MAPS_API_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=

# App
NEXT_PUBLIC_APP_URL=https://vouchiqo.com
NEXT_PUBLIC_API_URL=https://api.vouchiqo.com
```

---

## 16. Open Decisions Needed Before/During Build

These are ambiguous or unspecified in the SRD — flag with the project owner rather than silently assuming:

1. Cloudinary vs AWS S3 for file storage.
2. Infinite scroll vs pagination on `/deals` (SRD explicitly leaves this to developer).
3. TypeScript vs JavaScript (recommended: TypeScript).
4. Testing strategy/framework — not mentioned in SRD at all; recommend Jest + React Testing Library (web) and Jest + Supertest (api) at minimum for auth, payment webhook, and plan-gating logic given their business-criticality.
5. Whether "Brand" is a first-class collection or purely a derived view over `Merchant` — modeled here as the latter (simpler, avoids duplicate data), confirm before building brand CRUD in admin content management.
6. Exact NextAuth vs custom-JWT split for merchant/admin (see Section 7.1).

---

## 17. Delivery Milestones (SRD Section 8.1 — map directly to sprint planning)

| Milestone | % Payment | Target | Must be working |
|---|---|---|---|
| 1 | 20% | Contract signed | Repo created, founder as GitHub owner |
| 2 | 20% | End of Week 4 | Merchant + customer auth working; DB schema live on Atlas |
| 3 | 20% | End of Week 8 | Post → verify → admin approve → live pipeline; Razorpay subscription tested; deal browsing live |
| 4 | 20% | End of Week 11 | Merchant dashboard complete (analytics, campaigns, revival); admin panel complete; nearby offers + maps; all 15 email triggers |
| 5 | 20% | Final approval | Full deploy on vouchiqo.com; bugs resolved; full handover package |

Use this table to sequence backlog/sprints so each milestone's "must be working" list is demonstrably true at that checkpoint.