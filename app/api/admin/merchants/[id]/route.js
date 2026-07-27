import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

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

  const merchant = await Merchant.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true },
  ).lean();

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  try {
    const { emitToAdmins } = await import("@/lib/socket/server");
    const { SOCKET_EVENTS } = await import("@/lib/socket/events");
    emitToAdmins(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, {
      merchantId: merchant._id || merchant.id,
      status: merchant.status,
      businessName: merchant.businessName,
    });
    emitToAdmins(SOCKET_EVENTS.APPLICATION_NEW, {
      merchantId: merchant._id || merchant.id,
      status: merchant.status,
    });
  } catch (err) {
    console.error("[PUT /api/admin/merchants/[id]] Socket emit error:", err);
  }

  return ok({ merchant }, "Merchant updated successfully");
});
