import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import BrandClient from "./brand-client";

export const dynamic = "force-dynamic";

// Fields safe to expose publicly for related brand cards
const MERCHANT_PUBLIC_FIELDS = {
  businessName: 1,
  slug: 1,
  logo: 1,
  category: 1,
  description: 1,
  shortDescription: 1,
  followerCount: 1,
  isVerified: 1,
  plan: 1,
  website: 1,
  totalCoupons: 1,
};

// Default coordinates for Ranchi (fallback)
const DEFAULT_COORDS = { lat: 23.3441, lng: 85.3096 };

const MOCK_MERCHANTS = {
  "qatar-airways": {
    businessName: "Qatar Airways",
    category: "travel",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1773237560976/qatarairways-logo.jpg",
    description:
      "Fly with the World's Best Airline. Experience award-winning service, comfortable cabins, and delicious cuisine on flights to over 160 destinations worldwide.",
    longDescription:
      "Qatar Airways is the state-owned flag carrier of Qatar. Headquartered in the Qatar Airways Tower in Doha, the airline operates a hub-and-spoke network, linking over 150 international destinations across Africa, Asia, Europe, the Americas, and Oceania from its base at Hamad International Airport.",
    website: "https://www.qatarairways.com",
    followerCount: 61,
    isVerified: true,
    businessType: "online",
    location: { city: "Doha", state: "Qatar", country: "QA", coordinates: { lat: 25.2854, lng: 51.531 } },
  },
  qatarairways: {
    businessName: "Qatar Airways",
    category: "travel",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1773237560976/qatarairways-logo.jpg",
    description:
      "Fly with the World's Best Airline. Experience award-winning service, comfortable cabins, and delicious cuisine on flights to over 160 destinations worldwide.",
    longDescription:
      "Qatar Airways is the state-owned flag carrier of Qatar. Headquartered in the Qatar Airways Tower in Doha, the airline operates a hub-and-spoke network, linking over 150 international destinations across Africa, Asia, Europe, the Americas, and Oceania from its base at Hamad International Airport.",
    website: "https://www.qatarairways.com",
    followerCount: 61,
    isVerified: true,
    businessType: "online",
    location: { city: "Doha", state: "Qatar", country: "QA", coordinates: { lat: 25.2854, lng: 51.531 } },
  },
  hostinger: {
    businessName: "Hostinger",
    category: "other",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1620645638457/hostinger-coupons.jpg",
    description:
      "Hostinger offers cheap and reliable web hosting services with 24/7 customer support, 99.9% uptime guarantee, and easy-to-use control panel.",
    longDescription:
      "Hostinger is a web hosting provider and internet domain registrar, established in 2004. Hostinger is the parent company of 000webhost, Niagahoster and Weblink.",
    website: "https://www.hostinger.com",
    followerCount: 142,
    isVerified: true,
    businessType: "online",
    location: { city: "Kaunas", state: "Lithuania", country: "LT", coordinates: { lat: 54.8985, lng: 23.9036 } },
  },
  redrail: {
    businessName: "Redrail",
    category: "travel",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1653457813876/redrail-logo.jpg",
    description:
      "Book train tickets online with redRail, an IRCTC authorized partner. Check PNR status, live train running status, and seat availability.",
    longDescription:
      "redRail is a new-age train booking application by redBus. It is an authorized partner of IRCTC, allowing users to book train tickets quickly and check real-time PNR and seat availability status.",
    website: "https://www.redbus.in/rails",
    followerCount: 88,
    isVerified: true,
    businessType: "online",
    location: { city: "Bengaluru", state: "Karnataka", country: "IN", coordinates: { lat: 12.9716, lng: 77.5946 } },
  },
  coursera: {
    businessName: "Coursera",
    category: "education",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838612711/coursera-logo.jpg",
    description:
      "Build skills with courses from top universities and companies like Google, IBM, and Microsoft. Learn at your own pace with online learning.",
    longDescription:
      "Coursera Inc. is a U.S.-based massive open online course provider founded in 2012 by Stanford University computer science professors Andrew Ng and Daphne Koller.",
    website: "https://www.coursera.org",
    followerCount: 95,
    isVerified: true,
    businessType: "online",
    location: { city: "Mountain View", state: "California", country: "US", coordinates: { lat: 37.3861, lng: -122.0839 } },
  },
  dell: {
    businessName: "Dell",
    category: "electronics",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838662933/dell-logo.jpg",
    description:
      "Dell offers laptops, desktops, monitors, gaming PCs, servers, storage, and other computer accessories for home and business.",
    longDescription:
      "Dell is an American multinational computer technology company that develops, sells, repairs, and supports computers and related products and services.",
    website: "https://www.dell.com",
    followerCount: 210,
    isVerified: true,
    businessType: "both",
    location: { city: "Round Rock", state: "Texas", country: "US", coordinates: { lat: 30.5083, lng: -97.6789 } },
  },
  google: {
    businessName: "Google Workspace",
    category: "other",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1621589145623/google-workspace-logo.jpg",
    description:
      "Google Workspace is a collection of cloud computing, productivity and collaboration tools, software and products developed by Google.",
    longDescription:
      "Google Workspace comprises Gmail, Contacts, Calendar, Meet, and Chat for communication; Current for employee engagement; Drive for storage; and the Google Docs Editors suite for content creation.",
    website: "https://workspace.google.com",
    followerCount: 340,
    isVerified: true,
    businessType: "online",
    location: { city: "Mountain View", state: "California", country: "US", coordinates: { lat: 37.422, lng: -122.084 } },
  },
  adidas: {
    businessName: "Adidas",
    category: "fashion",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838702334/adidas-logo.jpg",
    description:
      "Shop the latest selection of Adidas shoes, clothing, accessories, and sports gear. Free shipping on orders over a specific value.",
    longDescription:
      "Adidas AG is a German multinational corporation, founded and headquartered in Herzogenaurach, Bavaria, that designs and manufactures shoes, clothing and accessories.",
    website: "https://www.adidas.com",
    followerCount: 180,
    isVerified: true,
    businessType: "both",
    location: { city: "Herzogenaurach", state: "Bavaria", country: "DE", coordinates: { lat: 49.5683, lng: 10.8933 } },
  },
  amazon: {
    businessName: "Amazon",
    category: "other",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838752233/amazon-logo.jpg",
    description:
      "Online shopping from the Earth's biggest selection of books, magazines, music, DVDs, videos, electronics, computers, software, apparel & accessories.",
    longDescription:
      "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.",
    website: "https://www.amazon.in",
    followerCount: 520,
    isVerified: true,
    businessType: "online",
    location: { city: "Seattle", state: "Washington", country: "US", coordinates: { lat: 47.6062, lng: -122.3321 } },
  },
  uber: {
    businessName: "Uber",
    category: "travel",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838802933/uber-logo.jpg",
    description:
      "Get a ride in minutes. Or become a driver and earn money on your schedule. Uber is finding you a ride in real-time.",
    longDescription:
      "Uber Technologies, Inc. is an American multinational transportation network company that provides ride-hailing services, food delivery, and freight transportation.",
    website: "https://www.uber.com",
    followerCount: 160,
    isVerified: true,
    businessType: "both",
    location: { city: "San Francisco", state: "California", country: "US", coordinates: { lat: 37.7749, lng: -122.4194 } },
  },
  udemy: {
    businessName: "Udemy",
    category: "education",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838852331/udemy-logo.jpg",
    description:
      "Udemy is an online learning and teaching marketplace with over 213,000 courses and 57 million students. Learn programming, marketing, data science and more.",
    longDescription:
      "Udemy, Inc. is an education technology company that provides an online learning and teaching platform. It was founded in May 2010 by Eren Bali, Gagan Biyani, and Oktay Caglar.",
    website: "https://www.udemy.com",
    followerCount: 220,
    isVerified: true,
    businessType: "online",
    location: { city: "San Francisco", state: "California", country: "US", coordinates: { lat: 37.7749, lng: -122.4194 } },
  },
};

