"use client";

import { useTranslations } from "next-intl";
import type { StatusPillVariant } from "@/utils/types";
import { StatusPill } from "./StatusPill";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { GuideColor, StatusBannerType } from "@/utils/types";
import { useDocumentPiP } from "@/controllers/PipController";
import { PipToggleButton } from "./PipToggleButton";
import { usePiPStore } from "@/app/store/usePipStore";
import { tv } from "tailwind-variants";

const panelStyles = tv({
  slots: {
    wrapper:
      "relative mx-auto w-full max-w-[600px] min-w-0 overflow-hidden rounded-[16px] bg-white shadow-[0_2px_16px_rgba(74,124,89,0.13)]",
    loadingOverlay:
      "absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[16px] bg-white",

    header:
      "flex items-center justify-between gap-2 border-b-[1.5px] border-[var(--green-border)] bg-white px-4 py-3",
    headerLeft: "flex min-w-0 items-center gap-[7px]",
    headerIconWrapper: "flex-shrink-0 text-[15px]",
    headerTitle:
      "m-0 text-[13px] font-bold whitespace-nowrap text-[var(--green)]",

    camBody: "relative m-0 aspect-[4/3] w-full min-w-0 overflow-hidden",
    radialBg:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(106,171,122,0.15)_0%,transparent_60%)]",

    stoppedContainer:
      "absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center",
    stoppedIcon: "text-6xl leading-none opacity-30",
    stoppedText: "text-lg font-semibold whitespace-pre-line text-white/30",

    canvasSlot: "absolute inset-0 h-full w-full",
    toast:
      "pointer-events-none absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(64,64,64,0.85)] px-7 py-4 text-center text-[20px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
    countdown:
      "absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(0,0,0,0.6)] px-6 py-3 text-[32px] font-bold text-white",
  },
  variants: {
    isStopped: {
      true: {
        camBody: "bg-gradient-to-br from-[#1e2d28] via-[#263530] to-[#1a2820]",
      },
      false: {
        camBody: "bg-gradient-to-br from-[#ddf0e4] via-[#edf8f1] to-[#cde8d5]",
      },
    },
  },
});

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

type getStatusPillVariantProps = {
  stopEstimating: boolean;
  countdownRemain: number | null;
  measurementStarted: boolean;
  isTurtle: boolean;
  guideColor: GuideColor;
};

function getStatusPillVariant(
  props: getStatusPillVariantProps,
): StatusPillVariant {
  const {
    stopEstimating,
    countdownRemain,
    measurementStarted,
    isTurtle,
    guideColor,
  } = props;
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
  const {
    wrapper,
    loadingOverlay,
    header,
    headerLeft,
    headerIconWrapper,
    headerTitle,
    camBody,
    radialBg,
    stoppedContainer,
    stoppedIcon,
    stoppedText,
    canvasSlot,
    toast,
    countdown,
  } = panelStyles({ isStopped: stopEstimating });

  return (
    <section className={wrapper()}>
      {showLoadingOverlay && (
        <div className={loadingOverlay()}>
          <LoadingSkeleton variant="camera" />
        </div>
      )}

      <header className={header()}>
        <div className={headerLeft()}>
          <span className={headerIconWrapper()} aria-hidden>
            {headerIcon}
          </span>
          <h2 className={headerTitle()}>{t("cameraTitle")}</h2>
        </div>
        <StatusPill variant={pillVariant}>{bannerMessage}</StatusPill>
      </header>

      <div className={camBody()} style={{ aspectRatio: "4/3" }}>
        {!stopEstimating && <div className={radialBg()} aria-hidden />}
        {stopEstimating ? (
          <div className={stoppedContainer()}>
            <span className={stoppedIcon()} aria-hidden>
              🐢
            </span>
            <p className={stoppedText()}>{t("messageText")}</p>
          </div>
        ) : (
          <>
            <div id={canvasSlotId} className={canvasSlot()} />
            <PipToggleButton
              isOpen={!!pipWindow}
              onClick={pipWindow ? closePiP : openPiP}
            />

            {showMeasurementStartedToast && (
              <div role="status" aria-live="polite" className={toast()}>
                {t("startMeasurementToast")}
              </div>
            )}

            {countdownRemain !== null && !measurementStarted && (
              <time
                dateTime={`PT${countdownRemain}S`}
                className={countdown()}
                aria-label={`${countdownRemain} ${t("secondLeft")}`}
              >
                {countdownRemain}
              </time>
            )}
          </>
        )}
      </div>
    </section>
  );
}
