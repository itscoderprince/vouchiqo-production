import { z } from "zod";

/**
 * Zod validation schema for merchant business profile onboarding & editing.
 */
export const merchantProfileSchema = z.object({
  // Step 1: Identity
  businessName: z
    .string({ required_error: "Legal Entity Corporate Name is required" })
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name cannot exceed 120 characters"),
  slug: z.string().optional(),
  category: z.string().default("food"),
  description: z.string().optional(),
  contactEmail: z
    .string({ required_error: "Official Contact Email is required" })
    .email("Please enter a valid email address"),
  contactPhone: z
    .string({ required_error: "Primary Phone Number is required" })
    .min(10, "Phone number must be at least 10 digits"),
  constitution: z.string().default("proprietorship"),
  liaisonName: z.string().optional(),
  liaisonDesignation: z.string().default("owner"),
  liaisonPhone: z.string().optional(),

  // Step 2: Location
  address: z
    .string({ required_error: "Complete physical address is required" })
    .min(5, "Complete physical address is required"),
  pincode: z
    .string({ required_error: "Pincode is required" })
    .min(6, "Please enter a valid 6-digit pincode"),
  city: z
    .string({ required_error: "Store city location is required" })
    .min(1, "Store city location is required"),
  state: z.string().optional(),
  country: z.string().default("IN"),
  lat: z.union([z.string(), z.number()]).optional(),
  lng: z.union([z.string(), z.number()]).optional(),
  gmapsLink: z.string().optional(),

  // Media
  logo: z.string().optional(),
  banner: z.string().optional(),
  shopImage: z.string().optional(),

  // Step 3: KYC
  docType: z.string().default("GST Registration Certificate"),
  docImage: z.string().optional(),
  pan: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.trim().length === 0 ||
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.trim().toUpperCase()),
      {
        message:
          "Please enter a valid 10-character PAN (e.g. ABCDE1234F) or leave empty",
      },
    ),
  gstin: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.trim().length === 0 ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          val.trim().toUpperCase(),
        ),
      {
        message:
          "Please enter a valid 15-character GSTIN (e.g. 22AAAAA1111A1Z1) or leave empty",
      },
    ),
  isGstExempt: z.boolean().default(false),

  // Step 4: Bank Details
  bankHolderName: z.string().optional(),
  bankAccountType: z.string().default("current"),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.trim().length === 0 ||
        /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val.trim().toUpperCase()),
      {
        message:
          "Please enter a valid 11-character IFSC code (e.g. HDFC0000123) or leave empty",
      },
    ),
});

/**
 * Field list per wizard step for step-by-step validation guards.
 */
export const STEP_FIELDS = {
  1: ["businessName", "contactEmail", "contactPhone"],
  2: ["address", "city", "pincode"],
  3: ["pan", "gstin"],
  4: ["bankIfsc"],
};
