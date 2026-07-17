import DealsClient from "./deals-client";

export const dynamic = "force-dynamic";

/**
 * Metadata definitions for search crawler optimization (SEO).
 */
export const metadata = {
  title: "Verified Deals, Coupon Codes & Promo Links | Vouchiqo",
  description:
    "Discover 100% verified coupons, promotional discount codes, retail deals, and seasonal offers on the Vouchiqo savings catalog.",
  openGraph: {
    title: "Verified Deals, Coupon Codes & Promo Links | Vouchiqo",
    description:
      "Discover 100% verified coupons, promotional discount codes, retail deals, and seasonal offers on the Vouchiqo savings catalog.",
    type: "website",
  },
};

export default function DealsPage() {
  return <DealsClient />;
}
