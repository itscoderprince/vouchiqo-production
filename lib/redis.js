import { Redis } from "ioredis";
import { logger } from "./logger.js";
import { env } from "../utils/env.js";

/**
 * Redis singleton.
 *
 * maxRetriesPerRequest: null is required by BullMQ.
 * lazyConnect: true avoids connection errors on import when Redis is unavailable.
 *
 * We use the global cache pattern same as MongoDB to survive Next.js HMR.
 */
function createClient() {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableReadyCheck: false,
  });

  client.on("connect", () => logger.info("Redis connected"));
  client.on("error", (err) => logger.error({ err }, "Redis error"));
  client.on("close", () => logger.warn("Redis connection closed"));

  return client;
}

const cache = global.__redis ?? { client: null };
global.__redis = cache;

if (!cache.client) {
  cache.client = createClient();
}

export const redis = cache.client;
