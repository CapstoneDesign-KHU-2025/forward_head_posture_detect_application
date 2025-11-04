import * as React from "react";
import { cn } from "@/utils/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** 색상 계열 */
  variant?: "neutral" | "success" | "warning" | "danger";
  /** 크기 */
  size?: "sm" | "md";
  /** 칩 모양 정도 */
  rounded?: "sm" | "md" | "full";
  /** 증감 표시: up=▲, down=▼ (없으면 표시 안 함) */
  delta?: "up" | "down";
  /** delta 아이콘을 텍스트 앞에 둘지 뒤에 둘지 */
  deltaPosition?: "start" | "end";
};

const variantClass: Record<NonNullable<BadgeProps["variant"]>, { bg: string; text: string; border: string }> = {
  neutral: { bg: "bg-black/5", text: "text-black", border: "border-black/10" },
  success: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  warning: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200" },
  danger: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const sizeClass: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "text-xs h-6 px-2",
  md: "text-sm h-7 px-2.5",
};

const radiusClass: Record<NonNullable<BadgeProps["rounded"]>, string> = {
  sm: "rounded",
  md: "rounded-md",
  full: "rounded-full",
};

export function Badge({
  className,
  children,
  variant = "neutral",
  size = "sm",
  rounded = "md",
  delta,
  deltaPosition = "start",
  ...props
}: BadgeProps) {
  const palette = variantClass[variant];
  const arrow = delta === "up" ? "▲" : delta === "down" ? "▼" : null;

  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-1 border font-medium",
        palette.bg,
        palette.text,
        palette.border,
        sizeClass[size],
        radiusClass[rounded],
        className
      )}
      {...props}
    >
      {delta && deltaPosition === "start" ? <span aria-hidden>{arrow}</span> : null}
      <span>{children}</span>
      {delta && deltaPosition === "end" ? <span aria-hidden>{arrow}</span> : null}
    </span>
  );
}