function getMockMerchant(slug) {
  const norm = slug.toLowerCase();

  // Generate a valid 24-character hex string from the slug
  let hexId = "";
  for (let i = 0; i < Math.min(slug.length, 12); i++) {
    hexId += slug.charCodeAt(i).toString(16).padStart(2, "0");
  }
  hexId = hexId.padEnd(24, "0").slice(0, 24);

  if (MOCK_MERCHANTS[norm]) {
    return {
      _id: hexId,
      ...MOCK_MERCHANTS[norm],
      slug,
    };
  }

  const titleName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    _id: hexId,
    businessName: titleName,
    slug,
    category: "other",
    logo: "",
    description: `Verified discount coupons and promo codes for ${titleName}. Grab the latest offers and save today.`,
    longDescription: `${titleName} is a verified partner brand offering premium products and services. Shop online using our exclusive discount coupons and get the best savings on every checkout.`,
    website: `https://www.${norm}.com`,
    followerCount: 42,
    isVerified: true,
    businessType: "online",
    location: {
      city: "Ranchi",
      state: "Jharkhand",
      country: "IN",
      coordinates: DEFAULT_COORDS,
    },
  };
}

function getMockCoupons(slug, merchantId) {
  const brandName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 15);

  return [
    {
      _id: `mock_cpn_${slug}_1`,
      merchantId,
      title: `Sitewide Discount: Flat 15% OFF on all ${brandName} orders`,
      description: `Fly or shop with ${brandName} and get an exclusive 15% discount on base fares or standard pricing. Limit one per customer.`,
      code: "SAVE15",
      discountValue: 15,
      discountType: "percentage",
      expiresAt: tomorrow,
      status: "active",
    },
    {
      _id: `mock_cpn_${slug}_2`,
      merchantId,
      title: `Special Promo: Flat ₹500 Cashback on bookings above ₹4,999`,
      description: `Get a flat ₹500 discount when your transaction value exceeds ₹4,999. Applicable to all verified digital checkouts.`,
      code: "CASH500",
      discountValue: 500,
      discountType: "fixed",
      expiresAt: tomorrow,
      status: "active",
    },
    {
      _id: `mock_cpn_${slug}_3`,
      merchantId,
      title: `Exclusive Offer: Enjoy up to 85% OFF on Seasonal Sales`,
      description: `Unlock high value discounts on selected items or routes. No promo code needed, discount applied automatically.`,
      code: "",
      discountValue: 85,
      discountType: "percentage",
      expiresAt: tomorrow,
      status: "active",
    },
  ];
}

