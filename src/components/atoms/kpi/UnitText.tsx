import * as React from "react";

type UnitTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** 단위 표기: °, %, h, 회 등 */
  children: React.ReactNode;
  /** 크기(StatValue 대비 비율 유지용) */
  size?: "sm" | "md";
  /** 베이스라인 맞춤(StatValue 옆에 붙일 때 권장) */
  alignBaseline?: boolean;
  /** 흐릿하게 표시할지 */
  muted?: boolean;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClass: Record<NonNullable<UnitTextProps["size"]>, string> = {
  sm: "text-base md:text-lg",
  md: "text-lg md:text-xl",
};

export function UnitText({
  className,
  children,
  size = "sm",
  alignBaseline = true,
  muted = true,
  ...props
}: UnitTextProps) {
  return (
    <span
      className={cn(
        sizeClass[size],
        alignBaseline && "align-baseline",
        muted ? "text-black/60" : "text-black",
        "font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}