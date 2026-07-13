export const SYSTEM_CATEGORIES = [
  { name: "Fashion & Clothing", slug: "fashion", emoji: "🛍️" },
  { name: "Food & Dining", slug: "food", emoji: "🍔" },
  { name: "Electronics & Gadgets", slug: "electronics", emoji: "💻" },
  { name: "Beauty & Wellness", slug: "beauty", emoji: "💄" },
  { name: "Travel & Hospitality", slug: "travel", emoji: "✈️" },
  { name: "Home & Living", slug: "home", emoji: "🛋️" },
  { name: "Home Improvement", slug: "home-improvement", emoji: "🛠️" },
  { name: "Fitness & Healthcare", slug: "fitness", emoji: "💪" },
  { name: "Education & Courses", slug: "education", emoji: "🎓" },
  { name: "Kids & Baby Products", slug: "kids-baby", emoji: "🧸" },
  { name: "Jewellery & Accessories", slug: "jewellery", emoji: "💍" },
  { name: "Automobile & Auto Services", slug: "automobile", emoji: "🚗" },
  { name: "Gaming & Entertainment", slug: "gaming", emoji: "🎮" },
  { name: "Grocery & Essentials", slug: "grocery", emoji: "🛒" },
  { name: "Finance & Insurance", slug: "finance", emoji: "🏦" },
];

export const DUMMY_TAB_COUPONS = {
  travel: [
    {
      _id: "dummy-travel-1",
      title: "Get Flat ₹500 OFF Bus Tickets: 12% Discount + 12% Cashback",
      discountValue: 500,
      discountType: "flat",
      description: "Book buses across India with Redbus and save flat ₹500.",
      merchantId: {
        name: "Redbus",
        logo: "https://companieslogo.com/img/orig/redBus_logo-3da19f20.png",
      },
    },
    {
      _id: "dummy-travel-2",
      title: "Flat 50% OFF First 3 Uber Rides - Up to ₹100 Per Ride",
      discountValue: 50,
      discountType: "percentage",
      description: "Grab this exclusive Uber promo code for rides.",
      merchantId: {
        name: "Uber",
        logo: "https://companieslogo.com/img/orig/UBER-e5d8ff84.png",
      },
    },
  ],
  recharge: [
    {
      _id: "dummy-recharge-1",
      title: "Get Flat ₹50 Cashback on Mobile Recharge & Bills",
      discountValue: 50,
      discountType: "flat",
      description: "Pay using Amazon Pay UPI and get instant cashback.",
      merchantId: {
        name: "Amazon",
        logo: "https://companieslogo.com/img/orig/AMZN-e9f942e4.png",
      },
    },
  ],
  fashion: [
    {
      _id: "dummy-fashion-1",
      title: "Giant Fashion Sale: Flat 22% OFF + Extra Bonus Cash",
      discountValue: 22,
      discountType: "percentage",
      description: "Up to 80% off sitewide on top apparel brands on AJIO.",
      merchantId: {
        name: "AJIO",
        logo: "https://companieslogo.com/img/orig/AJIO-007-Logo.png",
      },
    },
    {
      _id: "dummy-fashion-2",
      title: "End of Season Sale: Get Flat 30% OFF + Extra 15% OFF",
      discountValue: 30,
      discountType: "percentage",
      description: "Save big on Adidas shoes, tracksuits and accessories.",
      merchantId: {
        name: "Adidas",
        logo: "https://cdn.grabon.in/gograbon/images/banners/banner-1782207572271/Coupon%20Codes.jpg",
      },
    },
  ],
  food: [
    {
      _id: "dummy-food-1",
      title: "Get Flat ₹120 OFF on Orders of ₹299 and Above",
      discountValue: 120,
      discountType: "flat",
      description: "Use Swiggy super code to order from premium restaurants.",
      merchantId: {
        name: "Swiggy",
        logo: "https://companieslogo.com/img/orig/Swiggy-181f5ecb.png",
      },
    },
  ],
  electronics: [
    {
      _id: "dummy-elec-1",
      title: "Grab Up To 45% OFF + Extra 20% OFF on Laptops & Monitors",
      discountValue: 45,
      discountType: "percentage",
      description:
        "Buy premium Dell Inspiron and XPS laptops with exclusive warranty.",
      merchantId: {
        name: "Dell",
        logo: "https://companieslogo.com/img/orig/DELL-c06f3680.png",
      },
    },
  ],
  ott: [
    {
      _id: "dummy-ott-1",
      title: "Get 1 Year Coursera Plus Subscription at 40% OFF",
      discountValue: 40,
      discountType: "percentage",
      description:
        "Unlock unlimited courses, certificates and degree programs.",
      merchantId: {
        name: "Coursera",
        logo: "https://companieslogo.com/img/orig/Coursera-c454e606.png",
      },
    },
  ],
};

export const TODAY_PRODUCT_DEALS = [
  {
    title: "Nu Republic Soundbar 20 Bluetooth Soundbar",
    originalPrice: 4499,
    discountPrice: 769,
    discountText: "83% OFF",
    merchantName: "Amazon",
    merchantLogo: "https://companieslogo.com/img/orig/AMZN-e9f942e4.png",
    productImage:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
  {
    title: "Sangria Floral Printed Pure Cotton Square Neck Straight Kurta",
    originalPrice: 999,
    discountPrice: 389,
    discountText: "₹610 OFF",
    merchantName: "Myntra",
    merchantLogo:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png",
    productImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
  {
    title: "U.S. POLO ASSN. Men Cutaway-Collar Tailored Fit Shirt",
    originalPrice: 2199,
    discountPrice: 880,
    discountText: "60% OFF",
    merchantName: "AJIO",
    merchantLogo: "https://companieslogo.com/img/orig/AJIO-007-Logo.png",
    productImage:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
  {
    title: "MCaffeine Fien Rush EDP Perfume",
    originalPrice: 899,
    discountPrice: 674,
    discountText: "25% OFF",
    merchantName: "Nykaa",
    merchantLogo: "https://companieslogo.com/img/orig/Nykaa-eb34c2bd.png",
    productImage:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
];

export const COLLECTIONS_LIST = [
  {
    title: "Hostinger Coupons",
    logo: "https://companieslogo.com/img/orig/Hostinger-fde0f269.png",
    image:
      "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
  {
    title: "Uber Coupons",
    logo: "https://companieslogo.com/img/orig/UBER-e5d8ff84.png",
    image:
      "https://images.unsplash.com/photo-1510561234274-a86a305558ac?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
  {
    title: "Klook",
    logo: "https://companieslogo.com/img/orig/Klook-4589d9c2.png",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
  {
    title: "Redrail Coupons",
    logo: "https://companieslogo.com/img/orig/redBus_logo-3da19f20.png",
    image:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=400&auto=format&fit=crop",
    href: "/deals",
  },
];
