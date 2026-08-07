import { Resend } from "resend";
import { env } from "../../utils/env.js";

const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "Vouchiqo <onboarding@resend.dev>";

/**
 * High-precision, ultra-compact, modern responsive HTML email layout.
 * Features crisp typography, 4px/6px small border-radius, clean spacing, and premium UI/UX.
 */
function renderUserEmailLayout({ title, previewText, bodyContent }) {
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
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 20px 0; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; border-top: 3px solid #2563eb; padding: 18px 20px; display: table; width: 100%; box-sizing: border-box; }
    .header-logo { font-size: 20px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: -0.5px; }
    .header-logo span { color: #38bdf8; }
    .header-tag { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; float: right; margin-top: 4px; }
    .content { padding: 24px 20px; line-height: 1.5; font-size: 14px; color: #334155; }
    .h1 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.2px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-bottom: 12px; }
    .badge-success { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
    .badge-amber { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; margin: 16px 0; }
    .code-box { background: #f1f5f9; border: 1px dashed #0284c7; border-radius: 4px; padding: 12px; text-align: center; font-size: 22px; font-weight: 800; color: #0369a1; letter-spacing: 3px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin: 14px 0; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 4px; text-align: center; margin-top: 12px; }
    .btn-blue { background-color: #2563eb; }
    .btn-emerald { background-color: #059669; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="header-logo">Vouch<span>iqo</span></a>
        <span class="header-tag">Verified Deals</span>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p style="margin:0 0 4px 0;">© 2026 Vouchiqo Technologies Pvt Ltd • Ranchi &amp; Jharkhand</p>
        <p style="margin:0;">Account notification sent to your registered email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch low-level email via Resend
 */
async function dispatchEmail({ to, subject, html }) {
  if (!to) {
    console.warn("[dispatchEmail Warning]: Skipping dispatch - missing recipient 'to' email address.");
    return { success: false, error: "Missing recipient 'to' email address" };
  }

  if (!resend || !apiKey || apiKey === "re_dummy_key_for_build") {
    console.log(`[Resend Mock User Email] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  let recipient = to;
  const fromAddress = FROM_EMAIL;
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
        `[Resend User Email Error]: Cannot send email to ${to}.\n-> Reason: ${errMsg}\n-> Fix: Verify your domain at https://resend.com/domains and set EMAIL_FROM in .env.local`
      );
    } else {
      console.error("[Resend User Email Error]:", error);
    }
    return { success: false, error: errMsg };
  }
}

/**
 * 1. User Registration Welcome Email (Compact, 4px border-radius, clean UI/UX)
 */
export async function sendUserWelcomeEmail({ to, name }) {
  const userName = name || "Valued Member";
  const html = renderUserEmailLayout({
    title: "Welcome to Vouchiqo!",
    bodyContent: `
      <span class="badge badge-success">🎉 Registration Complete</span>
      <h1 class="h1">Welcome to Vouchiqo, ${userName}!</h1>
      <p style="margin: 0 0 12px 0;">Your account is ready. Discover Ranchi's top verified deals, save instant coupons, and get exclusive store discounts.</p>

      <div class="card">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Quick Start Guide</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 4px 0; width: 20px;">🔹</td>
            <td><strong>Explore Deals:</strong> Browse local food, retail &amp; service discounts.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; width: 20px;">🔹</td>
            <td><strong>Claim Coupons:</strong> Instant 1-tap claim to save codes in your profile.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; width: 20px;">🔹</td>
            <td><strong>Request Revivals:</strong> Notify brands when out-of-stock deals expire.</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-blue">Start Exploring Deals →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Welcome to Vouchiqo, ${userName}! Start saving today`,
    html,
  });
}

/**
 * 2. User Welcome Back Email (Compact, 4px border-radius, clean UI/UX - sent on login / returning)
 */
export async function sendUserWelcomeBackEmail({ to, name, lastLoginAt }) {
  const userName = name || "Valued Member";
  const formattedLastLogin = lastLoginAt
    ? new Date(lastLoginAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const html = renderUserEmailLayout({
    title: "Welcome Back to Vouchiqo!",
    bodyContent: `
      <span class="badge">👋 Welcome Back</span>
      <h1 class="h1">Great to see you again, ${userName}!</h1>
      <p style="margin: 0 0 12px 0;">You've successfully signed back into your Vouchiqo account${formattedLastLogin ? ` (last active ${formattedLastLogin})` : ""}.</p>

      <div class="card">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0284c7; margin-bottom: 4px;">Fresh Local Deals Waiting For You</div>
        <p style="margin: 0; font-size: 13px; color: #475569;">Check out the latest verified offers from top stores in Ranchi and claim your savings before they expire.</p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-blue">View Newest Offers →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Welcome back to Vouchiqo, ${userName}!`,
    html,
  });
}

/**
 * 3. OTP Verification Email
 */
export async function sendUserVerificationOtpEmail({ to, otp, name }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: "Security Code - Vouchiqo",
    bodyContent: `
      <span class="badge">🔒 Security Code</span>
      <h1 class="h1">Verify your email address</h1>
      <p style="margin: 0 0 10px 0;">Hello ${userName}, enter the verification code below to authorize your session.</p>
      <div class="code-box">${otp}</div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">Code expires in 10 minutes. Do not share this code with anyone.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: `${otp} is your Vouchiqo verification code`,
    html,
  });
}

/**
 * 4. Password Reset Email
 */
export async function sendUserPasswordResetEmail({ to, resetUrl, name }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: "Reset Password - Vouchiqo",
    bodyContent: `
      <span class="badge badge-amber">🔑 Password Reset</span>
      <h1 class="h1">Reset your Vouchiqo password</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, we received a request to reset your password.</p>
      <div style="text-align: center; margin: 16px 0;">
        <a href="${resetUrl}" class="btn btn-blue">Reset Password Now →</a>
      </div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">This link expires in 1 hour. If you didn't request this, your account remains secure.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: "Reset your Vouchiqo password",
    html,
  });
}

/**
 * 5. Coupon Claimed Confirmation Email
 */
export async function sendUserCouponClaimedEmail({
  to,
  name,
  couponTitle,
  merchantName,
  couponCode,
  discountText,
  validTill,
}) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: `Coupon Claimed: ${couponTitle}`,
    bodyContent: `
      <span class="badge badge-success">🏷️ Deal Claimed</span>
      <h1 class="h1">Coupon claimed successfully!</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, you claimed an offer from <strong>${merchantName || "Vouchiqo Partner"}</strong>.</p>
      
      <div class="card">
        <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${couponTitle}</div>
        <div style="font-size: 13px; color: #059669; font-weight: 700; margin-top: 2px;">${discountText || "Verified Deal"}</div>
        ${validTill ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Valid until: ${new Date(validTill).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>` : ""}
      </div>

      <div class="code-box">${couponCode || "VOUCHIQO"}</div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/customer/claimed"}" class="btn">View My Claimed Coupons →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Claimed: ${couponTitle} at ${merchantName || "Vouchiqo"}`,
    html,
  });
}

/**
 * 6. Coupon Redemption Receipt Email
 */
export async function sendUserCouponRedeemedEmail({
  to,
  name,
  couponTitle,
  merchantName,
  savingsAmount,
  storeAddress,
}) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: `Savings Receipt - ${couponTitle}`,
    bodyContent: `
      <span class="badge badge-success">✅ Offer Redeemed</span>
      <h1 class="h1">Saved ₹${savingsAmount || 0} at ${merchantName}!</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, your coupon <strong>${couponTitle}</strong> was redeemed successfully.</p>
      
      <div class="card" style="border-color: #a7f3d0; background: #ecfdf5;">
        <div style="font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 700;">Total Saved</div>
        <div style="font-size: 26px; font-weight: 800; color: #047857; margin: 2px 0;">₹${savingsAmount || 0}</div>
        ${storeAddress ? `<div style="font-size: 11px; color: #4b5563; margin-top: 4px;">📍 ${storeAddress}</div>` : ""}
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-emerald">Find More Deals →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `You saved ₹${savingsAmount || 0} at ${merchantName}!`,
    html,
  });
}

