"use client";

import { cn } from "@/utils/cn";

export type StatusPillVariant =
  | "idle"
  | "guide"
  | "warn"
  | "count"
  | "good"
  | "bad"
  | "stopped";

type StatusPillProps = {
  variant: StatusPillVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<
  StatusPillVariant,
  { pill: string; dot: string }
> = {
  idle: {
    pill: "bg-[#f0f4f2] border border-[var(--green-border)] text-[var(--text-muted)]",
    dot: "bg-[var(--text-muted)]",
  },
  guide: {
    pill: "bg-[#fff8e6] border border-[#f0d898] text-[#b07820]",
    dot: "bg-[#e0a030] animate-status-pulse",
  },
  warn: {
    pill: "bg-[#fff0ee] border border-[#f0c0b8] text-[#c03020]",
    dot: "bg-[#e05040] animate-status-pulse",
  },
  count: {
    pill: "bg-[#eef0ff] border border-[#c0c8f0] text-[#4060b0]",
    dot: "bg-[#6080d0] animate-status-blink",
  },
  good: {
    pill: "bg-[var(--green-light)] border border-[var(--green-border)] text-[var(--green)]",
    dot: "bg-[var(--green-mid)] animate-status-pulse",
  },
  bad: {
    pill: "bg-[#fff0ee] border border-[#f0b0a8] text-[#b02010]",
    dot: "bg-[#d03020] animate-status-pulse",
  },
  stopped: {
    pill: "bg-[#f0f2f0] border border-[#d0d8d0] text-[#6a7a70]",
    dot: "bg-[#aabab5]",
  },
};

export function StatusPill({ variant, children, className }: StatusPillProps) {
  const styles = variantStyles[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-[20px] px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap flex-shrink-0",
        styles.pill,
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 flex-shrink-0 rounded-full",
          styles.dot,
        )}
        aria-hidden
      />
      {children}
    </span>
  );
}
