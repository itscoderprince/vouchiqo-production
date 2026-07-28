"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  merchant: "/merchant/dashboard",
  customer: "/", // customers land on the homepage
};

/**
 * Central user hook — use this anywhere in the app instead of useSession.
 *
 * Returns:
 *  - user        → the current user object (null if not logged in)
 *  - role        → "customer" | "merchant" | "admin"
 *  - isLoaded    → true once session has been resolved
 *  - isLoggedIn  → shorthand for !!user
 *  - logout()    → signs out and redirects to /auth/login
 *  - homeRoute   → the right dashboard route for this user's role
 */
export function useUser() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user ?? null;
  const role = user?.role ?? "customer";

  async function logout() {
    try {
      // Clear any merchant session flags so redirect guards don't fire after logout
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vouchiqo_is_merchant");
      }
      await signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push("/");
  }

  return {
    user,
    role,
    isLoaded: !isPending,
    isLoggedIn: !!user,
    logout,
    homeRoute: ROLE_HOME[role] ?? "/",
  };
}
