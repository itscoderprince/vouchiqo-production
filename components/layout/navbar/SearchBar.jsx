"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/brands?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      router.push(`/brands?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer hover:text-[#2563eb] transition-colors"
        onClick={handleSearchClick}
      />
      <input
        type="text"
        placeholder="Search for brands, categories"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 placeholder-gray-400"
      />
    </div>
  );
};

export default SearchBar;
