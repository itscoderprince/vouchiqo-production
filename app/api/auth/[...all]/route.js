import { toNextJsHandler } from "better-auth/next-js";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendMerchantWelcomeEmail } from "@/lib/email/merchant-email";
import {
  sendUserWelcomeBackEmail,
  sendUserWelcomeEmail,
} from "@/lib/email/user-email";
import { connectDB } from "@/lib/mongodb";
import { ROLES } from "@/utils/constants";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

// ── Backend Zod Security Verification Schemas ────────────────────────────────
const backendSignInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

const backendSignUpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name must be at least 1 character")
    .max(100, "Name must be under 100 characters"),
  data: z
    .object({
      role: z.enum(["customer", "merchant"]),
      phoneNumber: z.string().optional(),
    })
    .optional(),
});

const backendForgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
});

const backendResetPasswordSchema = z.object({
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  token: z
    .string({ required_error: "Token is required" })
    .min(1, "Token is required"),
});

export async function POST(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Perform validation depending on endpoint
    if (
      pathname.endsWith("/sign-in/email") ||
      pathname.endsWith("/sign-up/email") ||
      pathname.endsWith("/forget-password") ||
      pathname.endsWith("/reset-password")
    ) {
      const clone = request.clone();
      const body = await clone.json().catch(() => ({}));

      let result;
      if (pathname.endsWith("/sign-in/email")) {
        result = backendSignInSchema.safeParse(body);
      } else if (pathname.endsWith("/sign-up/email")) {
        result = backendSignUpSchema.safeParse(body);
      } else if (pathname.endsWith("/forget-password")) {
        result = backendForgotPasswordSchema.safeParse(body);
      } else if (pathname.endsWith("/reset-password")) {
        result = backendResetPasswordSchema.safeParse(body);
      }

      if (result && !result.success) {
        return Response.json(
          {
            error: "Validation failed",
            message: result.error.errors[0]?.message ?? "Invalid request input",
            details: result.error.errors,
          },
          { status: 400 },
        );
      }

      // Check duplicate email & mobile on sign-up
      if (pathname.endsWith("/sign-up/email") && body.email) {
        await connectDB();
        const db = mongoose.connection.db;
        const normalizedEmail = body.email.toLowerCase().trim();
        const existingEmailUser = await db.collection("user").findOne({ email: normalizedEmail });
        if (existingEmailUser) {
          return Response.json(
            {
              error: "Conflict",
              message: "An account with this email address already exists. Please log in instead.",
            },
            { status: 409 },
          );
        }

        const phone = body.data?.phoneNumber;
        if (phone) {
          const cleanPhone = phone.trim();
          const existingPhoneMerchant = await db.collection("merchants").findOne({
            $or: [{ contactPhone: cleanPhone }, { liaisonPhone: cleanPhone }],
          });
          if (existingPhoneMerchant) {
            return Response.json(
              {
                error: "Conflict",
                message: "Mobile / Phone number is already registered to another merchant account.",
              },
              { status: 409 },
            );
          }
        }
      }

      // Business logic for /sign-in/email (sync roles + recreate admins)
      if (pathname.endsWith("/sign-in/email")) {
        const { email, password } = body;

        if (email) {
          await connectDB();
          const db = mongoose.connection.db;
          const normalizedEmail = email.toLowerCase().trim();
          const dbUser = await db
            .collection("user")
            .findOne({ email: normalizedEmail });
          if (dbUser) {
            const userIdStr = dbUser.id || dbUser._id.toString();
            const merchantProfile = await db
              .collection("merchants")
              .findOne({ authId: userIdStr });
            if (merchantProfile) {
              console.log(
                `[Merchant Sync] Promoting user ${normalizedEmail} to role: merchant`,
              );
              await db
                .collection("user")
                .updateOne(
                  { _id: dbUser._id },
                  { $set: { role: ROLES.MERCHANT } },
                );
              await db
                .collection("user_profiles")
                .updateOne(
                  { authId: userIdStr },
                  { $set: { role: ROLES.MERCHANT } },
                );
            }
          }
        }

        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminEmail = `${adminUsername}@vouchiqo.com`;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          adminPassword &&
          email === adminEmail &&
          password === adminPassword
        ) {
          console.log(`[Admin Sync] Syncing admin user: ${adminEmail}`);
          await connectDB();
          const db = mongoose.connection.db;

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

          await auth.api.signUpEmail({
            body: {
              email: adminEmail,
              password: adminPassword,
              name: "Super Admin",
            },
          });
          console.log(`[Admin Sync] Created admin user: ${adminEmail}`);

          const adminUser = await db
            .collection("user")
            .findOne({ email: adminEmail });
          if (adminUser) {
            await db
              .collection("user")
              .updateOne(
                { _id: adminUser._id },
                { $set: { role: ROLES.ADMIN } },
              );
            console.log(`[Admin Sync] Admin role elevated to ${ROLES.ADMIN}`);
          }
        }
      }
    }
  } catch (err) {
    console.error("[Auth API Interceptor] Error executing verification:", err);
  }

  const response = await handler.POST(request);

  // Post-process /sign-up/email to send Welcome Email & promote merchant role
  if (pathname.endsWith("/sign-up/email") && response.ok) {
    try {
      const clone = request.clone();
      const body = await clone.json().catch(() => ({}));
      const referer = request.headers.get("referer") || "";
      const requestedRole = body.role || body.data?.role;
      const isMerchantSignup =
        requestedRole === "merchant" ||
        referer.includes("/merchant") ||
        referer.includes("/onboarding");

      if (body.email) {
        const normalizedEmail = body.email.toLowerCase().trim();

        if (isMerchantSignup) {
          // Trigger Merchant Credentials Welcome Email
          sendMerchantWelcomeEmail({
            to: normalizedEmail,
            email: normalizedEmail,
            password: body.password || undefined,
            businessName: body.name || "Your Store",
          }).catch((err) =>
            console.error("[Merchant Welcome Email Error]:", err),
          );

          await connectDB();
          const db = mongoose.connection.db;

          const userDoc = await db
            .collection("user")
            .findOne({ email: normalizedEmail });

          if (userDoc) {
            const userIdStr = userDoc.id || userDoc._id.toString();
            await db
              .collection("user")
              .updateOne(
                { _id: userDoc._id },
                { $set: { role: ROLES.MERCHANT } },
              );
            await db
              .collection("user_profiles")
              .updateOne(
                { authId: userIdStr },
                { $set: { role: ROLES.MERCHANT } },
                { upsert: true },
              );
            console.log(
              `[Sign-Up Sync] Promoted newly registered user ${normalizedEmail} to role: merchant`,
            );
          }
        } else {
          // Trigger Customer Welcome Email
          sendUserWelcomeEmail({
            to: normalizedEmail,
            name: body.name || normalizedEmail.split("@")[0],
          }).catch((err) => console.error("[Welcome Email Error]:", err));
        }
      }
    } catch (e) {
      console.error("[Sign-Up Post-Process Error]:", e);
    }
  }

  // Post-process /sign-in/email to send Welcome Back email if returning after > 1 day
  if (pathname.endsWith("/sign-in/email") && response.ok) {
    try {
      const clone = request.clone();
      const body = await clone.json().catch(() => ({}));
      if (body.email) {
        await connectDB();
        const db = mongoose.connection.db;
        const normalizedEmail = body.email.toLowerCase().trim();
        const userDoc = await db
          .collection("user")
          .findOne({ email: normalizedEmail });

        if (userDoc) {
          const userIdStr = userDoc.id || userDoc._id.toString();
          const profile = await db
            .collection("user_profiles")
            .findOne({ authId: userIdStr });
          const now = new Date();

          const lastLogin = profile?.lastLoginAt
            ? new Date(profile.lastLoginAt)
            : null;

          const daysSinceLastLogin = lastLogin
            ? (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
            : 999;

          // Update lastLoginAt in user_profiles
          await db
            .collection("user_profiles")
            .updateOne(
              { authId: userIdStr },
              { $set: { lastLoginAt: now, updatedAt: now } },
              { upsert: true },
            );

          // Send Welcome Back email if returning after >= 1 day
          if (daysSinceLastLogin >= 1) {
            sendUserWelcomeBackEmail({
              to: normalizedEmail,
              name: userDoc.name || normalizedEmail.split("@")[0],
              lastLoginAt: lastLogin,
            }).catch((err) =>
              console.error("[Welcome Back Email Error]:", err),
            );
          }
        }
      }
    } catch (e) {
      console.error("[Sign-In Post-Process Error]:", e);
    }
  }

  return response;
}
