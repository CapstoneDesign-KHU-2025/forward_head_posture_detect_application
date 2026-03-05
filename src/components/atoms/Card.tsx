"use client";

import { cn } from "@/utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-[18px] bg-white shadow-soft-card", className)}
      {...props}
    />
  );
}

