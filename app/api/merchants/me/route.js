import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import {
  checkMerchantDuplicates,
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

  // Auto-clean legacy unmeaningful random suffixes (e.g. -g7y6) if present
  if (merchant && merchant.slug && /-[a-z0-9]{4,6}$/i.test(merchant.slug)) {
    const city = merchant.location?.city || merchant.city || "";
    const state = merchant.location?.state || merchant.state || "";
    const category = merchant.category || "";
    const cleanBase = merchant.businessName || merchant.slug.replace(/-[a-z0-9]{4,6}$/i, "");
    const newSlug = await generateUniqueSlug(cleanBase, city, state, category, merchant._id);
    if (newSlug !== merchant.slug) {
      merchant.slug = newSlug;
      await merchant.save();
    }
  }

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

  const city = body.location?.city || body.city || merchant.location?.city || "";
  const state = body.location?.state || body.state || merchant.location?.state || "";
  const category = body.category || merchant.category || "";

  // Auto-clean legacy random suffixes like "-g7y6" from existing merchant slugs
  const currentSlug = merchant.slug || "";
  const hasRandomSuffix = /-[a-z0-9]{4,6}$/i.test(currentSlug);

  if (!merchant.slug || hasRandomSuffix) {
    const cleanBase = body.businessName || merchant.businessName || currentSlug.replace(/-[a-z0-9]{4,6}$/i, "");
    merchant.slug = await generateUniqueSlug(cleanBase, city, state, category, merchant._id);
  } else if (body.slug && body.slug !== merchant.slug && user.role === "admin") {
    merchant.slug = await generateUniqueSlug(body.slug, city, state, category, merchant._id);
  }

  // Normalize document & image aliases from wizard / onboarding forms
  const docImg = body.docImage || body.docFileUrl || body.docUrl || body.identityDocumentUrl;
  if (docImg !== undefined) merchant.docImage = docImg;

  const shopImg = body.shopImage || body.shopPhotoUrl || body.shopFrontUrl || body.storePhotoUrl;
  if (shopImg !== undefined) merchant.shopImage = shopImg;

  const logoImg = body.logo || body.logoUrl || body.shopLogo;
  if (logoImg !== undefined) merchant.logo = logoImg;

  const bannerImg = body.banner || body.bannerUrl || body.shopBanner;
  if (bannerImg !== undefined) merchant.banner = bannerImg;

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

  await checkMerchantDuplicates(body, merchant._id);

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      merchant[field] = body[field];
    }
  });

  if (body.gstin !== undefined) {
    const cleanGstin = String(body.gstin || "").trim().toUpperCase();
    if (!cleanGstin) {
      merchant.gstin = undefined;
    } else {
      merchant.gstin = cleanGstin;
    }
  }

  if (body.location) {
    merchant.location = {
      ...merchant.location,
      ...body.location,
    };
  }

  if (body.operatingHours) {
    merchant.markModified("operatingHours");
  }

  await merchant.save();
  return ok(merchant);
});
