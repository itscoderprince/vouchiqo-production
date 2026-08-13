"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AffiliateProductPreviewCard, { CATEGORIES } from "./components/AffiliateProductPreviewCard";

export default function MerchantAffiliateProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.set("status", statusFilter);

      const res = await fetch(`/api/merchant/affiliate-products?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
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

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Affiliate link copied to clipboard!");
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === "active" ? "paused" : "active";
    setTogglingId(product._id);
    try {
      const res = await fetch(`/api/merchant/affiliate-products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, status: nextStatus } : p))
        );
        toast.success(`Product listing set to ${nextStatus}`);
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status.");
    } finally {
      setTogglingId(null);
    }
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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.affiliateUrl.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  // Statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const totalClicks = products.reduce((acc, p) => acc + (p.clickCount || 0), 0);
  const avgSavingsPct =
    totalProducts > 0
      ? Math.round(
          products.reduce((acc, p) => acc + (p.discountPercentage || 0), 0) /
            totalProducts
        )
      : 0;

  return (
    <DashboardLayout title="Affiliate Products" user={{ role: "merchant" }}>
      <div className="w-full max-w-full space-y-4 font-sans text-left">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Affiliate Products
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              List deals with custom affiliate links (CashKaro, Bitly, EarnKaro) and track shopper engagement.
            </p>
          </div>

          <Link
            href="/merchant/affiliate-products/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Affiliate Product</span>
          </Link>
        </div>

        {/* Clean Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Total Products
            </span>
            <span className="text-xl font-bold text-slate-900 leading-none block">
              {totalProducts}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Active Listings
            </span>
            <span className="text-xl font-bold text-emerald-600 leading-none block">
              {activeProducts}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Total Clicks
            </span>
            <span className="text-xl font-bold text-purple-600 leading-none block">
              {totalClicks}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Avg Discount
            </span>
            <span className="text-xl font-bold text-amber-600 leading-none block">
              {avgSavingsPct}% OFF
            </span>
          </div>
        </div>

        {/* Search, Category & Status Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 w-full">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products or links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors font-normal"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              {["all", "active", "paused"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid - Full Width Responsive Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-medium text-slate-500">
            Loading affiliate products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                No affiliate products found
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {search || categoryFilter !== "all"
                  ? "Try adjusting your search or category filter."
                  : "Start listing your products and earn commissions on clicks."}
              </p>
            </div>
            <Link
              href="/merchant/affiliate-products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Product</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4.5 w-full">
            {filteredProducts.map((product) => (
              <AffiliateProductPreviewCard
                key={product._id}
                product={product}
                isPreview={false}
                onCopy={handleCopyLink}
                onEdit={(p) => window.location.assign(`/merchant/affiliate-products/${p._id}`)}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                isDeleting={deletingId === product._id}
                isToggling={togglingId === product._id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
