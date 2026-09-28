import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { createExcelWorkbook } from "@/lib/excel";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/merchants/export
 * Admin: Download full cumulative Excel sheet of all merchants/companies listed till now.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const merchants = await Merchant.find({})
    .sort({ createdAt: -1 })
    .lean();

  const columns = [
    { header: "S.No", key: "slNo", width: 8 },
    { header: "Brand / Company Name", key: "businessName", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "City", key: "city", width: 16 },
    { header: "State", key: "state", width: 16 },
    { header: "Status", key: "status", width: 16 },
    { header: "Plan", key: "plan", width: 14 },
    { header: "Contact Email", key: "contactEmail", width: 28 },
    { header: "Contact Phone", key: "contactPhone", width: 16 },
    { header: "Website", key: "website", width: 30 },
    { header: "Total Coupons", key: "totalCoupons", width: 16 },
    { header: "Total Claims", key: "totalClaims", width: 16 },
    { header: "Onboarded Date", key: "createdAt", width: 18 },
  ];

  const rows = merchants.map((m, idx) => ({
    slNo: idx + 1,
    businessName: m.businessName || "Unnamed Merchant",
    category: (m.category || "general").toUpperCase(),
    city: m.location?.city || m.city || "Ranchi",
    state: m.location?.state || m.state || "Jharkhand",
    status: (m.status || "pending").toUpperCase(),
    plan: (m.plan || "starter").toUpperCase(),
    contactEmail: m.contactEmail || "-",
    contactPhone: m.contactPhone || m.liaisonPhone || "-",
    website: m.website || "-",
    totalCoupons: Number(m.totalCoupons) || 0,
    totalClaims: Number(m.totalClaims) || 0,
    createdAt: m.createdAt
      ? new Date(m.createdAt).toISOString().split("T")[0]
      : "-",
  }));

  const workbook = await createExcelWorkbook({
    data: rows,
    columns,
    sheetName: "Merchants Cumulative",
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().slice(0, 10);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Vouchiqo_Merchants_Cumulative_${dateStr}.xlsx`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
});
