import mongoose, { Schema } from "mongoose";
import { COUPON_CATEGORIES, MERCHANT_STATUS } from "@/utils/constants";

/**
 * Merchant profile.
 *
 * One merchant per user (enforced via authId unique index).
 * Status controls visibility: only "approved" merchants can have active coupons.
 *
 * Collection: merchants
 */
const merchantSchema = new Schema(
  {
    // Better Auth user ID of the merchant owner
    authId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },

    // URL-friendly identifier — e.g. "pizza-hut"
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    logo: { type: String }, // Cloudinary URL
    banner: { type: String }, // Cloudinary URL

    category: {
      type: String,
      enum: COUPON_CATEGORIES,
      required: true,
    },

    location: {
      address: { type: String, trim: true },
      pincode: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "IN" },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    contactEmail: { type: String, lowercase: true, trim: true },
    website: { type: String, trim: true },

    status: {
      type: String,
      enum: Object.values(MERCHANT_STATUS),
      default: MERCHANT_STATUS.PENDING,
      index: true,
    },

    // Subscription & Plan gating
    plan: {
      type: String,
      enum: ["starter", "growth", "pro", "enterprise"],
      default: "starter",
      index: true,
    },
    planExpiry: { type: Date, default: null },

    // Brand Page details
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: [1000, "Long description cannot exceed 1000 characters"],
    },
    contactPhone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ["online", "physical", "both"],
      default: "both",
    },
    operatingHours: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Analytics KPIs
    tickerImpressions: { type: Number, default: 0 },
    brandPageViews: { type: Number, default: 0 },
    revivalCredits: { type: Number, default: 0 },
    revivalCreditsUsed: { type: Number, default: 0 },

    // Denormalized counters — updated via background jobs or atomic $inc
    totalCoupons: { type: Number, default: 0 },
    totalRedemptions: { type: Number, default: 0 },
    totalClaims: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },

    autoApproveRevival: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String },

    // KYC Compliance & Statutory Fields
    constitution: {
      type: String,
      enum: ["proprietorship", "partnership", "llp", "pvt_ltd", "others"],
      default: "proprietorship",
    },
    liaisonName: { type: String, trim: true },
    liaisonDesignation: {
      type: String,
      enum: ["owner", "partner", "manager", "others"],
      default: "owner",
    },
    liaisonPhone: { type: String, trim: true },
    regionalHubCity: {
      type: String,
      enum: ["ranchi", "jamshedpur", "dhanbad", "bokaro"],
      default: "ranchi",
    },
    gmapsLink: { type: String, trim: true },
    pan: { type: String, uppercase: true, trim: true },
    gstin: { type: String, uppercase: true, trim: true },
    isGstExempt: { type: Boolean, default: false },
    bankDetails: {
      holderName: { type: String, trim: true },
      accountType: {
        type: String,
        enum: ["current", "savings"],
        default: "current",
      },
      accountNumber: { type: String, trim: true },
      ifsc: { type: String, uppercase: true, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      chequeImage: { type: String }, // Cloudinary URL
    },
    shopImage: { type: String }, // Cloudinary URL
  },
  {
    timestamps: true,
    collection: "merchants",
  },
);

merchantSchema.index({ status: 1, category: 1 });
merchantSchema.index({ "location.city": 1, status: 1 });

const Merchant =
  mongoose.models.Merchant ?? mongoose.model("Merchant", merchantSchema);

export default Merchant;
