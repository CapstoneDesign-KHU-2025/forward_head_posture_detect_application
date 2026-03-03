"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/atoms/Button";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === "ko" ? "en" : "ko";

    // 현재 경로에서 locale 부분만 교체합니다.
    // 예: /ko/login -> /en/login
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);

    router.replace(newPath);
  };

  return (
    <Button size="sm" onClick={toggleLanguage} className="font-bold border-[var(--green-border)] text-[var(--green)]">
      {locale === "ko" ? "🇺🇸 English" : "🇰🇷 한국어"}
    </Button>
  );
}
