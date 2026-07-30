import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { enforcePaymentRateLimit } from "@/modules/payment/payment-auth.middleware";
import Payment from "@/modules/payment/payment.model";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { BadRequestError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/verify
 * Standard payment verification endpoint
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/verify");

  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  const merchant = await Merchant.findOne({ authId: user.id });
  const merchantId = merchant?._id;

  const body = await request.json();
  const { orderId, paymentId, signature } = body;

  const isValid = PaymentService.verifySignature({
    orderId,
    paymentId,
    signature,
  });

  if (!isValid) {
    throw new BadRequestError("Invalid signature verification failed");
  }

  const payment = await Payment.findOne({ gatewayOrderId: orderId });
  if (!payment) {
    throw new NotFoundError("Payment transaction");
  }

  if (payment.type !== "SUBSCRIPTION") {
    await PaymentService.capturePayment(orderId, paymentId, payment.amount);
  }

  const updatedPayment = await PaymentService.getPayment(
    payment._id,
    merchantId,
  );

  return ok(
    updatedPayment,
    "Payment signature verified and captured successfully",
  );
});
