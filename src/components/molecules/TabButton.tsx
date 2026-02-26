"use client";

import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

type TabButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  badgeCount?: number;
};

export function TabButton({ isActive, badgeCount, children, className, ...props }: TabButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-t-[10px] px-2 py-2.5",
        "text-[15px] font-semibold transition-all",
        isActive
          ? "bg-white text-[#4a7c59]"
          : "bg-transparent text-white/80 hover:bg-white/15",
        className
      )}
      {...props}
    >
      {children}
      {badgeCount != null && badgeCount > 0 && (
        <Badge count={badgeCount} className="h-[20px] min-w-[20px]" />
      )}
    </button>
  );
}
