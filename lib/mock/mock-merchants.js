// Mock merchant data and generators for /brand/[slug] page fallbacks

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
  },
  hostinger: {
    businessName: "Hostinger",
    category: "services",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1620645638457/hostinger-coupons.jpg",
    description:
      "Hostinger offers cheap and reliable web hosting services with 24/7 customer support, 99.9% uptime guarantee, and easy-to-use control panel.",
    longDescription:
      "Hostinger is a web hosting provider and internet domain registrar, established in 2004. Hostinger is the parent company of 000webhost, Niagahoster and Weblink.",
    website: "https://www.hostinger.com",
    followerCount: 142,
    isVerified: true,
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
  },
  coursera: {
    businessName: "Coursera",
    category: "services",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838612711/coursera-logo.jpg",
    description:
      "Build skills with courses from top universities and companies like Google, IBM, and Microsoft. Learn at your own pace with online learning.",
    longDescription:
      "Coursera Inc. is a U.S.-based massive open online course provider founded in 2012 by Stanford University computer science professors Andrew Ng and Daphne Koller.",
    website: "https://www.coursera.org",
    followerCount: 95,
    isVerified: true,
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
  },
  google: {
    businessName: "Google Workspace",
    category: "services",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1621589145623/google-workspace-logo.jpg",
    description:
      "Google Workspace is a collection of cloud computing, productivity and collaboration tools, software and products developed by Google.",
    longDescription:
      "Google Workspace comprises Gmail, Contacts, Calendar, Meet, and Chat for communication; Current for employee engagement; Drive for storage; and the Google Docs Editors suite for content creation.",
    website: "https://workspace.google.com",
    followerCount: 340,
    isVerified: true,
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
  },
  amazon: {
    businessName: "Amazon",
    category: "shopping",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838752233/amazon-logo.jpg",
    description:
      "Online shopping from the Earth's biggest selection of books, magazines, music, DVDs, videos, electronics, computers, software, apparel & accessories.",
    longDescription:
      "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.",
    website: "https://www.amazon.in",
    followerCount: 520,
    isVerified: true,
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
  },
  udemy: {
    businessName: "Udemy",
    category: "services",
    logo: "https://cdn.grabon.in/gograbon/images/merchant/1614838852331/udemy-logo.jpg",
    description:
      "Udemy is an online learning and teaching marketplace with over 213,000 courses and 57 million students. Learn programming, marketing, data science and more.",
    longDescription:
      "Udemy, Inc. is an education technology company that provides an online learning and teaching platform. It was founded in May 2010 by Eren Bali, Gagan Biyani, and Oktay Caglar.",
    website: "https://www.udemy.com",
    followerCount: 220,
    isVerified: true,
  },
};

/**
 * Generate a valid 24-char hex ID from a slug string.
 */
function slugToHexId(slug) {
  let hexId = "";
  for (let i = 0; i < Math.min(slug.length, 12); i++) {
    hexId += slug.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hexId.padEnd(24, "0").slice(0, 24);
}

/**
 * Get a mock merchant by slug, or generate a generic fallback.
 */
export function getMockMerchant(slug) {
  const norm = slug.toLowerCase();
  const hexId = slugToHexId(slug);

  if (MOCK_MERCHANTS[norm]) {
    return { _id: hexId, ...MOCK_MERCHANTS[norm], slug };
  }

  const titleName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    _id: hexId,
    businessName: titleName,
    slug,
    category: "services",
    logo: "",
    description: `Verified discount coupons and promo codes for ${titleName}. Grab the latest offers and save today.`,
    longDescription: `${titleName} is a verified partner brand offering premium products and services. Shop online using our discount coupons and get exclusive savings on checkout.`,
    website: `https://www.${norm}.com`,
    followerCount: 42,
    isVerified: true,
  };
}

/**
 * Generate mock active coupons for a brand.
 */
export function getMockCoupons(slug, merchantId) {
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

/**
 * Generate mock expired coupons for a brand.
 */
export function getMockExpiredCoupons(slug, merchantId) {
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
