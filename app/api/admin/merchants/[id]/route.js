import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/merchants/[id]
 * Fetch single merchant profile with coupons, stats, and admin details.
 */
export const GET = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;
  const merchant = await Merchant.findById(id).lean();

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  // Fetch all coupons for this merchant
  const coupons = await Coupon.find({ merchantId: id })
    .sort({ createdAt: -1 })
    .lean();

  return ok({
    merchant,
    coupons,
  });
});

/**
 * PUT /api/admin/merchants/[id]
 * Update single merchant (plan override, credits, status).
 */
export const PUT = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;
  const body = await request.json();

  if (typeof body.extendDays === "number") {
    const existing = await Merchant.findById(id);
    if (existing) {
      const baseDate =
        existing.planExpiry && new Date(existing.planExpiry) > new Date()
          ? new Date(existing.planExpiry)
          : new Date();
      baseDate.setDate(baseDate.getDate() + body.extendDays);
      body.planExpiry = baseDate;
      body.paymentStatus = "completed";
      body.subscriptionStatus = "active";
    }
    delete body.extendDays;
  }

  const merchant = await Merchant.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true },
  ).lean();

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  try {
    const { dispatchEvent } = await import("@/lib/socket/dispatcher");
    const { SOCKET_EVENTS } = await import("@/lib/socket/events");
    const payload = {
      merchantId: merchant._id || merchant.id,
      status: merchant.status,
      businessName: merchant.businessName,
    };
    await dispatchEvent({
      target: "admins",
      event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
      payload,
    });
    if (merchant.authId) {
      await dispatchEvent({
        target: "user",
        userId: String(merchant.authId),
        event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
        payload,
      });
    }
  } catch (err) {
    console.error("[PUT /api/admin/merchants/[id]] Socket emit error:", err);
  }

  return ok({ merchant }, "Merchant updated successfully");
});
