import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import {
  generateUniqueSlug,
  getMerchantByAuthId,
} from "@/modules/merchant/merchant.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/merchants/me
 * Returns the authenticated user's merchant profile.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const merchant = await getMerchantByAuthId(user.id, user.email);
  return ok(merchant);
});

/**
 * PUT /api/merchants/me
 * Updates merchant profile details.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const body = await request.json();

  const merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant) {
    return ok({ message: "Merchant profile not found" }, 404);
  }

  // Slug immutability & uniqueness: regular merchants cannot change existing slug. Only Super Admin can change it.
  if (merchant.slug && user.role !== "admin") {
    delete body.slug;
  } else if (body.slug && body.slug !== merchant.slug) {
    const city = body.location?.city || body.city || merchant.location?.city || "";
    const state = body.location?.state || body.state || merchant.location?.state || "";
    merchant.slug = await generateUniqueSlug(body.slug, city, state, merchant._id);
  } else if (!merchant.slug) {
    const city = body.location?.city || body.city || merchant.location?.city || "";
    const state = body.location?.state || body.state || merchant.location?.state || "";
    merchant.slug = await generateUniqueSlug(body.businessName || "merchant", city, state, merchant._id);
  }

  // Update profile fields
  const allowedFields = [
    "businessName",
    "slug",
    "category",
    "customCategoryNotes",
    "description",
    "contactEmail",
    "contactPhone",
    "whatsappNumber",
    "website",
    "constitution",
    "liaisonName",
    "liaisonDesignation",
    "liaisonPhone",
    "gmapsLink",
    "docType",
    "docImage",
    "gstin",
    "isGstExempt",
    "shopImage",
    "logo",
    "banner",
    "operatingHours",
  ];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      merchant[field] = body[field];
    }
  });

  if (body.location) {
    merchant.location = {
      ...merchant.location,
      ...body.location,
    };
  }

  await merchant.save();
  return ok(merchant);
});
