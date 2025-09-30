import * as React from "react";

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  size?: "sm" | "md" | "lg";
};

const sizeClass: Record<NonNullable<TextProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Text({ className, size = "md", ...props }: TextProps) {
  return (
    <p
      className={sizeClass[size] + " text-black/80 leading-relaxed " + (className ?? "")}
      {...props}
    />
  );
}