import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP, oneTap } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import {
  sendUserPasswordResetEmail,
  sendUserVerificationEmail,
  sendUserVerificationOtpEmail,
} from "./email/user-email.js";
import { env } from "../utils/env.js";

// better-auth needs a Db instance, not the raw MongoClient
const client = new MongoClient(env.MONGODB_URI);
const db = client.db(); // ← client.db(), NOT client
const resend = new Resend(env.RESEND_API_KEY);

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: isProduction
    ? (env.BETTER_AUTH_URL || "https://vouchiqo.com")
    : "http://localhost:3000",
  trustedOrigins: [
    "http://vouchiqo.com",
    "https://vouchiqo.com",
    "http://www.vouchiqo.com",
    "https://www.vouchiqo.com",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
  ],
  secret: env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db),

  account: {
    skipStateCookieCheck: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: isProduction,
      domain: isProduction ? ".vouchiqo.com" : undefined,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProduction,
      httpOnly: true,
    },
    useSecureCookies: isProduction,
  },

  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            accessType: "offline",
            prompt: "select_account",
          },
        }
      : {}),
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendUserVerificationOtpEmail({ to: email, otp }).catch((err) =>
          console.error("[OTP Email Error]:", err),
        );
      },
    }),
    oneTap({
      clientId: env.GOOGLE_CLIENT_ID,
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
      await sendUserPasswordResetEmail({
        to: user.email,
        resetUrl: url,
        name: user.name,
      }).catch((err) => console.error("[Reset Email Error]:", err));
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendUserVerificationEmail({
        to: user.email,
        verifyUrl: url,
        name: user.name,
      }).catch((err) => console.error("[Verification Email Error]:", err));
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if 1 day old
    cookieCache: {
      enabled: false, // Ensure fresh session resolution on first login attempt
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
