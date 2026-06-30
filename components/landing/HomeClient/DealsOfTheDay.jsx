import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductOfferCard from "@/components/shared/ProductOfferCard";
import { TODAY_PRODUCT_DEALS } from "./constants";

export const DealsOfTheDay = () => (
  <section className="text-left w-full">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-brand-text font-heading">
        Deals Of The Day
      </h2>
      <Link
        href="/deals"
        className="text-brand-blue text-xs font-semibold hover:underline flex items-center gap-1 transition-colors"
      >
        <span>View More Deals</span>
        <div className="bg-brand-blue/5 rounded-full w-6 h-6 flex items-center justify-center">
          <ArrowRight className="w-3 h-3 text-brand-blue" />
        </div>
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {TODAY_PRODUCT_DEALS.map((product, idx) => (
        <ProductOfferCard key={idx} product={product} />
      ))}
    </div>
  </section>
);

export default DealsOfTheDay;
