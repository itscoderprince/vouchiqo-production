import mongoose, { Schema } from "mongoose";

const promoBannerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title/headline is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Explore",
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image URL is required"],
    },
    logo: {
      type: String,
    },
    link: {
      type: String,
      required: [true, "Banner redirect link is required"],
      trim: true,
    },
    slot: {
      type: String,
      enum: ["left-hero", "right-promo"],
      required: true,
      index: true,
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "promo_banners",
  },
);

const PromoBanner =
  mongoose.models.PromoBanner ??
  mongoose.model("PromoBanner", promoBannerSchema);

export default PromoBanner;
