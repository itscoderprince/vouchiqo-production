import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in environment variables.");
  process.exit(1);
}

async function wipeDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB to wipe database...");
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in database.`);

    for (const collection of collections) {
      const name = collection.name;
      const count = await db.collection(name).countDocuments();
      await db.collection(name).deleteMany({});
      console.log(`🧹 Cleared collection "${name}": deleted ${count} documents.`);
    }

    console.log("\n✅ Database wiped successfully! All users, merchants, coupons, campaigns & data have been erased.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error wiping database:", err);
    process.exit(1);
  }
}

wipeDatabase();
