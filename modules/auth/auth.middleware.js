import crypto from "crypto";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import {
  ForbiddenError,
  TooManyRequestsError,
  UnauthorizedError,
} from "@/utils/app-error";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the Better Auth session token from the Cookie header.
 * Strips the HMAC signature if the cookie is signed (e.g. "token.sig").
 * Returns null if no session cookie is present.
 *
 * @param {Request|string} request
 * @returns {string|null}
 */
function extractSessionToken(request) {
  const cookieHeader =
    (typeof request === "string" ? request : request?.headers?.get?.("cookie")) || "";
  if (!cookieHeader) return null;

  const match =
    cookieHeader.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/) ||
    cookieHeader.match(/(?:^|;\s*)__Secure-better-auth\.session_token=([^;]+)/);
  if (!match) return null;

  const rawValue = decodeURIComponent(match[1].trim());
  const dotIndex = rawValue.lastIndexOf(".");
  if (dotIndex > 0) {
    return rawValue.substring(0, dotIndex);
  }
  return rawValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current session from the request.
 *
 * Performance path:
 *   1. Extract raw session token from cookie (strip HMAC signature)
 *   2. Check Redis for cached session payload  → HIT: return cached (< 1ms)
 *   3. MISS: call auth.api.getSession()        → fallback to DB via secondaryStorage
 *   4. Cache the resolved session in Redis with TTL
 *
 * Throws UnauthorizedError if not authenticated.
 *
 * @param {Request} request
 * @returns {Promise<{user: object, session: object}>}
 */
export async function requireAuth(request) {
  const token = extractSessionToken(request);

  // Fast path: check Redis cache first (< 1ms)
  if (token) {
    try {
      const cacheKey = REDIS_KEYS.session(token);
      const cached = await redis.get(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        const sessionData = parsed.session
          ? parsed
          : { session: { token, id: parsed.id }, user: parsed };

        const expiresAt = sessionData.session?.expiresAt
          ? new Date(sessionData.session.expiresAt).getTime()
          : Infinity;

        if (expiresAt > Date.now()) {
          return {
            session: sessionData.session,
            user: sessionData.user,
          };
        }
      }
    } catch (redisErr) {
      // Redis miss or error — fall through to DB lookup silently
      console.warn("[Auth Cache] Redis lookup failed, falling back to DB:", redisErr?.message);
    }
  }

  // Slow path: real DB session lookup via Better Auth
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new UnauthorizedError();

  // Cache the resolved session in Redis for subsequent calls
  if (token && session?.user) {
    try {
      const cacheKey = REDIS_KEYS.session(token);
      const ttl = session.session?.expiresAt
        ? Math.max(
            60,
            Math.floor((new Date(session.session.expiresAt).getTime() - Date.now()) / 1000),
          )
        : REDIS_TTL.AUTH_SESSION;

      await redis.set(cacheKey, JSON.stringify(session), "EX", Math.min(ttl, 604800));
    } catch (cacheErr) {
      // Non-critical: caching failure should not break auth
      console.warn("[Auth Cache] Failed to cache session:", cacheErr?.message);
    }
  }

  return session;
}

/**
 * Require auth + a specific role.
 * Pass one or more roles that are allowed.
 *
 * @param {Request} request
 * @param {...string} roles - Allowed roles (e.g. ROLES.MERCHANT, ROLES.ADMIN)
 * @returns {Promise<{user: object, session: object}>}
 */
export async function requireRole(request, ...roles) {
  const session = await requireAuth(request);

  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(
      "You do not have permission to perform this action",
    );
  }

  return session;
}

/**
 * Invalidate the Redis session cache for a given token.
 * Call this on sign-out so the cached session is immediately invalid.
 *
 * @param {Request} request
 */
export async function invalidateSessionCache(request) {
  try {
    const token = extractSessionToken(request);
    if (!token) return;
    await redis.del(REDIS_KEYS.session(token));
  } catch (err) {
    console.warn("[Auth Cache] Failed to invalidate session cache:", err?.message);
  }
}

/**
 * Invalidate the Redis merchant profile cache for a given authId.
 * Call this after a merchant profile is updated so stale data is evicted.
 *
 * @param {string} authId
 */
export async function invalidateMerchantCache(authId) {
  try {
    if (!authId) return;
    await redis.del(REDIS_KEYS.merchantProfile(String(authId)));
  } catch (err) {
    console.warn("[Auth Cache] Failed to invalidate merchant cache:", err?.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple Redis-backed rate limiter.
 *
 * @param {Request} request
 * @param {string} route - Route identifier (e.g. "POST:/api/auth/login")
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowSecs - Window size in seconds (default: 60)
 */
export async function rateLimit(
  request,
  route,
  maxRequests,
  windowSecs = REDIS_TTL.RATE_LIMIT,
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const key = REDIS_KEYS.rateLimit(ip, route);
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSecs);
  }

  if (current > maxRequests) {
    throw new TooManyRequestsError();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Distributed Locks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Acquire a Redis distributed lock (used for redemption race conditions).
 *
 * @param {string} key - Redis key
 * @param {number} ttl - Lock TTL in seconds
 * @returns {Promise<boolean>} - true if lock acquired, false if already locked
 */
export async function acquireLock(key, ttl = REDIS_TTL.REDEEM_LOCK) {
  const result = await redis.set(key, "1", "EX", ttl, "NX");
  return result === "OK";
}

/**
 * Release a Redis distributed lock.
 *
 * @param {string} key - Redis key
 */
export async function releaseLock(key) {
  await redis.del(key);
}