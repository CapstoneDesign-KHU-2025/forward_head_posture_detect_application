"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TempFooter() {
  const t = useTranslations("TempFooter");

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-end px-6 py-3 bg-[var(--green-pale)]">
      <Link
        href="https://docs.google.com/forms/d/e/1FAIpQLSeRNoOKH3aNfmu0_JMZFy6Vslur6jfBuNlrj-5-Cekjen9wpw/viewform?usp=publish-editor"
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1.5 text-[13px] font-bold text-[var(--danger-text)] bg-[var(--danger-bg)] hover:text-[var(--danger-dark)] hover:bg-[#ffe5e0] rounded-[12px] transition-colors border-2 border-[var(--danger-text)]"
      >
        {t("feedback")}
      </Link>
    </footer>
  );
}
