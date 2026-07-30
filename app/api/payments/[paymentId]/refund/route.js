import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { enforcePaymentRateLimit } from "@/modules/payment/payment-auth.middleware";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/:paymentId/refund
 * Request partial or full refund
 */
export const POST = asyncHandler(async (request, { params }) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/refund");

  const { paymentId } = await params;
  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  let merchantId = null;
  if (user.role === ROLES.MERCHANT) {
    const merchant = await Merchant.findOne({ authId: user.id });
    merchantId = merchant?._id;
  }

  const body = await request.json().catch(() => ({}));
  const { amount, reason } = body;

  const result = await PaymentService.refundPayment(
    paymentId,
    merchantId,
    amount,
    reason,
  );

  return ok(result, "Refund processed successfully");
});
