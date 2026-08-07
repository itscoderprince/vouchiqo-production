import { Resend } from "resend";
import { env } from "../../utils/env.js";

const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM_MERCHANT_EMAIL =
  process.env.EMAIL_FROM_MERCHANT || process.env.EMAIL_FROM || "Vouchiqo Merchant <onboarding@resend.dev>";

/**
 * Ultra-compact, responsive HTML email layout for Merchant notifications.
 * Features 4px/6px micro border-radius, clean typography, and high contrast UI.
 */
function renderMerchantEmailLayout({ title, previewText, bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 20px 0; }
    .main { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; border-top: 3px solid #f59e0b; padding: 18px 20px; text-align: center; }
    .logo { font-size: 20px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: -0.5px; }
    .logo span { color: #f59e0b; }
    .merchant-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-top: 2px; display: block; }
    .content { padding: 24px 20px; line-height: 1.5; color: #334155; font-size: 14px; }
    .h1 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.2px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; margin-bottom: 12px; }
    .badge-approved { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
    .badge-rejected { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .badge-blue { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; margin: 14px 0; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 4px; text-align: center; margin-top: 12px; }
    .btn-amber { background-color: #f59e0b; color: #0f172a !important; }
    .btn-emerald { background-color: #059669; color: #ffffff !important; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}/merchant" class="logo">Vouch<span>iqo</span></a>
        <span class="merchant-tag">Merchant Partner Network</span>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p style="margin:0 0 4px 0;">© 2026 Vouchiqo Technologies Pvt Ltd • Merchant Operations Centre</p>
        <p style="margin:0;">Ranchi &amp; Jharkhand Business Desk</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch low-level email via Resend
 */
async function dispatchMerchantEmail({ to, subject, html }) {
  if (!to) {
    console.warn("[dispatchMerchantEmail Warning]: Skipping dispatch - missing recipient 'to' email address.");
    return { success: false, error: "Missing recipient 'to' email address" };
  }

  if (!resend || !apiKey || apiKey === "re_dummy_key_for_build") {
    console.log(`[Resend Mock Merchant Email] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  let recipient = to;
  const fromAddress = FROM_MERCHANT_EMAIL;
  const isTestingDomain = fromAddress.includes("onboarding@resend.dev");
  const devRecipient = process.env.EMAIL_DEV_RECIPIENT || env.EMAIL_DEV_RECIPIENT || "vouchiqo@gmail.com";

  if (isTestingDomain && recipient !== devRecipient && process.env.NODE_ENV === "development") {
    console.warn(
      `[Resend Dev Sandbox Notice]: Redirecting recipient '${to}' to '${devRecipient}' because 'onboarding@resend.dev' only allows sending to account owner email.`
    );
    recipient = devRecipient;
  }

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    const errMsg = error?.message || String(error);
    if (errMsg.includes("testing emails to your own email address")) {
      console.error(
        `[Resend Merchant Email Error]: Cannot send email to ${to}.\n-> Reason: ${errMsg}\n-> Fix: Verify your domain at https://resend.com/domains and set EMAIL_FROM_MERCHANT in .env.local`
      );
    } else {
      console.error("[Resend Merchant Email Error]:", error);
    }
    return { success: false, error: errMsg };
  }
}

/**
 * 1. Merchant Application Submitted / Welcome Email with Credentials
 */
export async function sendMerchantWelcomeEmail({
  to,
  email,
  password,
  businessName,
  liaisonName,
}) {
  const name = liaisonName || "Merchant Partner";
  const targetEmail = email || to;

  const html = renderMerchantEmailLayout({
    title: `Registration Received - ${businessName || "Vouchiqo Merchant"}`,
    bodyContent: `
      <span class="badge">⌛ Merchant Registration Received</span>
      <h1 class="h1">Thank you for registering, ${name}!</h1>
      <p style="margin: 0 0 10px 0;">We have successfully received your merchant account registration and onboarding details for <strong>${businessName || "your business"}</strong>.</p>
      
      <div class="card" style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 14px 16px; margin: 14px 0; border-radius: 4px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; margin-bottom: 6px;">🔑 Your Merchant Login Credentials</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 3px 0; color: #64748b; font-weight: 600; width: 130px;">Registered Email:</td>
            <td style="padding: 3px 0; color: #0f172a; font-weight: 700; font-family: ui-monospace, SFMono-Regular, monospace;">${targetEmail}</td>
          </tr>
          ${
            password
              ? `
          <tr>
            <td style="padding: 3px 0; color: #64748b; font-weight: 600; width: 130px;">Password:</td>
            <td style="padding: 3px 0; color: #0f172a; font-weight: 700; font-family: ui-monospace, SFMono-Regular, monospace;">${password}</td>
          </tr>`
              : ""
          }
        </table>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b;">Please keep this email safe. You can use these credentials to log into your merchant dashboard anytime.</p>
      </div>

      <div class="card">
        <strong style="color: #0f172a; font-size: 13px;">Next Steps in Onboarding:</strong>
        <ol style="margin: 6px 0 0 0; padding-left: 18px; font-size: 13px; color: #475569;">
          <li>Verification team reviews your business &amp; KYC details (24-48 hrs)</li>
          <li>Email notification dispatched instantly upon verification</li>
          <li>Once verified, your store page goes live &amp; you can post unlimited deals</li>
        </ol>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant-login"}" class="btn">Log In to Merchant Portal →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to: targetEmail,
    subject: `Welcome to Vouchiqo! Credentials & Registration for ${businessName || "your store"}`,
    html,
  });
}

/**
 * 2. Application Approved / Verified Email
 */
export async function sendMerchantApprovedEmail({
  to,
  businessName,
  liaisonName,
  dashboardUrl,
}) {
  const name = liaisonName || "Merchant Partner";
  const targetUrl =
    dashboardUrl ||
    (env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/dashboard";

  const html = renderMerchantEmailLayout({
    title: "Application Approved! Welcome to Vouchiqo Partner Network",
    bodyContent: `
      <span class="badge badge-approved">✅ Account Verified &amp; Active</span>
      <h1 class="h1">Congratulations, ${name}!</h1>
      <p style="margin: 0 0 10px 0;">Your business profile <strong>${businessName}</strong> has been officially verified and approved by the Vouchiqo Admin Team.</p>
      
      <div class="card" style="border-color: #a7f3d0; background: #ecfdf5;">
        <strong style="color: #065f46; font-size: 14px;">Your Merchant Storefront is Live!</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #047857;">You can now post discount offers, track in-store redemptions, and launch targeted promotional campaigns.</p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${targetUrl}" class="btn btn-amber">Go to Merchant Dashboard →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `🎉 Approved! ${businessName} is now live on Vouchiqo`,
    html,
  });
}

/**
 * 3. Application Rejected Email
 */
export async function sendMerchantRejectedEmail({
  to,
  businessName,
  liaisonName,
  rejectionReason,
}) {
  const name = liaisonName || "Merchant Partner";
  const editUrl =
    (env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/profile?edit=true";

  const html = renderMerchantEmailLayout({
    title: "Application Action Required - Vouchiqo",
    bodyContent: `
      <span class="badge badge-rejected">⚠️ Verification Action Needed</span>
      <h1 class="h1">Action Required for ${businessName}</h1>
      <p style="margin: 0 0 10px 0;">Hello ${name}, our compliance team reviewed your business profile and requested an update before final approval.</p>
      
      <div class="card" style="border-color: #fecaca; background: #fef2f2;">
        <strong style="color: #991b1b; font-size: 13px;">Reason for Review Request:</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #b91c1c;">${rejectionReason || "Please verify document clarity, GST/Identity match, or storefront photo quality."}</p>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${editUrl}" class="btn">Update Profile Details →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Action Required: Update profile details for ${businessName}`,
    html,
  });
}

/**
 * 4. Plan Selected Email (Triggered when merchant selects or upgrades a plan)
 */
export async function sendMerchantPlanSelectedEmail({
  to,
  businessName,
  planName,
  planPrice,
  billingCycle,
  featuresList = [],
}) {
  const cycleText = billingCycle || "monthly";
  const html = renderMerchantEmailLayout({
    title: `Subscription Plan Selected: ${planName}`,
    bodyContent: `
      <span class="badge badge-blue">📌 Subscription Plan Selected</span>
      <h1 class="h1">You've selected the ${planName} Plan!</h1>
      <p style="margin: 0 0 10px 0;">Hello <strong>${businessName}</strong>, thank you for selecting the <strong>${planName}</strong> plan for your store on Vouchiqo.</p>
      
      <div class="card">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b;">Plan Summary</div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0;">${planName} Plan</div>
        <div style="font-size: 14px; font-weight: 700; color: #2563eb;">₹${planPrice || 0} / ${cycleText}</div>
        
        ${
          featuresList.length > 0
            ? `<ul style="margin: 10px 0 0 0; padding-left: 18px; font-size: 12px; color: #475569;">
                ${featuresList.map((f) => `<li>${f}</li>`).join("")}
              </ul>`
            : ""
        }
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-amber">View Plan &amp; Billing →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Subscription Selected: ${planName} Plan for ${businessName}`,
    html,
  });
}

/**
 * 5. Payment Completed / Receipt Email (Triggered after successful Razorpay payment)
 */
export async function sendMerchantPaymentCompletedEmail({
  to,
  businessName,
  amount,
  currency = "INR",
  transactionId,
  orderId,
  planName,
  planExpiry,
}) {
  const displayAmount = (Number(amount) > 1000 ? Number(amount) / 100 : Number(amount)).toFixed(2);
  const formattedExpiry = planExpiry
    ? new Date(planExpiry).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const html = renderMerchantEmailLayout({
    title: `Payment Receipt - ${transactionId || orderId}`,
    bodyContent: `
      <span class="badge badge-approved">💳 Payment Successful</span>
      <h1 class="h1">Payment Receipt &amp; Tax Confirmation</h1>
      <p style="margin: 0 0 10px 0;">Thank you! We received your payment for <strong>${businessName}</strong>.</p>

      <div class="card" style="border-color: #a7f3d0; background: #ecfdf5;">
        <div style="font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 700;">Amount Paid</div>
        <div style="font-size: 26px; font-weight: 800; color: #047857; margin: 2px 0;">₹${displayAmount}</div>
        ${planName ? `<div style="font-size: 12px; font-weight: 700; color: #065f46;">Plan: ${planName} Plan</div>` : ""}
        ${formattedExpiry ? `<div style="font-size: 11px; color: #047857; margin-top: 2px;">Active until: ${formattedExpiry}</div>` : ""}
      </div>

      <div class="card" style="font-size: 12px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Transaction Details</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
          ${transactionId ? `<tr><td style="padding: 2px 0; color: #64748b; width: 130px;">Payment ID:</td><td style="font-weight: 700; font-family: ui-monospace, monospace;">${transactionId}</td></tr>` : ""}
          ${orderId ? `<tr><td style="padding: 2px 0; color: #64748b; width: 130px;">Order ID:</td><td style="font-weight: 700; font-family: ui-monospace, monospace;">${orderId}</td></tr>` : ""}
          <tr><td style="padding: 2px 0; color: #64748b; width: 130px;">Date &amp; Time:</td><td>${new Date().toLocaleString("en-IN")}</td></tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn">View Billing History →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Payment Successful (₹${displayAmount}): Receipt for ${businessName}`,
    html,
  });
}

/**
 * 6. Payment Failed Email
 */
export async function sendMerchantPaymentFailedEmail({
  to,
  businessName,
  planName,
  amount,
  failureReason,
}) {
  const displayAmount = (Number(amount) > 1000 ? Number(amount) / 100 : Number(amount)).toFixed(2);

  const html = renderMerchantEmailLayout({
    title: "Payment Failed - Action Required",
    bodyContent: `
      <span class="badge badge-rejected">❌ Payment Failed</span>
      <h1 class="h1">Payment Could Not Be Processed</h1>
      <p style="margin: 0 0 10px 0;">Hello <strong>${businessName}</strong>, your recent payment attempt of <strong>₹${displayAmount}</strong> for ${planName || "subscription"} was unsuccessful.</p>

      <div class="card" style="border-color: #fecaca; background: #fef2f2;">
        <div style="font-size: 12px; font-weight: 700; color: #991b1b;">Failure Details</div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #b91c1c;">${failureReason || "Transaction declined by bank or card issuer."}</p>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-amber">Retry Payment Now →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Action Required: Payment Failed for ${businessName}`,
    html,
  });
}

/**
 * 7. Campaign / Offer Created Confirmation Email
 */
export async function sendMerchantOfferCreatedEmail({
  to,
  businessName,
  offerTitle,
  code,
  discountText,
}) {
  const html = renderMerchantEmailLayout({
    title: `Offer Live: ${offerTitle}`,
    bodyContent: `
      <span class="badge badge-approved">🚀 Offer Live</span>
      <h1 class="h1">Your offer is now live on Vouchiqo!</h1>
      <p style="margin: 0 0 10px 0;">Great job! <strong>${offerTitle}</strong> is active and discoverable by local shoppers.</p>
      
      <div class="card">
        <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${offerTitle}</div>
        <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin: 2px 0;">${discountText || "Verified Deal"}</div>
        <div style="font-size: 12px; font-family: ui-monospace, monospace; color: #f59e0b; font-weight: 700; margin-top: 4px;">CODE: ${code}</div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/coupons"}" class="btn">Manage Listings →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Offer Live: ${offerTitle} (${businessName})`,
    html,
  });
}

/**
 * 8. Customer Coupon Redemption Alert Email
 */
export async function sendMerchantRedemptionNotificationEmail({
  to,
  businessName,
  offerTitle,
  customerName,
  savingsGiven,
}) {
  const html = renderMerchantEmailLayout({
    title: `Coupon Redeemed at ${businessName}`,
    bodyContent: `
      <span class="badge badge-approved">🔔 Instant Redemption</span>
      <h1 class="h1">New Coupon Redeemed!</h1>
      <p style="margin: 0 0 10px 0;">A customer just redeemed an offer at <strong>${businessName}</strong>.</p>
      
      <div class="card">
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Offer Title</div>
        <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">${offerTitle}</div>
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Customer</div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${customerName || "Vouchiqo User"}</div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/dashboard"}" class="btn">View Redemptions Analytics →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `New Redemption: ${offerTitle} at ${businessName}`,
    html,
  });
}

/**
 * 9. Revival Demand Alert Email (Customer requested offer revival)
 */
export async function sendMerchantRevivalAlertEmail({
  to,
  businessName,
  brandName,
  totalDemandsCount,
  revivalUrl,
}) {
  const targetUrl =
    revivalUrl ||
    (env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/revivals";

  const html = renderMerchantEmailLayout({
    title: `Customer Demand: ${totalDemandsCount} Revival Requests`,
    bodyContent: `
      <span class="badge">🔥 Customer Demand Surge</span>
      <h1 class="h1">Customers are requesting your offers!</h1>
      <p style="margin: 0 0 10px 0;">Hello team <strong>${businessName || brandName}</strong>, <strong>${totalDemandsCount || 1} local shoppers</strong> requested a deal revival for your brand.</p>
      
      <div class="card" style="border-color: #fde68a; background: #fffbeb; text-align: center; padding: 16px;">
        <div style="font-size: 32px; font-weight: 800; color: #d97706;">${totalDemandsCount || 1}</div>
        <div style="font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase;">Customer Revival Requests</div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${targetUrl}" class="btn btn-amber">Respond &amp; Relaunch Offer →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `🔥 High Demand: ${totalDemandsCount} customers requested deals for ${businessName || brandName}`,
    html,
  });
}

/**
 * 10. Monthly Performance & Summary Email
 */
export async function sendMerchantMonthlyReportEmail({
  to,
  businessName,
  monthName,
  totalRedemptions,
  totalSavingsProvided,
  totalPageViews,
}) {
  const html = renderMerchantEmailLayout({
    title: `Monthly Performance Report - ${monthName || "This Month"}`,
    bodyContent: `
      <span class="badge">📊 Performance Summary</span>
      <h1 class="h1">${businessName} Performance for ${monthName || "This Month"}</h1>
      <p style="margin: 0 0 10px 0;">Here is your customer engagement breakdown on Vouchiqo:</p>
      
      <div style="margin: 14px 0;">
        <div class="card" style="margin-bottom: 8px;">
          <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${totalRedemptions || 0}</div>
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total In-Store Redemptions</div>
        </div>
        <div class="card" style="margin-bottom: 8px;">
          <div style="font-size: 20px; font-weight: 800; color: #059669;">₹${totalSavingsProvided || 0}</div>
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Value Delivered to Customers</div>
        </div>
        <div class="card">
          <div style="font-size: 20px; font-weight: 800; color: #2563eb;">${totalPageViews || 0}</div>
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Brand Impressions</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/analytics"}" class="btn">View Full Analytics →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `📊 ${monthName || "Monthly"} Performance Report: ${businessName}`,
    html,
  });
}

/**
 * 11. Admin Subscription Control Center Update Email
 * (Triggered when Super Admin changes plan tier, extends expiry (+7 days, etc.), pauses, or cancels subscription)
 */
export async function sendMerchantSubscriptionAdminUpdateEmail({
  to,
  businessName,
  actionTitle,
  statusBadgeText,
  planName,
  planExpiry,
  detailMessage,
}) {
  const formattedExpiry = planExpiry
    ? new Date(planExpiry).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const html = renderMerchantEmailLayout({
    title: actionTitle || `Subscription Update - ${businessName}`,
    bodyContent: `
      <span class="badge badge-blue">${statusBadgeText || "⚡ Subscription Updated"}</span>
      <h1 class="h1">${actionTitle || "Subscription Account Update"}</h1>
      <p style="margin: 0 0 10px 0;">Hello <strong>${businessName}</strong>, an update was made to your merchant subscription by the Vouchiqo Administration Team.</p>

      <div class="card">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Subscription Status Summary</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          ${planName ? `<tr><td style="padding: 3px 0; color: #64748b; width: 130px;">Active Tier:</td><td style="font-weight: 700; color: #0f172a;">${String(planName).toUpperCase()} PLAN</td></tr>` : ""}
          ${formattedExpiry ? `<tr><td style="padding: 3px 0; color: #64748b; width: 130px;">Plan Expiry:</td><td style="font-weight: 700; color: #059669;">${formattedExpiry}</td></tr>` : ""}
        </table>
        ${detailMessage ? `<div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #475569;">${detailMessage}</div>` : ""}
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-amber">View Subscription &amp; Account Status →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Subscription Notice: ${actionTitle || "Account Updated"} for ${businessName}`,
    html,
  });
}
