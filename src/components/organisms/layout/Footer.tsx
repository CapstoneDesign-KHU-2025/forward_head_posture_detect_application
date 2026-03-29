"use client";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  const t = useTranslations("Footer");
  const FOOTER_LINKS = [
    { label: t("labels.terms"), href: "/terms" },
    { label: t("labels.privacy"), href: "/privacy" },
    { label: t("labels.contact"), href: "/contact" },
  ];

  return (
    <footer
      className={cn(
        "w-full border-t border-[var(--green-border)] py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0",
        className,
      )}
    >
      <div
        className="font-[Nunito] font-extrabold text-base text-[var(--green)]"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        🐢BoogiBoogi
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--green)] transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="text-xs text-[var(--text-muted)]">© 2026 BoogiBoogi! Team. All rights reserved.</div>
    </footer>
  );
}
