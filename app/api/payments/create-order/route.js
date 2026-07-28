import { auth } from "@/lib/auth";
import { createRazorpayOrder, razorpayKeyId } from "@/lib/razorpay";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/create-order
 * Creates an official Razorpay Order for live checkout
 */
export const POST = asyncHandler(async (request) => {
  let user = null;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    user = session?.user || null;
  } catch (err) {
    console.warn("Auth check in create-order:", err);
  }

  const body = await request.json();
  const { amount, plan, cycle = "monthly", type = "subscription", addOnId } = body;

  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid payment amount specified");
  }

  const userId = user?.id || `merchant_${Date.now()}`;
  const userEmail = user?.email || "merchant@vouchiqo.com";
  const receipt = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`.slice(0, 40);

  const notes = {
    userId: userId.toString(),
    userEmail,
    plan: plan || "growth",
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
