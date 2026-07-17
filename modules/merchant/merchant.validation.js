import { z } from "zod";
import { COUPON_CATEGORIES } from "@/utils/constants";

export const createMerchantSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),

  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  description: z.string().max(500).optional(),
  shortDescription: z.string().max(300).optional(),
  longDescription: z.string().max(1000).optional(),

  category: z.enum(COUPON_CATEGORIES),

  location: z
    .object({
      address: z.string().optional(),
      pincode: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().default("IN"),
      coordinates: z
        .object({
          lat: z.number().optional(),
          lng: z.number().optional(),
        })
        .optional(),
    })
    .optional(),

  contactEmail: z.string().email().or(z.string().max(0)).optional(),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  website: z.string().url().or(z.string().max(0)).optional(),
  businessType: z.enum(["online", "physical", "both"]).optional(),
  operatingHours: z.record(z.any()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  autoApproveRevival: z.boolean().optional(),

  // KYC compliance onboarding fields
  constitution: z
    .enum(["proprietorship", "partnership", "llp", "pvt_ltd", "others"])
    .optional(),
  liaisonName: z.string().optional(),
  liaisonDesignation: z
    .enum(["owner", "partner", "manager", "others"])
    .optional(),
  liaisonPhone: z
    .string()
    .regex(/^\d{10}$/, "Operational phone must be exactly 10 digits")
    .or(z.string().max(0))
    .optional(),
  regionalHubCity: z
    .enum(["ranchi", "jamshedpur", "dhanbad", "bokaro"])
    .optional(),
  gmapsLink: z
    .string()
    .regex(
      /^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)\//i,
      "Invalid Google Maps URL format",
    )
    .or(z.string().max(0))
    .optional(),
  pan: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "PAN must be a valid 10-character code",
    )
    .or(z.string().max(0))
    .optional(),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "GSTIN must be a valid 15-character ID",
    )
    .or(z.string().max(0))
    .optional(),
  isGstExempt: z.boolean().optional(),
  bankDetails: z
    .object({
      holderName: z.string().optional(),
      accountType: z.enum(["current", "savings"]).optional(),
      accountNumber: z
        .string()
        .regex(/^\d{9,18}$/, "Account serial must be 9 to 18 digits")
        .or(z.string().max(0))
        .optional(),
      ifsc: z
        .string()
        .regex(
          /^[A-Z]{4}0[A-Z0-9]{6}$/,
          "IFSC must be 11 characters (e.g. HDFC0000123)",
        )
        .or(z.string().max(0))
        .optional(),
      bankName: z.string().optional(),
      branchName: z.string().optional(),
      chequeImage: z.string().optional(),
    })
    .optional(),
  shopImage: z.string().optional(),
});

export const updateMerchantSchema = createMerchantSchema.partial();
