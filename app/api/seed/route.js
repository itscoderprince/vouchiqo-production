import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/seed
 * Seed ONLY the admin account using ADMIN_USERNAME and ADMIN_PASSWORD.
 * Clean, safe, production-ready.
 */
export async function GET() {
  console.log("[Seed Route] Started database seeding...");
  await connectDB();
  const db = mongoose.connection.db;

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = `${adminUsername}@vouchiqo.com`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return Response.json(
      {
        status: "error",
        message:
          "ADMIN_PASSWORD environment variable is required to run the seed.",
      },
      { status: 400 },
    );
  }

  try {
    // 1. Clean existing admin if present to avoid unique/duplicate key conflicts
    const existingAdmin = await db
      .collection("user")
      .findOne({ email: adminEmail });
    if (existingAdmin) {
      const adminId = existingAdmin.id || existingAdmin._id.toString();
      await db.collection("user").deleteOne({ _id: existingAdmin._id });
      await db.collection("account").deleteMany({ userId: adminId });
      await db.collection("session").deleteMany({ userId: adminId });
      console.log(`[Seed Route] Cleaned existing admin: ${adminEmail}`);
    }

    // 2. Create Admin User
    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Super Admin",
      },
    });

    // 3. Elevate role to admin
    const adminUser = await db
      .collection("user")
      .findOne({ email: adminEmail });
    if (adminUser) {
      await db
        .collection("user")
        .updateOne({ _id: adminUser._id }, { $set: { role: ROLES.ADMIN } });
      console.log(
        `[Seed Route] Admin role elevated successfully for ${adminEmail}`,
      );
    }

    return Response.json({
      status: "success",
      message: "Admin seeded successfully!",
    });
  } catch (err) {
    console.error("[Seed Route] Error seeding admin:", err);
    return Response.json(
      {
        status: "error",
        message: err.message || "Failed to seed admin user.",
      },
      { status: 500 },
    );
  }
}
