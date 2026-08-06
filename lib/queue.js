import { Queue } from "bullmq";
import { logger } from "./logger.js";
import { redis } from "./redis.js";
import { QUEUE_NAMES } from "../utils/constants.js";

/**
 * Queue connection config — BullMQ uses a dedicated Redis connection.
 * We reuse the same redis instance (maxRetriesPerRequest: null is required).
 */
const connection = redis;

// ─────────────────────────────────────────────
// Queue Instances
// Create one Queue per domain. Queues are producers — they add jobs.
// ─────────────────────────────────────────────

export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export const analyticsQueue = new Queue(QUEUE_NAMES.ANALYTICS, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 200 },
  },
});

export const couponQueue = new Queue(QUEUE_NAMES.COUPONS, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: { count: 100 },
  },
});

export const revivalQueue = new Queue(QUEUE_NAMES.REVIVALS, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: true,
    removeOnFail: { count: 50 },
  },
});

// ─────────────────────────────────────────────
// Helper: Add a job safely (with error logging)
// ─────────────────────────────────────────────

/**
 * @param {Queue} queue
 * @param {string} jobName
 * @param {object} data
 * @param {object} [opts]
 */
export async function addJob(queue, jobName, data, opts = {}) {
  try {
    await queue.add(jobName, data, opts);
  } catch (err) {
    logger.error({ err, jobName }, "Failed to add job to queue");
  }
}
