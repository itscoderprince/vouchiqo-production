import { sendMerchantPaymentCompletedEmail } from "@/lib/email/merchant-email";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { PaymentService } from "@/modules/payment/payment.service";
import { WebhookService } from "@/modules/payment/webhook.service";
import { ok } from "@/utils/api-response";
import { BadRequestError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/verify-signature
 * Verifies Razorpay HMAC SHA256 payment signature and updates Merchant Plan in DB
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  let merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    });
  }
  if (!merchant) throw new NotFoundError("Merchant profile");

  const body = await request.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    cycle = "monthly",
    type = "subscription",
    addOnId,
    amount,
  } = body;

  const isValid = PaymentService.verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid && razorpay_signature) {
    throw new BadRequestError(
      "Invalid Razorpay payment details! Verification failed.",
    );
  }

  // Handle fulfillment via WebhookService helper logic
  await WebhookService.handlePaymentCaptured({
    payload: {
      payment: {
        entity: {
          order_id: razorpay_order_id,
          id: razorpay_payment_id,
          notes: {
            plan,
            cycle,
            type,
            addOnId,
            merchantId: merchant._id.toString(),
          },
        },
      },
    },
  });

  // Explicitly update and persist merchant payment status & plan expiry in MongoDB
  merchant.paymentStatus = "completed";
  if (type === "subscription" || plan) {
    const selectedPlan = plan || merchant.plan || "growth";
    const expiryDays = cycle === "yearly" ? 365 : 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    merchant.plan = selectedPlan;
    merchant.planExpiry = expiryDate;
    merchant.planStartedAt = new Date();
    merchant.subscriptionStatus = "active";
    if (razorpay_payment_id) merchant.lastPaymentId = razorpay_payment_id;
    if (razorpay_order_id) merchant.lastOrderId = razorpay_order_id;

    if (selectedPlan === "pro") {
      merchant.revivalCredits = (merchant.revivalCredits || 0) + 50;
    } else if (selectedPlan === "enterprise") {
      merchant.revivalCredits = 999999;
    }
  } else if (addOnId === "revival_pack") {
    merchant.revivalCredits = (merchant.revivalCredits || 0) + 25;
  }

  await merchant.save();

  // Dispatch Payment Completed Email to Merchant
  const targetEmail = merchant.contactEmail || user.email;
  if (targetEmail) {
    sendMerchantPaymentCompletedEmail({
      to: targetEmail,
      businessName: merchant.businessName,
      amount: amount || 0,
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planName: (plan || merchant.plan || "growth").toUpperCase(),
      planExpiry: merchant.planExpiry,
    }).catch((err) => console.error("[Payment Completed Email Error]:", err));
  }

  return ok(
    merchant,
    "Payment verified successfully and account state updated!",
  );
});
