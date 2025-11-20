"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { FooterLink } from "@/components/atoms/FooterLink";

type FooterProps = {
  links: { label: string; href: string; underline?: boolean }[];
  className?: string;
};

export default function Footer({ links, className }: FooterProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";
  
  // 로그인 페이지와 캐릭터 선택 페이지에서는 Footer 숨김
  if (isLoginPage || isCharacterPage) return null;
  
  return (
    <footer
      className={[
        "w-full border-t border-black/10 bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <FooterLink key={l.href} href={l.href} underline={l.underline}>
              {l.label}
            </FooterLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}