"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = (nextLocale: "en" | "ko") => {
    if (locale === nextLocale) return;
    router.replace(pathname, { locale: nextLocale });
  };
  return (
    <div className="relative inline-flex items-center bg-[#E8F5E9] rounded-full p-1 w-32 h-10 shadow-inner cursor-pointer">
      <div
        className={`absolute top-1 bottom-1 w-[60px] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          locale === "ko" ? "translate-x-[60px]" : "translate-x-0"
        }`}
      />

      <button
        onClick={() => handleToggle("en")}
        className={`relative z-10 flex-1 flex justify-center text-sm font-bold transition-colors duration-300 ${
          locale === "en" ? "text-[#2D5F2E]" : "text-[#8CA38D]"
        }`}
      >
        EN
      </button>

      <button
        onClick={() => handleToggle("ko")}
        className={`relative z-10 flex-1 flex justify-center text-sm font-bold transition-colors duration-300 ${
          locale === "ko" ? "text-[#2D5F2E]" : "text-[#8CA38D]"
        }`}
      >
        KR
      </button>
    </div>
  );
}
