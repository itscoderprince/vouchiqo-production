"use server";

import mongoose from "mongoose";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { sendMerchantWelcomeEmail } from "@/lib/email/merchant-email";
import { sendUserWelcomeEmail } from "@/lib/email/user-email";

/**
 * /auth/callback — Server-side role redirect after OAuth (e.g. Google Sign-In).
 * Better Auth redirects here after the OAuth flow completes.
 * We read the session on the server and forward the user to their correct dashboard.
 */
export default async function AuthCallbackPage({ searchParams }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // No valid session — send back to login
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const requestedRole = resolvedSearchParams?.role;
  const currentRole = session.user.role;
  let finalRole = currentRole;

  await connectDB();
  const db = mongoose.connection.db;

  // Check if first-time login for OAuth user
  const userProfile = await db
    .collection("user_profiles")
    .findOne({ authId: session.user.id });

  const now = new Date();
  if (!userProfile || !userProfile.lastLoginAt) {
    // First-time OAuth login!
    const targetEmail = session.user.email;
    if (targetEmail) {
      if (requestedRole === "merchant" || currentRole === "merchant") {
        sendMerchantWelcomeEmail({
          to: targetEmail,
          email: targetEmail,
          businessName: session.user.name || "Merchant Store",
        }).catch((err) => console.error("[OAuth Merchant Welcome Email Error]:", err));
      } else {
        sendUserWelcomeEmail({
          to: targetEmail,
          name: session.user.name || targetEmail.split("@")[0],
        }).catch((err) => console.error("[OAuth User Welcome Email Error]:", err));
      }
    }
  }

  // If a role was specifically requested (e.g., during sign up) and user currently has customer role,
  // we update their role in the database.
  if (
    requestedRole &&
    requestedRole !== currentRole &&
    (requestedRole === "merchant" || requestedRole === "customer")
  ) {
    // Update role in Better Auth's user collection
    await db
      .collection("user")
      .updateOne({ _id: session.user.id }, { $set: { role: requestedRole } });

    // Update/upsert UserProfile model role
    await UserProfile.findOneAndUpdate(
      { authId: session.user.id },
      { $set: { role: requestedRole, lastLoginAt: now, updatedAt: now } },
      { upsert: true },
    );

    finalRole = requestedRole;
  } else {
    // Ensure UserProfile is initialized for the user and lastLoginAt is set
    await UserProfile.findOneAndUpdate(
      { authId: session.user.id },
      { $set: { lastLoginAt: now, updatedAt: now }, $setOnInsert: { role: currentRole } },
      { upsert: true },
    );
  }

  if (finalRole === "admin") {
    redirect("/admin/dashboard");
  } else if (finalRole === "merchant") {
    redirect("/merchant/dashboard");
  } else {
    redirect("/");
  }
}
