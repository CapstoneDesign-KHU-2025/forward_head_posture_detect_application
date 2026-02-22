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
        "flex items-center gap-1.5 rounded-[20px] border border-[#d4ead9] bg-white px-3.5 py-1.5",
        "font-medium transition-colors hover:border-[#6aab7a] hover:bg-[#e8f5ec]",
        className
      )}
    >
      <Users size={17} className="text-[#4a7c59]" />
      <Badge count={requestCount} />
    </button>
  );
}
