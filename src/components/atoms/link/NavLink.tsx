import * as React from "react";
import Link from "next/link";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  /** 현재 페이지면 true → active 스타일 적용 */
  active?: boolean;
  /** 밑줄 여부 */
  underline?: boolean;
  className?: string;
};

export function NavLink({
  href,
  children,
  active = false,
  underline = false,
  className,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "px-3 py-2 text-sm font-medium transition-colors",
        active ? "text-black font-bold" : "text-black/60 hover:text-black",
        underline ? "underline underline-offset-4" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}