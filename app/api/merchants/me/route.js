import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { getMerchantByAuthId } from "@/modules/merchant/merchant.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET /api/merchants/me
 * Returns the authenticated user's merchant profile.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const merchant = await getMerchantByAuthId(user.id);
  return ok(merchant);
});

/**
 * PUT /api/merchants/me
 * Updates bankDetails and merchant profile details.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const body = await request.json();

  const merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant) {
    return ok({ message: "Merchant profile not found" }, 404);
  }

  if (body.bankDetails) {
    merchant.bankDetails = {
      holderName: body.bankDetails.holderName || body.bankDetails.accountHolder || merchant.bankDetails?.holderName,
      bankName: body.bankDetails.bankName || merchant.bankDetails?.bankName,
      accountNumber: body.bankDetails.accountNumber || merchant.bankDetails?.accountNumber,
      ifsc: body.bankDetails.ifsc || body.bankDetails.ifscCode || merchant.bankDetails?.ifsc,
      accountType: body.bankDetails.accountType || merchant.bankDetails?.accountType || "current",
    };
  }

  await merchant.save();
  return ok(merchant);
});
