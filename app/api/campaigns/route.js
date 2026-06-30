import { connectDB } from "@/lib/mongodb";
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

  // Gate campaigns to Growth+ plans
  if (merchant.plan === "starter") {
    throw new ForbiddenError(
      "Campaign Manager is only available on Growth plans and above.",
    );
  }

  const body = await request.json();
  const {
    name,
    type,
    objective,
    description,
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
    type,
    objective,
    description,
    couponIds: couponIds || [],
    settings: {
      homepageSlot: !!settings?.homepageSlot,
      pushNotification: !!settings?.pushNotification,
      newsletter: !!settings?.newsletter,
    },
    status: status || "draft",
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  return created(campaign, "Campaign created successfully");
});
