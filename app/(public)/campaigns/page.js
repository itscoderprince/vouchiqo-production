import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import CampaignsClient from "./campaigns-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Festival Offers, Coupon Codes & Holiday Deals | Vouchiqo",
  description:
    "Find active verified festival coupons, holiday discount codes and sales from top stores and brands on Vouchiqo.",
};

export default function CampaignsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fa]">
      <Navbar />
      <CampaignsClient />
      <Footer />
    </div>
  );
}
