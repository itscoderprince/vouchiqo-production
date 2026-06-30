"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FlatCouponCard({ coupon }) {
  const { _id, title, discountValue, discountType, merchantId } = coupon;

  const merchantName =
    merchantId?.businessName || merchantId?.name || "Partner";

  const getLogoUrl = () => {
    if (
      merchantId?.logo?.startsWith("/") ||
      merchantId?.logo?.startsWith("http")
    )
      return merchantId.logo;
    const nameLower = merchantName.toLowerCase();
    if (nameLower.includes("burger")) {
      return "/brandlogos/10030.jpg";
    }
    if (nameLower.includes("stylezone")) {
      return "/brandlogos/10021.jpg";
    }
    if (nameLower.includes("techgadgets")) {
      return "/brandlogos/10007.jpg";
    }
    if (nameLower.includes("marbella")) {
      return "/brandlogos/10024.jpg";
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(merchantName)}&backgroundColor=3e80dd&textColor=ffffff`;
  };

  const logoUrl = getLogoUrl();
  const merchantLower = merchantName.toLowerCase();
  const titleLower = title.toLowerCase();

  /* ── LEFT BLOCK: determine the 3-line promo text ── */
  const getPromo = () => {
    // Amazon Prime Day
    if (
      merchantLower.includes("amazon") &&
      (titleLower.includes("prime") || titleLower.includes("day"))
    ) {
      return { top: "AMAZON", mid: "PRIME DAY", bot: "SALE" };
    }
    // End of Season Sale
    if (titleLower.includes("season") && titleLower.includes("sale")) {
      return { top: "END OF", mid: "SEASON", bot: "SALE" };
    }
    // Generic percentage / flat discount
    const isUpTo =
      titleLower.includes("up to") ||
      titleLower.includes("upto") ||
      titleLower.includes("grab up");
    const prefix = isUpTo ? "UP TO" : "FLAT";
    if (discountValue) {
      const valueText =
        discountType === "percentage"
          ? `${discountValue}%`
          : `₹${discountValue}`;
      return { top: prefix, mid: valueText, bot: "OFF" };
    }
    return { top: "SPECIAL", mid: "OFFER", bot: "TODAY" };
  };

  const promo = getPromo();

  /* ── LOGO CONTAINER: brand-specific background ── */
  const getLogoBg = () => {
    if (merchantLower.includes("amazon")) return "#000000";
    if (merchantLower.includes("flipkart")) return "#F7C037";
    return "#ffffff";
  };
  const logoBgColor = getLogoBg();
  const logoHasDarkBg =
    merchantLower.includes("amazon") || merchantLower.includes("flipkart");

  return (
    <div
      className="gh-ec"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        transition: "box-shadow 250ms ease, transform 250ms ease",
        overflow: "hidden",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ── TOP SECTION (amt) ── */}
      <div
        className="amt"
        style={{
          display: "flex",
          alignItems: "stretch",
          padding: "24px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {/* Left promo text (amt-header) */}
        <div
          className="amt-header"
          style={{
            width: "130px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRight: "1px dashed #cbd5e1",
            paddingRight: "16px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#3E80DD",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              lineHeight: 1.2,
            }}
          >
            {promo.top}
          </span>
          <span
            style={{
              display: "block",
              fontSize: "26px",
              fontWeight: 900,
              color: "#3E80DD",
              textTransform: "uppercase",
              lineHeight: 1.1,
              margin: "2px 0",
              wordBreak: "break-word",
            }}
          >
            {promo.mid}
          </span>
          <span
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: "#3E80DD",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              lineHeight: 1.2,
            }}
          >
            {promo.bot}
          </span>
        </div>

        {/* Right description (p) */}
        <p
          style={{
            flex: 1,
            paddingLeft: "16px",
            fontSize: "16px",
            fontWeight: 500,
            color: "#334155",
            lineHeight: 1.5,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </p>
      </div>

      {/* ── FOOTER SECTION (footer-links) ── */}
      <div
        data-div-type="footer-links"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          gap: "16px",
          backgroundColor: "#F8FAFC",
        }}
      >
        {/* Merchant logo container (imw) */}
        <div
          className="imw"
          style={{
            height: "48px",
            width: "88px",
            borderRadius: "6px",
            border: logoHasDarkBg ? "none" : "1px solid #e2e8f0",
            backgroundColor: logoBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={logoUrl}
            alt={merchantName}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* View All Coupons link */}
        <Link
          href={`/deals/${_id}`}
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#3E80DD",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          <span>View All {merchantName} Coupons</span>
          <ExternalLink
            style={{ width: "14px", height: "14px", color: "#3E80DD" }}
          />
        </Link>
      </div>
    </div>
  );
}
