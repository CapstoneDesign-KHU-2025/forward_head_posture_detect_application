import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "lg" | "md" | "sm";
};

const base =
  "inline-flex items-center justify-center font-semibold transition-all duration-200 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--green)] text-white border border-transparent hover:bg-[var(--green-dark)] " +
    "focus-visible:ring-[var(--green)] ring-offset-white",

  secondary:
    "bg-white text-[var(--text-sub)] border border-[var(--green-border)] hover:bg-[var(--green-pale)] " +
    "focus-visible:ring-[var(--green)] ring-offset-white",

  danger:
    "bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)] hover:bg-[#ffe5e0] " +
    "focus-visible:ring-[var(--danger-text)] ring-offset-white",

  ghost: "bg-transparent border-none p-0 min-h-0 shadow-none font-normal",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  lg:
    "px-10 py-[13px] text-[15px] rounded-[14px] shadow-[0_4px_14px_rgba(74,124,89,0.3)] " +
    "hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(74,124,89,0.4)]",

  md: "px-5 py-2.5 text-[13px] rounded-[10px]",

  sm: "px-[14px] py-[7px] text-[12px] rounded-[10px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return <button ref={ref} className={cn(base, sizeClass[size], variantClass[variant], className)} {...props} />;
  },
);

Button.displayName = "Button";
