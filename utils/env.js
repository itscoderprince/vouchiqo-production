import { z } from "zod";

/**
 * Validates all required environment variables at startup.
 * If any are missing or invalid, the app will crash with a clear error.
 * This prevents silent failures in production.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Redis
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // Google OAuth (Optional in local dev)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.CI;

const envToValidate = { ...process.env };

if (isBuild) {
  // Inject valid dummy variables during build phase to prevent construction/evaluation crashes
  if (!envToValidate.MONGODB_URI) {
    envToValidate.MONGODB_URI = "mongodb://localhost:27017/build_db";
  }
  if (!envToValidate.REDIS_URL) {
    envToValidate.REDIS_URL = "redis://localhost:6379";
  }
  if (!envToValidate.BETTER_AUTH_SECRET) {
    envToValidate.BETTER_AUTH_SECRET =
      "a_32_character_dummy_secret_value_for_build";
  }
  if (!envToValidate.BETTER_AUTH_URL) {
    envToValidate.BETTER_AUTH_URL = "http://localhost:3000";
  }
  if (!envToValidate.CLOUDINARY_CLOUD_NAME) {
    envToValidate.CLOUDINARY_CLOUD_NAME = "dummy";
  }
  if (!envToValidate.CLOUDINARY_API_KEY) {
    envToValidate.CLOUDINARY_API_KEY = "dummy";
  }
  if (!envToValidate.CLOUDINARY_API_SECRET) {
    envToValidate.CLOUDINARY_API_SECRET = "dummy";
  }
  if (!envToValidate.RESEND_API_KEY) {
    envToValidate.RESEND_API_KEY = "re_dummy_key_for_build";
  }
}

const parsed = envSchema.safeParse(envToValidate);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error(
    "❌ Invalid environment variables:\n",
    JSON.stringify(errors, null, 2),
  );
  throw new Error(
    "Fix the environment variables above before starting the app.",
  );
}

export const env = parsed.data;
