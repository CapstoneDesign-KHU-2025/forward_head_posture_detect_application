"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "md" | "sm";
  variant?: "ghost" | "filled" | "outline";
  icon: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center rounded-[10px] transition-colors duration-200 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--green)] ring-offset-white " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const sizeClass: Record<NonNullable<IconButtonProps["size"]>, string> = {
  md: "h-10 w-10 text-[18px]",
  sm: "h-8 w-8 text-[14px]",
};

const variantClass: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ghost: "text-[var(--text-sub)] hover:bg-[var(--green-light)] hover:text-[var(--green)]",
  filled:
    "bg-[var(--green-light)] text-[var(--green)] hover:bg-[var(--green)] hover:text-white",
  outline:
    "bg-[var(--green-pale)] text-[var(--text-sub)] border border-[var(--green-border)] hover:bg-[var(--green-light)]",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", variant = "ghost", icon, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(base, sizeClass[size], variantClass[variant], className)}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

