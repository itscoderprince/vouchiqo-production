"use client";

import { Search, Star, StarOff, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FeaturedDeals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.success && json.data) {
        setCoupons(json.data.coupons || []);
      }
    } catch (err) {
      console.error("Error fetching admin coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleFeatured = async (couponId, isFeatured) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId, isFeatured: !isFeatured }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === couponId ? { ...c, isFeatured: !isFeatured } : c,
          ),
        );
      }
    } catch (err) {
      console.error("Error toggling featured status:", err);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const brand = c.merchantId?.businessName || "";
    const title = c.title || "";
    return (
      brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <DashboardLayout
      title="Featured Deals"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="flex justify-between items-center gap-4">
        <InputGroup className="bg-brand-bg border border-brand-border rounded-lg h-10 px-1 w-full sm:w-60 shadow-none">
          <InputGroupAddon>
            <Search className="w-4 h-4 text-brand-subtext" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs placeholder-brand-subtext h-full"
          />
        </InputGroup>
      </div>

      {/* List */}
      <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto flex-1">
          <Table className="w-full text-xs">
            <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
              <TableRow className="hover:bg-transparent border-b border-brand-border">
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Brand
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Offer details
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Status
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                  Feature Control
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
              {loading
                ? <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="p-8 text-center text-brand-subtext font-semibold h-auto"
                    >
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
                      <span>Loading coupon listings...</span>
                    </TableCell>
                  </TableRow>
                : filteredCoupons.length === 0
                  ? <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={4}
                        className="p-8 text-center text-brand-subtext font-semibold h-auto"
                      >
                        No coupons found matching your search.
                      </TableCell>
                    </TableRow>
                  : filteredCoupons.map((coupon) => (
                      <TableRow
                        key={coupon._id}
                        className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                      >
                        <TableCell className="p-4 font-bold text-brand-navy h-auto">
                          {coupon.merchantId?.businessName || "Unknown Brand"}
                        </TableCell>
                        <TableCell className="p-4">{coupon.title}</TableCell>
                        <TableCell className="p-4">
                          <Badge
                            variant={
                              coupon.isFeatured ? "warning" : "secondary"
                            }
                            className={`rounded-full text-[10px] font-bold py-0.5 px-2.5 border-0 shadow-none ${
                              coupon.isFeatured
                                ? "bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10"
                                : "bg-brand-subtext/15 text-brand-subtext hover:bg-brand-subtext/15"
                            }`}
                          >
                            {coupon.isFeatured
                              ? "Homepage Featured"
                              : "Regular Listing"}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleFeatured(
                                coupon._id,
                                coupon.isFeatured,
                              )
                            }
                            className={`text-xs py-1.5 px-4 font-bold flex items-center gap-1.5 justify-center ml-auto h-auto cursor-pointer shadow-none ${
                              coupon.isFeatured
                                ? "border-brand-warning/30 text-brand-warning hover:bg-brand-warning/5 hover:text-brand-warning"
                                : "border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5 hover:text-brand-blue"
                            }`}
                          >
                            {coupon.isFeatured
                              ? <StarOff className="w-3.5 h-3.5" />
                              : <Star className="w-3.5 h-3.5 fill-current" />}
                            <span>
                              {coupon.isFeatured ? "Unfeature" : "Feature Deal"}
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
