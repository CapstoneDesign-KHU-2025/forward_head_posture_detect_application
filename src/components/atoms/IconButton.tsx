"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "md" | "sm" | "xs";
  variant?: "ghost" | "outline" | "calendar";
  icon: React.ReactNode;
  ariaLabel?: string;
};

const base =
  "inline-flex items-center justify-center rounded-[10px] transition-colors duration-200 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--green)] ring-offset-white " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const sizeClass: Record<NonNullable<IconButtonProps["size"]>, string> = {
  md: "h-10 w-10",
  sm: "h-8 w-8",
  xs: "h-[22px] w-[22px]",
};

const variantClass: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ghost: "text-[var(--text-sub)] hover:bg-[var(--green-light)] hover:text-[var(--green)]",
  outline:
    "rounded-lg border border-[#d4ead9] bg-[#f4faf6] text-xs text-[#7a9585] transition-colors hover:bg-[#e8f5ec]",
  calendar:
    "rounded-full bg-[#e8f5ec] font-bold text-[#4a7c59] transition-colors hover:bg-[#d4ead9]",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", variant = "ghost", icon, ariaLabel, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        aria-label={ariaLabel}
        className={cn(base, sizeClass[size], variantClass[variant], className)}
        {...props}
      >
        <span aria-hidden="true" className="flex size-full items-center justify-center leading-none [&_svg]:block">
          {icon}
        </span>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

