import Link from "next/link";

export const PopularCategories = () => {
  const CATEGORIES = [
    "Flight Coupons",
    "Fashion Coupons",
    "Electronics Coupons",
    "Groceries Coupons",
    "Travel Coupons",
    "Medicines Coupons",
    "Bus Coupons",
    "Education Coupons",
    "Hotel Coupons",
    "Kitchen Appliances Coupons",
    "OTT Coupons",
    "Hosting Coupons",
    "Pizza Coupons",
    "Services Coupons",
    "Footwear Coupons",
    "Lingerie Coupons",
    "Entertainment Coupons",
    "Bike Rentals Coupons",
    "Furniture Coupons",
    "Recharge Coupons",
    "Utility Bill Payments Coupons",
    "Gifts & Flowers Coupons",
    "Jewellery Coupons",
    "Protein Supplements Coupons",
    "Lab Tests Coupons",
    "Eyewear Coupons",
    "Kids & Lifestyle Coupons",
    "Beauty Coupons",
    "Meat & Dairy Coupons",
  ];

  return (
    <section className="text-left w-full py-8 border-t border-brand-border">
      <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-6 font-heading">
        Popular Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-8 text-xs font-semibold text-brand-subtext uppercase tracking-wider">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href="/deals"
            className="hover:text-brand-blue transition-colors"
          >
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularCategories;