function getMockExpiredCoupons(slug, merchantId) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  return [
    {
      _id: `mock_cpn_exp_${slug}_1`,
      merchantId,
      title: `Expired Offer: Flat 20% OFF Sitewide`,
      description: `Grab flat 20% discount on all purchases during the special weekend flash deal.`,
      code: "FLASH20",
      discountValue: 20,
      discountType: "percentage",
      expiresAt: yesterday,
      status: "expired",
    },
  ];
}

/**
 * Generate dynamic SEO metadata for the Brand page.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();

  try {
    let merchant = await Merchant.findOne({
      slug,
      status: "approved",
    }).lean();

    if (!merchant) {
      merchant = getMockMerchant(slug);
    }

    const title = `${merchant.businessName} Coupons, Promo Codes & Deals | Vouchiqo`;
    const description =
      merchant.shortDescription ||
      `Save at ${merchant.businessName} with verified coupon codes, discounts, and expiring offers. 100% community-tested and active.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch (err) {
    return {
      title: "Brand Store Not Found | Vouchiqo",
      description:
        "The requested brand storefront could not be located on Vouchiqo.",
    };
  }
}

/**
 * Server Component fetching the brand profile, coupons, and related brands.
 */
export default async function BrandPage({ params }) {
  const { slug } = await params;
  await connectDB();

  let merchant;
  let coupons = [];
  let expiredCoupons = [];
  let relatedBrands = [];

  try {
    // Fetch the merchant — full fields needed for brand page
    merchant = await Merchant.findOne({ slug, status: "approved" }).lean();

    if (!merchant) {
      // Fallback to mock data so the page never 404s for demo brands
      merchant = getMockMerchant(slug);
      coupons = getMockCoupons(slug, merchant._id);
      expiredCoupons = getMockExpiredCoupons(slug, merchant._id);
    } else {
      // ── Active coupons (not expired, not deleted/paused) ──
      const rawCoupons = await Coupon.find({
        merchantId: merchant._id,
        status: "active",
        expiresAt: { $gt: new Date() },
      })
        .sort({ isFeatured: -1, createdAt: -1 })
        .populate("merchantId", "businessName slug logo website")
        .lean();
      coupons = JSON.parse(JSON.stringify(rawCoupons || []));

      // ── Expired coupons (status=expired OR active but past expiresAt) ──
      // Exclude deleted coupons — they should not surface publicly
      const rawExpired = await Coupon.find({
        merchantId: merchant._id,
        status: { $ne: "deleted" },
        $or: [
          { status: "expired" },
          { status: "active", expiresAt: { $lte: new Date() } },
        ],
      })
        .sort({ expiresAt: -1 })
        .limit(5)
        .populate("merchantId", "businessName slug logo")
        .lean();
      expiredCoupons = JSON.parse(JSON.stringify(rawExpired || []));
    }
  } catch (err) {
    console.error("Error loading brand profile or coupons:", err);
    notFound();
  }

  // ── Related brands — isolated so errors here never kill the page ──
  try {
    const isRealId = merchant._id && /^[0-9a-fA-F]{24}$/.test(merchant._id.toString());
    const relatedQuery = {
      category: merchant.category,
      status: "approved",
      ...(isRealId ? { _id: { $ne: merchant._id } } : {}),
    };
    // Only select public-safe fields — never expose PAN, GSTIN, bank details, authId
    const rawRelated = await Merchant.find(relatedQuery)
      .select(MERCHANT_PUBLIC_FIELDS)
      .limit(6)
      .lean();
    relatedBrands = JSON.parse(JSON.stringify(rawRelated || []));
  } catch (err) {
    // Related brands failing should not break the whole page
    console.warn("Related brands fetch failed (non-fatal):", err.message);
    relatedBrands = [];
  }

  return (
    <BrandClient
      merchant={JSON.parse(JSON.stringify(merchant))}
      coupons={coupons}
      expiredCoupons={expiredCoupons}
      relatedBrands={relatedBrands}
    />
  );
}
