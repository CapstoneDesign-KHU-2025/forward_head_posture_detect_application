import * as React from "react";
import { cn } from "@/util/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};


const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

// 색상 스타일 (variant)
const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-black text-white hover:bg-black/90 focus-visible:ring-black ring-offset-white",
  secondary:
    "bg-white text-black border border-black/10 hover:bg-black/5 focus-visible:ring-black ring-offset-white",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          "w-[240px] h-[48px]", // 고정 크기
          variantClass[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";