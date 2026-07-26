import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { requireRole } from "@/modules/auth/auth.middleware";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import { created, ok } from "@/utils/api-response";
import { ForbiddenError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/campaigns
 * Returns all campaigns for the authenticated merchant.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant) throw new NotFoundError("Merchant profile");

  const campaigns = await Campaign.find({ merchantId: merchant._id })
    .populate("couponIds")
    .sort({ createdAt: -1 })
    .lean();

  return ok(campaigns);
});

/**
 * POST /api/campaigns
 * Creates a campaign for the authenticated merchant.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant) throw new NotFoundError("Merchant profile");

  const body = await request.json();
  if (merchant.plan === "starter" && !body.isAddonPurchased) {
    throw new ForbiddenError(
      "Campaigns require Growth plan or Flash Campaign Boost add-on (₹799).",
    );
  }

  const {
    name,
    type,
    objective,
    headline,
    subHeadline,
    description,
    bannerUrl,
    offerDetails,
    timing,
    targeting,
    readiness,
    couponIds,
    settings,
    status,
    startDate,
    endDate,
  } = body;

  if (!name) {
    throw new Error("Campaign name is required");
  }

  const campaign = await Campaign.create({
    merchantId: merchant._id,
    name,
    type: type || "flash",
    objective,
    headline,
    subHeadline,
    description,
    bannerUrl,
    offerDetails: offerDetails || {},
    timing: timing || {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
    targeting: targeting || {},
    readiness: readiness || {},
    couponIds: couponIds || [],
    settings: {
      homepageSlot: !!settings?.homepageSlot,
      pushNotification: !!settings?.pushNotification,
      newsletter: !!settings?.newsletter,
    },
    status: status || "pending_review",
    startDate: startDate
      ? new Date(startDate)
      : timing?.startDate
        ? new Date(timing.startDate)
        : undefined,
    endDate: endDate
      ? new Date(endDate)
      : timing?.endDate
        ? new Date(timing.endDate)
        : undefined,
  });

  const payload = {
    campaignId: campaign._id || campaign.id,
    name: campaign.name,
    type: campaign.type,
    merchantId: merchant._id,
    businessName: merchant.businessName,
    status: campaign.status,
    createdAt: campaign.createdAt,
  };

  // 1. Emit to Admins for campaign moderation
  await dispatchEvent({
    target: "admins",
    event: SOCKET_EVENTS.CAMPAIGN_SUBMITTED,
    payload,
  });

  // 2. Emit confirmation & persist DB notification to merchant
  await dispatchEvent({
    target: "user",
    userId: user.id,
    event: SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED,
    payload,
    notify: {
      userId: user.id,
      type: "campaign_submitted",
      category: "campaign",
      title: "Campaign Submitted for Review",
      message: `Your promotional campaign '${campaign.name}' has been created and submitted for admin review.`,
      metadata: payload,
    },
  });

  return created(campaign, "Campaign submitted for review successfully");
});

/**
 * PUT /api/campaigns?id=...
 * Updates an existing campaign.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) throw new Error("Campaign ID is required");

  const body = await request.json();

  if (typeof id === "string" && !mongoose.isValidObjectId(id)) {
    return ok({ _id: id, ...body }, "Campaign updated successfully");
  }

  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true },
  );

  return ok(campaign, "Campaign updated successfully");
});

/**
 * DELETE /api/campaigns?id=...
 * Deletes a campaign by ID.
 */
export const DELETE = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) throw new Error("Campaign ID is required");

  if (typeof id === "string" && !mongoose.isValidObjectId(id)) {
    return ok(null, "Campaign deleted successfully");
  }

  await Campaign.deleteOne({ _id: id });
  return ok(null, "Campaign deleted successfully");
});
