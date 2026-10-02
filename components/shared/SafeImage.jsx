"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function SafeImage({
  src,
  alt = "Image",
  fallbackSrc = "/placeholder-brand.png",
  className = "",
  fill = false,
  width,
  height,
  priority = false,
  loading,
  fetchPriority,
  sizes,
  style,
  unoptimized,
  ...rest
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Sync state if src or fallbackSrc changes
  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const finalSrc = hasError || !imgSrc ? fallbackSrc : imgSrc;

  // Determine if image should bypass Next.js image optimization (e.g. data URI, blob, or svg)
  const isDataOrBlob =
    typeof finalSrc === "string" &&
    (finalSrc.startsWith("data:") ||
      finalSrc.startsWith("blob:") ||
      finalSrc.endsWith(".svg") ||
      finalSrc.includes("data:image"));
  const shouldBeUnoptimized =
    typeof unoptimized === "boolean" ? unoptimized : isDataOrBlob;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      loading={priority ? undefined : (loading || "lazy")}
      fetchPriority={fetchPriority}
      sizes={sizes}
      unoptimized={shouldBeUnoptimized}
      className={className}
      style={style}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      {...rest}
    />
  );
}
