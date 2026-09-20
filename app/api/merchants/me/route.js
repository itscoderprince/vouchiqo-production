import { connectDB } from "@/lib/mongodb";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import { invalidateMerchantCache, requireAuth } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import {
  checkMerchantDuplicates,
  generateUniqueSlug,
} from "@/modules/merchant/merchant.service";
import { error, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { redis } from "@/lib/redis";
import { REDIS_KEYS, REDIS_TTL, normalizeCategory } from "@/utils/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/merchants/me
 * Returns the authenticated user's merchant profile.
 */
export const GET = asyncHandler(async (request) => {
  const { user } = await requireAuth(request);
  const authIdStr = user.id ? String(user.id) : null;

  // Fast path: Redis cache check (< 1ms)
  if (authIdStr) {
    try {
      const cacheKey = REDIS_KEYS.merchantProfile(authIdStr);
      const cached = await redis.get(cacheKey);
      if (cached) {
        if (cached === "__NOT_FOUND__") {
          return error("Merchant profile not found", 404, "NOT_FOUND");
        }
        return ok(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("[Merchant Cache] Lookup failed:", cacheErr?.message);
    }
  }

  await connectDB();

  let merchant = null;
  if (authIdStr) {
    merchant = await Merchant.findOne({ authId: authIdStr }).lean();
  }
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    }).lean();
  }

  if (!merchant) {
    if (authIdStr) {
      try {
        await redis.set(REDIS_KEYS.merchantProfile(authIdStr), "__NOT_FOUND__", "EX", 60);
      } catch {}
    }
    return error("Merchant profile not found", 404, "NOT_FOUND");
  }

  // Auto-clean legacy unmeaningful random suffixes (e.g. -g7y6) if present
  if (merchant && merchant.slug && /-[a-z0-9]{4,6}$/i.test(merchant.slug)) {
    try {
      const city = merchant.location?.city || merchant.city || "";
      const state = merchant.location?.state || merchant.state || "";
      const category = merchant.category || "";
      const cleanBase =
        merchant.businessName || merchant.slug.replace(/-[a-z0-9]{4,6}$/i, "");
      const newSlug = await generateUniqueSlug(
        cleanBase,
        city,
        state,
        category,
        merchant._id,
      );
      if (newSlug && newSlug !== merchant.slug) {
        await Merchant.updateOne(
          { _id: merchant._id },
          { $set: { slug: newSlug } },
        );
        merchant.slug = newSlug;
      }
    } catch (err) {
      console.error("[Slug Auto-Clean Error]:", err);
    }
  }

  // Cache resolved merchant profile in Redis (5 min TTL)
  if (authIdStr) {
    try {
      await redis.set(
        REDIS_KEYS.merchantProfile(authIdStr),
        JSON.stringify(merchant),
        "EX",
        REDIS_TTL.MERCHANT_PROFILE,
      );
    } catch (cacheErr) {
      console.warn("[Merchant Cache] Save failed:", cacheErr?.message);
    }
  }

  return ok(merchant);
});

/**
 * PUT /api/merchants/me
 * Updates merchant profile details with category propagation to all coupons & affiliate products.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const body = await request.json();

  const authIdStr = user.id ? String(user.id) : null;
  let merchant = null;
  if (authIdStr) {
    merchant = await Merchant.findOne({ authId: authIdStr });
  }
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    });
  }

  if (!merchant) {
    return error("Merchant profile not found", 404, "NOT_FOUND");
  }

  // Auto-link authId if it was missing or different
  if (authIdStr && (!merchant.authId || merchant.authId !== authIdStr)) {
    merchant.authId = authIdStr;
  }

  const oldCategory = merchant.category;
  let newCategory = null;
  if (
    body.category !== undefined &&
    body.category !== null &&
    String(body.category).trim() !== ""
  ) {
    newCategory = normalizeCategory(body.category);
  }

  const city =
    body.location?.city || body.city || merchant.location?.city || "";
  const state =
    body.location?.state || body.state || merchant.location?.state || "";
  const categoryForSlug = newCategory || merchant.category || "";

  // Auto-clean legacy random suffixes like "-g7y6" from existing merchant slugs
  const currentSlug = merchant.slug || "";
  const hasRandomSuffix = /-[a-z0-9]{4,6}$/i.test(currentSlug);

  if (!merchant.slug || hasRandomSuffix) {
    const cleanBase =
      body.businessName ||
      merchant.businessName ||
      currentSlug.replace(/-[a-z0-9]{4,6}$/i, "");
    merchant.slug = await generateUniqueSlug(
      cleanBase,
      city,
      state,
      categoryForSlug,
      merchant._id,
    );
  } else if (
    body.slug &&
    body.slug !== merchant.slug &&
    user.role === "admin"
  ) {
    merchant.slug = await generateUniqueSlug(
      body.slug,
      city,
      state,
      categoryForSlug,
      merchant._id,
    );
  }

  // Normalize document & image aliases from wizard / onboarding forms
  const docImg =
    body.docImage || body.docFileUrl || body.docUrl || body.identityDocumentUrl;
  if (docImg !== undefined) merchant.docImage = docImg;

  const shopImg =
    body.shopImage ||
    body.shopPhotoUrl ||
    body.shopFrontUrl ||
    body.storePhotoUrl;
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
      if (field === "category") {
        if (newCategory) merchant.category = newCategory;
      } else {
        merchant[field] = body[field];
      }
    }
  });

  if (body.gstin !== undefined) {
    const cleanGstin = String(body.gstin || "")
      .trim()
      .toUpperCase();
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

  if (body.bankDetails && typeof body.bankDetails === "object") {
    merchant.bankDetails = {
      ...merchant.bankDetails,
      ...body.bankDetails,
    };
    merchant.markModified("bankDetails");
  }

  await merchant.save();

  // Invalidate Redis merchant profile cache so the next request gets fresh data
  if (authIdStr) {
    await invalidateMerchantCache(authIdStr).catch(() => {});
  }

  // Cascade category change to all listings (coupons) and affiliate products
  const hasCategoryChanged = Boolean(
    newCategory &&
      (!oldCategory || normalizeCategory(oldCategory) !== newCategory),
  );

  if (hasCategoryChanged) {
    const merchantIds = [merchant._id];
    if (merchant._id) {
      merchantIds.push(String(merchant._id));
    }

    try {
      const [couponRes, affiliateRes] = await Promise.allSettled([
        Coupon.updateMany(
          { merchantId: { $in: merchantIds } },
          { $set: { category: newCategory } },
        ),
        AffiliateProduct.updateMany(
          { merchantId: { $in: merchantIds } },
          { $set: { category: newCategory } },
        ),
      ]);

      console.log(
        `[Category Cascade] Successfully propagated category "${newCategory}" for merchant ${merchant._id}:`,
        `Coupons modified: ${couponRes.status === "fulfilled" ? couponRes.value?.modifiedCount : "error"}`,
        `Affiliate products modified: ${affiliateRes.status === "fulfilled" ? affiliateRes.value?.modifiedCount : "error"}`,
      );
    } catch (cascadeErr) {
      console.error("[Category Cascade Error]:", cascadeErr);
    }
  }

  await invalidateMerchantCache(authIdStr);
  return ok(merchant, "Profile updated successfully");
});
