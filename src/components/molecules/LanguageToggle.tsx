"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // 💡 함수에 인자를 받아 처리하도록 변경하여 무한 렌더링 방지
  const handleToggle = (nextLocale: string) => {
    if (locale === nextLocale) return; // 이미 같은 언어면 무시
    
    // 현재 경로에서 제일 앞의 언어 부분만 안전하게 교체
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.replace(newPath);
  };

  return (
    <div className="relative inline-flex items-center bg-[#E8F5E9] rounded-full p-1 w-32 h-10 shadow-inner cursor-pointer">
      {/* 배경 슬라이더 애니메이션 */}
      <div
        className={`absolute top-1 bottom-1 w-[60px] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          locale === "ko" ? "translate-x-[60px]" : "translate-x-0"
        }`}
      />

      {/* 왼쪽: 영어 (EN) */}
      <button
        // 🚨 무한 렌더링을 막기 위해 반드시 화살표 함수 형태로 작성!
        onClick={() => handleToggle("en")}
        className={`relative z-10 flex-1 flex justify-center text-sm font-bold transition-colors duration-300 ${
          locale === "en" ? "text-[#2D5F2E]" : "text-[#8CA38D]"
        }`}
      >
        EN
      </button>

      {/* 오른쪽: 한국어 (KR) */}
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