import crypto from "node:crypto";
import Razorpay from "razorpay";

export const razorpayKeyId =
  process.env.RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  "rzp_live_TITo8u45hFpoaE";

export const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET || "gB7L9g0ORWMbFcyN5dYN2Umu";

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

/**
 * Creates a Razorpay order in INR (amount in paise)
 * @param {Object} params - { amount (in INR), currency, receipt, notes }
 */
export async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
  const rzp = getRazorpayInstance();
  const amountInPaise = Math.round(Number(amount) * 100);

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
 * Verifies Razorpay payment signature
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
