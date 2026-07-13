/**
 * Standalone seed script — bypasses @/ path aliases that only work in Next.js.
 * Run with: node scripts/seed.mjs
 */
import envPkg from "@next/env";
const { loadEnvConfig } = envPkg;
loadEnvConfig(process.cwd());

import mongoose from "mongoose";

async function seed() {
  console.log("🌱 Starting Database Seeding...\n");

  // ─── Connect directly (no @/ alias issue) ───────────────────────────────────
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not found in .env");

  await mongoose.connect(uri, { bufferCommands: false });
  console.log("🔌 Connected to MongoDB.\n");

  // ─── Late imports (models use @/ too, use dynamic workaround) ───────────────
  const { auth } = await import("../lib/auth.js");
  const Merchant = (await import("../modules/merchant/merchant.model.js")).default;
  const Coupon = (await import("../modules/coupon/coupon.model.js")).default;
  const PlatformSetting = (await import("../modules/admin/settings.model.js")).default;
  const { MERCHANT_STATUS, COUPON_STATUS, DISCOUNT_TYPE, ROLES } = await import("../utils/constants.js");

  const db = mongoose.connection.db;

  // ─── Emails to clean ────────────────────────────────────────────────────────
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
  const adminEmail = `${adminUsername}@vouchiqo.com`;
  const demoEmails = [
    "customer@vouchiqo.com",
    "customer2@vouchiqo.com",
    "merchant@vouchiqo.com",
    "merchant2@vouchiqo.com",
    "merchant3@vouchiqo.com",
    "marbella@vouchiqo.com",
    adminEmail,
  ];

  console.log("🧹 Cleaning old demo data...");
  const oldUsers = await db.collection("user").find({ email: { $in: demoEmails } }).toArray();
  const oldUserIds = oldUsers.map(u => u.id || u._id.toString());
  if (oldUserIds.length > 0) {
    await db.collection("user").deleteMany({ $or: [{ id: { $in: oldUserIds } }, { _id: { $in: oldUsers.map(u => u._id) } }] });
    await db.collection("account").deleteMany({ userId: { $in: oldUserIds } });
    await db.collection("session").deleteMany({ userId: { $in: oldUserIds } });
  }
  await Merchant.deleteMany({});
  await Coupon.deleteMany({});
  await PlatformSetting.deleteMany({});
  console.log("✅ Cleared old data.\n");

  const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

  // ════════════════════════════════════════════════════════════════
  //  USERS
  // ════════════════════════════════════════════════════════════════

  // Customer 1
  console.log("👤 Creating customer@vouchiqo.com ...");
  try {
    await auth.api.signUpEmail({ body: { email: "customer@vouchiqo.com", password: "Password123!", name: "Alice Johnson" } });
    console.log("   ✅ Done\n");
  } catch (e) { console.log("   ⚠️", e.message, "\n"); }

  // Customer 2
  console.log("👤 Creating customer2@vouchiqo.com ...");
  try {
    await auth.api.signUpEmail({ body: { email: "customer2@vouchiqo.com", password: "Password123!", name: "Bob Smith" } });
    console.log("   ✅ Done\n");
  } catch (e) { console.log("   ⚠️", e.message, "\n"); }

  // Admin
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@123!";
  console.log(`👤 Creating ${adminEmail} ...`);
  try {
    await auth.api.signUpEmail({ body: { email: adminEmail, password: adminPassword, name: "Super Admin" } });
    const adminUser = await db.collection("user").findOne({ email: adminEmail });
    if (adminUser) await db.collection("user").updateOne({ _id: adminUser._id }, { $set: { role: ROLES.ADMIN } });
    console.log("   ✅ Done\n");
  } catch (e) { console.log("   ⚠️", e.message, "\n"); }

  // ════════════════════════════════════════════════════════════════
  //  MERCHANT 1 — Burger House (food, Arrah)
  // ════════════════════════════════════════════════════════════════
  console.log("🏪 Creating Merchant: Burger House...");
  let merchantProfile1 = null;
  try {
    await auth.api.signUpEmail({ body: { email: "merchant@vouchiqo.com", password: "Merchant@123!", name: "Burger House" } });
    const mUser = await db.collection("user").findOne({ email: "merchant@vouchiqo.com" });
    if (mUser) {
      await db.collection("user").updateOne({ _id: mUser._id }, { $set: { role: ROLES.MERCHANT } });
      merchantProfile1 = await Merchant.create({
        authId: mUser.id || mUser._id.toString(),
        businessName: "Burger House",
        slug: "burger-house",
        description: "Gourmet burgers and hand-cut fries in the heart of Arrah. Fresh beef, brioche buns, secret sauce.",
        category: "food",
        contactEmail: "hello@burgerhouse.com",
        website: "https://burgerhouse.example.com",
        status: MERCHANT_STATUS.APPROVED,
        plan: "growth",
        location: { 
          address: "Maharaja Hata, Near Railway Station",
          pincode: "802301",
          city: "Arrah", 
          state: "Bihar", 
          country: "IN",
          coordinates: { lat: 25.5564, lng: 84.6681 }
        },
        isVerified: true,
      });
      console.log("   ✅ Done\n");
    }
  } catch (e) { console.log("   ❌", e.message, "\n"); }

  // ════════════════════════════════════════════════════════════════
  //  MERCHANT 2 — StyleZone (fashion, Patna)
  // ════════════════════════════════════════════════════════════════
  console.log("🏪 Creating Merchant: StyleZone...");
  let merchantProfile2 = null;
  try {
    await auth.api.signUpEmail({ body: { email: "merchant2@vouchiqo.com", password: "Merchant@123!", name: "StyleZone" } });
    const mUser2 = await db.collection("user").findOne({ email: "merchant2@vouchiqo.com" });
    if (mUser2) {
      await db.collection("user").updateOne({ _id: mUser2._id }, { $set: { role: ROLES.MERCHANT } });
      merchantProfile2 = await Merchant.create({
        authId: mUser2.id || mUser2._id.toString(),
        businessName: "StyleZone",
        slug: "stylezone",
        description: "Trendy fashion for every season in Patna. From casual wear to formal outfits. Free delivery over ₹999.",
        category: "fashion",
        contactEmail: "deals@stylezone.com",
        website: "https://stylezone.example.com",
        status: MERCHANT_STATUS.APPROVED,
        plan: "pro",
        location: { 
          address: "Fraser Road, Near Maurya Lok",
          pincode: "800001",
          city: "Patna", 
          state: "Bihar", 
          country: "IN",
          coordinates: { lat: 25.6112, lng: 85.1384 }
        },
        isVerified: true,
      });
      console.log("   ✅ Done\n");
    }
  } catch (e) { console.log("   ❌", e.message, "\n"); }

  // ════════════════════════════════════════════════════════════════
  //  MERCHANT 3 — TechGadgets (electronics, Delhi)
  // ════════════════════════════════════════════════════════════════
  console.log("🏪 Creating Merchant: TechGadgets...");
  let merchantProfile3 = null;
  try {
    await auth.api.signUpEmail({ body: { email: "merchant3@vouchiqo.com", password: "Merchant@123!", name: "TechGadgets" } });
    const mUser3 = await db.collection("user").findOne({ email: "merchant3@vouchiqo.com" });
    if (mUser3) {
      await db.collection("user").updateOne({ _id: mUser3._id }, { $set: { role: ROLES.MERCHANT } });
      merchantProfile3 = await Merchant.create({
        authId: mUser3.id || mUser3._id.toString(),
        businessName: "TechGadgets",
        slug: "techgadgets",
        description: "Latest smartphones, laptops, accessories and smart home devices. Best prices guaranteed.",
        category: "electronics",
        contactEmail: "support@techgadgets.com",
        website: "https://techgadgets.example.com",
        status: MERCHANT_STATUS.APPROVED,
        plan: "enterprise",
        location: { 
          address: "Nehru Place, Block G",
          pincode: "110019",
          city: "Delhi", 
          state: "Delhi", 
          country: "IN",
          coordinates: { lat: 28.5494, lng: 77.2515 }
        },
        isVerified: true,
      });
      console.log("   ✅ Done\n");
    }
  } catch (e) { console.log("   ❌", e.message, "\n"); }

  // ════════════════════════════════════════════════════════════════
  //  MERCHANT 4 — Marbella Tiles & Sanitary (home, Ranchi)
  // ════════════════════════════════════════════════════════════════
  console.log("🏪 Creating Merchant: Marbella Tiles & Sanitary...");
  let merchantProfile4 = null;
  try {
    await auth.api.signUpEmail({ body: { email: "marbella@vouchiqo.com", password: "Merchant@123!", name: "Marbella" } });
    const mUser4 = await db.collection("user").findOne({ email: "marbella@vouchiqo.com" });
    if (mUser4) {
      await db.collection("user").updateOne({ _id: mUser4._id }, { $set: { role: ROLES.MERCHANT } });
      merchantProfile4 = await Merchant.create({
        authId: mUser4.id || mUser4._id.toString(),
        businessName: "Marbella",
        slug: "marbella",
        description: "Premium vitrified tiles, Italian marble, and luxury sanitary fittings in Ranchi. Leading dealer of custom bathwares.",
        category: "home",
        contactEmail: "deals@marbellatiles.com",
        website: "https://marbellatiles.com",
        status: MERCHANT_STATUS.APPROVED,
        plan: "pro",
        location: { 
          address: "Lalpur Chowk, Circular Road",
          pincode: "834001",
          city: "Ranchi", 
          state: "Jharkhand", 
          country: "IN",
          coordinates: { lat: 23.3448, lng: 85.3121 }
        },
        isVerified: true,
      });
      console.log("   ✅ Done\n");
    }
  } catch (e) { console.log("   ❌", e.message, "\n"); }

  // ════════════════════════════════════════════════════════════════
  //  COUPONS GENERATOR — TOTAL 40+ ACTIVE COUPONS
  // ════════════════════════════════════════════════════════════════
  const couponsToSeed = [];

  // Marbella Coupons (6)
  if (merchantProfile4) {
    console.log("🎟️  Adding Marbella coupons...");
    const marbellaCoupons = [
      {
        title: "Flat ₹5,000 off Premium Marble Tiles",
        description: "Get flat ₹5,000 discount on a minimum billing of ₹50,000. Perfect for home flooring renovations.",
        code: "MARBELLA5K",
        discountType: DISCOUNT_TYPE.FIXED,
        discountValue: 5000,
        category: "home",
        expiresAt: daysFromNow(30),
        location: { city: "Ranchi", state: "Jharkhand", country: "IN", isOnline: false },
        isFeatured: true,
        status: COUPON_STATUS.ACTIVE,
        isVerified: true,
      },
      {
        title: "15% off Sanitary Ware",
        description: "15% discount on all designer sanitary ware, faucets, and bathroom fittings.",
        code: "MARBELLA15",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 15,
        category: "home",
        expiresAt: daysFromNow(15),
        location: { city: "Ranchi", state: "Jharkhand", country: "IN", isOnline: false },
        isHot: true,
        status: COUPON_STATUS.ACTIVE,
        isVerified: true,
      },
      {
        title: "Free Adhesive with Ceramic Tiles",
        description: "Buy 100 boxes of ceramic tiles and get 5 bags of tile adhesive absolutely free.",
        code: "FREEADHESIVE",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "home",
        expiresAt: daysFromNow(45),
        location: { city: "Ranchi", state: "Jharkhand", country: "IN", isOnline: false },
        status: COUPON_STATUS.ACTIVE,
        isVerified: true,
      },
      {
        title: "10% off Italian Granite",
        description: "10% off our premium collection of imported Italian granite slabs. In-store only.",
        code: "ITALIAN10",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 10,
        category: "home",
        expiresAt: daysFromNow(60),
        location: { city: "Ranchi", state: "Jharkhand", country: "IN", isOnline: false },
        status: COUPON_STATUS.ACTIVE,
        isVerified: true,
      },
      {
        title: "Flat ₹2,000 off Bathroom Cabinets",
        description: "Flat discount on stylish modular bathroom cabinets. Minimum purchase ₹15,000.",
        code: "CABINET2K",
        discountType: DISCOUNT_TYPE.FIXED,
        discountValue: 2000,
        category: "home",
        expiresAt: daysFromNow(20),
        location: { city: "Ranchi", state: "Jharkhand", country: "IN", isOnline: false },
        status: COUPON_STATUS.ACTIVE,
        isVerified: true,
      },
      {
        title: "Free Interior Consultation",
        description: "Get a free 3D interior design consultation with our in-house architects.",
        code: "MARBELLADZ",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "home",
        expiresAt: daysFromNow(90),
        location: { city: "Ranchi", state: "Jharkhand", country: "IN", isOnline: false },
        status: COUPON_STATUS.ACTIVE,
        isVerified: true,
      }
    ];

    marbellaCoupons.forEach(c => {
      c.merchantId = merchantProfile4._id;
      couponsToSeed.push(c);
    });
  }

  // Burger House Coupons (12)
  if (merchantProfile1) {
    console.log("🎟️  Adding Burger House coupons...");
    const burgerCoupons = [
      { title: "30% off Gourmet Burgers", code: "BURGER30", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 30, isFeatured: true },
      { title: "Buy 1 Get 1 Free Fries", code: "BOGOFRIES", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0, isHot: true },
      { title: "Free Drink with Meal", code: "FREEDRINK", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "15% off Online Delivery", code: "ONLINE15", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 15 },
      { title: "₹100 off First Order", code: "WELCOME100", discountType: DISCOUNT_TYPE.FIXED, discountValue: 100, isFeatured: true },
      { title: "Flat ₹200 off Party Combo", code: "PARTY200", discountType: DISCOUNT_TYPE.FIXED, discountValue: 200 },
      { title: "20% off Family Meal Box", code: "FAMILY20", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 20 },
      { title: "Free Extra Cheese Slice", code: "CHEESY", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "10% off Chicken Wings Bucket", code: "WINGS10", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 10 },
      { title: "₹50 off Classic Cheese Burger", code: "CLASSIC50", discountType: DISCOUNT_TYPE.FIXED, discountValue: 50 },
      { title: "Buy 2 Get 1 Free Veggie Wraps", code: "WRAPBOGO", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "Free Ice Cream with meal above ₹500", code: "SWEETDISH", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
    ];

    burgerCoupons.forEach((c, idx) => {
      c.merchantId = merchantProfile1._id;
      c.category = "food";
      c.description = c.description || `Enjoy great deals and savings on ${c.title}. Valid at Burger House.`;
      c.expiresAt = daysFromNow(10 + idx * 5);
      c.location = idx % 3 === 0 
        ? { isOnline: true }
        : { city: "Arrah", state: "Bihar", country: "IN", isOnline: false };
      c.status = COUPON_STATUS.ACTIVE;
      c.isVerified = true;
      couponsToSeed.push(c);
    });
  }

  // StyleZone Coupons (12)
  if (merchantProfile2) {
    console.log("🎟️  Adding StyleZone coupons...");
    const fashionCoupons = [
      { title: "20% off Summer Collection", code: "SUMMER20", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 20, isFeatured: true, isHot: true },
      { title: "Free Shipping on Orders Over ₹999", code: "FREESHIP", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "₹500 off Men's Formal Wear", code: "FORMAL500", discountType: DISCOUNT_TYPE.FIXED, discountValue: 500 },
      { title: "Buy 2 Get 1 Free Accessories", code: "STYLE3FOR2", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0, isHot: true },
      { title: "15% off Ethnic Wear", code: "ETHNIC15", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 15 },
      { title: "₹1,000 off Designer Lehengas", code: "FESTIVE1K", discountType: DISCOUNT_TYPE.FIXED, discountValue: 1000, isFeatured: true },
      { title: "10% off Premium Leather Shoes", code: "SHOES10", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 10 },
      { title: "Buy 1 Get 1 Free Kids T-Shirts", code: "KIDSBOGO", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "₹300 off Denim Jackets", code: "DENIM300", discountType: DISCOUNT_TYPE.FIXED, discountValue: 300 },
      { title: "25% off Winter Wear clearance", code: "WINTER25", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 25 },
      { title: "Free Socks with any Shoe purchase", code: "SOCKS", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "12% off Activewear Collection", code: "FITSTYLE", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 12 },
    ];

    fashionCoupons.forEach((c, idx) => {
      c.merchantId = merchantProfile2._id;
      c.category = "fashion";
      c.description = c.description || `Special seasonal promotion: ${c.title}. Stand out with StyleZone.`;
      c.expiresAt = daysFromNow(12 + idx * 4);
      c.location = idx % 4 === 0 
        ? { isOnline: true }
        : { city: "Patna", state: "Bihar", country: "IN", isOnline: false };
      c.status = COUPON_STATUS.ACTIVE;
      c.isVerified = true;
      couponsToSeed.push(c);
    });
  }

  // TechGadgets Coupons (12)
  if (merchantProfile3) {
    console.log("🎟️  Adding TechGadgets coupons...");
    const electronicsCoupons = [
      { title: "10% off all Laptops", code: "LAPTOP10", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 10, isFeatured: true },
      { title: "₹2,000 off Smartphones over ₹15,000", code: "PHONE2K", discountType: DISCOUNT_TYPE.FIXED, discountValue: 2000, isHot: true },
      { title: "Free Wireless Earbuds with phone purchase", code: "EARBUDSFREE", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0, isFeatured: true, isHot: true },
      { title: "15% off Smart Home Devices", code: "SMARTHOME15", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 15 },
      { title: "₹500 off Mechanical Keyboards", code: "KEYBOARD500", discountType: DISCOUNT_TYPE.FIXED, discountValue: 500 },
      { title: "10% off Noise Cancelling Headphones", code: "HEADPHONES", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 10 },
      { title: "Free Charging Dock with Smartwatch", code: "DOCKFREE", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "₹1,500 off Tablet Purchase", code: "TAB1500", discountType: DISCOUNT_TYPE.FIXED, discountValue: 1500 },
      { title: "20% off Bluetooth Speakers", code: "SPEAKER20", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 20 },
      { title: "Free Screen Guard with any phone repair", code: "REPAIRFREE", discountType: DISCOUNT_TYPE.FREEBIE, discountValue: 0 },
      { title: "₹200 off Type-C Fast Charger", code: "CHARGER200", discountType: DISCOUNT_TYPE.FIXED, discountValue: 200 },
      { title: "12% off External Hard Drives", code: "STORAGE12", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 12 },
    ];

    electronicsCoupons.forEach((c, idx) => {
      c.merchantId = merchantProfile3._id;
      c.category = "electronics";
      c.description = c.description || `Claim the latest tech offers: ${c.title}. Only at TechGadgets.`;
      c.expiresAt = daysFromNow(8 + idx * 6);
      c.location = idx % 3 === 0 
        ? { isOnline: true }
        : { city: "Delhi", state: "Delhi", country: "IN", isOnline: false };
      c.status = COUPON_STATUS.ACTIVE;
      c.isVerified = true;
      couponsToSeed.push(c);
    });
  }

  // Bulk insert all generated coupons (total = 42)
  console.log(`🎟️  Inserting all ${couponsToSeed.length} coupons into DB...`);
  await Coupon.insertMany(couponsToSeed);
  console.log("   ✅ Done.\n");


  // ════════════════════════════════════════════════════════════════
  //  CLAIMS & REDEMPTIONS (For Alice Johnson / customer@vouchiqo.com)
  // ════════════════════════════════════════════════════════════════
  console.log("🎟️  Seeding Claims & Redemptions for customer@vouchiqo.com...");
  const Claim = (await import("../modules/claim/claim.model.js")).default;
  const Redemption = (await import("../modules/redemption/redemption.model.js")).default;
  const UserProfile = (await import("../modules/user/user.model.js")).default;

  const customerUser = await db.collection("user").findOne({ email: "customer@vouchiqo.com" });
  if (customerUser && merchantProfile1 && merchantProfile2 && merchantProfile3) {
    const customerAuthId = customerUser.id || customerUser._id.toString();

    // Clear old claims, redemptions & profiles
    await Claim.deleteMany({});
    await Redemption.deleteMany({});
    await UserProfile.deleteMany({});

    const burgerCoupons = await Coupon.find({ merchantId: merchantProfile1._id });
    const styleCoupons = await Coupon.find({ merchantId: merchantProfile2._id });
    const techCoupons = await Coupon.find({ merchantId: merchantProfile3._id });

    const allCoupons = [
      ...burgerCoupons.map(c => ({ coupon: c, merchantId: merchantProfile1._id })),
      ...styleCoupons.map(c => ({ coupon: c, merchantId: merchantProfile2._id })),
      ...techCoupons.map(c => ({ coupon: c, merchantId: merchantProfile3._id }))
    ];

    // Shuffle coupons to make the distribution random
    allCoupons.sort(() => Math.random() - 0.5);

    const redemptionsToSeed = [];
    const claimsToSeed = [];
    const now = new Date();
    let totalSavingsVal = 0;

    // Use the first 11 coupons for redemptions spread over 11 months
    const redemptionCoupons = allCoupons.slice(0, 11);
    // Use the last 2 coupons for active claims (Saved Deals)
    const activeCoupons = allCoupons.slice(11, 13);

    redemptionCoupons.forEach((item, idx) => {
      const coupon = item.coupon;
      const merchantId = item.merchantId;

      // Assign to month going back in time
      const rDate = new Date();
      rDate.setMonth(now.getMonth() - idx);
      rDate.setDate(Math.floor(Math.random() * 20) + 5);
      rDate.setHours(12, 0, 0, 0);

      const claimId = new mongoose.Types.ObjectId();
      
      claimsToSeed.push({
        _id: claimId,
        userId: customerAuthId,
        couponId: coupon._id,
        merchantId: merchantId,
        status: "redeemed",
        redeemedAt: rDate,
        createdAt: rDate,
        updatedAt: rDate
      });

      const savingsAmount = coupon.discountType === "percentage"
        ? (coupon.discountValue * (coupon.originalPrice || 800)) / 100
        : (coupon.discountValue || 150);

      const originalPrice = coupon.originalPrice || (savingsAmount * 2.5);
      totalSavingsVal += savingsAmount;

      redemptionsToSeed.push({
        userId: customerAuthId,
        couponId: coupon._id,
        claimId: claimId,
        merchantId: merchantId,
        couponCode: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        originalPrice: originalPrice,
        savingsAmount: savingsAmount,
        createdAt: rDate,
        updatedAt: rDate
      });
    });

    // Seed 2 active claims (Saved Deals)
    activeCoupons.forEach((item) => {
      claimsToSeed.push({
        _id: new mongoose.Types.ObjectId(),
        userId: customerAuthId,
        couponId: item.coupon._id,
        merchantId: item.merchantId,
        status: "active",
        createdAt: now,
        updatedAt: now
      });
    });

    await Claim.insertMany(claimsToSeed);
    await Redemption.insertMany(redemptionsToSeed);

    await UserProfile.create({
      authId: customerAuthId,
      role: "customer",
      interests: ["Food & Dining", "Fashion & Apparel", "Electronics & Gadgets"],
      location: { city: "Ranchi", state: "Jharkhand", country: "IN" },
      emailNotifications: true,
      smsNotifications: false,
      expiryAlerts: true,
      totalSavings: totalSavingsVal
    });

    console.log(`   ✅ Seeded ${claimsToSeed.length} claims and ${redemptionsToSeed.length} redemptions (Total Savings: ₹${totalSavingsVal.toFixed(2)})`);
  }

  // ════════════════════════════════════════════════════════════════
  //  PLATFORM SETTINGS (Including 5 Social Proof success stories)
  // ════════════════════════════════════════════════════════════════
  console.log("⚙️  Seeding Platform Settings (social_proof, revival_stats, categories)...");

  // 1. Social proof stories (5)
  const stories = [
    {
      user: "Anish S. from Ranchi",
      brand: "Marbella Tiles & Sanitary",
      offer: "Saved ₹5,400 on home flooring tiles",
      date: "2 days ago",
      text: "Vouchiqo helped reactivate the flat ₹5,000 discount. Marbella Ranchi approved it immediately after receiving the request batch."
    },
    {
      user: "Sarah J. from Delhi",
      brand: "Starbucks Coffee",
      offer: "Revived Buy 1 Get 1 Free Espresso",
      date: "5 days ago",
      text: "Requested Starbucks BOGO revival. Within 48 hours, Vouchiqo updated the code to active, and I redeemed it in-store."
    },
    {
      user: "Amit K. from Patna",
      brand: "Biryani Palace",
      offer: "Saved ₹1,200 on family dining",
      date: "3 days ago",
      text: "Reactivated the 20% off coupon for Patna's Biryani Palace. Shared the request with 10 friends to cross the voting threshold!"
    },
    {
      user: "Rahul V. from Arrah",
      brand: "Burger House",
      offer: "Revived 30% discount on gourmet meals",
      date: "1 day ago",
      text: "The 30% off Burger House coupon had expired. Vouchiqo notified the merchant and we got a fresh new code in 24 hours!"
    },
    {
      user: "Rohan D. from Bangalore",
      brand: "Notion Premium Team Plan",
      offer: "Recovered $100 SaaS Workspace Credits",
      date: "1 week ago",
      text: "Our team credits coupon had expired. Vouchiqo contacted Notion's partnership team, and they re-enabled it for our domain!"
    }
  ];

  await PlatformSetting.create({
    key: "social_proof",
    value: stories
  });

  // 2. Revival Stats
  await PlatformSetting.create({
    key: "revival_stats",
    value: {
      totalRequests: 5240,
      thisMonthRequests: 142,
      recoveredAmount: 1250000,
      successRate: 94.2
    }
  });

  // 3. Categories
  await PlatformSetting.create({
    key: "categories",
    value: [
      { id: "food", name: "Food & Dining", slug: "food", active: true },
      { id: "fashion", name: "Fashion & Apparel", slug: "fashion", active: true },
      { id: "electronics", name: "Electronics", slug: "electronics", active: true },
      { id: "beauty", name: "Beauty & Wellness", slug: "beauty", active: true },
      { id: "travel", name: "Travel & Hotels", slug: "travel", active: true },
      { id: "fitness", name: "Fitness & Gym", slug: "fitness", active: true },
      { id: "home", name: "Home decor", slug: "home", active: true },
      { id: "entertainment", name: "Entertainment", slug: "entertainment", active: true },
      { id: "services", name: "Local services", slug: "services", active: true },
      { id: "other", name: "Others", slug: "other", active: true }
    ]
  });

  // 4. Payouts (Seeding Marbella Payout to test the revenue admin panel)
  await PlatformSetting.create({
    key: "payouts",
    value: [
      {
        id: "pay-1",
        businessName: "Marbella",
        amount: 24500,
        status: "pending",
        period: "June 2026",
        bankDetails: "HDFC Bank - A/C: 501002345876 - IFSC: HDFC0000123",
        createdAt: "2026-06-15T10:00:00.000Z"
      },
      {
        id: "pay-2",
        businessName: "Starbucks Coffee",
        amount: 12800,
        status: "paid",
        period: "June 2026",
        bankDetails: "ICICI Bank - A/C: 001205009876 - IFSC: ICIC0000012",
        createdAt: "2026-06-14T09:30:00.000Z"
      },
      {
        id: "pay-3",
        businessName: "Zomato Partner Ranchi",
        amount: 32000,
        status: "pending",
        period: "June 2026",
        bankDetails: "SBI - A/C: 30456123987 - IFSC: SBIN0000183",
        createdAt: "2026-06-16T11:45:00.000Z"
      }
    ]
  });

  console.log("   ✅ Platform settings populated.\n");

  // ─── Print test credentials ──────────────────────────────────────────────────
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              🎉 SEEDING COMPLETE — Test Accounts              ║
╠═══════════════════════════════════════════════════════════════╣
║  ROLE        EMAIL                        PASSWORD            ║
║  ──────────  ───────────────────────────  ─────────────────── ║
║  customer    customer@vouchiqo.com        Password123!        ║
║  customer    customer2@vouchiqo.com       Password123!        ║
║  merchant    merchant@vouchiqo.com        Merchant@123!       ║
║  merchant    merchant2@vouchiqo.com       Merchant@123!       ║
║  merchant    merchant3@vouchiqo.com       Merchant@123!       ║
║  merchant    marbella@vouchiqo.com        Merchant@123!       ║
║  admin       admin@vouchiqo.com           Admin@123!          ║
╠═══════════════════════════════════════════════════════════════╣
║  Merchants:  Burger House | StyleZone | TechGadgets | Marbella║
║  Coupons:    12 + 12 + 12 + 6 = 42 Active Coupons             ║
║  Settings:   5 Success stories seeded in platform_settings    ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed crashed:", err);
  process.exit(1);
});
