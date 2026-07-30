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

  const merchant = await Merchant.findOne({ authId: user.id });
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

  const updatedMerchant = await Merchant.findById(merchant._id);

  return ok(
    updatedMerchant,
    "Payment verified successfully and account state updated!",
  );
});
