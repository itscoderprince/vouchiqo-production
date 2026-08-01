import { connectDB } from "@/lib/mongodb";
import { getPlatformSettings } from "@/modules/admin/settings.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/plans
 * Public API endpoint to fetch active merchant subscription plans & pricing from database.
 */
export const GET = asyncHandler(async () => {
  await connectDB();
  const settingsMap = await getPlatformSettings();
  const rawPlans = settingsMap.merchant_plans || [];

  const plans = Array.isArray(rawPlans)
    ? rawPlans.filter((p) => p.active !== false)
    : [];

  return ok({ plans });
});
