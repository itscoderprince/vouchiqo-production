"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ShoppingBag,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Check,
  Tag,
  MousePointerClick,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MerchantAffiliateProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (search) query.set("search", search);

      const res = await fetch(`/api/merchant/affiliate-products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      } else {
        toast.error("Failed to load affiliate products.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching products.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Affiliate link copied to clipboard! ✂️");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this affiliate product?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/merchant/affiliate-products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Affiliate product deleted successfully.");
      } else {
        toast.error("Failed to delete affiliate product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Affiliate Products" user={{ role: "merchant" }}>
      <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-7xl mx-auto font-sans text-left">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Affiliate Products
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              List products with custom affiliate links (CashKaro, Bitly, EarnKaro, etc.) and track shopper clicks.
            </p>
          </div>

          <Link
            href="/merchant/affiliate-products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Affiliate Product</span>
          </Link>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors font-medium"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {["all", "active", "paused"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                  statusFilter === st
                    ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid / Empty State */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Loading affiliate products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 px-4 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Affiliate Products Listed</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You haven&apos;t created any affiliate products yet. Add products with custom affiliate links (e.g. CashKaro, Bitly) to earn commissions.
              </p>
            </div>
            <Link
              href="/merchant/affiliate-products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Affiliate Product</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map((p) => {
              const savings = p.originalPrice - p.discountPrice;
              const savingsPercent = p.discountPercentage || Math.round((savings / p.originalPrice) * 100);

              return (
                <div
                  key={p._id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs hover:shadow-md hover:border-blue-500/80 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Image + Status Badge */}
                    <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                        {p.category}
                      </div>
                      {savingsPercent > 0 && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs">
                          {savingsPercent}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Title */}
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {p.title}
                    </h3>

                    {/* Pricing Box */}
                    <div className="flex items-baseline gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-base font-black text-blue-600">
                        ₹{p.discountPrice?.toLocaleString()}
                      </span>
                      {p.originalPrice > p.discountPrice && (
                        <span className="text-xs font-semibold text-slate-400 line-through">
                          ₹{p.originalPrice?.toLocaleString()}
                        </span>
                      )}
                      {savings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 ml-auto bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Save ₹{savings.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Affiliate Link Details */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Affiliate Link URL
                      </span>
                      <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-lg border border-slate-200 text-xs">
                        <span className="truncate text-slate-700 font-mono text-[11px] flex-1">
                          {p.affiliateUrl}
                        </span>
                        <button
                          onClick={() => handleCopyLink(p.affiliateUrl, p._id)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
                          title="Copy Affiliate Link"
                        >
                          {copiedId === p._id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={p.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                          title="Test Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
                      <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                      <span>{p.clickCount || 0} clicks</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/merchant/affiliate-products/${p._id}`}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
