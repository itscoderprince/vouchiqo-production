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
    await PaymentService.capturePayment(orderId, paymentId, payment.amount).catch(() => {});
  }

  payment.status = "CAPTURED";
  payment.gatewayPaymentId = paymentId;
  payment.paidAt = new Date();
  await payment.save();

  const merchantRecord = merchant || (await Merchant.findById(payment.merchantId));
  if (merchantRecord) {
    merchantRecord.paymentStatus = "completed";
    if (
      payment.type === "SUBSCRIPTION" ||
      payment.metadata?.type === "subscription"
    ) {
      const plan = payment.metadata?.plan || "growth";
      const cycle = payment.metadata?.cycle || "monthly";
      const expiryDays = cycle === "yearly" ? 365 : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      merchantRecord.plan = plan;
      merchantRecord.planExpiry = expiryDate;
      merchantRecord.subscriptionStatus = "active";
      merchantRecord.lastPaymentId = paymentId;
      merchantRecord.lastOrderId = orderId;

      if (plan === "pro") {
        merchantRecord.revivalCredits = (merchantRecord.revivalCredits || 0) + 50;
      } else if (plan === "enterprise") {
        merchantRecord.revivalCredits = 999999;
      }
    } else if (payment.metadata?.addOnId === "revival_pack") {
      merchantRecord.revivalCredits = (merchantRecord.revivalCredits || 0) + 25;
    }
    await merchantRecord.save();
  }

  const updatedPayment = await PaymentService.getPayment(
    payment._id,
    merchantId,
  );

  return ok(
    updatedPayment,
    "Payment signature verified and plan activated successfully",
  );
});
