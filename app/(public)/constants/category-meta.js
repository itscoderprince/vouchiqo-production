// Shared category metadata used by /categories and /category/[slug] pages

export const CATEGORY_META = {
  food: {
    title: "Food & Dining",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648578/food.svg",
    slug: "food",
  },
  fashion: {
    title: "Fashion",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648143/fashion.svg",
    slug: "fashion",
  },
  electronics: {
    title: "Electronics",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647250/electronics.svg",
    slug: "electronics",
  },
  beauty: {
    title: "Beauty",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409643778/beauty.svg",
    slug: "beauty",
  },
  travel: {
    title: "Travel",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656824/travel.svg",
    slug: "travel",
  },
  fitness: {
    title: "Health & Fitness",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773792964436/fitness.svg",
    slug: "fitness",
  },
  home: {
    title: "Home & Kitchen",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409649785/home-and-kitchen.svg",
    slug: "home",
  },
  entertainment: {
    title: "Entertainment",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647335/entertainment.svg",
    slug: "entertainment",
  },
  services: {
    title: "Services",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409655353/services.svg",
    slug: "services",
  },
  "home-improvement": {
    title: "Home Improvement",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409655353/services.svg",
    slug: "home-improvement",
  },
  education: {
    title: "Education",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    slug: "education",
  },
  finance: {
    title: "Finance",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    slug: "finance",
  },
  gaming: {
    title: "Gaming",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647335/entertainment.svg",
    slug: "gaming",
  },
  automotive: {
    title: "Automotive",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409655353/services.svg",
    slug: "automotive",
  },
  "kids-baby": {
    title: "Kids & Baby",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648143/fashion.svg",
    slug: "kids-baby",
  },
  pets: {
    title: "Pets",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    slug: "pets",
  },
  organic: {
    title: "Organic",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409643778/beauty.svg",
    slug: "organic",
  },
  grocery: {
    title: "Grocery",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648578/food.svg",
    slug: "grocery",
  },
  other: {
    title: "Other Deals",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656550/tickets.svg",
    slug: "other",
  },
};

// Extended metadata used by /category/[slug] page (includes banners, emojis, sub-categories)
export const CATEGORY_DETAIL_META = {
  food: {
    title: "Food & Dining",
    emoji: "🍔",
    banner: "bg-gradient-to-r from-amber-500 to-orange-500",
    subs: ["Fast Food", "Fine Dining", "Bakeries", "Beverages"],
  },
  fashion: {
    title: "Fashion & Apparel",
    emoji: "🛍️",
    banner: "bg-gradient-to-r from-pink-500 to-rose-500",
    subs: ["Footwear", "Apparel", "Watches", "Accessories"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    emoji: "💻",
    banner: "bg-gradient-to-r from-blue-500 to-indigo-500",
    subs: ["Mobiles", "Laptops", "Accessories", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Skincare",
    emoji: "💄",
    banner: "bg-gradient-to-r from-rose-400 to-pink-500",
    subs: ["Makeup", "Skincare", "Fragrance", "Hair Care"],
  },
  travel: {
    title: "Travel & Hotels",
    emoji: "✈️",
    banner: "bg-gradient-to-r from-emerald-500 to-teal-500",
    subs: ["Hotels", "Flights", "Cabs", "Luggage"],
  },
  fitness: {
    title: "Health & Fitness",
    emoji: "💪",
    banner: "bg-gradient-to-r from-red-500 to-orange-500",
    subs: ["Gyms", "Supplements", "Equipment", "Wearables"],
  },
  home: {
    title: "Home & Décor",
    emoji: "🏠",
    banner: "bg-gradient-to-r from-teal-500 to-emerald-600",
    subs: ["Furniture", "Sanitary Ware", "Tiles", "Lighting"],
  },
  entertainment: {
    title: "SaaS & Productivity",
    emoji: "💼",
    banner: "bg-gradient-to-r from-indigo-500 to-purple-600",
    subs: ["SaaS Tools", "Streaming", "Gaming", "Subscriptions"],
  },
  services: {
    title: "Local Services",
    emoji: "🛠️",
    banner: "bg-gradient-to-r from-violet-500 to-fuchsia-600",
    subs: ["Repairs", "Catering", "Spa", "On-Demand"],
  },
  "home-improvement": {
    title: "Home Improvement",
    emoji: "🏗️",
    banner: "bg-gradient-to-r from-amber-500 to-orange-600",
    subs: [
      "Tiles & Sanitary",
      "Granite & Marble",
      "Flooring",
      "Paint & Hardware",
      "Tools",
    ],
  },
  education: {
    title: "Education & Learning",
    emoji: "🎓",
    banner: "bg-gradient-to-r from-cyan-500 to-blue-600",
    subs: [
      "Online Courses",
      "Certifications",
      "Test Prep",
      "Books & Stationery",
    ],
  },
  finance: {
    title: "Finance & Insurance",
    emoji: "💵",
    banner: "bg-gradient-to-r from-emerald-500 to-green-600",
    subs: ["Credit Cards", "Loans", "Insurance", "Investments"],
  },
  gaming: {
    title: "Gaming & Consoles",
    emoji: "🎮",
    banner: "bg-gradient-to-r from-purple-500 to-indigo-600",
    subs: ["PC Games", "Console Keys", "Gaming Gear", "Mobile Gaming"],
  },
  automotive: {
    title: "Automotive & Car Care",
    emoji: "🚗",
    banner: "bg-gradient-to-r from-slate-600 to-zinc-800",
    subs: ["Car Accessories", "Tires", "Servicing", "Cleaning Kits"],
  },
  "kids-baby": {
    title: "Kids & Baby",
    emoji: "👶",
    banner: "bg-gradient-to-r from-pink-400 to-orange-400",
    subs: ["Baby Clothing", "Toys", "Baby Care", "Diapers"],
  },
  pets: {
    title: "Pet Supplies",
    emoji: "🐾",
    banner: "bg-gradient-to-r from-amber-500 to-red-500",
    subs: ["Dog Food", "Cat Treats", "Pet Toys", "Grooming"],
  },
  organic: {
    title: "Organic & Wellness",
    emoji: "🌿",
    banner: "bg-gradient-to-r from-green-400 to-emerald-500",
    subs: ["Organic Food", "Herbal Beauty", "Health Supplements"],
  },
  grocery: {
    title: "Groceries & Supermarket",
    emoji: "🛒",
    banner: "bg-gradient-to-r from-emerald-400 to-lime-500",
    subs: ["Fresh Vegetables", "Beverages", "Snacks", "Household Items"],
  },
  other: {
    title: "Special & Other Deals",
    emoji: "🏷️",
    banner: "bg-gradient-to-r from-slate-500 to-slate-700",
    subs: ["Daily Deals", "Bundles", "Freebies", "Cashbacks"],
  },
};
