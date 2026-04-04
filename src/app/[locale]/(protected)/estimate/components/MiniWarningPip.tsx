"use client";

import { AlertTriangle, Check, CheckCircle2, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useDocumentPiP } from "@/controllers/PipController";
import { useMeasurement } from "@/controllers/MeasurementController";
import { cn } from "@/utils/cn";

type MiniWarningPipProps = {
  isTurtle: boolean;
  pipWindow: Window | null;
  measurementStarted: boolean;
};

export function MiniWarningPip({
  isTurtle,
  pipWindow,
  measurementStarted,
}: MiniWarningPipProps) {
  const { closePiP } = useDocumentPiP();
  const { stopMeasurement } = useMeasurement();

  const onStop = async () => {
    await stopMeasurement();
    closePiP();
  };
  const t = useTranslations("MiniWarningPip");

  if (!pipWindow) return null;

  const phase = !measurementStarted ? "ready" : isTurtle ? "warn" : "good";

  return createPortal(
    <div className="flex min-h-screen w-screen items-center bg-[#1a221d] px-3 py-2.5">
      <div className="flex w-full items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {phase === "ready" ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2a3530]"
              aria-hidden
            >
              <Loader2
                size={20}
                className="animate-spin text-[#8fb8a8]"
                strokeWidth={2.2}
              />
            </div>
          ) : phase === "good" ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16392c]"
              aria-hidden
            >
              <Check size={20} className="text-[#7dd3a8]" strokeWidth={2.5} />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3d2826]"
              aria-hidden
            >
              <AlertTriangle
                size={20}
                className="text-[#e07a72]"
                strokeWidth={2.2}
              />
            </div>
          )}
          <h2
            className={cn(
              "min-w-0 flex-1 text-[14px] leading-snug font-bold",
              phase === "ready" && "text-[#d0e5db]",
              phase === "good" && "text-[#8fe3b8]",
              phase === "warn" && "text-[#e89890]",
            )}
          >
            {phase === "ready"
              ? t("getReadyTitle")
              : phase === "good"
                ? t("goodTitle")
                : t("warningTitle")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onStop}
          className={cn(
            "shrink-0 rounded-xl border-2 bg-transparent px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors",
            phase === "ready" &&
              "border-[#5c6e64] text-[#9fb0a6] hover:bg-white/[0.04] active:bg-white/[0.07]",
            phase === "good" &&
              "border-[#5c6e64] text-[#9fb0a6] hover:bg-white/[0.04] active:bg-white/[0.07]",
            phase === "warn" &&
              "border-[#e07a72] text-[#e89890] hover:bg-[#e07a72]/10 active:bg-[#e07a72]/16",
          )}
        >
          {t("stop")}
        </button>
      </div>
    </div>,

    pipWindow.document.body,
  );
}
