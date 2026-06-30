"use client";

import Link from "next/link";

export default function BrandGridItem({ name, logo, href }) {
  return (
    <Link
      href={href}
      className="bg-brand-bg rounded-lg p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-brand-border hover:shadow-md hover:scale-[1.03] hover:border-brand-blue/30 transition-all select-none group text-center"
    >
      <div className="h-8 w-full flex items-center justify-center overflow-hidden">
        <img
          src={logo}
          alt={name}
          className="h-full max-w-full object-contain transition-all duration-300"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
          }}
        />
      </div>
      <span className="text-[10px] text-brand-subtext font-bold uppercase tracking-wider group-hover:text-brand-blue transition-colors">
        {name}
      </span>
    </Link>
  );
}
