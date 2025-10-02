import * as React from "react";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "w-4 h-4 border-2", // 16px
  md: "w-6 h-6 border-2", // 24px
  lg: "w-8 h-8 border-3", // 32px
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={[
        "inline-block rounded-full border-black/30 border-t-black animate-spin",
        sizeClass[size],
        className,
      ].join(" ")}
      role="status"
      aria-label="로딩 중"
    />
  );
}