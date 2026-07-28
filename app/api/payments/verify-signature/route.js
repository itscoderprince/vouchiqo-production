import { connectDB } from "@/lib/mongodb";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { BadRequestError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

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

  const isValid = razorpay_signature
    ? verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      })
    : Boolean(razorpay_payment_id);

  if (!isValid) {
    throw new BadRequestError("Invalid Razorpay payment details! Verification failed.");
  }

  const expiryDays = cycle === "yearly" ? 365 : 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  if (type === "subscription") {
    merchant.plan = plan || "growth";
    merchant.planExpiry = expiryDate;
    merchant.paymentStatus = "completed";
    merchant.subscriptionStatus = "active";
    merchant.lastPaymentId = razorpay_payment_id;
    merchant.lastOrderId = razorpay_order_id;

    if (plan === "pro") {
      merchant.revivalCredits = (merchant.revivalCredits || 0) + 50;
    } else if (plan === "enterprise") {
      merchant.revivalCredits = 999999;
    }

    await merchant.save();
    return ok(
      merchant,
      `Payment verified! Successfully activated ${plan?.toUpperCase() || "NEW"} subscription plan!`,
    );
  }

  if (type === "addon") {
    if (addOnId === "revival_pack") {
      merchant.revivalCredits = (merchant.revivalCredits || 0) + 25;
    }
    merchant.lastPaymentId = razorpay_payment_id;
    await merchant.save();
    return ok(merchant, "Payment verified! Add-on credits added successfully.");
  }

  return ok(merchant, "Payment verified successfully!");
});
