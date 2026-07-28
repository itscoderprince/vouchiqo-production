import { createRazorpayOrder, razorpayKeyId } from "@/lib/razorpay";
import { requireRole } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * POST /api/payments/create-order
 * Creates an official Razorpay Order for live checkout
 */
export const POST = asyncHandler(async (request) => {
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const body = await request.json();
  const { amount, plan, cycle = "monthly", type = "subscription", addOnId } = body;

  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid payment amount");
  }

  const receipt = `rcpt_${user.id.slice(-6)}_${Date.now()}`;
  const notes = {
    userId: user.id,
    userEmail: user.email,
    plan: plan || "custom",
    cycle,
    type,
    addOnId: addOnId || "",
  };

  const order = await createRazorpayOrder({
    amount: Number(amount),
    currency: "INR",
    receipt,
    notes,
  });

  return ok(
    {
      orderId: order.id,
      amount: order.amount, // in paise
      currency: order.currency,
      keyId: razorpayKeyId,
      receipt: order.receipt,
    },
    "Razorpay order created successfully",
  );
});
