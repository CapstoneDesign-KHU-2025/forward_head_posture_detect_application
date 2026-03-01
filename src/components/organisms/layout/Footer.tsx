"use client";

import { usePathname } from "next/navigation";

type FooterProps = {
  links: { label: string; href: string; underline?: boolean }[];
  className?: string;
};

export default function Footer({ links, className }: FooterProps) {
  const pathname = usePathname();

  if (pathname !== "/landing") return null;

  return (
    <footer
      className={[
        "w-full border-t border-[var(--green-border)] py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="font-[Nunito] font-extrabold text-base text-[var(--green)]"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        🐢 거북목 거북거북!
      </div>
      <div className="text-xs text-[var(--text-muted)]">
        © 2026 거북목 거북거북! Team. All rights reserved.
      </div>
    </footer>
  );
}
