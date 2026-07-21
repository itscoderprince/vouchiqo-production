// Mock/seed data for listing pages (brands, categories, merchants, campaigns)
// Extracted from client components to keep UI code focused

// ── Brands ──────────────────────────────────────────────────────────────────
export const POPULAR_BRANDS = [
  {
    slug: "samsung",
    businessName: "Samsung",
    logo: "/brandlogos/10005.jpg",
    coupons: 1,
    offers: 52,
  },
  {
    slug: "oneplus",
    businessName: "OnePlus",
    logo: "/brandlogos/10006.jpg",
    coupons: 1,
    offers: 31,
  },
  {
    slug: "adidas",
    businessName: "Adidas",
    logo: "/brandlogos/10012.jpg",
    coupons: 1,
    offers: 31,
  },
  {
    slug: "lenovo",
    businessName: "Lenovo",
    logo: "/brandlogos/10017.jpg",
    coupons: 4,
    offers: 31,
  },
  {
    slug: "apple",
    businessName: "Apple",
    logo: "/brandlogos/10013.jpg",
    coupons: 2,
    offers: 45,
  },
];

export const MOCK_BRANDS_SEED = [
  { businessName: "Samsung", slug: "samsung", logo: "/brandlogos/10005.jpg" },
  { businessName: "Sony", slug: "sony", logo: "/brandlogos/10035.jpg" },
  { businessName: "Sparx", slug: "sparx", logo: "/brandlogos/10036.jpg" },
  {
    businessName: "SOME BY MI",
    slug: "some-by-mi",
    logo: "/brandlogos/10037.jpg",
  },
  { businessName: "Adidas", slug: "adidas", logo: "/brandlogos/10012.jpg" },
  { businessName: "Apple", slug: "apple", logo: "/brandlogos/10013.jpg" },
  { businessName: "Asus", slug: "asus", logo: "/brandlogos/10008.jpg" },
  { businessName: "Dell", slug: "dell", logo: "/brandlogos/10007.jpg" },
  { businessName: "HP", slug: "hp", logo: "/brandlogos/10009.jpg" },
  { businessName: "Lenovo", slug: "lenovo", logo: "/brandlogos/10017.jpg" },
  { businessName: "Nike", slug: "nike", logo: "/brandlogos/10010.jpg" },
  { businessName: "Puma", slug: "puma", logo: "/brandlogos/10011.jpg" },
];

// ── Merchants ───────────────────────────────────────────────────────────────
export const TRENDING_STORES = [
  {
    slug: "lenskart",
    businessName: "Lenskart",
    logo: "/brandlogos/10012.jpg",
    coupons: 34,
    offers: 22,
  },
  {
    slug: "sonata",
    businessName: "Sonata",
    logo: "/brandlogos/10035.jpg",
    coupons: 48,
    offers: 30,
  },
  {
    slug: "techgadgets",
    businessName: "Dell",
    logo: "/brandlogos/10007.jpg",
    coupons: 8,
    offers: 6,
  },
  {
    slug: "starbucks-coffee",
    businessName: "Starbucks",
    logo: "/brandlogos/10026.jpg",
    coupons: 34,
    offers: 13,
  },
];

