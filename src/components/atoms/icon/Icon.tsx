"use client";

import * as React from "react";

type IconProps = {
  children: React.ReactElement<{ className?: string }>;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClass: Record<NonNullable<IconProps["size"]>, string> = {
  sm: "w-4 h-4", // 16px
  md: "w-5 h-5", // 20px
  lg: "w-6 h-6", // 24px
};

export function Icon({ children, size = "md", className }: IconProps) {
  const childClass = cn(sizeClass[size], children.props?.className);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {React.cloneElement(children, { className: childClass })}
    </span>
  );
}