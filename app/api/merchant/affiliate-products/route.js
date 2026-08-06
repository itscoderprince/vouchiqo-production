import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import {
  createAffiliateProduct,
  getMerchantAffiliateProducts,
} from "@/modules/affiliate-product/affiliate-product.service";
import { created, ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/merchant/affiliate-products
 * Fetch authenticated merchant's affiliate products.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const merchant = await Merchant.findOne({ authId: user.id }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const products = await getMerchantAffiliateProducts(merchant._id, {
    status,
    search,
  });

  return ok(products);
});

/**
 * POST /api/merchant/affiliate-products
 * Create a new affiliate product.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const merchant = await Merchant.findOne({ authId: user.id }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const body = await request.json();
  const product = await createAffiliateProduct(merchant._id, body);

  return created(product, "Affiliate product created successfully");
});
