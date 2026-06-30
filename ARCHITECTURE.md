# Vouchiqo — Full Architecture & Project Flow

> **Read this file first.** It is the single source of truth for how Vouchiqo works —
> what every screen does, how every actor moves through the system, and how all the
> pieces connect. Read it alongside `SRD v1.0` and `SRD Amendment v1.1`.

---

## Table of Contents

1. [What is Vouchiqo?](#1-what-is-vouchiqo)
2. [Three Actors](#2-three-actors)
3. [Platform URL Map](#3-platform-url-map)
4. [System Layers](#4-system-layers)
5. [Homepage — Full Breakdown](#5-homepage--full-breakdown)
6. [Customer Flow — Start to End](#6-customer-flow--start-to-end)
7. [Merchant Flow — Start to End](#7-merchant-flow--start-to-end)
8. [Admin Flow — Start to End](#8-admin-flow--start-to-end)
9. [Expired Coupon Revival Flow](#9-expired-coupon-revival-flow)
10. [Hot Deals Ticker — Priority Engine](#10-hot-deals-ticker--priority-engine)
11. [Personalisation Engine](#11-personalisation-engine)
12. [Location System](#12-location-system)
13. [Brand / Merchant Page](#13-brand--merchant-page)
14. [Customer Savings Dashboard](#14-customer-savings-dashboard)
15. [Revenue Model](#15-revenue-model)
16. [Data Models — Key Entities](#16-data-models--key-entities)
17. [State Machines](#17-state-machines)
18. [Feature Dependency Map](#18-feature-dependency-map)
19. [Developer Notes & Constraints](#19-developer-notes--constraints)

---

## 1. What is Vouchiqo?

Vouchiqo is an Indian coupon and deal aggregation platform. It connects three groups:

- **Customers** who browse, save, and redeem discount coupons — for free.
- **Merchants** who pay a monthly subscription to list their deals and gain customer visibility.
- **Vouchiqo (Admin)** which runs the platform, manages quality, and monetises through subscriptions, paid placements, and affiliate commissions.

**Core differentiator:** The *Expired Coupon Revival* system. Customers submit expired discount codes; Vouchiqo contacts the merchant and negotiates reactivation within 48 hours. No other Indian coupon platform offers this. It is the platform's primary retention and trust hook.

---

## 2. Three Actors

| Actor | Access | Primary Goal |
|---|---|---|
| **Customer** | Public site + `/profile` | Find deals, save money, track savings |
| **Merchant** | `/merchant/dashboard` | List coupons, gain visibility, track redemptions |
| **Admin (Vouchiqo)** | `/admin` panel | Approve merchants, manage ticker, process revivals, track revenue |

Customers and merchants use separate auth systems. Admin is internal only.

---

## 3. Platform URL Map

```
/ ................................ Homepage
/deals ........................... All deals — filterable by location, category, discount
/deal/:id ........................ Individual deal page
/brand/:slug-coupons-deals ....... Merchant public profile page
/expired-coupon-revival .......... Expired coupon revival — full page
/categories ...................... Category listing
/nearby .......................... Nearby offers (map-based)

/auth/signup ..................... Customer registration (2 steps)
/auth/login ...................... Customer login
/profile ......................... Customer profile hub
  /profile#savings ............... My Savings dashboard (NEW — first tab)
  /profile#saved-deals ........... Saved/bookmarked deals
  /profile#cashback .............. Cashback wallet
  /profile#activity .............. Redemption history
  /profile#settings .............. Preferences, location, interests, auth

/merchant/signup ................. Merchant registration
/merchant/login .................. Merchant login
/merchant/dashboard .............. Merchant hub
  /merchant/dashboard/deals ....... Deal management (create/edit/delete)
  /merchant/dashboard/analytics ... Performance analytics
  /merchant/dashboard/profile ..... Business profile editor (feeds /brand page)
  /merchant/dashboard/billing ..... Subscription plan + add-ons
  /merchant/dashboard/revivals .... Incoming revival requests

/admin ........................... Admin panel
  /admin/merchants ................ Merchant approvals and management
  /admin/ticker ................... Ticker management (pin/unpin/order)
  /admin/revivals ................. Revival request queue
  /admin/deals .................... Deal quality control
  /admin/revenue .................. Revenue dashboard
```

---

## 4. System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOMER-FACING FRONTEND                                        │
│  Homepage · /deals · /deal/:id · /brand/:slug · /profile        │
├─────────────────────────────────────────────────────────────────┤
│  MERCHANT DASHBOARD FRONTEND                                     │
│  Deal management · Analytics · Brand profile editor · Billing   │
├─────────────────────────────────────────────────────────────────┤
│  ADMIN PANEL FRONTEND                                            │
│  Merchant approvals · Ticker control · Revival queue · Revenue  │
├──────────────────────┬──────────────────────────────────────────┤
│  PRIORITY ENGINE     │  PERSONALISATION ENGINE                  │
│  Ticker order logic  │  Interest + location filtering           │
├──────────────────────┴──────────────────────────────────────────┤
│  APPLICATION BACKEND / API                                       │
│  Auth · Deals · Merchants · Revivals · Payments · Analytics     │
├─────────────────────────────────────────────────────────────────┤
│  DATABASE                                                        │
│  Users · Merchants · Deals · Revivals · Transactions · Sessions │
├─────────────────────────────────────────────────────────────────┤
│  EXTERNAL SERVICES                                               │
│  Google Maps · Payment gateway · Email · Push notifications     │
│  Affiliate tracking (CoupX) · OAuth (Google / Apple)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Homepage — Full Breakdown

The homepage is the most complex screen. It serves anonymous visitors, logged-in customers, and acts as the primary acquisition surface for merchants (via the ticker).

### 5.1 Layout — Top to Bottom

```
[NAVBAR]
  Logo | Search | Location Badge | Revive Coupon | Categories | Login/Avatar

[HOT DEALS TICKER BAR]          ← fixed/sticky, always visible on scroll
  🔴 HOT DEALS | [deal items scrolling right-to-left] | View All Hot Deals →

[HERO SECTION]
  Main headline · CTA · Search bar

[LOCATION PROMPT BAR]           ← shown only when no location is set
  📍 See deals near you — set your location  [Set Location]

[CATEGORY STRIP]
  16 category chips — interest-selected ones highlighted in orange, shown first

[PERSONALISED DEALS FEED]
  Heading: "Today's Top Deals"            ← anonymous
  Heading: "Your Personalised Deals, [Name]"  ← logged-in
  [Edit Preferences] link next to heading (logged-in only)
  
  Tab switcher (when location is set):
    [🔴 Near Ranchi]  [🔴 All India]
  
  Deal card grid — ordered by interests + location

[EXPIRED COUPON REVIVAL SECTION]
  Full-width section between "How It Works" and "Trending Categories"
  Left: headline + stats + inline mini-form
  Right: animated SVG (expired → revived coupon)

[HOW IT WORKS SECTION]

[TRENDING CATEGORIES GRID]

[FOOTER]
  Quick Links: Expired Coupon Revival (FIRST link) | ...
```

### 5.2 Homepage State Machine

```
Visitor arrives
      │
      ├── Has saved location? ──NO──► Show location prompt bar
      │         │YES
      │         └──► Show "Near [City]" tab as default active
      │
      ├── Has account + logged in?
      │         │NO ──► Anonymous session
      │         │         └── Has localStorage interests?
      │         │                   │NO ──► After 10s / 40% scroll: show interest banner
      │         │                   │YES ──► Reorder feed from localStorage
      │         │
      │         │YES ──► Load interests from DB profile
      │                   └── Show "Your Personalised Deals, [Name]"
      │                   └── Show "Edit Preferences" link
      │
      └── Interest banner dismissed?
                │YES ──► Set 30-day dismissal cookie; do not show again
                │NO  ──► Show again on next visit (within 30 days)
```

### 5.3 Interest Capture Banner (Anonymous)

- Appears: after 10 seconds OR after 40% scroll — whichever is first.
- Does NOT appear for logged-in users.
- Dismissed state stored in `localStorage` — suppressed for 30 days.
- On selection: `localStorage.set('interests', [...categories])` → feed reorders instantly without reload.
- "No thanks" link dismisses with no selection; still stores dismissal to prevent re-showing.

---

## 6. Customer Flow — Start to End

### 6.1 First Visit (Anonymous)

```
1. LAND on homepage
   └── Ticker bar scrolls above-the-fold deals (paid/premium first)
   └── Location prompt bar appears (no location saved)
   └── After 10s / 40% scroll → interest banner slides in from bottom

2. SET LOCATION (optional, zero friction)
   └── Click location badge in navbar → dropdown appears
   └── Options: "Use My GPS" | Search city | State dropdown
   └── Selection → saved to localStorage → feed shows "Near [City]" tab
   └── "Local Deal" badge appears on cards from nearby merchants

3. SELECT INTERESTS (optional, zero friction)
   └── Multi-select from 16 category chips
   └── "Show Me Deals →" button
   └── Feed reorders — selected categories float to top
   └── Banner dismisses; stored in localStorage for 30 days

4. BROWSE DEALS
   └── Via homepage feed → click card → /deal/:id
   └── Via /deals page → apply filters (location, category, discount %, expiry)
   └── Via /brand/:slug → full merchant profile page
   └── Via ticker → any item is a link → /deal/:id

5. ENCOUNTER EXPIRED COUPON
   └── Expired tab on /brand/:slug → "Request Revival" button on each card
   └── Homepage revival section → inline mini-form
   └── /expired-coupon-revival page → full form
   └── Submits: code + brand name + email → sees inline success message
```

### 6.2 Registration

```
TRIGGER: Customer tries to save a deal, access cashback wallet, or submit a revival

STEP 1 — Credentials
   └── Email + Password  OR  Google OAuth  OR  Apple OAuth
   └── Email verification link sent (email/password flow)

STEP 2 — Interest Selection
   └── 16 category chips, multi-select
   └── Saved to DB → feeds ALL personalisation surfaces
   └── Pre-fills from localStorage if set during anonymous session

POST-SIGNUP
   └── Location from anonymous session carried over to DB profile
   └── Redirected to original destination (deal page / profile / etc.)
```

### 6.3 Logged-In Experience

```
HOMEPAGE (logged in)
   └── Section heading: "Your Personalised Deals, [First Name]"
   └── "Edit Preferences" link → side panel → update interests → feed refreshes instantly
   └── Non-selected categories appear in "More Deals" section below
   └── If no interests set: nudge card → "Tell us what you like →" → /profile#settings

BROWSING
   └── "Follow Brand" button on /brand pages → stores followed brands
   └── Deal alerts: push notifications for followed brands' new deals
   └── Weekly email digest: only deals from selected interest categories

REDEEMING A DEAL
   └── Open /deal/:id
   └── Copy coupon code (button) → code copied to clipboard
   └── Click "Get Deal" → redirects to merchant website (new tab)
   └── If affiliate-tracked: purchase recorded in Vouchiqo system
   └── Savings amount auto-calculated and added to Savings Dashboard

SAVINGS DASHBOARD (/profile#savings)
   └── KPI cards: Saved This Month | Total Lifetime Savings | Spend Tracked | Savings Rate %
   └── 12-month chart: savings line (orange) vs spending line (navy)
   └── Category donut: where I save most — click slice to filter table below
   └── Top 5 Brands bar chart: ₹ saved per brand with brand logos
   └── Transaction table: every tracked use — sortable, filterable, exportable to CSV
   └── Milestone badges: ₹500 / ₹1k / ₹5k / ₹10k saved → confetti animation on unlock
   └── "Share My Savings" → generates image card → shareable to WhatsApp / Instagram / Twitter
```

---

## 7. Merchant Flow — Start to End

### 7.1 Signup and Onboarding

```
1. MERCHANT DISCOVERS VOUCHIQO
   └── Direct outreach by Vouchiqo sales team
   └── Or self-discovery via platform

2. MERCHANT SIGNUP (/merchant/signup)
   └── Business name, email, category (one of 16), website, GSTIN (optional)
   └── Email verified → dashboard access with Starter plan

3. PLAN SELECTION (/merchant/dashboard/billing)
   └── Starter  → basic listing, ticker only if slots unfilled
   └── Growth   → higher ticker priority (CTR-sorted), blue "Growth Partner" badge
   └── Pro      → always in ticker (redemption-rate sorted), purple "Pro Partner" badge
   └── Enterprise → always first in tier, orange "Enterprise Partner" badge, full analytics

   Payment processed → plan activates → priority engine updates automatically
```

### 7.2 Building the Brand Page

```
/merchant/dashboard/profile → feeds /brand/[slug]-coupons-deals

BRAND PROFILE FIELDS:
   ├── Cover image (1200×300px) — fallback: auto-generated gradient from brand colour
   ├── Brand logo (80px circle)
   ├── Short description (300 chars)
   ├── Long description (1000 chars, optional, collapsible on public page)
   ├── Full business address → Street, City, State, Pincode, Country
   ├── Google Maps embed auto-appears for physical businesses
   ├── Contact: Phone (click-to-call) | WhatsApp number | Business email
   ├── Operating hours: Mon–Sun per day, Open/Close time, "Closed" toggle per day
   └── Business type: "Online Store" | "Physical Store" | "Online + Physical"
       └── Map section hidden for "Online Store" merchants

"Preview My Brand Page" button → opens /brand/[slug] in new tab
```

### 7.3 Creating and Publishing Deals

```
/merchant/dashboard/deals → New Deal

DEAL FIELDS:
   ├── Title (short, customer-facing)
   ├── Coupon code (the actual code customers copy)
   ├── Discount type: Percentage (%) or Flat (₹)
   ├── Discount value
   ├── Original / MRP price (used for savings calculation)
   ├── Validity dates (start → end)
   ├── Category (one of 16 — determines personalisation targeting)
   ├── Deal type: Online | In-Store | Both
   └── Terms & conditions (optional)

ON PUBLISH:
   └── Deal enters priority engine immediately
   └── Appears on /deals, /brand/[slug], and homepage feed
   └── Ticker placement based on plan tier (automatic, no manual action)
   └── Expired at end date → auto-moves to Expired tab on /brand page
```

### 7.4 Buying Paid Placement Add-Ons

```
/merchant/dashboard/billing → Add-Ons

AVAILABLE ADD-ONS:
   ├── Homepage Featured Slot — ₹999 / 3 days
   │     └── Elevates merchant to Priority 1 in ticker (above all plan-based order)
   │     └── Auto-activates on payment — no admin action needed
   │     └── Card text: "Your deals appear first in the Hot Deals ticker bar for 3 consecutive days"
   │
   └── Flash Campaign Boost — ₹799 / campaign duration
         └── Elevated for the campaign's active period
         └── Auto-activates on payment

TICKER IMPRESSIONS (Analytics page):
   └── KPI card: "Ticker Impressions this month — how many times your deals appeared in the ticker"
```

### 7.5 Monitoring Analytics

```
/merchant/dashboard/analytics

KPI CARDS:
   ├── Deal clicks (total and per deal)
   ├── Coupon uses / redemptions
   ├── Ticker Impressions (NEW — how often deal appeared in ticker)
   ├── Brand Page Views (monthly unique visitors to /brand/[slug])
   └── Avg discount offered

PERFORMANCE TABLE:
   └── Per-deal: clicks, uses, CTR, redemption rate, days remaining

TREND CHARTS:
   └── Monthly: clicks vs redemptions vs impressions
   └── Top performing deals by redemption rate
```

---

## 8. Admin Flow — Start to End

### 8.1 Merchant Approval

```
NEW MERCHANT SIGNUP EVENT
      │
      ▼
Admin notified → /admin/merchants → review application
      │
      ├── Checks: business name, website (live?), category, GSTIN
      │
      ├── APPROVE
      │     └── Merchant gets full dashboard access
      │     └── Plan activates (Starter by default until payment)
      │
      └── REJECT
            └── Reason recorded and sent to merchant
            └── Merchant can reapply with corrections
```

### 8.2 Ticker Management

```
/admin/ticker

VIEWS:
   ├── Current ticker order (live preview of what customers see)
   ├── Priority breakdown: Paid slots | Enterprise | Pro | Growth | Starter
   ├── Which merchants have active paid Featured Slots (+ expiry dates)
   └── Per-deal: impressions, clicks, current position

ACTIONS:
   ├── Manually PIN a deal → forces it to top regardless of automatic order
   ├── UNPIN a pinned deal → returns to automatic priority
   └── OVERRIDE order for specific deals or campaigns
```

### 8.3 Revival Queue Management

```
/admin/revivals

INCOMING REQUEST CONTAINS:
   ├── Customer email
   ├── Expired coupon code
   └── Brand / store name (auto-matched to merchant in DB if registered)

ADMIN WORKFLOW:
   1. Open request in queue
   2. Identify merchant (registered on Vouchiqo or external)
   3. Contact merchant via:
         └── Dashboard notification (if registered merchant)
         └── Direct email (if not on platform — opportunity to pitch)
   4. Wait for merchant response (48-hour SLA)
   5. Relay outcome to customer by email

OUTCOMES:
   ├── APPROVED
   │     └── Merchant provides new/extended code
   │     └── Admin sends code to customer
   │     └── Revival marked "Successful" — counted in platform stats
   │
   ├── COUNTER OFFER
   │     └── Merchant offers alternative deal
   │     └── Admin forwards offer to customer
   │     └── Revival marked "Counter Offered"
   │
   └── REJECTED
         └── Merchant declines
         └── Admin notifies customer with apology + link to active deals
         └── Revival marked "Rejected"
```

### 8.4 Platform Stats Update

```
/admin/settings → Platform Stats

EDITABLE STATS (shown on homepage Revival section):
   ├── "X+ Revivals Processed" → update as milestone crossed
   ├── "₹XL+ Recovered" → update monthly
   └── "X% Approval Rate" → update monthly based on actual data
```

### 8.5 Revenue Monitoring

```
/admin/revenue

STREAMS:
   ├── Subscriptions: MRR by plan tier, churn rate, upgrades/downgrades
   ├── Add-Ons: Featured Slot + Flash Boost purchases this period
   ├── Affiliate: commissions on tracked purchase transactions (via CoupX)
   └── Revival (future stream): potential fee to merchants for successful revivals

TOP MERCHANT TABLE:
   └── By subscription revenue | By add-on spend | By affiliate contribution
```

---

## 9. Expired Coupon Revival Flow

This is Vouchiqo's most important feature. It must be fast, low-friction, and visible everywhere.

### 9.1 Entry Points (Customer)

| Entry Point | Location | Behaviour |
|---|---|---|
| Inline mini-form | Homepage Revival section | Form expands in-page, no navigation |
| Request Revival button | /brand/:slug → Expired tab (per card) | Form pre-filled with code + brand |
| Full page | /expired-coupon-revival | Standalone page with full form |
| Navbar link | "Revive Coupon" between Nearby and Categories | Orange/red badge indicator |
| Footer link | First item in Quick Links column | Always visible |

### 9.2 The Form

```
Fields:
  ├── Expired Coupon Code (text input, required)
  ├── Brand / Store Name (text with autocomplete from merchant DB, required)
  └── Your Email (text input, required — used to send the outcome)

On submit:
  └── Inline success: "Submitted! We'll reach out within 48 hours."
  └── Request stored in revival queue in DB
  └── Admin notified

No account required to submit a revival.
```

### 9.3 Full Revival State Machine

```
[Customer submits form]
         │
         ▼
[Revival request created — status: PENDING]
         │
         ▼
[Admin receives in queue — status: IN_REVIEW]
         │
         ▼
[Admin contacts merchant]
         │
    48-hour window
         │
         ├──────────────────────────────────────────────┐
         │                                              │
    [Merchant responds]                      [No response in 48h]
         │                                              │
         │                                              ▼
         │                                    [Auto-close: EXPIRED]
         │                                    [Customer notified]
         │
    ┌────┴──────────────────────────┐
    │                               │
[APPROVED]                    [COUNTER]               [REJECTED]
    │                               │                     │
    ▼                               ▼                     ▼
Fresh code             Alternative deal offered    Customer notified
sent to customer       forwarded to customer       with active deals link
    │                               │
    ▼                               ▼
[status: SUCCESSFUL]       [status: COUNTER_OFFERED]   [status: REJECTED]
    │
    ▼
Platform stats incremented:
  └── "Revivals Processed" counter +1
  └── "₹ Recovered" += deal value
  └── Approval rate recalculated
```

---

## 10. Hot Deals Ticker — Priority Engine

### 10.1 Visual Spec

```
Position:   Immediately below navbar. Full viewport width. Sticky (stays on scroll).
Height:     44px desktop / 40px mobile
Background: Deep navy (#1A3C5E) with shimmer effect
Left badge: "🔴 HOT DEALS" orange pill, white text, left-aligned
Scroll:     Right-to-left continuous loop, ~20–25 second full cycle
Pause:      On hover (desktop) / touch-hold (mobile)
Items:      [Brand logo 16px] [Brand name bold white] [Offer snippet] [Discount badge orange] [→]
Separator:  Vertical orange dividing line between items
Right end:  Fixed "View All Hot Deals →" link → /deals?filter=featured
Click:      Each item is a link → /deal/:id
```

### 10.2 Priority Hierarchy (highest → lowest)

```
PRIORITY 1 — Paid Featured Slots
   └── Merchants who purchased "Homepage Featured Slot" (₹999/3 days)
   └── OR "Flash Campaign Boost" (₹799/campaign)
   └── Admin can manually reorder within this tier
   └── Auto-activates on purchase — no admin action needed

PRIORITY 2 — Enterprise Plan Merchants
   └── All active deals, automatically and continuously
   └── No performance threshold required

PRIORITY 3 — Pro Plan Merchants
   └── Active deals with highest redemption rate in last 7 days
   └── Sorted by: (redemptions ÷ clicks) → last 7 days

PRIORITY 4 — Growth Plan Merchants
   └── Top-performing deals sorted by click-through rate
   └── Sorted by: (clicks ÷ impressions) → last 7 days

PRIORITY 5 — Starter Plan Merchants
   └── Only fills remaining slots if ticker has space
   └── Edge case — unlikely once platform has 20+ paid merchants
```

### 10.3 Content Rules

- Content updates in real-time from DB — no manual curation needed except Priority 1.
- Admin can pin/unpin any deal in Ticker Management panel.
- Merchant Analytics shows "Ticker Impressions" KPI (how many times their deals appeared in the ticker this month).

---

## 11. Personalisation Engine

### 11.1 Interest Categories (16 total — same list everywhere)

```
1.  Fashion & Apparel
2.  Electronics & Gadgets
3.  Food & Dining
4.  Travel & Hotels
5.  Beauty & Skincare
6.  Home & Décor
7.  Home Improvement (Tiles, Sanitary, Granite, Flooring)
8.  Health & Fitness
9.  Education & Courses
10. Finance & Insurance
11. Gaming
12. Automotive
13. Kids & Baby
14. Pets
15. Organic & Wellness
16. Grocery & Supermarket
```

### 11.2 Where Interests Are Set

| Surface | Who | Stored in |
|---|---|---|
| Signup Step 2 | New customer | Database (user profile) |
| Homepage interest banner | Anonymous visitor | localStorage |
| Profile → Settings → Preferences tab | Logged-in customer | Database |
| "Edit Preferences" side panel (homepage) | Logged-in customer | Database (instant refresh) |

### 11.3 How Interests Are Applied

| Surface | Effect |
|---|---|
| Homepage deals feed | Selected categories float to top; others in "More Deals" below |
| Category strip | Selected categories shown first, highlighted in orange |
| Email newsletter | Weekly digest contains only deals from selected categories |
| Push notifications | Deal alerts only for selected categories |
| Nearby offers page (/nearby) | Pre-filters to selected categories on load |

### 11.4 No-Preference State

If a logged-in user has no interests set (e.g. signed up via Google with no interest step):
- Show soft nudge card at top of deals grid: "Tell us what you like for personalised deals →"
- Links to /profile → Settings → Interests tab

---

## 12. Location System

### 12.1 Location Badge (Navbar — Always Visible)

```
Default (no location): "🔴 Set Location"
With location:         "🔴 Ranchi"  [chevron down]

Click → dropdown/popover:
   ├── "Use My Current Location" (GPS button)
   ├── City search input (autocomplete from 200+ Indian cities list)
   └── State dropdown (alternative)

Storage:
   └── Anonymous user: localStorage
   └── Logged-in user: DB (persists across sessions and devices)
```

### 12.2 Homepage Location Integration

When location is set, the deals section shows a tab switcher:

```
[🔴 Near Ranchi]  [All India]
    ↑ default active    ↑ shows all nationwide deals
    when location set

"Near [City]" tab shows:
   └── Deals from merchants who listed matching city/state
   └── PLUS all online/nationwide deals
   └── Local merchants get "🔴 Local Deal" orange badge on their card

"All India" tab:
   └── All deals, no location filtering (same as current feed without location)
```

### 12.3 Special Business Rule — Ranchi / Jharkhand

```
IF user location = Ranchi OR any Jharkhand city:
   └── Home Improvement category automatically elevated to top of personalised feed
   └── Marbella's (specific merchant) coupon cards show "Local Business" badge
   └── This applies regardless of whether user has Home Improvement in their interests
```

### 12.4 /deals Page Integration

```
Filter sidebar (top, above Category filter):
   "Location: [Current city or All India]  [Change]"
   └── Changing location updates results without full page reload
```

---

## 13. Brand / Merchant Page

**URL:** `/brand/[brandname]-coupons-deals`
**Slug:** auto-generated from business name — lowercase, hyphens, URL-safe

### 13.1 Page Sections (Top to Bottom)

```
[BRAND HEADER]
   ├── Cover image (1200×300px) — fallback: gradient from brand colour
   ├── Brand logo (80px circle, overlapping cover at bottom-left)
   ├── Brand name (H1)
   ├── "Vouchiqo Verified" badge (green)
   ├── Plan badge: "Pro Partner" (purple) | "Growth Partner" (blue) | "Enterprise Partner" (orange)
   │     └── Starter merchants: no badge shown
   ├── Stats row: Active Deals: X | Coupons Used: X this month | Avg Discount: X% | Category: X
   └── Action buttons:
         ├── "Follow Brand" → saves brand, enables deal alerts
         ├── "Visit Website" → external link, new tab
         └── "Share" → WhatsApp, copy link

[BRAND DESCRIPTION]
   ├── Short description (up to 300 chars) — from merchant dashboard
   └── Long description (up to 1000 chars, optional) — collapsible "Read more →" if over 3 lines

[LOCATION & CONTACT]  ← hidden for "Online Store" type merchants
   ├── Full address: Street / Area, City, State, Pincode, Country
   ├── Google Maps embed — clicking opens Google Maps in new tab
   ├── Phone (click-to-call on mobile)
   ├── WhatsApp Business (click-to-WhatsApp)
   ├── Email (shown as contact form link, not raw address)
   ├── Operating Hours table (Mon–Sun) with "Open Now" / "Closed" live status
   └── Business Type badge: "Online Store" | "Physical Store" | "Online + Physical"

[DEALS & COUPONS]
   Tab switcher:
      ├── [Active Deals (X)]     ← deal card grid, same component as rest of site
      ├── [Coupons (X)]
      ├── [Special Offers (X)]
      └── [Expired (X)]          ← each card has "Request Revival" button
   
   Sort options: Most Popular (default) | Newest | Highest Discount | Expiring Soonest

[CUSTOMER REVIEWS & TRUST]
   ├── Overall star rating (from coupon helpfulness votes on individual deal pages)
   ├── Top 3 most helpful customer comments (shown as quote cards)
   └── "Was this brand helpful?" thumbs up/down for the brand page overall

[RELATED BRANDS]
   └── 4 brand cards from the same category — prevents dead-end navigation
```

### 13.2 Meta Tags (SEO)

```
Title:       "[Brand Name] — Coupons, Deals & Offers [Month Year] | Vouchiqo"
Description: Dynamically generated from brand description + active deal count + location
```

---

## 14. Customer Savings Dashboard

**URL:** `/profile` → "My Savings" tab (FIRST tab)
**Replaces:** "My Saves" tab from SRD v1.0 (which moves to second position as "Saved Deals")

### 14.1 Components

```
[MILESTONE BADGES ROW]
   ├── First Saving ₹50+ — unlocks on first tracked redemption
   ├── ₹500 Saved
   ├── ₹1,000 Saved
   ├── ₹5,000 Saved
   └── ₹10,000 Saved
   
   On milestone unlock: confetti animation plays once
   Hover on badge: shows "Reached on DD MMM YYYY"

[KPI CARDS — 4 cards in a row, 2×2 on mobile]
   ├── Card 1: Saved This Month (₹X) | "from X coupon uses" | +X% vs last month
   ├── Card 2: Total Lifetime Savings (₹X) | "Since [account creation date]"
   ├── Card 3: Total Spend Tracked (₹X) | "across X purchases" | tooltip explains affiliate-only tracking
   └── Card 4: Savings Rate (X%) | "You save ₹X for every ₹100 spent" | 
               Green if >20% | Amber if 10-20% | Grey if <10%

[SAVINGS TIMELINE CHART]
   ├── Line chart: 12 months on X-axis, ₹ on Y-axis (dual Y-axis)
   ├── Orange line: savings | Navy line: spending
   ├── Toggle: [3 Months] [6 Months] [12 Months] [All Time]
   └── Hover tooltip: "In [Month]: Spent ₹X, Saved ₹Y across Z coupons"

[CATEGORY BREAKDOWN]
   ├── Donut chart: "Where I Save the Most" — slice per category, ₹ amount
   └── Click slice → filters transaction table below to that category

[TOP 5 BRANDS BAR CHART]
   └── Horizontal bars: brand logo + ₹ saved per brand

[TRANSACTION HISTORY TABLE]
   Columns: Date | Brand | Coupon Code | Original Price | Discount | Amount Paid | Saved | Category
   ├── Sortable by any column
   ├── Paginated (20 per page)
   ├── Filters: date range, category, brand search
   └── Export to CSV button

[SHARE MY SAVINGS]
   └── Generates OG-style image card: "I saved ₹X this month using Vouchiqo! 🎉"
   └── Shareable to: WhatsApp | Instagram Stories | Twitter

[EMPTY STATE — for new users]
   └── Illustration + "Your savings journey starts here. Use your first coupon to start tracking."
   └── "Browse Deals" CTA button
```

### 14.2 Data Source

- Savings and spend data comes from **affiliate-tracked transactions only** (via CoupX or equivalent).
- Not all customer spending is tracked — only purchases made through Vouchiqo affiliate links.
- Tooltip on "Total Spend Tracked" card explains this limitation.

---

## 15. Revenue Model

| Stream | Mechanism | Amount |
|---|---|---|
| **Subscriptions** | Monthly recurring per merchant | 4 tiers — Starter, Growth, Pro, Enterprise |
| **Homepage Featured Slot** | Paid add-on → Priority 1 ticker for 3 days | ₹999 / 3 days |
| **Flash Campaign Boost** | Paid add-on → elevated ticker for campaign | ₹799 / campaign |
| **Affiliate Commissions** | % of purchase value on tracked transactions | Variable per merchant agreement |
| **Revival Fees (future)** | Merchants pay to facilitate revival of their expired codes | TBD |

---

## 16. Data Models — Key Entities

### User (Customer)

```
user {
  id                UUID        PRIMARY KEY
  email             STRING      UNIQUE NOT NULL
  name              STRING
  phone             STRING
  auth_provider     ENUM        [email, google, apple]
  location_city     STRING
  location_state    STRING
  interests         STRING[]    (array of category keys)
  followed_brands   UUID[]      (merchant IDs)
  created_at        TIMESTAMP
  cashback_balance  DECIMAL
}
```

### Merchant

```
merchant {
  id                UUID        PRIMARY KEY
  business_name     STRING      NOT NULL
  slug              STRING      UNIQUE (auto-generated)
  email             STRING      UNIQUE NOT NULL
  category          STRING      (one of 16 categories)
  plan              ENUM        [starter, growth, pro, enterprise]
  plan_expires_at   TIMESTAMP
  website_url       STRING
  gstin             STRING
  address_street    STRING
  address_city      STRING
  address_state     STRING
  address_pincode   STRING
  phone             STRING
  whatsapp          STRING
  business_email    STRING
  operating_hours   JSON        {mon: {open: "09:00", close: "18:00", closed: false}, ...}
  business_type     ENUM        [online, physical, both]
  logo_url          STRING
  cover_image_url   STRING
  short_description STRING      (max 300 chars)
  long_description  STRING      (max 1000 chars)
  brand_colour      STRING      (hex, used for fallback cover gradient)
  approved          BOOLEAN
  approved_at       TIMESTAMP
  created_at        TIMESTAMP
}
```

### Deal / Coupon

```
deal {
  id                UUID        PRIMARY KEY
  merchant_id       UUID        FOREIGN KEY → merchant.id
  title             STRING      NOT NULL
  coupon_code       STRING      NOT NULL
  discount_type     ENUM        [percentage, flat]
  discount_value    DECIMAL     NOT NULL
  original_price    DECIMAL
  category          STRING      (one of 16)
  deal_type         ENUM        [online, instore, both]
  valid_from        TIMESTAMP
  valid_until       TIMESTAMP
  terms             TEXT
  status            ENUM        [active, expired, paused, removed]
  clicks            INTEGER     DEFAULT 0
  uses              INTEGER     DEFAULT 0
  impressions       INTEGER     DEFAULT 0
  created_at        TIMESTAMP
}
```

### Revival Request

```
revival {
  id                UUID        PRIMARY KEY
  coupon_code       STRING      NOT NULL
  brand_name        STRING      NOT NULL
  merchant_id       UUID        NULLABLE (if matched to registered merchant)
  customer_email    STRING      NOT NULL
  customer_id       UUID        NULLABLE (if logged in)
  status            ENUM        [pending, in_review, approved, counter_offered, rejected, expired]
  outcome_code      STRING      (the new code if approved)
  outcome_note      TEXT
  submitted_at      TIMESTAMP
  resolved_at       TIMESTAMP
}
```

### Ticker Slot (Paid Placement)

```
ticker_slot {
  id                UUID        PRIMARY KEY
  merchant_id       UUID        FOREIGN KEY → merchant.id
  type              ENUM        [featured_slot, flash_boost]
  starts_at         TIMESTAMP
  ends_at           TIMESTAMP
  amount_paid       DECIMAL
  status            ENUM        [active, expired]
  pinned_position   INTEGER     NULLABLE (admin override)
  created_at        TIMESTAMP
}
```

### Transaction (Affiliate-Tracked)

```
transaction {
  id                UUID        PRIMARY KEY
  user_id           UUID        FOREIGN KEY → user.id
  merchant_id       UUID        FOREIGN KEY → merchant.id
  deal_id           UUID        FOREIGN KEY → deal.id
  coupon_code       STRING
  original_amount   DECIMAL
  discount_amount   DECIMAL
  paid_amount       DECIMAL
  category          STRING
  tracked_at        TIMESTAMP
  affiliate_ref     STRING      (affiliate tracking reference)
}
```

---

## 17. State Machines

### Deal Status

```
[DRAFT] ──publish──► [ACTIVE]
                         │
              ┌──────────┤
              │          │
         admin pause   date passes
              │          │
              ▼          ▼
          [PAUSED]   [EXPIRED]
              │          │
           unpause    revival request
              │          │
              ▼          ▼
          [ACTIVE]  [REVIVAL_REQUESTED]
```

### Merchant Plan

```
[STARTER] ──pays──► [GROWTH | PRO | ENTERPRISE]
                           │
                    payment renewal
                           │
              ┌────────────┤
              │            │
           renews     doesn't renew
              │            │
              ▼            ▼
          [same plan]  [STARTER] (downgrade, existing deals remain active)
```

### Revival Request

```
[PENDING] ──admin reviews──► [IN_REVIEW] ──merchant contacted──►
     │                                                          │
     │                                            ┌────────────┤────────────┐
     │                                            │            │            │
  48h no response                           [APPROVED]   [COUNTER]   [REJECTED]
     │                                            │
     ▼                                    [SUCCESSFUL]
  [EXPIRED]
```

---

## 18. Feature Dependency Map

```
Hot Deals Ticker
   └── depends on: Deal.status = active, Merchant.plan, ticker_slot table, Priority Engine

Personalisation Feed
   └── depends on: User.interests (or localStorage), Deal.category, Location System

Location-Aware Feed
   └── depends on: User.location_city (or localStorage), Merchant.address_city, Deal.deal_type

Revival System
   └── depends on: Revival table, Admin queue, Merchant contact info, Email service

Savings Dashboard
   └── depends on: Transaction table, affiliate tracking integration (CoupX), User.created_at

Milestone Badges
   └── depends on: Savings Dashboard data (sum of transaction.discount_amount per user)

Brand Page — Map & Hours
   └── depends on: Merchant.business_type ≠ online, Merchant.address fields, Google Maps API

"Open Now" badge
   └── depends on: Merchant.operating_hours JSON, server timezone, current time calculation

Ticker Impressions (merchant analytics)
   └── depends on: Deal impression tracking when deal appears in ticker

Share My Savings
   └── depends on: Savings Dashboard data, image generation service (OG card)
```

---

## 19. Developer Notes & Constraints

### Critical Business Rules

1. **Ticker priority is strictly hierarchical.** Priority 1 (paid) always beats Priority 2 (Enterprise), which always beats Priority 3 (Pro), etc. No exceptions unless manually overridden in admin panel.

2. **Interests must be multi-select.** A user can have multiple interest categories. The system never forces a single choice.

3. **Location persists across sessions.** Once set, it must survive page refreshes, new tabs, and return visits (localStorage for anonymous, DB for logged-in).

4. **Ranchi / Jharkhand rule is hardcoded.** When location = any Jharkhand city, Home Improvement rises to top and Marbella gets a "Local Business" badge — regardless of user interests.

5. **Revival form requires no account.** Any visitor can submit a revival. Account is not a gate.

6. **Interest banner must not block browsing.** It slides in from the bottom — not a full-screen modal. The user can dismiss it with "No thanks" and continue browsing.

7. **Add-on purchase auto-activates ticker priority.** No admin action needed. Payment → Priority 1 immediately.

8. **Expired deals auto-move to Expired tab.** No merchant or admin action needed. The system handles this at `valid_until` timestamp.

9. **Savings dashboard tracks affiliate transactions only.** The tooltip on "Total Spend Tracked" must explain this to avoid confusion.

10. **Google Maps embed is mandatory for physical businesses.** For merchants with `business_type = physical` or `both`, the map section is not optional.

### SEO Rules

- Brand page slug: `[business-name]-coupons-deals` — auto-generated, URL-safe, lowercase, hyphens.
- Meta title: `[Brand Name] — Coupons, Deals & Offers [Month Year] | Vouchiqo`
- Meta description: dynamically generated from brand description + active deal count + location.

### Performance Notes

- Ticker content updates from DB in real-time — no caching of ticker order.
- Deals feed reorders on interest change without full page reload.
- Location tab switch (Near City / All India) updates without full page reload.
- "Edit Preferences" side panel saves and refreshes feed without page reload.

### Mobile Breakpoints

| Section | Mobile Behaviour |
|---|---|
| Ticker bar | Height 40px (vs 44px desktop) |
| KPI cards | 2×2 grid (vs 4-in-a-row desktop) |
| Revival section | Single column, visual below form |
| Brand page location | Stacked, map full width |
| Deals grid | 1 or 2 column (vs 3–4 desktop) |
| Interest banner | Inputs stack vertically, button full width |

---

*End of ARCHITECTURE.md — Vouchiqo v1.1*

*This document covers SRD v1.0 + Amendment v1.1. If a third amendment is issued, update Sections 5, 10, 11, 12, 13, 14, and 16 first — those are the most likely to change.*
