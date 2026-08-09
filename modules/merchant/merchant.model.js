import mongoose, { Schema } from "mongoose";
import { COUPON_CATEGORIES, MERCHANT_STATUS, normalizeCategory } from "../../utils/constants.js";

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
      set: (val) => normalizeCategory(val),
    },

    customCategoryNotes: {
      type: String,
      trim: true,
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
      default: "starter",
      index: true,
    },
    planExpiry: { type: Date, default: null },

    // Commission Structure
    commissionRate: { type: String, trim: true },
    commissionModel: { type: String, trim: true },
    commissionAgreed: { type: Boolean, default: false },

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
    totalClicks: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
    storePageViews: { type: Number, default: 0 },
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
    docType: { type: String, trim: true },
    docImage: { type: String }, // Cloudinary URL for primary identity document
    gstin: { type: String, uppercase: true, trim: true },
    isGstExempt: { type: Boolean, default: false },
    shopImage: { type: String }, // Cloudinary URL for storefront photo
  },
  {
    timestamps: true,
    collection: "merchants",
  },
);

merchantSchema.pre("save", function () {
  if (
    !this.plan ||
    this.plan === "starter" ||
    String(this.plan).toLowerCase().includes("starter") ||
    String(this.plan).toLowerCase().includes("free")
  ) {
    if (!this.paymentStatus || this.paymentStatus === "pending") {
      this.paymentStatus = "completed";
    }
    if (!this.subscriptionStatus || this.subscriptionStatus === "pending") {
      this.subscriptionStatus = "active";
    }
  }

  if (this.gstin !== undefined) {
    const cleanGstin = String(this.gstin || "").trim().toUpperCase();
    if (!cleanGstin) {
      this.gstin = undefined;
    } else {
      this.gstin = cleanGstin;
    }
  }

  if (this.contactEmail !== undefined) {
    const cleanEmail = String(this.contactEmail || "").trim().toLowerCase();
    if (!cleanEmail) {
      this.contactEmail = undefined;
    } else {
      this.contactEmail = cleanEmail;
    }
  }

  if (this.contactPhone !== undefined) {
    const cleanPhone = String(this.contactPhone || "").trim();
    if (!cleanPhone) {
      this.contactPhone = undefined;
    } else {
      this.contactPhone = cleanPhone;
    }
  }

  if (this.liaisonPhone !== undefined) {
    const cleanLiaison = String(this.liaisonPhone || "").trim();
    if (!cleanLiaison) {
      this.liaisonPhone = undefined;
    } else {
      this.liaisonPhone = cleanLiaison;
    }
  }
});

merchantSchema.index({ status: 1, category: 1 });
merchantSchema.index({ "location.city": 1, status: 1 });
merchantSchema.index({ contactEmail: 1 }, { unique: true, sparse: true });
merchantSchema.index({ contactPhone: 1 }, { unique: true, sparse: true });
merchantSchema.index({ liaisonPhone: 1 }, { unique: true, sparse: true });
merchantSchema.index({ gstin: 1 }, { unique: true, sparse: true });

delete mongoose.models.Merchant;
if (mongoose.modelSchemas) delete mongoose.modelSchemas.Merchant;

const Merchant = mongoose.model("Merchant", merchantSchema);

export default Merchant;
