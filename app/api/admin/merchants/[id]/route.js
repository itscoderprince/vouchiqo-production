import { sendMerchantSubscriptionAdminUpdateEmail } from "@/lib/email/merchant-email";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Claim from "@/modules/claim/claim.model";
import Coupon from "@/modules/coupon/coupon.model";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import Redemption from "@/modules/redemption/redemption.model";
import UserProfile from "@/modules/user/user.model";
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

  const existingMerchant = await Merchant.findById(id).lean();
  if (!existingMerchant) {
    throw new NotFoundError("Merchant");
  }

  let actionTitle = "";
  let statusBadgeText = "";
  let detailMessage = "";

  if (body.customExpiryDate) {
    const customDateObj = new Date(body.customExpiryDate);
    if (!isNaN(customDateObj.getTime())) {
      body.planExpiry = customDateObj;
      body.paymentStatus = "completed";
      body.subscriptionStatus = "active";
      actionTitle = "Subscription Expiry Date Updated";
      statusBadgeText = "⏳ Expiry Date Set";
      detailMessage = `Your subscription validity has been updated by Vouchiqo Admin.`;
    }
    delete body.customExpiryDate;
    delete body.action;
  } else if (body.action === "pause") {
    body.subscriptionStatus = "paused";
    body.paymentStatus = "pending";
    actionTitle = "Subscription Plan Paused";
    statusBadgeText = "⏸️ Plan Paused";
    detailMessage = `Your subscription plan has been temporarily paused by Vouchiqo Admin.`;
    delete body.action;
  } else if (body.action === "stop" || body.action === "cancel") {
    body.subscriptionStatus = "cancelled";
    body.paymentStatus = "pending";
    actionTitle = "Subscription Plan Cancelled";
    statusBadgeText = "🛑 Plan Stopped";
    detailMessage = `Your subscription plan has been stopped/cancelled by Vouchiqo Admin.`;
    delete body.action;
  } else if (body.action === "resume") {
    body.subscriptionStatus = "active";
    body.paymentStatus = "completed";
    actionTitle = "Subscription Plan Reactivated";
    statusBadgeText = "▶️ Plan Reactivated";
    detailMessage = `Your subscription plan has been reactivated and is now fully active.`;
    delete body.action;
  }

  if (typeof body.extendDays === "number") {
    const baseDate =
      existingMerchant.planExpiry && new Date(existingMerchant.planExpiry) > new Date()
        ? new Date(existingMerchant.planExpiry)
        : new Date();
    baseDate.setDate(baseDate.getDate() + body.extendDays);
    body.planExpiry = baseDate;
    body.paymentStatus = "completed";
    body.subscriptionStatus = "active";
    actionTitle = `Subscription Extended by +${body.extendDays} Days`;
    statusBadgeText = `➕ Extended ${body.extendDays} Days`;
    detailMessage = `Vouchiqo Admin granted an extension of +${body.extendDays} days to your subscription.`;
    delete body.extendDays;
    delete body.action;
  }

  if (body.plan && body.plan !== existingMerchant.plan) {
    if (!actionTitle) {
      actionTitle = `Subscription Tier Changed to ${body.plan.toUpperCase()}`;
      statusBadgeText = `🚀 Tier Upgraded`;
      detailMessage = `Your subscription tier has been updated from ${existingMerchant.plan?.toUpperCase() || "STARTER"} to ${body.plan.toUpperCase()}.`;
    }
  }

  const merchant = await Merchant.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true },
  ).lean();

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  // Dispatch Email Notification to Merchant if subscription control action was performed
  const targetEmail = merchant.contactEmail || merchant.email;
  if (targetEmail && (actionTitle || body.plan)) {
    sendMerchantSubscriptionAdminUpdateEmail({
      to: targetEmail,
      businessName: merchant.businessName,
      actionTitle: actionTitle || `Subscription Update for ${merchant.businessName}`,
      statusBadgeText: statusBadgeText || "⚡ Subscription Update",
      planName: merchant.plan,
      planExpiry: merchant.planExpiry,
      detailMessage,
    }).catch((err) => console.error("[Admin Subscription Email Error]:", err));
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

/**
 * DELETE /api/admin/merchants/[id]
 * Delete single merchant and all associated DB records (coupons, claims, redemptions, campaigns, user profile). Admin only.
 */
export const DELETE = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;
  const merchant = await Merchant.findById(id).lean();

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  // 1. Find all coupons owned by this merchant
  const coupons = await Coupon.find({ merchantId: id }).select("_id").lean();
  const couponIds = coupons.map((c) => c._id);

  // 2. Delete all redemptions for this merchant / coupons
  await Redemption.deleteMany({
    $or: [{ merchantId: id }, { couponId: { $in: couponIds } }],
  });

  // 3. Delete all claims for this merchant / coupons
  await Claim.deleteMany({
    $or: [{ merchantId: id }, { couponId: { $in: couponIds } }],
  });

  // 4. Delete all campaigns for this merchant
  await Campaign.deleteMany({ merchantId: id });

  // 5. Delete all coupons for this merchant
  await Coupon.deleteMany({ merchantId: id });

  // 6. Delete merchant document
  await Merchant.findByIdAndDelete(id);

  // 7. Delete associated user account profile (by authId or userId)
  if (merchant.authId || merchant.userId) {
    await UserProfile.deleteMany({
      $or: [
        ...(merchant.authId ? [{ authId: merchant.authId }] : []),
        ...(merchant.userId ? [{ _id: merchant.userId }] : []),
      ],
    });
  }

  // Dispatch realtime event
  try {
    const { dispatchEvent } = await import("@/lib/socket/dispatcher");
    const { SOCKET_EVENTS } = await import("@/lib/socket/events");
    await dispatchEvent({
      target: "admins",
      event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
      payload: { merchantId: id, deleted: true },
    });
  } catch (err) {
    console.error("[DELETE /api/admin/merchants/[id]] Socket error:", err);
  }

  return ok({ id }, "Merchant and all associated data deleted permanently");
});
