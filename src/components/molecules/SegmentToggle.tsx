"use client";

import { cn } from "@/utils/cn";

type SegmentToggleOption<T extends string = string> = {
  value: T;
  label: string;
};

type SegmentToggleProps<T extends string = string> = {
  options: SegmentToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentToggleProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-white p-[3px] shadow-[0_3px_14px_rgba(74,124,89,0.16)]",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150",
              "[&:not(:last-child)]:mr-1",
              isActive
                ? "bg-[var(--green)] text-white"
                : "bg-transparent text-[var(--text-sub)] hover:bg-[var(--green-light)] hover:text-[var(--green)]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
