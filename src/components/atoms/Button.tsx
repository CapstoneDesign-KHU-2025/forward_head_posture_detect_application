import * as React from "react";
import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex items-center justify-center rounded-md font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

// 색상 스타일 (variant)
const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[#2D5F2E] text-white hover:bg-[#4A9D4D] focus-visible:ring-[#2D5F2E] ring-offset-white",
  secondary: "bg-white text-[#2D5F2E] border border-[#4A9D4D] hover:bg-[#F8FBF8] focus-visible:ring-[#4A9D4D] ring-offset-white",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          "px-6 py-3 min-h-[48px]", // 패딩 기반 크기, 최소 높이만 설정
          variantClass[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
