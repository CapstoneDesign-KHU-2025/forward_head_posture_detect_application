import * as React from "react";
import { FooterLink } from "@/components/atoms/link/FooterLink";

type FooterProps = {
  links: { label: string; href: string; underline?: boolean }[];
  className?: string;
};

export default function Footer({ links, className }: FooterProps) {
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