"use client";

import { AlertTriangle, Check, Loader2, type LucideIcon } from "lucide-react";
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

type Phase = "ready" | "good" | "warn";

type PhaseConfig = {
  Icon: LucideIcon;
  iconClass: string;
  strokeWidth: number;
  wrapperBg: string;
  textColor: string;
  titleKey: "getReadyTitle" | "goodTitle" | "warningTitle";
  buttonVariant: "danger" | "primary";
};

const phaseConfig = {
  ready: {
    Icon: Loader2,
    iconClass: "animate-spin text-[var(--green)]",
    strokeWidth: 2.2,
    wrapperBg: "",
    textColor: "text-[var(--text)]",
    titleKey: "getReadyTitle",
    buttonVariant: "primary",
  },
  good: {
    Icon: Check,
    iconClass: "text-[var(--green-dark)]",
    strokeWidth: 2.5,
    wrapperBg: "bg-[var(--green-mid)]",
    textColor: "text-[var(--green-dark)]",
    titleKey: "goodTitle",
    buttonVariant: "primary",
  },
  warn: {
    Icon: AlertTriangle,
    iconClass: "text-[#e07a72]",
    strokeWidth: 2.2,
    wrapperBg: "bg-[var(--danger-mid)]",
    textColor: "text-[var(--danger-text)]",
    titleKey: "warningTitle",
    buttonVariant: "danger",
  },
} satisfies Record<Phase, PhaseConfig>;

export function MiniWarningPip({
  isTurtle,
  pipWindow,
  measurementStarted,
}: MiniWarningPipProps) {
  const { closePiP } = useDocumentPiP();
  const { stopMeasurement } = useMeasurement();
  const t = useTranslations("MiniWarningPip");

  const onStop = async () => {
    await stopMeasurement();
    closePiP();
  };

  if (!pipWindow) return null;

  const phase: Phase = !measurementStarted ? "ready" : isTurtle ? "warn" : "good";
  const { Icon, iconClass, strokeWidth, wrapperBg, textColor, titleKey, buttonVariant } =
    phaseConfig[phase];

  return createPortal(
    <div className="flex min-h-screen w-screen items-center px-3 py-2.5">
      <div className="flex w-full items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              wrapperBg,
            )}
            aria-hidden
          >
            <Icon size={20} className={iconClass} strokeWidth={strokeWidth} />
          </div>
          <h2
            className={cn(
              "min-w-0 flex-1 text-[14px] leading-snug font-bold",
              textColor,
            )}
          >
            {t(titleKey)}
          </h2>
        </div>
        <Button onClick={onStop} size="sm" variant={buttonVariant}>
          {t("stop")}
        </Button>
      </div>
    </div>,
    pipWindow.document.body,
  );
}
