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
  return (
    <button
      type="button"
      onClick={onClick}
      title="친구 관리"
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]",
        "text-[var(--text-sub)] transition-all duration-150",
        "hover:bg-[var(--green-light)] hover:text-[var(--green)]",
        className
      )}
    >
      <Users size={24} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {requestCount > 0 && (
        <span
          className="absolute top-1.5 right-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-[#ff8c6b] border-[1.5px] border-white"
          aria-hidden
        />
      )}
    </button>
  );
}
