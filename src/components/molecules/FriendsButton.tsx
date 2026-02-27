 "use client";

import { Icon } from "@/components/atoms/Icon";
import { Badge } from "@/components/atoms/Badge";
import { Users } from "lucide-react";
import { cn } from "@/utils/cn";

type FriendsButtonProps = {
  requestCount: number;
  onClick: () => void;
  className?: string;
};

export function FriendsButton({
  requestCount,
  onClick,
  className,
}: FriendsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="친구 관리"
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]",
        "text-[var(--text-sub)] transition-all duration-150",
        "hover:bg-[var(--green-light)] hover:text-[var(--green)]",
        className,
      )}
    >
      <Icon size="md">
        <Users strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Icon>
      {requestCount > 0 && (
        <div className="absolute top-1.5 right-1.5">
          <Badge count={requestCount} variant="dot" />
        </div>
      )}
    </button>
  );
}