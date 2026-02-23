"use client";

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
  const hasRequests = requestCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-9 h-9 items-center justify-center rounded-[10px] text-[#7a9585]",
        "transition-all duration-200 hover:bg-[#e8f5ec] hover:text-[#4a7c59]",
        className
      )}
    >
      <Users size={20} />
      {hasRequests && (
        <span className="absolute top-[6px] right-[6px] h-[7px] w-[7px] rounded-full bg-[#ff8c6b] border-[1.5px] border-white" />
      )}
    </button>
  );
}
