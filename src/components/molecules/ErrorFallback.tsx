"use client";

import { FallbackProps } from "react-error-boundary";
import { useRouter } from "@/i18n/navigation";
import { startTransition } from "react";
import { useTranslations } from "next-intl";
export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();
  const t = useTranslations("ErrorFallback");
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-[#2C3E50] text-white p-6 rounded-[20px]"
      style={{ aspectRatio: "4/3" }}
    >
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">{t("ErrorFallback.title")}</h2>
      <p className="text-sm text-gray-300 mb-6 text-center max-w-[80%] break-keep">
        {(error as Error)?.message || t("ErrorFallback.message")}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => {
            startTransition(() => {
              router.refresh();
              resetErrorBoundary();
            });
          }}
          className="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
        >
          {t("ErrorFallback.button")}
        </button>
        <button
          onClick={resetErrorBoundary}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          {t("ErrorFallback.tryAgain")}
        </button>
      </div>
    </div>
  );
}
