import { cn } from "@/utils/cn";

type BadgeVariant = "count" | "dot";

type BadgeProps = {
  count: number;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ count, variant = "count", className }: BadgeProps) {
  if (count <= 0) return null;

  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-flex h-[7px] w-[7px] items-center justify-center rounded-full bg-[#ff8c6b] border-[1.5px] border-white",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5",
        "bg-[#ff8c6b] text-white text-[13px] font-bold leading-none",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
