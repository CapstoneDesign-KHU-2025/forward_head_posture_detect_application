"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { tv } from "tailwind-variants";

const styles = {
  wrapper: tv({
    base: "relative inline-flex items-center bg-[#E8F5E9] rounded-full p-1 w-32 h-10 shadow-inner cursor-pointer",
  }),
  slider: tv({
    base: "absolute top-1 bottom-1 w-[60px] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out",
    variants: {
      shifted: {
        true: "translate-x-[60px]",
        false: "translate-x-0",
      },
    },
  }),
  button: tv({
    base: "relative z-10 flex-1 flex justify-center text-sm font-bold transition-colors duration-300 hover:bg-transparent",
    variants: {
      active: {
        true: "text-[#2D5F2E]",
        false: "text-[#8CA38D] hover:text-[#305b3d]",
      },
    },
  }),
};

const LOCALES = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KR" },
] as const;

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = (nextLocale: "en" | "ko") => {
    if (locale === nextLocale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className={styles.wrapper()}>
      <div className={styles.slider({ shifted: locale === "ko" })} />
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleToggle(value)}
          className={styles.button({ active: locale === value })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
