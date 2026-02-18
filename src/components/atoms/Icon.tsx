"use client";
import { cloneElement } from "react";
import { cn } from "@/utils/cn";

type IconProps = {
  children: React.ReactElement<{ className?: string }>;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass: Record<NonNullable<IconProps["size"]>, string> = {
  sm: "w-4 h-4", // 16px
  md: "w-5 h-5", // 20px
  lg: "w-6 h-6", // 24px
};

export function Icon({ children, size = "md", className }: IconProps) {
  const childClass = cn(sizeClass[size], children.props?.className);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {cloneElement(children, { className: childClass })}
    </span>
  );
}