/**
 * 7. Savings Milestone Email
 */
export async function sendUserSavingsMilestoneEmail({
  to,
  name,
  totalSavings,
  couponsRedeemedCount,
}) {
  const userName = name || "Savings Champion";
  const html = renderUserEmailLayout({
    title: "Savings Milestone Achieved!",
    bodyContent: `
      <span class="badge badge-amber">🏆 Milestone Reached</span>
      <h1 class="h1">Congrats ${userName}! Saved ₹${totalSavings}!</h1>
      <p style="margin: 0 0 12px 0;">You've officially saved ₹${totalSavings} across ${couponsRedeemedCount || 1} local deals on Vouchiqo.</p>
      
      <div style="text-align: center; margin-top: 16px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-blue">Explore Top Deals →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `🎉 Congrats ${userName}! You've saved ₹${totalSavings} on Vouchiqo`,
    html,
  });
}

/**
 * 8. Revival Request Confirmation Email
 */
export async function sendUserRevivalConfirmationEmail({ to, name, brandName }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: `Revival Request - ${brandName}`,
    bodyContent: `
      <span class="badge">⚡ Deal Revival</span>
      <h1 class="h1">Revival request sent to ${brandName}</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, we notified <strong>${brandName}</strong> that you're eager for their offers to return. We'll email you the moment new deals go live.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Deal Revival Requested for ${brandName}`,
    html,
  });
}
