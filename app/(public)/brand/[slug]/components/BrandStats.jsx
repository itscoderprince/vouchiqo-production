"use client";

export default function BrandStats({ coupons, merchant }) {
  const pctArr = coupons
    .filter((c) => c.discountType === "percentage" && c.discountValue)
    .map((c) => c.discountValue);
  const fixedArr = coupons
    .filter((c) => c.discountType === "fixed" && c.discountValue)
    .map((c) => c.discountValue);
  const hasFreebie = coupons.some((c) => c.discountType === "freebie");

  let discountLabel = "See Deals";
  if (pctArr.length > 0) {
    discountLabel = `Up to ${Math.max(...pctArr)}%`;
  } else if (fixedArr.length > 0) {
    discountLabel = `Up to ₹${Math.max(...fixedArr)}`;
  } else if (hasFreebie) {
    discountLabel = "Freebies";
  }

  const stats = [
    {
      label: "Active Deals",
      value: `${coupons.length}`,
    },
    {
      label: "Best Discount",
      value: discountLabel,
    },
    {
      label: "Channel",
      value: merchant.businessType || "Online",
    },
    {
      label: "Category",
      value: merchant.category || "General",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-left shadow-sm"
        >
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block">
            {s.label}
          </span>
          <span className="text-sm font-semibold text-gray-900 mt-0.5 block capitalize">
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
