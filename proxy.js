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
    const fetchUrl = new URL(ROUTES.API.GET_SESSION, request.url);
    // Force local loopback address and port to avoid DNS or SSL validation loopback errors
    fetchUrl.hostname = "127.0.0.1";
    fetchUrl.port = process.env.PORT || "3000";
    fetchUrl.protocol = "http:";

    const response = await fetch(fetchUrl, {
      headers: {
        cookie: request.headers.get("cookie") || "",
        host: "localhost:3000",
        "x-forwarded-host": "localhost:3000",
      },
    });

    if (response.ok) {
      const session = await response.json();
      if (session?.user) {
        const { role } = session.user;
        console.log(
          `[Middleware] Path: "${pathname}", User: "${session.user.email}", Role: "${role}"`,
        );

        // Redirect logged-in users away from auth forms (e.g. login, register)
        const isAuthForm =
          pathname === ROUTES.AUTH.LOGIN ||
          pathname === ROUTES.AUTH.REGISTER ||
          pathname === ROUTES.AUTH.FORGOT_PASSWORD ||
          pathname === ROUTES.AUTH.RESET_PASSWORD ||
          pathname === ROUTES.AUTH.VERIFY_OTP ||
          pathname === "/merchant-login" ||
          pathname === "/merchant-register" ||
          pathname === "/admin-login" ||
          (pathname.startsWith("/auth") && pathname !== ROUTES.AUTH.CALLBACK);

        if (isAuthForm) {
          const dest = getRedirectForRole(role);
          console.log(
            `[Middleware] Redirecting logged-in user away from auth form to: "${dest}"`,
          );
          return NextResponse.redirect(new URL(dest, request.url));
        }

        // Enforce centralized authorization rules on protected path folders
        if (!isAuthorizedForRoute(pathname, role)) {
          const dest = getRedirectForRole(role);
          console.log(
            `[Middleware] Unauthorized access attempt for "${pathname}". Redirecting to: "${dest}"`,
          );
          return NextResponse.redirect(new URL(dest, request.url));
        }

        return NextResponse.next();
      }
    }
  } catch (error) {
    console.error("[Middleware] session verification failed:", error.message);
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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/merchant-login",
    "/merchant-register",
    "/admin-login",
  ],
};
