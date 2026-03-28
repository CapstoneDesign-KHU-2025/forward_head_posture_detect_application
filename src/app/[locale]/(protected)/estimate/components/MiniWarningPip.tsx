"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type MiniWarningPipProps = {
  isTurtle: boolean;
  pipWindow: Window | null;
  measurementStarted: boolean;
};
export function MiniWarningPip({ isTurtle, pipWindow, measurementStarted }: MiniWarningPipProps) {
  if (!pipWindow) return null;

  const t = useTranslations("MiniWarningPip");
  return createPortal(
    <div
      className={`flex h-screen w-screen flex-col items-center justify-center transition-colors duration-500 ${
        isTurtle ? "bg-red-500 text-white" : "bg-[var(--background)] text-[var(--green)]"
      }`}
    >
      {!measurementStarted ? (
        <>
          <h2 className="font-bold mb-2"> {t("getReady")}</h2>
        </>
      ) : isTurtle ? (
        <>
          <AlertTriangle size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">🚨 {t("warning")}</h2>
        </>
      ) : (
        <>
          <CheckCircle2 size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">{t("good")} 🐢</h2>
        </>
      )}
    </div>,
    pipWindow.document.body,
  );
}
