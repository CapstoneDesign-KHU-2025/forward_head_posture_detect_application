import { cn } from "@/utils/cn";

type BadgeProps = {
  count: number;
  className?: string;
};

export function Badge({ count, className }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5",
        "bg-orange text-white text-[13px] font-bold leading-none",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