export const MOCK_MERCHANTS_SEED = [
  { businessName: "Zomato", slug: "zomato", coupons: 26, offers: 8 },
  { businessName: "Zivame", slug: "zivame", coupons: 57, offers: 15 },
  { businessName: "ZoomCar", slug: "zoomcar", coupons: 7, offers: 5 },
  { businessName: "Zappfresh", slug: "zappfresh", coupons: 18, offers: 4 },
  { businessName: "Zoomin", slug: "zoomin", coupons: 48, offers: 12 },
  { businessName: "ZOROY", slug: "zoroy", coupons: 7, offers: 3 },
  { businessName: "7NetLive", slug: "7netlive", coupons: 12, offers: 6 },
  { businessName: "Zestpics", slug: "zestpics", coupons: 18, offers: 9 },
  {
    businessName: "Vouchiqo Nutrition",
    slug: "vouchiqo-nutrition",
    coupons: 9,
    offers: 4,
  },
  { businessName: "Zyppys", slug: "zyppys", coupons: 11, offers: 5 },
  { businessName: "Zymrat", slug: "zymrat", coupons: 12, offers: 6 },
  { businessName: "Zoe", slug: "zoe", coupons: 10, offers: 4 },
  { businessName: "Zooty", slug: "zooty", coupons: 7, offers: 3 },
  { businessName: "Zostel", slug: "zostel", coupons: 18, offers: 9 },
  { businessName: "Zara", slug: "zara", coupons: 13, offers: 6 },
  { businessName: "Zebpay", slug: "zebpay", coupons: 7, offers: 3 },
  { businessName: "Zodiac", slug: "zodiac", coupons: 11, offers: 5 },
  { businessName: "Zoludio", slug: "zoludio", coupons: 13, offers: 6 },
  { businessName: "ZEE5", slug: "zee5", coupons: 8, offers: 3 },
  { businessName: "ZestMoney", slug: "zestmoney", coupons: 11, offers: 5 },
  { businessName: "ZoloStays", slug: "zolostays", coupons: 10, offers: 4 },
  { businessName: "Zoomcar Zap", slug: "zoomcar-zap", coupons: 11, offers: 5 },
  { businessName: "Zomato Gold", slug: "zomato-gold", coupons: 12, offers: 6 },
  { businessName: "ZALORA", slug: "zalora", coupons: 14, offers: 7 },
  { businessName: "Zoff Foods", slug: "zoff-foods", coupons: 8, offers: 4 },
  { businessName: "Zapvi", slug: "zapvi", coupons: 29, offers: 11 },
  { businessName: "Zebronics", slug: "zebronics", coupons: 16, offers: 7 },
  { businessName: "Zandu Care", slug: "zandu-care", coupons: 40, offers: 18 },
  { businessName: "Zarlin", slug: "zarlin", coupons: 13, offers: 6 },
  { businessName: "Zyro", slug: "zyro", coupons: 7, offers: 3 },
  { businessName: "Zingavita", slug: "zingavita", coupons: 11, offers: 5 },
  { businessName: "Zunpulse", slug: "zunpulse", coupons: 13, offers: 6 },
  { businessName: "Zool Retail", slug: "zool-retail", coupons: 9, offers: 4 },
  { businessName: "Zerodha", slug: "zerodha", coupons: 9, offers: 4 },
  { businessName: "Zingbus", slug: "zingbus", coupons: 14, offers: 7 },
  { businessName: "Zopto", slug: "zopto", coupons: 27, offers: 11 },
  { businessName: "Zouk", slug: "zouk", coupons: 32, offers: 15 },
  { businessName: "Zigly", slug: "zigly", coupons: 5, offers: 2 },
  { businessName: "Zoomcar Host", slug: "zoomcar-host", coupons: 9, offers: 4 },
  { businessName: "Zap Cricket", slug: "zap-cricket", coupons: 9, offers: 4 },
  { businessName: "Zety", slug: "zety", coupons: 10, offers: 4 },
  { businessName: "Zavya", slug: "zavya", coupons: 8, offers: 3 },
  { businessName: "Zeroharm", slug: "zeroharm", coupons: 13, offers: 6 },
  { businessName: "Zomunk", slug: "zomunk", coupons: 8, offers: 3 },
  { businessName: "Zulutrade", slug: "zulutrade", coupons: 8, offers: 4 },
  { businessName: "ZoogVPN", slug: "zoogvpn", coupons: 7, offers: 3 },
  { businessName: "Zoviz", slug: "zoviz", coupons: 11, offers: 5 },
  { businessName: "Zlade", slug: "zlade", coupons: 9, offers: 4 },
  { businessName: "Zink London", slug: "zink-london", coupons: 8, offers: 4 },
  {
    businessName: "Zonka Feedback",
    slug: "zonka-feedback",
    coupons: 8,
    offers: 4,
  },
  { businessName: "Zeligate", slug: "zeligate", coupons: 7, offers: 3 },
  { businessName: "Zop", slug: "zop", coupons: 9, offers: 4 },
  { businessName: "ZipWP", slug: "zipwp", coupons: 7, offers: 3 },
  { businessName: "Zoominfo", slug: "zoominfo", coupons: 8, offers: 4 },
  { businessName: "Zendesk", slug: "zendesk", coupons: 8, offers: 4 },
  { businessName: "Zapier", slug: "zapier", coupons: 7, offers: 3 },
  { businessName: "Zeemo", slug: "zeemo", coupons: 7, offers: 3 },
  { businessName: "Zoho", slug: "zoho", coupons: 7, offers: 3 },
  { businessName: "Zibaa", slug: "zibaa", coupons: 7, offers: 3 },
];

// ── Categories ─────────────────────────────────────────────────────────────
export const POPULAR_CATEGORIES = [
  {
    slug: "fashion",
    title: "Fashion",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409648143/fashion.svg",
    coupons: "1,371",
    offers: "5,324",
  },
  {
    slug: "food",
    title: "Food & Dining",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647250/food.svg",
    coupons: "850",
    offers: "3,120",
  },
  {
    slug: "electronics",
    title: "Electronics",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409647250/electronics.svg",
    coupons: "402",
    offers: "2,025",
  },
  {
    slug: "beauty",
    title: "Beauty",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409643778/beauty.svg",
    coupons: "1,345",
    offers: "4,650",
  },
  {
    slug: "travel",
    title: "Travel",
    icon: "https://cdn.grabon.in/gograbon/images/category/1773409656824/travel.svg",
    coupons: "491",
    offers: "794",
  },
];

