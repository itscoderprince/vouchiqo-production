import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import {
  createCustomerRevival,
  getCustomerRevivalStats,
  listAllCustomerRevivals,
  updateCustomerRevivalStatus,
} from "@/modules/revival/customer-revival.service";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

const createCustomerRevivalSchema = z.object({
  code: z.string().min(2).max(50).toUpperCase(),
  brandName: z.string().min(2).max(100),
  email: z.string().email(),
});

/**
 * GET /api/revivals/customer
 * Returns the count of customer revival requests processed this month for public,
 * or lists all revival documents for administrators.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get("admin") === "true";

  if (isAdminRequest) {
    await requireRole(request, ROLES.ADMIN);
    const revivals = await listAllCustomerRevivals();
    return ok({ revivals });
  }

  const stats = await getCustomerRevivalStats();
  return ok(stats);
});

/**
 * POST /api/revivals/customer
 * Submits a new customer revival request.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const data = createCustomerRevivalSchema.parse(body);

  const { revival, message } = await createCustomerRevival(data);
  return created(revival, message);
});

/**
 * PUT /api/revivals/customer
 * Admin: Update customer revival request status.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { revivalId, status } = await request.json();
  const revival = await updateCustomerRevivalStatus(revivalId, status);
  return ok(revival, `Customer revival request status updated to ${status}`);
});
