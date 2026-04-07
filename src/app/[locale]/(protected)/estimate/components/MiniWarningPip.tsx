"use client";

import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useDocumentPiP } from "@/controllers/PipController";
import { useMeasurement } from "@/controllers/MeasurementController";
import { cn } from "@/utils/cn";
import { Button } from "@/components/Button";

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
    <div className="flex min-h-screen w-screen items-center px-3 py-2.5">
      <div className="flex w-full items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {phase === "ready" ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              aria-hidden
            >
              <Loader2
                size={20}
                className="animate-spin text-[var(--green)]"
                strokeWidth={2.2}
              />
            </div>
          ) : phase === "good" ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--green-mid)]"
              aria-hidden
            >
              <Check
                size={20}
                className="text-[var(--green-dark)]"
                strokeWidth={2.5}
              />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--danger-mid)]"
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
              phase === "ready" && "text-[var(--text)]",
              phase === "good" && "text-[var(--green-dark)]",
              phase === "warn" && "text-[var(--danger-text)]",
            )}
          >
            {phase === "ready"
              ? t("getReadyTitle")
              : phase === "good"
                ? t("goodTitle")
                : t("warningTitle")}
          </h2>
        </div>
        <Button
          onClick={onStop}
          size="sm"
          variant={phase == "warn" ? "danger" : "primary"}
        >
          {t("stop")}
        </Button>
      </div>
    </div>,

    pipWindow.document.body,
  );
}
