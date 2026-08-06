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
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "Vouchiqo <noreply@vouchiqo.com>";

const worker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job) => {
    if (job.name === JOB_NAMES.SEND_EMAIL) {
      const { to, subject, html } = job.data;

      if (!to || !subject || !html) {
        console.warn("[notifications-worker] Missing required parameters.");
        return;
      }

      if (!resend || !RESEND_API_KEY) {
        console.log(`[notifications-worker Mock Dispatch] To: ${to} | Subject: ${subject}`);
        return;
      }

      await resend.emails.send({
        from: FROM_EMAIL,
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
  },
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
