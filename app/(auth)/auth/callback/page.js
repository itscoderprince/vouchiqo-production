"use server";

import mongoose from "mongoose";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import UserProfile from "@/modules/user/user.model";

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
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const requestedRole = resolvedSearchParams?.role;
  const currentRole = session.user.role;
  let finalRole = currentRole;

  // If a role was specifically requested (e.g., during sign up) and user currently has customer role,
  // we update their role in the database.
  if (
    requestedRole &&
    requestedRole !== currentRole &&
    (requestedRole === "merchant" || requestedRole === "customer")
  ) {
    await connectDB();
    const db = mongoose.connection.db;

    // Update role in Better Auth's user collection
    await db
      .collection("user")
      .updateOne({ _id: session.user.id }, { $set: { role: requestedRole } });

    // Update/upsert UserProfile model role
    await UserProfile.findOneAndUpdate(
      { authId: session.user.id },
      { $set: { role: requestedRole } },
      { upsert: true },
    );

    finalRole = requestedRole;
  } else {
    // Ensure UserProfile is initialized for the user
    await connectDB();
    await UserProfile.findOneAndUpdate(
      { authId: session.user.id },
      { $setOnInsert: { role: currentRole } },
      { upsert: true },
    );
  }

  if (finalRole === "admin") {
    redirect("/admin/dashboard");
  } else if (finalRole === "merchant") {
    redirect("/merchant/dashboard");
  } else {
    redirect("/customer/dashboard");
  }
}
