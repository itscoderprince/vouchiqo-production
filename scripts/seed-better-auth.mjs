import mongoose from "mongoose";
import { auth } from "../lib/auth.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function seedData() {
  try {
    console.log("⏳ Connecting to MongoDB to seed test accounts via Better Auth...");
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // 1. Clear database first
    const collections = await db.listCollections().toArray();
    for (const c of collections) {
      await db.collection(c.name).deleteMany({});
    }
    console.log("🧹 Database cleared.");

    // Helper to sign up user via Better Auth API
    const createAuthUser = async (name, email, password, role = "user") => {
      try {
        await auth.api.signUpEmail({
          body: { email, password, name, role },
        });
      } catch (err) {
        console.log(`[Seed Note] for ${email}:`, err.message || err);
      }
      const u = await db.collection("user").findOne({ email });
      if (u) {
        await db.collection("user").updateOne({ _id: u._id }, { $set: { role } });
        return u._id.toString();
      }
      return null;
    };

    // 2. Create Super Admin
    const adminEmail = `${process.env.ADMIN_USERNAME || "admin"}@vouchiqo.com`;
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123!";
    await createAuthUser("Super Admin", adminEmail, adminPassword, "admin");
    console.log(`✅ 1. Super Admin created: ${adminEmail}`);

    // 3. Create 2 Customer Users
    const customers = [
      { name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "+91 98765 43210" },
      { name: "Priya Singh", email: "priya.singh@example.com", phone: "+91 98765 43211" },
    ];

    for (const c of customers) {
      const authId = await createAuthUser(c.name, c.email, "User@123!", "user");
      if (authId) {
        await db.collection("user_profiles").insertOne({
          _id: new mongoose.Types.ObjectId(),
          authId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          city: "Ranchi",
          state: "Jharkhand",
          pincode: "834001",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    console.log("✅ 2. 2 Customer Users created.");

    // 4. Create 7 Fresh Merchants
    const merchantsData = [
      {
        businessName: "Marbella Tiles & Sanitaryware",
        contactEmail: "marbella@vouchiqo.com",
        phone: "+91 98351 23456",
        category: "Home Improvement",
        plan: "pro",
        status: "approved",
        address: "Plot 42, Main Road, Overbridge, Ranchi, Jharkhand 834001",
      },
      {
        businessName: "Burger House",
        contactEmail: "burgerhouse@vouchiqo.com",
        phone: "+91 98351 23457",
        category: "Food & Dining",
        plan: "growth",
        status: "approved",
        address: "Nucleus Mall, Food Court, Ranchi, Jharkhand 834001",
      },
      {
        businessName: "JewelCraft Ranchi",
        contactEmail: "jewelcraft@vouchiqo.com",
        phone: "+91 98351 23458",
        category: "Jewelry & Luxury",
        plan: "enterprise",
        status: "approved",
        address: "Lalpur Chowk, Ranchi, Jharkhand 834001",
      },
      {
        businessName: "Kaveri Restaurant",
        contactEmail: "kaveri@vouchiqo.com",
        phone: "+91 98351 23459",
        category: "Fine Dining",
        plan: "starter",
        status: "approved",
        address: "Church Road, Commercial Complex, Ranchi 834001",
      },
      {
        businessName: "Trends Fashion Studio",
        contactEmail: "trendsfashion@vouchiqo.com",
        phone: "+91 98351 23460",
        category: "Fashion & Apparel",
        plan: "growth",
        status: "pending",
        address: "Opp. GEL Church Complex, Main Road, Ranchi 834001",
      },
      {
        businessName: "FitPulse Gym & Spa",
        contactEmail: "fitpulse@vouchiqo.com",
        phone: "+91 98351 23461",
        category: "Health & Fitness",
        plan: "starter",
        status: "pending",
        address: "Kanke Road, Near Rock Garden, Ranchi 834008",
      },
      {
        businessName: "Apex Electronics",
        contactEmail: "apexelectronics@vouchiqo.com",
        phone: "+91 98351 23462",
        category: "Electronics & Gadgets",
        plan: "starter",
        status: "rejected",
        address: "Daily Market, Main Road, Ranchi 834001",
      },
    ];

    for (const m of merchantsData) {
      const authId = await createAuthUser(m.businessName, m.contactEmail, "Merchant@123!", "merchant");
      if (authId) {
        const slug = m.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const merchantDbId = new mongoose.Types.ObjectId();

        await db.collection("merchants").insertOne({
          _id: merchantDbId,
          authId,
          businessName: m.businessName,
          slug,
          contactEmail: m.contactEmail,
          phone: m.phone,
          category: m.category,
          plan: m.plan,
          status: m.status,
          address: m.address,
          isVerified: m.status === "approved",
          revivalCredits: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        if (m.status === "approved") {
          await db.collection("coupons").insertOne({
            _id: new mongoose.Types.ObjectId(),
            merchantId: merchantDbId,
            title: `Flat 20% OFF at ${m.businessName}`,
            code: `${m.businessName.substring(0, 4).toUpperCase()}20`,
            discountType: "percentage",
            discountValue: 20,
            category: m.category,
            status: "active",
            claimsCount: 15,
            totalLimit: 500,
            expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          await db.collection("campaigns").insertOne({
            _id: new mongoose.Types.ObjectId(),
            merchantId: merchantDbId,
            name: `${m.businessName} Festive Special Campaign`,
            type: "festival",
            status: "pending_review",
            headline: `Special Offer from ${m.businessName}`,
            offerDetails: {
              code: `${m.businessName.substring(0, 4).toUpperCase()}FEST`,
              discountValue: 25,
              redemptionLimit: 1000,
            },
            startDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
    console.log("✅ 3. 7 Fresh Merchants created with active coupons & campaigns.");

    console.log("\n🎉 Seeding finished successfully! All 10 accounts are ready for login.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
}

seedData();
