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
  lenskart: {
    businessName: "Lenskart",
    category: "fashion",
    logo: "/brandlogos/10012.jpg",
    description:
      "Buy prescription eyeglasses, sunglasses, contact lenses, and home eye checkups at Lenskart stores near you.",
    longDescription:
      "Lenskart is an Indian optical prescription eyewear retail chain, founded in 2010. It has over 1,500 retail stores across India, offering state-of-the-art eye examinations and premium designs.",
    website: "https://www.lenskart.com",
    followerCount: 142,
    isVerified: true,
  },
  sonata: {
    businessName: "Sonata",
    category: "fashion",
    logo: "/brandlogos/10035.jpg",
    description:
      "Explore Sonata watches for men, women, and kids. Elegant designs, quartz watches, sport watches, and smart wearables at Titan World outlets.",
    longDescription:
      "Sonata is India's largest selling watch brand from Titan Company Limited. Offering stylish and contemporary designs, Sonata watches are available at thousands of retail outlets across the nation.",
    website: "https://www.sonatawatches.in",
    followerCount: 88,
    isVerified: true,
  },
  titan: {
    businessName: "Titan",
    category: "fashion",
    logo: "/brandlogos/10035.jpg",
    description:
      "Discover premium watches, bags, perfume, and fashion accessories at Titan World and Titan Eyeplus stores.",
    longDescription:
      "Titan Company Limited is an Indian luxury products company that mainly manufactures fashion accessories such as watches, jewelry and eyewear. Part of the Tata Group, it has a massive retail network.",
    website: "https://www.titan.co.in",
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
  starbucks: {
    businessName: "Starbucks",
    category: "food",
    logo: "/brandlogos/10026.jpg",
    description:
      "Handcrafted hot and cold beverages, delicious fresh food, and premium coffee beans at your nearest Starbucks store.",
    longDescription:
      "Starbucks Corporation is an American multinational chain of coffeehouses and roastery reserves. With hundreds of stores across major cities in India, it is the premier spot for coffee lovers.",
    website: "https://www.starbucks.in",
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
  croma: {
    businessName: "Croma",
    category: "electronics",
    logo: "/brandlogos/10008.jpg",
    description:
      "Explore and buy electronics, home appliances, smartphones, laptops, and kitchen appliances at your nearest Croma store.",
    longDescription:
      "Croma is an Indian retail chain of consumer electronics and durables run by Infiniti Retail, a subsidiary of the Tata Group. It operates over 400 stores across 100+ cities in India.",
    website: "https://www.croma.com",
    followerCount: 520,
    isVerified: true,
  },
  decathlon: {
    businessName: "Decathlon",
    category: "fashion",
    logo: "/brandlogos/10012.jpg",
    description:
      "Explore Decathlon for high-quality sports gear, fitness equipment, clothing, shoes, and outdoor accessories under one roof.",
    longDescription:
      "Decathlon S.A. is a French sporting goods retailer. With over 100 massive stores in India, it is the largest sporting goods retailer in the country.",
    website: "https://www.decathlon.in",
    followerCount: 160,
    isVerified: true,
  },
  kfc: {
    businessName: "KFC",
    category: "food",
    logo: "/brandlogos/10030.jpg",
    description:
      "Get finger-lickin' good fried chicken, burgers, sides, and desserts at your nearest KFC restaurant.",
    longDescription:
      "KFC is an American fast food restaurant chain specialized in fried chicken. It is the world's second-largest restaurant chain with a massive retail presence in India.",
    website: "https://www.kfc.co.in",
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
      description: `Shop with ${brandName} and get an exclusive 15% discount on your order. Limit one per customer.`,
      code: "SAVE15",
      discountValue: 15,
      discountType: "percentage",
      expiresAt: tomorrow,
      status: "active",
    },
    {
      _id: `mock_cpn_${slug}_2`,
      merchantId,
      title: `Special Promo: Flat ₹500 OFF on orders above ₹4,999`,
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
      title: `Exclusive Offer: Up to 85% OFF on Seasonal Sale`,
      description: `Unlock high value discounts on selected items. No promo code needed, discount applied automatically.`,
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
