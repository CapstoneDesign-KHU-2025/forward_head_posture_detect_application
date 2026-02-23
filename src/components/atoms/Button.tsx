import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex items-center justify-center rounded-[14px] font-bold text-[15px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

// HTML 디자인 시안 기준 (home_final)
const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#4a7c59] text-white shadow-[0_4px_14px_rgba(74,124,89,0.3)] hover:bg-[#3a6147] hover:-translate-y-0.5 focus-visible:ring-[#4a7c59] ring-offset-white",
  secondary:
    "bg-white text-[#4a7c59] border border-[#d4ead9] hover:bg-[#e8f5ec] focus-visible:ring-[#4a7c59] ring-offset-white",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, "px-8 py-3.5", variantClass[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
