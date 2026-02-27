"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/atoms/Icon";
import { cn } from "@/utils/cn";

type BrandLinkProps = {
  href?: string;
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  className?: string;
};

export function BrandLink({
  href = "/",
  icon,
  label,
  className,
}: BrandLinkProps) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === href) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2 ring-offset-white",
        className
      )}
      aria-label={`${label} home`}
      style={{ textDecoration: "none" }}
    >
      <Icon size="lg">
        {icon}
      </Icon>

      <span
        className="text-[20px] font-extrabold text-[var(--green)]"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {label}
      </span>
    </Link>
  );
}
