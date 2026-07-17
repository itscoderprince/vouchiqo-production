import { toNextJsHandler } from "better-auth/next-js";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ROLES } from "@/utils/constants";

/**
 * Better Auth catch-all route handler.
 *
 * This single route handles all auth operations:
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - POST /api/auth/forget-password
 * - POST /api/auth/reset-password
 * - GET  /api/auth/verify-email
 * - GET  /api/auth/get-session
 *
 * Do not add business logic here — use auth.middleware.js in other routes.
 */
const handler = toNextJsHandler(auth);

export const GET = handler.GET;

export async function POST(request) {
  try {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/sign-in/email")) {
      const clone = request.clone();
      const body = await clone.json();
      const email = body.email;
      const password = body.password;

      if (email) {
        await connectDB();
        const db = mongoose.connection.db;
        const normalizedEmail = email.toLowerCase().trim();
        const dbUser = await db.collection("user").findOne({ email: normalizedEmail });
        if (dbUser) {
          const userIdStr = dbUser.id || dbUser._id.toString();
          const merchantProfile = await db.collection("merchants").findOne({ authId: userIdStr });
          if (merchantProfile) {
            console.log(`[Merchant Sync] Promoting user ${normalizedEmail} to role: merchant`);
            await db.collection("user").updateOne(
              { _id: dbUser._id },
              { $set: { role: ROLES.MERCHANT } }
            );
            await db.collection("user_profiles").updateOne(
              { authId: userIdStr },
              { $set: { role: ROLES.MERCHANT } }
            );
          }
        }
      }

      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminEmail = `${adminUsername}@vouchiqo.com`;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (adminPassword && email === adminEmail && password === adminPassword) {
        console.log(`[Admin Sync] Syncing admin user: ${adminEmail}`);
        await connectDB();
        const db = mongoose.connection.db;

        // Clean existing admin to ensure password / role are fresh
        const existingAdmin = await db
          .collection("user")
          .findOne({ email: adminEmail });
        if (existingAdmin) {
          const adminId = existingAdmin.id || existingAdmin._id.toString();
          await db.collection("user").deleteOne({ _id: existingAdmin._id });
          await db.collection("account").deleteMany({ userId: adminId });
          await db.collection("session").deleteMany({ userId: adminId });
          console.log(`[Admin Sync] Cleaned existing admin: ${adminEmail}`);
        }

        // Recreate admin user via Better Auth
        await auth.api.signUpEmail({
          body: {
            email: adminEmail,
            password: adminPassword,
            name: "Super Admin",
          },
        });
        console.log(`[Admin Sync] Created admin user: ${adminEmail}`);

        // Elevate role to admin
        const adminUser = await db
          .collection("user")
          .findOne({ email: adminEmail });
        if (adminUser) {
          await db
            .collection("user")
            .updateOne({ _id: adminUser._id }, { $set: { role: ROLES.ADMIN } });
          console.log(`[Admin Sync] Admin role elevated to ${ROLES.ADMIN}`);
        }
      }
    }
  } catch (err) {
    console.error("[Admin Sync] Error syncing admin user:", err);
  }

  return handler.POST(request);
}
