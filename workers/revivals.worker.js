/**
 * Revivals BullMQ Worker
 *
 * Runs repeatable SLA checking jobs to flag Category A requests
 * where the merchant has not responded within the 48-hour window.
 *
 * Start with: node workers/revivals.worker.js
 */

import { Queue, Worker } from "bullmq";
import mongoose from "mongoose";
import { redis } from "../lib/redis.js";
import { JOB_NAMES, QUEUE_NAMES } from "../utils/constants.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[revivals-worker] MONGODB_URI is missing.");
  process.exit(1);
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("[revivals-worker] MongoDB connected");
}

const customerRevivalSchema = new mongoose.Schema(
  {
    category: { type: String },
    status: { type: String },
    needsFollowUp: { type: Boolean },
    createdAt: { type: Date },
  },
  { strict: false, collection: "customer_revivals" }
);

const CustomerRevival =
  mongoose.models.CustomerRevival ??
  mongoose.model("CustomerRevival", customerRevivalSchema);

// 1. Initialize queue to schedule repeatable job
const queue = new Queue(QUEUE_NAMES.REVIVALS, { connection: redis });

async function scheduleRepeatableJob() {
  await queue.add(
    JOB_NAMES.CHECK_REVIVALS,
    {},
    {
      repeat: { cron: "0 * * * *" }, // Run every hour
      jobId: "revivals-sla-check-repeatable-job",
    }
  );
  console.log("[revivals-worker] SLA check repeatable job scheduled (every hour)");
}

scheduleRepeatableJob().catch((err) => {
  console.error("[revivals-worker] Failed to schedule repeatable job:", err);
});

// 2. Start Worker
const worker = new Worker(
  QUEUE_NAMES.REVIVALS,
  async (job) => {
    await connectDB();

    if (job.name === JOB_NAMES.CHECK_REVIVALS) {
      console.log("[revivals-worker] Running SLA compliance check...");
      
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const result = await CustomerRevival.updateMany(
        {
          category: "A",
          status: "pending",
          createdAt: { $lte: fortyEightHoursAgo },
          needsFollowUp: { $ne: true },
        },
        {
          $set: { needsFollowUp: true },
        }
      );

      console.log(
        `[revivals-worker] Flagged ${result.modifiedCount} Category A request(s) as non-responsive (passed 48h SLA).`
      );
    } else {
      console.warn(`[revivals-worker] Unknown job: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`[revivals-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[revivals-worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[revivals-worker] Worker error:", err);
});

console.log("[revivals-worker] Revivals worker started");
