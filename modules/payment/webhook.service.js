import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import Merchant from "@/modules/merchant/merchant.model";
import { IdempotencyService } from "./idempotency.service";
import { PaymentStateService } from "./payment-state.service";
import Payment from "./payment.model";
import WebhookLog from "./webhook-log.model";

export class WebhookService {
  /**
   * Verify webhook signature helper
   */
  static verifySignature(payload, signature, secret) {
    return verifyRazorpayWebhookSignature(payload, signature, secret);
  }

  /**
   * Process webhook event with log deduplication & Redis state tracking
   */
  static async processWebhook(eventId, eventType, payload, signature, rawBody) {
    const existing = await WebhookLog.findOne({ eventId });
    if (existing) {
      return { processed: true, skipped: true, logId: existing._id };
    }

    const isVerified = this.verifySignature(rawBody || payload, signature);

    const log = new WebhookLog({
      eventId,
      eventType,
      payload,
      signature,
      verified: isVerified,
    });

    await log.save();

    if (!isVerified) {
      log.processed = true;
      log.error = "Invalid webhook signature";
      await log.save();
      throw new Error("Invalid webhook signature");
    }

    let result;
    try {
      switch (eventType) {
        case "payment.captured":
          result = await this.handlePaymentCaptured(payload);
          break;
        case "payment.failed":
          result = await this.handlePaymentFailed(payload);
          break;
        case "refund.created":
          result = await this.handleRefundCreated(payload);
          break;
        case "subscription.charged":
          result = await this.handleSubscriptionCharged(payload);
          break;
        case "subscription.activated":
          result = await this.handleSubscriptionActivated(payload);
          break;
        case "subscription.cancelled":
          result = await this.handleSubscriptionCancelled(payload);
          break;
        default:
          result = { message: `Event ${eventType} received and logged` };
      }

      log.processed = true;
      log.processedAt = new Date();
      await log.save();
      return result;
    } catch (err) {
      log.error = err.message || String(err);
      log.attempts = (log.attempts || 0) + 1;
      log.lastAttemptAt = new Date();
      await log.save();
      throw err;
    }
  }

  /**
   * Handle payment.captured event with Redis distributed state updates
   */
  static async handlePaymentCaptured(payload) {
    const paymentData =
      payload.payload?.payment?.entity || payload.payment || {};
    const { order_id, id: payment_id, notes } = paymentData;

    if (order_id) {
      await PaymentStateService.acquireLock(order_id);
    }

    try {
      const payment = await Payment.findOne({
        $or: [{ gatewayOrderId: order_id }, { gatewayPaymentId: payment_id }],
      });

      if (!payment) {
        return {
          warning: "No matching payment record found for order",
          order_id,
        };
      }

      payment.status = "CAPTURED";
      payment.gatewayPaymentId = payment_id;
      payment.paidAt = new Date();
      await payment.save();

      if (payment.idempotencyKey) {
        await IdempotencyService.completeIntent(
          payment.idempotencyKey,
          payment._id,
        );
      }

      // Update Redis payment state
      if (order_id) {
        await PaymentStateService.setState(order_id, {
          status: "CAPTURED",
          gatewayPaymentId: payment_id,
          paidAt: payment.paidAt,
        });
      }

      // Update merchant profile
      if (payment.merchantId) {
        const merchant = await Merchant.findById(payment.merchantId);
        if (merchant) {
          merchant.paymentStatus = "completed";

          if (
            payment.type === "SUBSCRIPTION" ||
            notes?.type === "subscription"
          ) {
            const plan = notes?.plan || "growth";
            const cycle = notes?.cycle || "monthly";
            const expiryDays = cycle === "yearly" ? 365 : 30;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + expiryDays);

            merchant.plan = plan;
            merchant.planExpiry = expiryDate;
            merchant.subscriptionStatus = "active";
            merchant.lastPaymentId = payment_id;
            merchant.lastOrderId = order_id;

            if (plan === "pro") {
              merchant.revivalCredits = (merchant.revivalCredits || 0) + 50;
            } else if (plan === "enterprise") {
              merchant.revivalCredits = 999999;
            }
            await merchant.save();
          } else if (payment.type === "ADDON" || notes?.type === "addon") {
            if (notes?.addOnId === "revival_pack") {
              merchant.revivalCredits = (merchant.revivalCredits || 0) + 25;
            }
            merchant.lastPaymentId = payment_id;
            await merchant.save();
          }
        }
      }

      return { success: true, paymentId: payment._id };
    } finally {
      if (order_id) {
        await PaymentStateService.releaseLock(order_id);
      }
    }
  }

  /**
   * Handle payment.failed event
   */
  static async handlePaymentFailed(payload) {
    const paymentData =
      payload.payload?.payment?.entity || payload.payment || {};
    const { order_id, error_description } = paymentData;

    const payment = await Payment.findOne({ gatewayOrderId: order_id });
    if (payment) {
      payment.status = "FAILED";
      payment.failedAt = new Date();
      payment.metadata = { ...payment.metadata, error: error_description };
      await payment.save();

      if (payment.idempotencyKey) {
        await IdempotencyService.failIntent(
          payment.idempotencyKey,
          error_description,
        );
      }

      if (order_id) {
        await PaymentStateService.setState(order_id, {
          status: "FAILED",
          error: error_description,
        });
      }
    }

    return { success: true, order_id };
  }

  /**
   * Handle refund.created event
   */
  static async handleRefundCreated(payload) {
    const refundData = payload.payload?.refund?.entity || payload.refund || {};
    const { payment_id, amount } = refundData;

    const payment = await Payment.findOne({ gatewayPaymentId: payment_id });
    if (payment) {
      const refundAmountPaise = Number(amount);
      const newStatus =
        refundAmountPaise >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

      payment.status = newStatus;
      payment.refundedAt = new Date();
      await payment.save();

      if (payment.gatewayOrderId) {
        await PaymentStateService.setState(payment.gatewayOrderId, {
          status: newStatus,
          refundedAt: payment.refundedAt,
        });
      }
    }

    return { success: true, payment_id };
  }

  /**
   * Handle subscription.charged event
   */
  static async handleSubscriptionCharged(payload) {
    const subData = payload.payload?.subscription?.entity || payload || {};
    const { id: subscription_id, payment_id, notes } = subData;

    if (notes?.merchantId) {
      const merchant = await Merchant.findById(notes.merchantId);
      if (merchant) {
        merchant.subscriptionStatus = "active";
        merchant.lastPaymentId = payment_id;
        await merchant.save();
      }
    }

    return { success: true, subscription_id };
  }

  /**
   * Handle subscription.activated event
   */
  static async handleSubscriptionActivated(payload) {
    const subData = payload.payload?.subscription?.entity || payload || {};
    const { id: subscription_id, notes } = subData;

    if (notes?.merchantId) {
      await Merchant.findByIdAndUpdate(notes.merchantId, {
        subscriptionStatus: "active",
      });
    }

    return { success: true, subscription_id };
  }

  /**
   * Handle subscription.cancelled event
   */
  static async handleSubscriptionCancelled(payload) {
    const subData = payload.payload?.subscription?.entity || payload || {};
    const { id: subscription_id, notes } = subData;

    if (notes?.merchantId) {
      await Merchant.findByIdAndUpdate(notes.merchantId, {
        subscriptionStatus: "cancelled",
      });
    }

    return { success: true, subscription_id };
  }
}

export default WebhookService;
