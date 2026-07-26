import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = "admin@vouchiqo.com";

async function seedAdmin() {
  try {
    console.log("⏳ Seeding clean Super Admin account...");
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // Check if seed route can run via fetch or seed directly
    const res = await fetch("http://localhost:3000/api/seed");
    const json = await res.json();
    console.log("Seed API response:", json);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err.message);
    process.exit(0);
  }
}

seedAdmin();
