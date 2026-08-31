import mongoose from "mongoose";
import { sendEmail } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/broadcast/email
 * Returns registered platform users and merchants available for broadcast.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  // Better Auth stores registered users in the 'user' collection
  const db = mongoose.connection.db;

  const [rawUsers, merchants] = await Promise.all([
    db
      .collection("user")
      .find({ email: { $exists: true, $ne: "" } })
      .project({ name: 1, email: 1, role: 1, createdAt: 1 })
      .toArray()
      .catch(() => []),
    Merchant.find()
      .select("businessName contactEmail phone")
      .lean()
      .catch(() => []),
  ]);

  // Customer shoppers (role != 'merchant')
  const shoppers = rawUsers.filter((u) => u.role !== "merchant");

  const shopperRecipients = shoppers.map((u) => ({
    email: u.email,
    name: u.name || "Valued Shopper",
    type: "user",
  }));

  const merchantRecipients = merchants
    .filter((m) => m.contactEmail)
    .map((m) => ({
      email: m.contactEmail,
      name: m.businessName || "Partner Merchant",
      type: "merchant",
    }));

  const allRecipients = [...shopperRecipients, ...merchantRecipients];

  return ok({
    totalUsers: shopperRecipients.length > 0 ? shopperRecipients.length : rawUsers.length,
    totalMerchants: merchantRecipients.length > 0 ? merchantRecipients.length : merchants.length,
    totalRecipients: allRecipients.length,
    sampleRecipients: allRecipients.slice(0, 10),
  });
});

/**
 * POST /api/admin/broadcast/email
 * Send live email broadcast or test copy via Resend.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const {
    subject,
    headline,
    description,
    bannerUrl,
    offerCode,
    ctaUrl,
    isTest,
    testEmail,
  } = body;

  if (!subject) {
    return Response.json(
      { status: "error", message: "Email subject is required" },
      { status: 400 },
    );
  }

  // Generate responsive Vouchiqo branded email HTML
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 20px; color: #0f172a; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fbcfe8; box-shadow: 0 4px 20px rgba(244, 63, 94, 0.08); }
      .header { background: linear-gradient(135deg, #e11d48 0%, #db2777 100%); padding: 24px; text-align: center; color: #ffffff; }
      .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
      .subtag { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fce7f3; margin-top: 4px; font-weight: 600; }
      .content { padding: 28px 24px; text-align: left; }
      .headline { font-size: 20px; font-weight: 700; color: #881337; margin: 0 0 12px 0; line-height: 1.3; }
      .description { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; font-weight: 400; }
      .banner { width: 100%; max-height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; border: 1px solid #fbcfe8; }
      .code-box { background: #fff1f2; border: 2px dashed #f43f5e; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
      .code-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9f1239; margin-bottom: 6px; letter-spacing: 0.5px; }
      .code { font-family: monospace; font-size: 22px; font-weight: 800; color: #e11d48; letter-spacing: 2px; }
      .btn { display: inline-block; background: #e11d48; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 10px; margin-top: 10px; text-align: center; }
      .footer { background: #fff1f2; padding: 16px; text-align: center; font-size: 11px; color: #9f1239; border-top: 1px solid #fecdd3; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="logo">Vouchiqo</h1>
        <div class="subtag">Verified Local Deals &amp; Offers</div>
      </div>
      <div class="content">
        <h2 class="headline">${headline || subject}</h2>
        <p class="description">${description || "Unlock exclusive verified discounts across top partner outlets on Vouchiqo."}</p>
        ${bannerUrl ? `<img src="${bannerUrl}" class="banner" alt="Campaign Banner" />` : ""}
        ${
          offerCode
            ? `
          <div class="code-box">
            <div class="code-label">Use Promo Code At Counter</div>
            <div class="code">${offerCode}</div>
          </div>`
            : ""
        }
        <div style="text-align: center; margin-top: 24px;">
          <a href="${ctaUrl || "https://vouchiqo.com"}" class="btn">Claim Deal on Vouchiqo →</a>
        </div>
      </div>
      <div class="footer">
        © 2026 Vouchiqo • You are receiving this official promotional alert as a registered member.<br>
        Ranchi, Jharkhand, India.
      </div>
    </div>
  </body>
  </html>`;

  // Test mode: Send test copy to specified email
  if (isTest) {
    const target = testEmail || "admin@vouchiqo.com";
    const result = await sendEmail({
      to: target,
      subject: `[TEST BLAST] ${subject}`,
      html: emailHtml,
    });

    return ok(
      { testEmail: target, result, status: "test_sent" },
      `Test email sent successfully to ${target} via Resend`,
    );
  }

  // Live broadcast mode: Send to registered database users/merchants based on recipientType
  const { recipientType = "all" } = body;
  const db = mongoose.connection.db;
  let targetList = [];

  if (recipientType === "users" || recipientType === "all") {
    const rawUsers = await db
      .collection("user")
      .find({ email: { $exists: true, $ne: "" } })
      .project({ email: 1, role: 1 })
      .toArray()
      .catch(() => []);
    const shopperEmails = rawUsers
      .filter((u) => recipientType === "all" || u.role !== "merchant")
      .map((u) => u.email)
      .filter(Boolean);
    targetList.push(...shopperEmails);
  }

  if (recipientType === "merchants" || recipientType === "all") {
    const merchants = await Merchant.find({
      contactEmail: { $exists: true, $ne: "" },
    })
      .select("contactEmail businessName")
      .lean()
      .catch(() => []);
    targetList.push(...merchants.map((m) => m.contactEmail).filter(Boolean));
  }

  // Deduplicate emails
  targetList = [...new Set(targetList)];
  if (targetList.length === 0) {
    targetList = ["admin@vouchiqo.com"];
  }

  // Dispatch live emails in parallel batches
  let sentCount = 0;
  for (const email of targetList.slice(0, 50)) {
    try {
      await sendEmail({
        to: email,
        subject,
        html: emailHtml,
      });
      sentCount++;
    } catch (e) {
      console.error(`[Broadcast Error to ${email}]:`, e);
    }
  }

  return ok(
    {
      sentCount,
      recipientType,
      totalRecipients: targetList.length,
      status: "broadcast_completed",
    },
    `Email broadcast sent to ${sentCount} registered ${recipientType === "merchants" ? "merchants" : recipientType === "users" ? "shoppers" : "platform members"} via Resend!`,
  );
});
