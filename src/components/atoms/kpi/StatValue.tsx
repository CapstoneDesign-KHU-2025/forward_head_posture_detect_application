import * as React from "react";

type StatValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** 보통 숫자(15, 10 등), 필요하면 아이콘/노드도 가능 */
  children: React.ReactNode;
  /** 크기 */
  size?: "sm" | "md" | "lg" | "xl";
  /** 더 강하게(폰트 굵기 업) */
  strong?: boolean;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClass: Record<NonNullable<StatValueProps["size"]>, string> = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
  xl: "text-4xl md:text-5xl",
};

export function StatValue({
  className,
  children,
  size = "lg",
  strong = true,
  ...props
}: StatValueProps) {
  return (
    <span
      className={cn(
        sizeClass[size],
        strong ? "font-extrabold" : "font-semibold",
        "tracking-tight text-black",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}