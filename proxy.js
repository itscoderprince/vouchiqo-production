import { NextResponse } from "next/server";
import {
  getRedirectForRole,
  isAuthorizedForRoute,
  isProtectedRoute,
  ROUTES,
} from "./utils/routes";

/**
 * Next.js Middleware/Proxy for authentication redirects and route protection.
 * Utilizes centralized routing and role-based redirect rules from utils/routes.js.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Fast synchronous check on cookies first to minimize overhead
  const hasSession =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__secure-better-auth.session_token");

  if (!hasSession) {
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }
    return NextResponse.next();
  }

  // 2. Cookie is present. Fetch session validation via the centralized API endpoint.
  try {
    const response = await fetch(new URL(ROUTES.API.GET_SESSION, request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const session = await response.json();
      if (session?.user) {
        const { role } = session.user;

        // Redirect logged-in users away from auth forms (e.g. login, register)
        if (pathname.startsWith("/auth") && pathname !== ROUTES.AUTH.CALLBACK) {
          const dest = getRedirectForRole(role);
          return NextResponse.redirect(new URL(dest, request.url));
        }

        // Enforce centralized authorization rules on protected path folders
        if (!isAuthorizedForRoute(pathname, role)) {
          const dest = getRedirectForRole(role);
          return NextResponse.redirect(new URL(dest, request.url));
        }

        return NextResponse.next();
      }
    }
  } catch (error) {
    console.error("Middleware session verification failed:", error);
  }

  // Fallback: If verification failed/expired, redirect from protected routes to login
  if (isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/customer/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
