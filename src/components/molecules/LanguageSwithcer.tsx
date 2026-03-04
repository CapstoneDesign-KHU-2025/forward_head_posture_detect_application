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

    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);

    router.replace(newPath);
  };

  return (
    <Button size="sm" onClick={toggleLanguage} className="font-bold border-[var(--green-border)] text-[var(--green)]">
      {locale === "ko" ? "🇺🇸 English" : "🇰🇷 한국어"}
    </Button>
  );
}
