import { Redis } from "ioredis";
import { logger } from "./logger.js";
import { env } from "../utils/env.js";

/**
 * Redis singleton.
 *
 * maxRetriesPerRequest: null is required by BullMQ.
 * commandTimeout: 3000 prevents slow/unreachable Redis queries from hanging HTTP requests.
 * connectTimeout: 5000 limits handshake time.
 */
function createClient() {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
    commandTimeout: 3000,
    enableReadyCheck: true,
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