// ── Campaigns / Festivals ──────────────────────────────────────────────────
export const POPULAR_FESTIVALS = [
  {
    title: "Amazon Prime Day",
    slug: "amazon-prime-day",
    coupons: 0,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636840/amazon-prime-day-logo.jpg",
  },
  {
    title: "Friendship Day",
    slug: "friendship-day",
    coupons: 9,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637732/friendship-day-logo.jpg",
  },
  {
    title: "Independence Day",
    slug: "independence-day",
    coupons: 8,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637985/independence-day-logo.jpg",
  },
  {
    title: "Onam",
    slug: "onam",
    coupons: 8,
    offers: 10,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638310/onam-logo.jpg",
  },
];

export const ALL_FESTIVALS = [
  {
    title: "Amazon Prime Day",
    slug: "amazon-prime-day",
    coupons: 0,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636840/amazon-prime-day-logo.jpg",
  },
  {
    title: "Friendship Day",
    slug: "friendship-day",
    coupons: 9,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637732/friendship-day-logo.jpg",
  },
  {
    title: "Independence Day",
    slug: "independence-day",
    coupons: 8,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637985/independence-day-logo.jpg",
  },
  {
    title: "Onam",
    slug: "onam",
    coupons: 8,
    offers: 10,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638310/onam-logo.jpg",
  },
  {
    title: "Raksha Bandhan",
    slug: "rakshabandhan",
    coupons: 15,
    offers: 26,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638544/raksha-bandhan-logo.jpg",
  },
  {
    title: "Ganesh Chaturthi",
    slug: "ganeshchaturthi",
    coupons: 5,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637815/ganesh-chaturthi-logo.jpg",
  },
  {
    title: "Amazon Great Indian Sale",
    slug: "amazongreatindiansale",
    coupons: 4,
    offers: 8,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636363/amazon-great-indian-sale-logo.jpg",
  },
  {
    title: "Flipkart Big Billion Day Sale",
    slug: "flipkartbigbilliondaysale",
    coupons: 3,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637644/flipkart-big-billion-days-sale-logo.jpg",
  },
  {
    title: "Dussehra",
    slug: "dussehra",
    coupons: 18,
    offers: 23,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637321/dussehra-logo.jpg",
  },
  {
    title: "Black Friday",
    slug: "blackfriday",
    coupons: 10,
    offers: 23,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636918/black-friday-logo.jpg",
  },
  {
    title: "New Year",
    slug: "newyear",
    coupons: 8,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638152/new-year-offers-logo.jpg",
  },
  {
    title: "Cyber Monday",
    slug: "cyber-monday",
    coupons: 2,
    offers: 4,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637164/cyber-monday-logo.jpg",
  },
  {
    title: "Valentines Day",
    slug: "valentinesday",
    coupons: 5,
    offers: 9,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638853/valentine%27s-day-logo.jpg",
  },
  {
    title: "Christmas",
    slug: "christmas",
    coupons: 6,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637079/christmas-logo.jpg",
  },
  {
    title: "Flash Sale",
    slug: "flashsale",
    coupons: 15,
    offers: 33,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637562/flash-sale-logo.jpg",
  },
  {
    title: "Ugadi",
    slug: "ugadi",
    coupons: 8,
    offers: 16,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638777/ugadi-logo.jpg",
  },
  {
    title: "OMG Sale",
    slug: "omgsale",
    coupons: 3,
    offers: 4,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638232/omg-sale-logo.jpg",
  },
  {
    title: "Diwali",
    slug: "diwali",
    coupons: 5,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637240/diwali-logo.jpg",
  },
  {
    title: "Paytm Sale",
    slug: "paytmsale",
    coupons: 2,
    offers: 5,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638392/paytm-logo.jpg",
  },
  {
    title: "Children's Day",
    slug: "childrensday",
    coupons: 4,
    offers: 6,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412636998/children%27s-day-logo.jpg",
  },
  {
    title: "Pongal",
    slug: "pongal",
    coupons: 8,
    offers: 16,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638468/pongal-logo.jpg",
  },
  {
    title: "Republic Day",
    slug: "republicday",
    coupons: 6,
    offers: 12,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638701/republic-day-logo.jpg",
  },
  {
    title: "Ramzan",
    slug: "ramzan",
    coupons: 7,
    offers: 14,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638619/ramzan-logo.jpg",
  },
  {
    title: "Mother's Day",
    slug: "mothersday",
    coupons: 15,
    offers: 24,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638067/mother%27s-day-logo.jpg",
  },
  {
    title: "Women's Day",
    slug: "womensday",
    coupons: 5,
    offers: 11,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412638931/women%27s-day-logo.jpg",
  },
  {
    title: "Holi",
    slug: "holi",
    coupons: 8,
    offers: 17,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637893/holi-logo.jpg",
  },
  {
    title: "Fathers Day",
    slug: "fathersday",
    coupons: 18,
    offers: 36,
    image:
      "https://cdn.grabon.in/gograbon/images/festival/1773412637480/father%27s-day-logo.jpg",
  },
];
