import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import { getCouponById } from "@/modules/coupon/coupon.service";
import DealDetailsClient from "./deal-details-client";

export const dynamic = "force-dynamic";

/**
 * Generate dynamic SEO metadata for the deal page.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  await connectDB();

  try {
    const coupon = await getCouponById(id);
    const brandName = coupon.merchantId?.businessName || "Verified Partner";
    const discountText =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;

    const title = `${discountText} ${brandName} Coupon - ${coupon.title} | Vouchiqo`;
    const description =
      coupon.description ||
      `Get ${discountText} at ${brandName} with Vouchiqo's verified coupon code: ${coupon.code}. 100% working and community tested.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch (err) {
    return {
      title: "Coupon Deal Not Found | Vouchiqo",
      description:
        "The requested discount code could not be found or has expired.",
    };
  }
}

/**
 * Server Component fetching the coupon details and injecting JSON-LD.
 */
export default async function CouponPage({ params }) {
  const { id } = await params;
  await connectDB();

  let coupon;
  let relatedCoupons = [];

  try {
    coupon = await getCouponById(id);

    // Fetch up to 3 similar coupons in the same category
    const rawRelated = await Coupon.find({
      category: coupon.category,
      status: "active",
      expiresAt: { $gt: new Date() },
      _id: { $ne: coupon._id },
    })
      .populate("merchantId", "businessName slug logo")
      .limit(3)
      .lean();

    relatedCoupons = JSON.parse(JSON.stringify(rawRelated || []));
  } catch (err) {
    console.error("Error loading deal page:", err);
    notFound();
  }

  const brandName = coupon.merchantId?.businessName || "Verified Partner";

  // JSON-LD structured data Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: coupon.title,
    description:
      coupon.description || `Claim ${coupon.title} coupon code on Vouchiqo.`,
    price: "0",
    priceCurrency: "INR",
    eligibleRegion: {
      "@type": "Place",
      name: coupon.location?.city || "India",
    },
    offeredBy: {
      "@type": "Merchant",
      name: brandName,
    },
    seller: {
      "@type": "Organization",
      name: "Vouchiqo",
      url: "https://vouchiqo.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DealDetailsClient
        coupon={JSON.parse(JSON.stringify(coupon))}
        relatedCoupons={relatedCoupons}
      />
    </>
  );
}
