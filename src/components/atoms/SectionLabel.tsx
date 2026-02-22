import { cn } from "@/utils/cn";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "mb-1 pt-1 text-[11px] font-bold tracking-wide text-[#aac8b2]",
        className
      )}
    >
      {children}
    </div>
  );
}
