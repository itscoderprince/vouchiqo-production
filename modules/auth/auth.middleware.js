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
 * Returns null if no session cookie is present.
 *
 * @param {Request} request
 * @returns {string|null}
 */
function extractSessionToken(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  // Better Auth uses "better-auth.session_token" in production
  // and "__Secure-better-auth.session_token" on HTTPS
  const match =
    cookieHeader.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/) ||
    cookieHeader.match(/(?:^|;\s*)__Secure-better-auth\.session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * SHA-256 hash of the raw session token.
 * We NEVER store the raw token in Redis — only its hash.
 *
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current session from the request.
 *
 * Performance path:
 *   1. Extract session token from cookie
 *   2. SHA-256 hash it (never store raw tokens in Redis)
 *   3. Check Redis for cached session payload  → HIT: return cached (2–5ms)
 *   4. MISS: call auth.api.getSession()        → ~80–300ms MongoDB lookup
 *   5. Cache the result in Redis for AUTH_SESSION TTL (5 min)
 *
 * Throws UnauthorizedError if not authenticated.
 *
 * @param {Request} request
 * @returns {Promise<{user: object, session: object}>}
 */
export async function requireAuth(request) {
  const token = extractSessionToken(request);

  // Fast path: check Redis cache first
  if (token) {
    try {
      const tokenHash = hashToken(token);
      const cacheKey = REDIS_KEYS.session(tokenHash);
      const cached = await redis.get(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        // Reconstruct the minimal session shape expected by callers
        return {
          session: { token },
          user: parsed,
        };
      }
    } catch (redisErr) {
      // Redis miss or error — fall through to DB lookup silently
      console.warn("[Auth Cache] Redis lookup failed, falling back to DB:", redisErr?.message);
    }
  }

  // Slow path: real DB session lookup via Better Auth
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new UnauthorizedError();

  // Cache the resolved session in Redis for subsequent calls
  if (token && session?.user) {
    try {
      const tokenHash = hashToken(token);
      const cacheKey = REDIS_KEYS.session(tokenHash);
      const payload = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        isActive: session.user.isActive ?? true,
      };
      await redis.setex(cacheKey, REDIS_TTL.AUTH_SESSION, JSON.stringify(payload));
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
    const tokenHash = hashToken(token);
    await redis.del(REDIS_KEYS.session(tokenHash));
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