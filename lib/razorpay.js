import crypto from "node:crypto";
import Razorpay from "razorpay";

export const razorpayKeyId = (
  process.env.RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  "rzp_live_TITo8u45hFpoaE"
).trim();

export const razorpayKeySecret = (
  process.env.RAZORPAY_KEY_SECRET || "gB7L9g0ORWMbFcyN5dYN2Umu"
).trim();

export const razorpayWebhookSecret = (
  process.env.RAZORPAY_WEBHOOK_SECRET || ""
).trim();

let instance = null;

export function getRazorpayInstance() {
  if (!instance) {
    instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  }
  return instance;
}

export const razorpayConfig = {
  keyId: razorpayKeyId,
  keySecret: razorpayKeySecret,
  webhookSecret: razorpayWebhookSecret,
  currency: "INR",
  timeout: 30000,
};

/**
 * Creates a Razorpay order in INR (amount in paise or INR)
 * @param {Object} params - { amount (in INR or paise if passesInPaise=true), currency, receipt, notes, passesInPaise }
 */
export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
  passesInPaise = false,
}) {
  const rzp = getRazorpayInstance();
  const amountInPaise = passesInPaise
    ? Math.round(Number(amount))
    : Math.round(Number(amount) * 100);

  const options = {
    amount: amountInPaise,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes,
  };

  const order = await rzp.orders.create(options);
  return order;
}

/**
 * Verifies Razorpay payment signature for checkout verification
 * @param {Object} params - { orderId, paymentId, signature }
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Verifies Razorpay Webhook signature
 * @param {string|Object} body - Raw string body or JSON object
 * @param {string} signature - x-razorpay-signature header
 * @param {string} [secret] - Webhook secret override
 */
export function verifyRazorpayWebhookSignature(body, signature, secret) {
  const webhookSecret = secret || razorpayWebhookSecret;
  if (!webhookSecret || !signature) {
    return false;
  }

  const payloadString = typeof body === "string" ? body : JSON.stringify(body);

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadString)
    .digest("hex");

  return expectedSignature === signature;
}
