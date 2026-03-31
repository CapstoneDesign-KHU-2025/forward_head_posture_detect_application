"use client";

import { useTranslations } from "next-intl";
import type { StatusPillVariant } from "@/utils/types";
import { StatusPill } from "./StatusPill";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { GuideColor, StatusBannerType } from "@/utils/types";
import { useDocumentPiP } from "@/controllers/PipController";
import { PipToggleButton } from "./PipToggleButton";
import { usePiPStore } from "@/app/store/usePipStore";

type EstimatePanelProps = {
  bannerType: StatusBannerType;
  bannerMessage: string;
  canvasSlotId: string;
  showMeasurementStartedToast: boolean;
  countdownRemain: number | null;
  measurementStarted: boolean;
  stopEstimating: boolean;
  isFirstFrameDrawn: boolean;
  guideColor: GuideColor;
};

function getStatusPillVariant(props: {
  stopEstimating: boolean;
  countdownRemain: number | null;
  measurementStarted: boolean;
  isTurtle: boolean;
  guideColor: GuideColor;
}): StatusPillVariant {
  const { stopEstimating, countdownRemain, measurementStarted, isTurtle, guideColor } = props;
  if (stopEstimating) return "stopped";
  if (countdownRemain !== null) return "count";
  if (isTurtle && measurementStarted) return "bad";
  if (!isTurtle && measurementStarted) return "good";
  if (guideColor === "orange") return "warn";
  if (guideColor === "red") return "guide";
  return "idle";
}

function getHeaderIcon(variant: StatusPillVariant): string {
  switch (variant) {
    case "stopped":
      return "⏹";
    case "idle":
      return "📷";
    case "guide":
      return "📐";
    case "warn":
      return "🔴";
    case "count":
      return "✅";
    case "good":
      return "🟢";
    case "bad":
      return "🐢";
    default:
      return "📷";
  }
}

export default function EstimatePanel({
  bannerType,
  bannerMessage,
  canvasSlotId,
  showMeasurementStartedToast,
  countdownRemain,
  measurementStarted,
  stopEstimating,
  isFirstFrameDrawn,
  guideColor,
}: EstimatePanelProps) {
  const t = useTranslations("EstimatePanel");
  const isTurtle = bannerType === "warning";
  const pipWindow = usePiPStore((state) => state.pipWindow);
  const { openPiP, closePiP } = useDocumentPiP();

  const pillVariant = getStatusPillVariant({
    stopEstimating,
    countdownRemain,
    measurementStarted,
    isTurtle,
    guideColor,
  });

  const headerIcon = getHeaderIcon(pillVariant);
  const showLoadingOverlay = !stopEstimating && !isFirstFrameDrawn;

  return (
    <section className="relative bg-white rounded-[16px] overflow-hidden shadow-[0_2px_16px_rgba(74,124,89,0.13)] w-full max-w-[600px] min-w-0 mx-auto">
      {showLoadingOverlay && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[16px] bg-white">
          <LoadingSkeleton variant="camera" />
        </div>
      )}

      <header className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-b-[1.5px] border-[var(--green-border)]">
        <div className="flex items-center gap-[7px] min-w-0">
          <span className="text-[15px] flex-shrink-0" aria-hidden>
            {headerIcon}
          </span>
          <h2 className="m-0 text-[13px] font-bold text-[var(--green)] whitespace-nowrap">{t("cameraTitle")}</h2>
        </div>
        <StatusPill variant={pillVariant}>{bannerMessage}</StatusPill>
      </header>

      {/* cam-body*/}
      <div
        className={`relative w-full min-w-0 m-0 overflow-hidden ${
          stopEstimating
            ? "bg-gradient-to-br from-[#1e2d28] via-[#263530] to-[#1a2820]"
            : "bg-gradient-to-br from-[#ddf0e4] via-[#edf8f1] to-[#cde8d5]"
        }`}
        style={{ aspectRatio: "4/3" }}
      >
        {!stopEstimating && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 60% 40%, rgba(106,171,122,0.15) 0%, transparent 60%)",
            }}
            aria-hidden
          />
        )}
        {stopEstimating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="text-6xl leading-none opacity-30" aria-hidden>
              🐢
            </span>
            <p className="text-lg font-semibold whitespace-pre-line text-white/30">{t("messageText")}</p>
          </div>
        ) : (
          <>
            <div id={canvasSlotId} className="absolute inset-0 w-full h-full" />
            <PipToggleButton isOpen={!!pipWindow} onClick={pipWindow ? closePiP : openPiP} />

            {showMeasurementStartedToast && (
              <div
                role="status"
                aria-live="polite"
                className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(64,64,64,0.85)] px-7 py-4 text-center text-[20px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                {t("startMeasurementToast")}
              </div>
            )}

            {countdownRemain !== null && !measurementStarted && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(0,0,0,0.6)] px-6 py-3 text-[32px] font-bold text-white">
                {countdownRemain}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
