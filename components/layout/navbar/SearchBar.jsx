import { Search } from "lucide-react";

export const SearchBar = () => (
  <div className="flex-1 max-w-[380px] relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    <input
      type="text"
      placeholder="Search for brands, categories"
      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 placeholder-gray-400"
    />
  </div>
);

export default SearchBar;
