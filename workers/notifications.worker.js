/**
 * Notifications BullMQ Worker
 *
 * Processes background email sending jobs enqueued by the notifications queue.
 *
 * Start with: node workers/notifications.worker.js
 */

import { Worker } from "bullmq";
import { Resend } from "resend";
import { redis } from "../lib/redis.js";
import { JOB_NAMES, QUEUE_NAMES } from "../utils/constants.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("[notifications-worker] RESEND_API_KEY is missing.");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

const worker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job) => {
    if (job.name === JOB_NAMES.SEND_EMAIL) {
      const { to, subject, html } = job.data;

      if (!to || !subject || !html) {
        console.warn("[notifications-worker] Missing required parameters.");
        return;
      }

      await resend.emails.send({
        from: "Vouchiqo <onboarding@resend.dev>",
        to,
        subject,
        html,
      });

      console.log(`[notifications-worker] Email sent successfully to ${to}`);
    } else {
      console.warn(`[notifications-worker] Unknown job: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[notifications-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[notifications-worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[notifications-worker] Worker error:", err);
});

console.log("[notifications-worker] Notifications worker started");
