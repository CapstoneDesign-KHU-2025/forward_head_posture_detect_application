import React from "react";
import { NavLink } from "@/components/atoms/link/NavLink";

type NavItemProps = {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactElement; // 아이콘은 선택적으로 받음
  active?: boolean;
  underline?: boolean;
  className?: string;
};

export default function NavItem({
  href,
  children,
  icon,
  active = false,
  underline = false,
  className,
}: NavItemProps) {
  return (
    <NavLink
      href={href}
      active={active}
      underline={underline}
      className={["inline-flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 아이콘이 있으면 왼쪽에 표시 */}
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </NavLink>
  );
}