import Link from "next/link";
import { cn } from "@/utils/cn";

const FOOTER_LINKS = [
  { label: "서비스 약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "문의하기", href: "/contact" },
];

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full border-t border-[var(--green-border)] py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0",
        className
      )}
    >
      <div
        className="font-[Nunito] font-extrabold text-base text-[var(--green)]"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        🐢 거북목 거북거북!
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
      <div className="text-xs text-[var(--text-muted)]">
        © 2026 거북목 거북거북! Team. All rights reserved.
      </div>
    </footer>
  );
}
