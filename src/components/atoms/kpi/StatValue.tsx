type StatValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** 보통 숫자(15, 10 등), 필요하면 아이콘/노드도 가능 */
  children: React.ReactNode;
  /** 크기 */
  size?: "sm" | "md" | "lg" | "xl";
  /** 더 강하게(폰트 굵기 업) */
  strong?: boolean;
};
import { cn } from "@/utils/cn";

const sizeClass: Record<NonNullable<StatValueProps["size"]>, string> = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-[2.5rem]",
  xl: "text-[2.5rem]",
};

export function StatValue({ className, children, size = "lg", strong = true, ...props }: StatValueProps) {
  return (
    <span
      className={cn(
        sizeClass[size],
        strong ? "font-extrabold" : "font-semibold",
        "tracking-tight text-[#2D5F2E]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
