import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import {
  COUPON_STATUS,
  DISCOUNT_TYPE,
  MERCHANT_STATUS,
  ROLES,
} from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/seed
 * Seed the database with customer, merchant, and admin accounts, plus coupons.
 */
export async function GET() {
  await connectDB();
  const db = mongoose.connection.db;

  const demoEmails = [
    "customer@vouchiqo.com",
    "customer2@vouchiqo.com",
    "merchant@vouchiqo.com",
    "merchant2@vouchiqo.com",
    "merchant3@vouchiqo.com",
    "admin@vouchiqo.com",
  ];

  // 1. Clean data
  const oldUsers = await db
    .collection("user")
    .find({ email: { $in: demoEmails } })
    .toArray();
  const oldUserIds = oldUsers.map((u) => u.id || u._id.toString());
  if (oldUserIds.length > 0) {
    await db.collection("user").deleteMany({
      $or: [
        { id: { $in: oldUserIds } },
        { _id: { $in: oldUsers.map((u) => u._id) } },
      ],
    });
    await db.collection("account").deleteMany({ userId: { $in: oldUserIds } });
    await db.collection("session").deleteMany({ userId: { $in: oldUserIds } });
  }
  await Merchant.deleteMany({});
  await Coupon.deleteMany({});

  const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

  // 2. Create Users
  await auth.api.signUpEmail({
    body: {
      email: "customer@vouchiqo.com",
      password: "Password123!",
      name: "Alice Johnson",
    },
  });
  await auth.api.signUpEmail({
    body: {
      email: "customer2@vouchiqo.com",
      password: "Password123!",
      name: "Bob Smith",
    },
  });

  await auth.api.signUpEmail({
    body: {
      email: "admin@vouchiqo.com",
      password: "Admin@123!",
      name: "Super Admin",
    },
  });
  const adminUser = await db
    .collection("user")
    .findOne({ email: "admin@vouchiqo.com" });
  if (adminUser) {
    await db
      .collection("user")
      .updateOne({ _id: adminUser._id }, { $set: { role: ROLES.ADMIN } });
  }

  // 3. Create Merchant 1
  await auth.api.signUpEmail({
    body: {
      email: "merchant@vouchiqo.com",
      password: "Merchant@123!",
      name: "Burger House",
    },
  });
  const mUser = await db
    .collection("user")
    .findOne({ email: "merchant@vouchiqo.com" });
  let merchantProfile1 = null;
  if (mUser) {
    await db
      .collection("user")
      .updateOne({ _id: mUser._id }, { $set: { role: ROLES.MERCHANT } });
    merchantProfile1 = await Merchant.create({
      authId: mUser.id || mUser._id.toString(),
      businessName: "Burger House",
      slug: "burger-house",
      description:
        "Gourmet burgers and hand-cut fries in the heart of the city. Fresh beef, brioche buns, secret sauce.",
      category: "food",
      contactEmail: "hello@burgerhouse.com",
      website: "https://burgerhouse.example.com",
      status: MERCHANT_STATUS.APPROVED,
      location: { city: "Arrah", state: "Bihar", country: "IN" },
      isVerified: true,
    });
  }

  // 4. Create Merchant 2
  await auth.api.signUpEmail({
    body: {
      email: "merchant2@vouchiqo.com",
      password: "Merchant@123!",
      name: "StyleZone",
    },
  });
  const mUser2 = await db
    .collection("user")
    .findOne({ email: "merchant2@vouchiqo.com" });
  let merchantProfile2 = null;
  if (mUser2) {
    await db
      .collection("user")
      .updateOne({ _id: mUser2._id }, { $set: { role: ROLES.MERCHANT } });
    merchantProfile2 = await Merchant.create({
      authId: mUser2.id || mUser2._id.toString(),
      businessName: "StyleZone",
      slug: "stylezone",
      description:
        "Trendy fashion for every season. From casual wear to formal outfits. Free delivery on orders over $50.",
      category: "fashion",
      contactEmail: "deals@stylezone.com",
      website: "https://stylezone.example.com",
      status: MERCHANT_STATUS.APPROVED,
      location: { city: "Patna", state: "Bihar", country: "IN" },
      isVerified: true,
    });
  }

  // 5. Create Merchant 3
  await auth.api.signUpEmail({
    body: {
      email: "merchant3@vouchiqo.com",
      password: "Merchant@123!",
      name: "TechGadgets",
    },
  });
  const mUser3 = await db
    .collection("user")
    .findOne({ email: "merchant3@vouchiqo.com" });
  let merchantProfile3 = null;
  if (mUser3) {
    await db
      .collection("user")
      .updateOne({ _id: mUser3._id }, { $set: { role: ROLES.MERCHANT } });
    merchantProfile3 = await Merchant.create({
      authId: mUser3.id || mUser3._id.toString(),
      businessName: "TechGadgets",
      slug: "techgadgets",
      description:
        "Latest smartphones, laptops, accessories and smart home devices. Best prices guaranteed.",
      category: "electronics",
      contactEmail: "support@techgadgets.com",
      website: "https://techgadgets.example.com",
      status: MERCHANT_STATUS.APPROVED,
      location: { city: "Delhi", state: "Delhi", country: "IN" },
      isVerified: true,
    });
  }

  // 6. Create Coupons for Merchant 1
  if (merchantProfile1) {
    await Coupon.insertMany([
      {
        merchantId: merchantProfile1._id,
        title: "30% off any Gourmet Burger",
        description:
          "Enjoy 30% off all premium beef, chicken, and veggie burgers. Dine-in only.",
        code: "BURGER30",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 30,
        category: "food",
        expiresAt: daysFromNow(30),
        location: {
          city: "Arrah",
          state: "Bihar",
          country: "IN",
          isOnline: false,
        },
        isFeatured: true,
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile1._id,
        title: "Buy One Get One Free Fries",
        description:
          "Get a free side of hand-cut fries with any large burger combo. Valid weekdays only.",
        code: "BOGOFRIES",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "food",
        expiresAt: daysFromNow(15),
        location: {
          city: "Arrah",
          state: "Bihar",
          country: "IN",
          isOnline: false,
        },
        isHot: true,
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile1._id,
        title: "Free Drink with any Meal",
        description:
          "Order any full meal and get a complimentary soft drink or juice. New customers only.",
        code: "FREEDRINK",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "food",
        expiresAt: daysFromNow(20),
        location: {
          city: "Arrah",
          state: "Bihar",
          country: "IN",
          isOnline: false,
        },
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile1._id,
        title: "15% off Online Delivery Orders",
        description:
          "Use at checkout on our website. Valid for all delivery orders above $10.",
        code: "ONLINE15",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 15,
        category: "food",
        expiresAt: daysFromNow(60),
        location: { isOnline: true },
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile1._id,
        title: "$5 off your First Order",
        description:
          "New customers get $5 off their first online order. Enter code at checkout.",
        code: "WELCOME5",
        discountType: DISCOUNT_TYPE.FIXED,
        discountValue: 5,
        category: "food",
        expiresAt: daysFromNow(90),
        location: { isOnline: true },
        isFeatured: true,
        status: COUPON_STATUS.ACTIVE,
      },
    ]);
  }

  // 7. Create Coupons for Merchant 2
  if (merchantProfile2) {
    await Coupon.insertMany([
      {
        merchantId: merchantProfile2._id,
        title: "20% off Summer Collection",
        description:
          "Shop the full summer range and save 20%. Applies to dresses, tops, shorts and swimwear.",
        code: "SUMMER20",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 20,
        category: "fashion",
        expiresAt: daysFromNow(45),
        location: {
          city: "Patna",
          state: "Bihar",
          country: "IN",
          isOnline: false,
        },
        isFeatured: true,
        isHot: true,
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile2._id,
        title: "Free Shipping on Orders Over $50",
        description: "Get free standard shipping when you spend $50 or more.",
        code: "FREESHIP50",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "fashion",
        expiresAt: daysFromNow(30),
        location: { isOnline: true },
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile2._id,
        title: "$15 off Men's Formal Wear",
        description:
          "Save $15 on all men's shirts, trousers and blazers. In-store purchase required.",
        code: "FORMAL15",
        discountType: DISCOUNT_TYPE.FIXED,
        discountValue: 15,
        category: "fashion",
        expiresAt: daysFromNow(25),
        location: {
          city: "Patna",
          state: "Bihar",
          country: "IN",
          isOnline: false,
        },
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile2._id,
        title: "Buy 2 Get 1 Free on Accessories",
        description:
          "Mix and match any 3 accessories (bags, scarves, belts) and get the cheapest one free.",
        code: "STYLE3FOR2",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "fashion",
        expiresAt: daysFromNow(10),
        location: {
          city: "Patna",
          state: "Bihar",
          country: "IN",
          isOnline: false,
        },
        isHot: true,
        status: COUPON_STATUS.ACTIVE,
      },
    ]);
  }

  // 8. Create Coupons for Merchant 3
  if (merchantProfile3) {
    await Coupon.insertMany([
      {
        merchantId: merchantProfile3._id,
        title: "10% off all Laptops",
        description:
          "10% off our full range of laptops including MacBook, Dell, HP and Lenovo models.",
        code: "LAPTOP10",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 10,
        category: "electronics",
        expiresAt: daysFromNow(20),
        location: {
          city: "Delhi",
          state: "Delhi",
          country: "IN",
          isOnline: false,
        },
        isFeatured: true,
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile3._id,
        title: "$50 off Smartphones over $500",
        description:
          "Spend $500+ on any smartphone and get $50 off instantly at checkout.",
        code: "PHONE50",
        discountType: DISCOUNT_TYPE.FIXED,
        discountValue: 50,
        category: "electronics",
        expiresAt: daysFromNow(14),
        location: { isOnline: true },
        isHot: true,
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile3._id,
        title: "Free Wireless Earbuds with any Phone",
        description:
          "Purchase any smartphone above $300 and receive a pair of wireless earbuds free.",
        code: "EARBUDSFREE",
        discountType: DISCOUNT_TYPE.FREEBIE,
        discountValue: 0,
        category: "electronics",
        expiresAt: daysFromNow(7),
        location: {
          city: "Delhi",
          state: "Delhi",
          country: "IN",
          isOnline: false,
        },
        isFeatured: true,
        isHot: true,
        status: COUPON_STATUS.ACTIVE,
      },
      {
        merchantId: merchantProfile3._id,
        title: "15% off Smart Home Devices",
        description:
          "Save on smart speakers, security cameras, smart bulbs and more. Online store only.",
        code: "SMARTHOME15",
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 15,
        category: "electronics",
        expiresAt: daysFromNow(40),
        location: { isOnline: true },
        status: COUPON_STATUS.ACTIVE,
      },
    ]);
  }

  return Response.json({
    status: "success",
    message: "Database seeded successfully!",
  });
}
