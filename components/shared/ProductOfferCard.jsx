"use client";

export default function ProductOfferCard({ product }) {
  const {
    title,
    originalPrice,
    discountPrice,
    discountText,
    merchantName,
    merchantLogo,
    productImage,
    href = "#",
  } = product;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden relative group flex flex-col justify-between h-[380px] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 select-none text-left">
      {/* Upper image area */}
      <div className="relative p-6 flex-grow flex items-center justify-center bg-slate-50/50">
        {/* Merchant Logo Badge (top left) */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center p-1 border border-slate-200/80 z-10">
          <img
            src={merchantLogo}
            alt={merchantName}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Product image */}
        <img
          src={productImage}
          alt={title}
          className="h-32 object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
          }}
        />

        {/* Discount Badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#EA384D] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {discountText}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 border-t border-slate-100 flex flex-col gap-3 bg-white">
        <div className="flex flex-col gap-1 min-h-[52px]">
          <span className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
            {title}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            By {merchantName}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-black text-slate-900">
            ₹{discountPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-400 line-through font-medium">
            ₹{originalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-extrabold text-[12px] tracking-wider uppercase rounded-xl transition-all duration-300 text-center shadow-sm cursor-pointer border-none"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
