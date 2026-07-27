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
  customCategoryNotes: z.string().optional(),

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
  website: z.string().optional(),
  businessType: z.enum(["online", "physical", "both"]).or(z.string()).optional(),
  operatingHours: z.record(z.any()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  signatureImage: z.string().optional(),
  autoApproveRevival: z.boolean().optional(),

  // KYC compliance onboarding fields
  constitution: z
    .enum(["proprietorship", "partnership", "llp", "pvt_ltd", "others"])
    .or(z.string())
    .optional(),
  liaisonName: z.string().optional(),
  liaisonDesignation: z
    .enum(["owner", "partner", "manager", "others"])
    .or(z.string())
    .optional(),
  liaisonPhone: z.string().optional(),
  regionalHubCity: z.string().optional(),
  gmapsLink: z.string().optional(),
  docType: z.string().optional(),
  docImage: z.string().optional(),
  pan: z.string().optional(),
  gstin: z.string().optional(),
  isGstExempt: z.boolean().optional(),
  bankDetails: z
    .object({
      holderName: z.string().optional(),
      accountType: z.enum(["current", "savings"]).or(z.string()).optional(),
      accountNumber: z.string().optional(),
      ifsc: z.string().optional(),
      bankName: z.string().optional(),
      branchName: z.string().optional(),
      chequeImage: z.string().optional(),
    })
    .optional(),
  shopImage: z.string().optional(),
});

export const updateMerchantSchema = createMerchantSchema.partial();
