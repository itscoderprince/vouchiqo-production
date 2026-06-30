import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * POST /api/merchants/me/upgrade
 * Simulates a Razorpay payment processing and upgrades the merchant plan/adds add-ons.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant) throw new NotFoundError("Merchant profile");

  const body = await request.json();
  const { type, plan, cycle, addOnId } = body;

  const expiryDays = cycle === "yearly" ? 365 : 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  if (type === "subscription") {
    merchant.plan = plan;
    merchant.planExpiry = expiryDate;

    // Set default revival credits if upgraded to pro
    if (plan === "pro") {
      merchant.revivalCredits = 50;
      merchant.revivalCreditsUsed = 0;
    } else if (plan === "enterprise") {
      merchant.revivalCredits = 999999; // Represents unlimited
      merchant.revivalCreditsUsed = 0;
    }

    await merchant.save();
    return ok(merchant, `Successfully upgraded to ${plan} plan!`);
  }

  if (type === "addon") {
    if (addOnId === "revival_pack") {
      merchant.revivalCredits = (merchant.revivalCredits || 0) + 25;
      await merchant.save();
      return ok(merchant, "Successfully purchased 25 revival credits!");
    }

    return ok(merchant, "Add-on purchased successfully!");
  }

  throw new Error("Invalid request type");
});
