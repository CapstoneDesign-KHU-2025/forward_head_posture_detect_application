import { cn } from "@/utils/cn";

type ChipProps = {
  children: React.ReactNode;
  className?: string;
};

export function Chip({ children, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-lg border px-2 py-1",
        "text-[13px] font-semibold text-[#aac8b2]",
        "border-[#e4f0e8] bg-[var(--green-pale)]",
        className
      )}
    >
      {children}
    </span>
  );
}
