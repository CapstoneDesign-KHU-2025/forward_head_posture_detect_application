"use client";

import { Badge } from "@/components/atoms/Badge";
import { Users } from "lucide-react";
import { cn } from "@/utils/cn";

type FriendRequestIndicatorProps = {
  requestCount: number;
  onClick: () => void;
  className?: string;
};

export function FriendRequestIndicator({
  requestCount,
  onClick,
  className,
}: FriendRequestIndicatorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 min-h-11 items-center justify-center gap-2 rounded-[25px] border-2 border-[#d4ead9] bg-white px-5 py-2",
        "font-semibold text-base transition-all duration-300",
        "hover:border-[#6aab7a] hover:bg-[#e8f5ec] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(74,124,89,0.25)]",
        className
      )}
    >
      <Users size={17} className="text-[#4a7c59]" />
      <Badge count={requestCount} />
    </button>
  );
}
