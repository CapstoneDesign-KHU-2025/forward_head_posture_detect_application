"use client";

import { cn } from "@/utils/cn";

type ToastProps = {
  message: string;
  isVisible: boolean;
  className?: string;
};

export function Toast({ message, isVisible, className }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 whitespace-nowrap",
        "rounded-[30px] bg-[#4a7c59] px-6 py-2.5 text-[15px] font-medium text-white",
        "transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0",
        className
      )}
    >
      {message}
    </div>
  );
}
