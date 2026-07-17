"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import {
  useCoupon,
  useUpdateCoupon,
  validateExpiryDate,
} from "@/hooks/use-coupons";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { COUPON_CATEGORIES } from "@/utils/constants";
import CouponForm from "../components/CouponForm";

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const { data: coupon, isLoading, error } = useCoupon(id);
  const { data: merchant } = useMerchantProfile();
  const updateMutation = useUpdateCoupon(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    category: "food",
    discountType: "percentage",
    discountValue: "",
    originalPrice: "",
    salePrice: "",
    dealUrl: "",
    expiresAt: "",
    maxClaims: "",
    image: "",
    status: "active",
    isFeatured: false,
  });

  // Prefill form when data is loaded
  useEffect(() => {
    if (coupon) {
      let expDateStr = "";
      if (coupon.expiresAt) {
        const d = new Date(coupon.expiresAt);
        if (!Number.isNaN(d.getTime())) {
          expDateStr = d.toISOString().split("T")[0];
        }
      }

      setFormData({
        title: coupon.title || "",
        description: coupon.description || "",
        code: coupon.code || "",
        category: coupon.category || "food",
        discountType: coupon.discountType || "percentage",
        discountValue:
          coupon.discountValue !== undefined
            ? String(coupon.discountValue)
            : "",
        originalPrice:
          coupon.originalPrice !== undefined
            ? String(coupon.originalPrice)
            : "",
        salePrice:
          coupon.salePrice !== undefined ? String(coupon.salePrice) : "",
        dealUrl: coupon.dealUrl || "",
        expiresAt: expDateStr,
        maxClaims:
          coupon.maxClaims !== undefined && coupon.maxClaims !== null
            ? String(coupon.maxClaims)
            : "",
        image: coupon.image || "",
        status: coupon.status || "active",
        isFeatured: coupon.isFeatured || false,
      });
    }
  }, [coupon]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Offer title is required.");
      return;
    }

    if (!validateExpiryDate(formData.expiresAt)) return;

    const parsedMaxClaims = parseInt(formData.maxClaims, 10);
    const parsedDiscount = parseFloat(formData.discountValue);

    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      code: formData.code.trim().toUpperCase(),
      expiresAt: new Date(formData.expiresAt).toISOString(),
      discountType: formData.discountType,
      // Only send discountValue if it is a valid positive number
      discountValue:
        formData.discountType !== "freebie" &&
        !Number.isNaN(parsedDiscount) &&
        parsedDiscount > 0
          ? parsedDiscount
          : undefined,
      // Only send maxClaims if it is a valid positive integer
      maxClaims:
        !Number.isNaN(parsedMaxClaims) && parsedMaxClaims > 0
          ? parsedMaxClaims
          : undefined,
      image: formData.image || undefined,
      isFeatured: formData.isFeatured,
      originalPrice:
        formData.discountType === "fixed" && formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
      salePrice:
        formData.discountType === "fixed" && formData.salePrice
          ? parseFloat(formData.salePrice)
          : undefined,
      dealUrl: formData.dealUrl || undefined,
    };

    updateMutation.mutate(payload);
  };

  // Navigate on success
  useEffect(() => {
    if (updateMutation.isSuccess) {
      router.push("/merchant/coupons");
    }
  }, [updateMutation.isSuccess, router]);

  if (updateMutation.isSuccess) {
    return (
      <DashboardLayout title="Saving Changes..." user={{ role: "merchant" }}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Offer Listing" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="form" />
      </DashboardLayout>
    );
  }

  if (error || !coupon) {
    return (
      <DashboardLayout title="Edit Offer Listing" user={{ role: "merchant" }}>
        <div className="text-center py-20 text-brand-error font-semibold space-y-4">
          <p>{error?.message || "Failed to load coupon details."}</p>
          <Link
            href="/merchant/coupons"
            className="text-xs text-brand-blue font-bold hover:underline"
          >
            Back to Coupons list
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Offer Listing"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <Link
            href="/merchant/coupons"
            className="flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-blue"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Listings</span>
          </Link>
          <span className="text-[10px] bg-brand-surface border border-brand-border px-2 py-0.5 rounded font-bold text-brand-subtext">
            ID: {id}
          </span>
        </div>

        <CouponForm
          formData={formData}
          setFormData={setFormData}
          listingType={
            formData.discountType === "freebie"
              ? "special"
              : formData.discountType === "fixed"
                ? "deal"
                : "coupon"
          }
          handleSubmit={handleSubmit}
          isPending={updateMutation.isPending}
          submitText="Save Offer Changes"
          isEdit={true}
          couponCategories={COUPON_CATEGORIES}
          merchantPlan={merchant?.plan}
        />
      </div>
    </DashboardLayout>
  );
}
