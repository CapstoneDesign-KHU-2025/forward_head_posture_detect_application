import * as React from "react";

type SkeletonProps = {
  /** 모양: 텍스트 줄, 네모 박스, 원형 */
  variant?: "text" | "rect" | "circle";
  /** 크기 */
  width?: number | string;
  height?: number | string;
  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  className,
}: SkeletonProps) {
  const baseClass =
    "animate-pulse bg-black/10 dark:bg-white/10 rounded";

  const shapeClass =
    variant === "text"
      ? "h-4 rounded"
      : variant === "circle"
      ? "rounded-full"
      : "rounded-md";

  return (
    <div
      className={cn(baseClass, shapeClass, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}