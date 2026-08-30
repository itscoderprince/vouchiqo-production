import { redis } from "@/lib/redis";
import PromoBanner from "@/modules/admin/banner.model";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";

/**
 * Get active promotional banners from MongoDB or Redis cache.
 * Active condition:
 * - status: "active"
 * - startDate is either null or <= current time
 * - endDate is either null or >= current time
 * Sorted by priority descending, then createdAt descending.
 */
export async function getPromoBanners() {
  try {
    const cached = await redis.get(REDIS_KEYS.BANNERS);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Redis error fetching promo banners:", err);
  }

  const now = new Date();
  const banners = await PromoBanner.find({
    status: "active",
    $and: [
      {
        $or: [{ startDate: null }, { startDate: { $lte: now } }],
      },
      {
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      },
    ],
  })
    .populate("merchantId", "businessName slug logo banner")
    .sort({ priority: -1, createdAt: -1 })
    .lean();

  try {
    await redis.setex(
      REDIS_KEYS.BANNERS,
      REDIS_TTL.BANNERS,
      JSON.stringify(banners),
    );
  } catch (err) {
    console.error("Redis error writing promo banners:", err);
  }

  return banners;
}

/**
 * Helper function to invalidate active banners cache.
 */
export async function invalidateBannersCache() {
  try {
    await redis.del(REDIS_KEYS.BANNERS);
  } catch (err) {
    console.error("Redis error deleting promo banners cache:", err);
  }
}

/**
 * Fetch all promo banners for Admin panel management.
 * Unfiltered list, sorted by priority desc, then createdAt desc.
 */
export async function getAllBanners() {
  return await PromoBanner.find({})
    .populate("merchantId", "businessName slug logo banner")
    .sort({ priority: -1, createdAt: -1 })
    .lean();
}

function cleanBannerPayload(data) {
  const cleaned = { ...data };
  if (
    !cleaned.merchantId ||
    String(cleaned.merchantId).trim() === "" ||
    cleaned.merchantId === "undefined"
  ) {
    delete cleaned.merchantId;
  }
  if (
    !cleaned.campaignId ||
    String(cleaned.campaignId).trim() === "" ||
    cleaned.campaignId === "undefined"
  ) {
    delete cleaned.campaignId;
  }
  if (cleaned.title === undefined) cleaned.title = "";
  if (cleaned.subtitle === undefined) cleaned.subtitle = "";
  if (cleaned.buttonText === undefined) cleaned.buttonText = "";
  if (cleaned.logo === undefined) cleaned.logo = "";
  if (cleaned.link === undefined) cleaned.link = "#";
  if (!cleaned.textColor) cleaned.textColor = "#ffffff";
  if (!cleaned.subtitleColor) cleaned.subtitleColor = "#fbbf24";
  if (!cleaned.buttonBgColor) cleaned.buttonBgColor = "#f59e0b";
  if (!cleaned.buttonTextColor) cleaned.buttonTextColor = "#0f172a";
  if (!cleaned.textPosition) cleaned.textPosition = "left";
  if (cleaned.overlayOpacity === undefined || cleaned.overlayOpacity === null) cleaned.overlayOpacity = 70;
  return cleaned;
}

/**
 * Create a new banner slide.
 * Invalidates redis cache.
 */
export async function createBanner(data) {
  const payload = cleanBannerPayload(data);
  const banner = await PromoBanner.create(payload);
  await invalidateBannersCache();
  return banner;
}

/**
 * Update an existing banner slide by ID.
 * Invalidates redis cache.
 */
export async function updateBanner(id, data) {
  const payload = cleanBannerPayload(data);
  const banner = await PromoBanner.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  );
  await invalidateBannersCache();
  return banner;
}

/**
 * Delete a banner slide by ID.
 * Invalidates redis cache.
 */
export async function deleteBanner(id) {
  const result = await PromoBanner.findByIdAndDelete(id);
  await invalidateBannersCache();
  return result;
}

/**
 * Bulk reorder banners by an array of banner IDs (from 1st/top to last).
 * Updates priority values so that 1st banner has the highest priority.
 * Invalidates redis cache.
 */
export async function reorderBanners(orderedIds) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return { count: 0 };
  const total = orderedIds.length;
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { priority: (total - index) * 10 } },
    },
  }));
  await PromoBanner.bulkWrite(bulkOps);
  await invalidateBannersCache();
  return { count: orderedIds.length };
}
