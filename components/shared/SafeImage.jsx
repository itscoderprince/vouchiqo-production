"use client";

import Image from "next/image";
import { useState } from "react";

export default function SafeImage({
  src,
  alt = "Image",
  fallbackSrc = "/placeholder-brand.png",
  className = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  style,
  unoptimized = true,
  ...rest
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const finalSrc = hasError || !imgSrc ? fallbackSrc : imgSrc;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      sizes={sizes}
      unoptimized={true}
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
