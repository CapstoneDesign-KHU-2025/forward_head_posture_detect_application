"use client";

import { UserAvatar } from "@/components/atoms/UserAvatar";
import { cn } from "@/utils/cn";

type UserRowProps = {
  name: string;
  email: string;
  initial: string;
  bgColor?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function UserRow({
  name,
  email,
  initial,
  actions,
  className,
  bgColor = "#6aab7a",
}: UserRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-[#eef6f0] py-2.5 last:border-b-0",
        className
      )}
    >
      <UserAvatar initial={initial} bgColor={bgColor} />
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-[#2d3b35]">{name}</div>
        <div className="text-sm text-[#7a9585]">{email}</div>
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-1.5">{actions}</div>
      )}
    </div>
  );
}
