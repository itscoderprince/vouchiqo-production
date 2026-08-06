import { sendMerchantPlanSelectedEmail } from "@/lib/email/merchant-email";
import { connectDB } from "@/lib/mongodb";
import { razorpayKeyId } from "@/lib/razorpay";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { handleIdempotency } from "@/modules/payment/idempotency.middleware";
import { enforcePaymentRateLimit } from "@/modules/payment/payment-auth.middleware";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";
import { toPaise } from "@/utils/payment-utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/create-order
 * Headers: Idempotency-Key: <key>
 * Creates an official Razorpay Order & Payment record with idempotency
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/create-order");

  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  const merchant = await Merchant.findOne({ authId: user.id });
  const merchantId = merchant?._id || user.id;

  const { idempotencyKey, existingResult } = await handleIdempotency(request, {
    ...user,
    merchantId,
  });

  if (existingResult) {
    return ok(
      existingResult.data,
      "Idempotent response: payment previously initiated",
    );
  }

  const body = await request.json();
  const {
    amount,
    plan,
    cycle = "monthly",
    type = "ADDON",
    addOnId,
    description,
    gstin,
  } = body;

  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid payment amount specified");
  }

  // Amount sent from client is in Rupees (e.g. 1499, 3999, 9999, 11799)
  // Always convert Rupees to Paise for Razorpay SDK (₹1 = 100 Paise)
  const amountInPaise = toPaise(amount);

  const cleanGstin = gstin?.trim()?.toUpperCase() || merchant?.gstin || "";

  if (cleanGstin && merchant && merchant.gstin !== cleanGstin) {
    merchant.gstin = cleanGstin;
    await merchant.save();
  }

  const result = await PaymentService.createOrder({
    merchantId,
    amount: amountInPaise,
    currency: "INR",
    type: type.toUpperCase(),
    description: description || `Payment for ${plan || type}`,
    metadata: {
      userEmail: user.email,
      plan: plan || "growth",
      cycle,
      type,
      addOnId: addOnId || "",
      gstin: cleanGstin,
    },
    idempotencyKey,
  });

  // Dispatch Email to Merchant about the chosen subscription plan
  const recipientEmail = merchant?.contactEmail || user?.email;
  if (recipientEmail && plan) {
    sendMerchantPlanSelectedEmail({
      to: recipientEmail,
      businessName: merchant?.businessName || "Merchant Partner",
      planName: String(plan).toUpperCase(),
      planPrice: amount,
      billingCycle: cycle,
    }).catch((err) => console.error("[Plan Selected Email Error]:", err));
  }

  return ok(
    {
      orderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      keyId: razorpayKeyId,
      paymentId: result.payment.paymentId,
      idempotencyKey,
      isDuplicate: result.isDuplicate,
    },
    "Razorpay order created successfully",
  );
});
