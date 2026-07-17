/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Vouchiqo Next.js Middleware/Proxy — Next.js 16+ Compliant
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Runs on the Node.js runtime (Next.js 16+ proxy.js default/enabled runtime).
 * Directly invokes auth.api.getSession() to inspect the session cookie —
 * ZERO HTTP fetch, completely eliminating localhost/Vercel loopback network issues.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getRedirectForRole,
  isAuthorizedForRoute,
  isProtectedRoute,
  ROUTES,
} from "./utils/routes";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // ── Step 1: Fast cookie presence check ──────────────────────────────────
  // Both cookie names: plain HTTP (dev) and __Secure- prefixed (prod HTTPS)
  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  if (!hasSessionCookie) {
    // No cookie at all — definitely not logged in
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Step 2: Validate session directly via Better Auth API ───────────────
  // auth.api.getSession reads the cookie from the request headers directly.
  // NO HTTP fetch — this works on both localhost and Vercel production.
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (err) {
    console.error(
      "[Proxy Middleware] auth.api.getSession failed:",
      err?.message,
    );
  }

  // ── Step 3: No valid session (expired / tampered cookie) ────────────────
  if (!session?.user) {
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Step 4: Logged-in user — apply role-based routing ───────────────────
  const { role, email } = session.user;
  console.log(
    `[Proxy Middleware] "${pathname}" | user="${email}" role="${role}"`,
  );

  // Redirect logged-in users away from auth pages to their correct dashboard
  const isAuthPage =
    pathname === ROUTES.AUTH.LOGIN ||
    pathname === ROUTES.AUTH.REGISTER ||
    pathname === ROUTES.AUTH.ADMIN_LOGIN ||
    pathname === ROUTES.AUTH.MERCHANT_LOGIN ||
    pathname === ROUTES.AUTH.MERCHANT_REGISTER ||
    pathname === ROUTES.AUTH.FORGOT_PASSWORD ||
    pathname === ROUTES.AUTH.RESET_PASSWORD ||
    pathname === ROUTES.AUTH.VERIFY_OTP ||
    (pathname.startsWith("/auth") && pathname !== ROUTES.AUTH.CALLBACK);

  if (isAuthPage) {
    const dest = getRedirectForRole(role);
    console.log(`[Proxy Middleware] Logged-in user on auth page → "${dest}"`);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Block users from accessing unauthorized role namespaces
  if (!isAuthorizedForRoute(pathname, role)) {
    const dest = getRedirectForRole(role);
    console.log(
      `[Proxy Middleware] Unauthorized: "${pathname}" for role="${role}" → "${dest}"`,
    );
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    // Protected dashboard namespaces
    "/admin/:path*",
    "/merchant/:path*",
    "/customer/:path*",
    "/profile/:path*",

    // Auth callback (needed to validate role after OAuth)
    "/auth/:path*",

    // Auth pages (redirect logged-in users away from these)
    "/login",
    "/register",
    "/admin-login",
    "/merchant-login",
    "/merchant-register",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ],
};
