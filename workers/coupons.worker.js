/**
 * Coupons BullMQ Worker
 *
 * Runs repeatable background jobs to automatically expire coupons whose expiresAt has passed.
 *
 * Start with: node workers/coupons.worker.js
 */

import { Queue, Worker } from "bullmq";
import mongoose from "mongoose";
import { redis } from "../lib/redis.js";
import { JOB_NAMES, QUEUE_NAMES } from "../utils/constants.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[coupons-worker] MONGODB_URI is missing.");
  process.exit(1);
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("[coupons-worker] MongoDB connected");
}

const couponSchema = new mongoose.Schema(
  {
    status: { type: String },
    expiresAt: { type: Date },
  },
  { strict: false, collection: "coupons" }
);

const Coupon = mongoose.models.Coupon ?? mongoose.model("Coupon", couponSchema);

// 1. Initialize queue to schedule repeatable job
const queue = new Queue(QUEUE_NAMES.COUPONS, { connection: redis });

async function scheduleRepeatableJob() {
  await queue.add(
    JOB_NAMES.EXPIRE_COUPON,
    {},
    {
      repeat: { cron: "*/15 * * * *" }, // Run every 15 minutes
      jobId: "auto-expire-coupons-repeatable-job",
    }
  );
  console.log("[coupons-worker] Auto-expiry repeatable job scheduled (every 15 minutes)");
}

scheduleRepeatableJob().catch((err) => {
  console.error("[coupons-worker] Failed to schedule repeatable job:", err);
});

// 2. Start Worker
const worker = new Worker(
  QUEUE_NAMES.COUPONS,
  async (job) => {
    await connectDB();

    if (job.name === JOB_NAMES.EXPIRE_COUPON) {
      console.log("[coupons-worker] Running auto-expiry check...");
      
      const result = await Coupon.updateMany(
        {
          status: "active",
          expiresAt: { $lte: new Date() },
        },
        {
          $set: { status: "expired" },
        }
      );

      console.log(`[coupons-worker] Expired ${result.modifiedCount} active coupon(s).`);
    } else {
      console.warn(`[coupons-worker] Unknown job: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`[coupons-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[coupons-worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[coupons-worker] Worker error:", err);
});

console.log("[coupons-worker] Coupons worker started");
