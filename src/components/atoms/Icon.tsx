"use client";
import { cloneElement } from "react";
import { cn } from "@/utils/cn";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type IconProps = {
  children: React.ReactElement<{ className?: string }>;
  size?: IconSize;
  className?: string;
};

const sizeClass: Record<IconSize, string> = {
  xs: "w-4 h-4",     // 16px
  sm: "w-5 h-5",     // 20px
  md: "w-6 h-6",     // 24px
  lg: "w-7 h-7",     // 28px
  xl: "w-9 h-9",     // 36px
  "2xl": "w-14 h-14", // 56px
};

export function Icon({ children, size = "lg", className }: IconProps) {
  const childClass = cn(sizeClass[size], children.props?.className);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {cloneElement(children, { className: childClass })}
    </span>
  );
}
