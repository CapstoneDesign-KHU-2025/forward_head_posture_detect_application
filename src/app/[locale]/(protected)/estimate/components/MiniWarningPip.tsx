"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useDocumentPiP } from "@/providers/PipProvider";
import { useMeasurement } from "@/providers/MeasurementProvider";

type MiniWarningPipProps = {
  isTurtle: boolean;
  pipWindow: Window | null;
  measurementStarted: boolean;
};
export function MiniWarningPip({ isTurtle, pipWindow, measurementStarted }: MiniWarningPipProps) {
  const { closePiP } = useDocumentPiP();
  const { stopMeasurement } = useMeasurement();
  const onStop = () => {
    stopMeasurement();
    closePiP();
  };
  const t = useTranslations("MiniWarningPip");
  if (!pipWindow) return null;
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
          <h2 className="font-bold mb-2">🚨 {t("warning")}</h2>{" "}
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 whitespace-nowrap rounded-[10px] border border-[rgba(255,92,92,0.25)] bg-[rgb(255,180,180)] px-3.5 py-1.5 text-xs font-bold text-[#ab1a1a] transition-colors hover:bg-[rgba(245,144,144,0.86)]"
          >
            {t("stop")}
          </button>
        </>
      ) : (
        <>
          <CheckCircle2 size={32} className="animate-bounce mt-1.5" />
          <h2 className="font-bold mb-2">{t("good")} 🐢</h2>{" "}
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 whitespace-nowrap rounded-[10px] border border-[rgba(255,92,92,0.25)] bg-[rgba(255,92,92,0.15)] px-3.5 py-1.5 text-xs font-bold text-[#ff8c8c] transition-colors hover:bg-[rgba(255,92,92,0.28)]"
          >
            {t("stop")}
          </button>
        </>
      )}
    </div>,
    pipWindow.document.body,
  );
}
