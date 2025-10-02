"use client";

import * as React from "react";

type AvatarProps = {
  /** 이미지 주소 (없거나 로드 실패 시 fallback 표시) */
  src?: string;
  /** 대체 텍스트 (접근성용) */
  alt?: string;
  /** 크기 */
  size?: "sm" | "md" | "lg" | "xl";
  /** 이미지 없을 때 보여줄 노드 */
  fallback?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClass: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-8 h-8 text-xs",     // 32px
  md: "w-10 h-10 text-sm",   // 40px
  lg: "w-12 h-12 text-base", // 48px
  xl: "w-14 h-14 text-lg",   // 56px
};

export function Avatar({
  src,
  alt = "",
  size = "md",
  fallback,
  className,
}: AvatarProps) {
  const [error, setError] = React.useState(false);

  const img = src && !error ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-full"
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <div
      className="flex w-full h-full items-center justify-center bg-black/5 text-black/60 rounded-full select-none"
      aria-hidden="true"
    >
      {fallback ?? "•"}
    </div>
  );

  return (
    <span
      className={cn(
        "inline-flex overflow-hidden rounded-full",
        sizeClass[size],
        className
      )}
    >
      {img}
    </span>
  );
}