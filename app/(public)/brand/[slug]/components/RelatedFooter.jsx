"use client";

import Link from "next/link";

export default function RelatedFooter({ relatedBrands, merchant }) {
  if (!relatedBrands || relatedBrands.length === 0) return null;

  return (
    <section
      className="w-full bg-white border-t border-gray-100 py-8 select-none"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Related Brands in {merchant.category || "Same Category"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {relatedBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brand/${brand.slug}`}
              className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:border-blue-200 hover:bg-blue-50 flex items-center gap-3 transition-all hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-900 group-hover:bg-blue-600 text-white font-semibold flex items-center justify-center text-sm flex-shrink-0 transition-colors">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={brand.businessName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  brand.businessName?.[0]
                )}
              </div>
              <div className="overflow-hidden">
                <h5 className="font-medium text-[13px] text-gray-800 truncate leading-none group-hover:text-blue-700 transition-colors">
                  {brand.businessName}
                </h5>
                <span className="text-[10px] text-gray-400 font-normal block mt-1 capitalize">
                  {brand.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
