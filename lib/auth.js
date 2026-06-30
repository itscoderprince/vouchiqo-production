import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import { env } from "@/utils/env";

// better-auth needs a Db instance, not the raw MongoClient
const client = new MongoClient(env.MONGODB_URI);
const db = client.db(); // ← client.db(), NOT client
const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db),

  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await resend.emails.send({
          from: "Vouchiqo <noreply@vouchiqo.com>",
          to: email,
          subject: "Verify your email address",
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a; margin-bottom: 16px;">Verify your email address</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">Thank you for registering. Please use the verification code below to verify your email address. This code is valid for 10 minutes.</p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #4f46e5;">${otp}</span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not request this email, you can safely ignore it.</p>
            </div>
          `,
        });
      },
    }),
  ],

  rateLimit: {
    enabled: true,
    window: 60, // 60-second window
    max: 10000, // prevent rate limiting on internal middleware/session calls
    customRules: {
      "/session": { window: 60, max: 10000 },
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 10 },
      "/forgot-password": { window: 60, max: 10 },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Vouchiqo <noreply@vouchiqo.com>",
        to: user.email,
        subject: "Reset your Vouchiqo password",
        html: `
          <h2>Reset your password</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Vouchiqo <noreply@vouchiqo.com>",
        to: user.email,
        subject: "Verify your Vouchiqo email",
        html: `
          <h2>Verify your email</h2>
          <p>Click below to verify your email address.</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a>
        `,
      });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if 1 day old
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min client-side cache
    },
  },

  // Extend the auth user with app-level fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: true, // allow client to set role on sign-up
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
    },
  },
});
