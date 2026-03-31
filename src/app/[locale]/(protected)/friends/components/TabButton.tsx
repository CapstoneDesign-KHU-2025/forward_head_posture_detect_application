"use client";

import { cn } from "@/utils/cn";

type TabButtonProps = {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export function TabButton({ isActive, onClick, children, className }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer items-center gap-1.5 px-4 pb-2.5 pt-1.5 text-[15px] font-bold transition-colors",
        isActive ? "text-[#4a7c59]" : "text-[#aac8b2] hover:text-[#7a9585]",
        className
      )}
    >
      {isActive && (
        <span
          className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-sm bg-[#4a7c59]"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
