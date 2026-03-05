"use client";

import { useMeasurement } from "@/providers/MeasurementProvider";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";
import ErrorBanner from "@/components/atoms/ErrorBanner";
import AsyncBoundary from "@/components/molecules/AsyncBoundary";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";

import { MEASUREMENT_CANVAS_SLOT_ID } from "@/providers/MeasurementProvider";
import { useTranslations } from "next-intl";

export default function Estimate() {
  const t = useTranslations("Estimate");

  const {
    stopEstimating,
    startMeasurement,
    stopMeasurement,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,
    getStatusBannerType,
    statusBannerMessage,
    isFirstFrameDrawn,
    guideColor,
  } = useMeasurement();

  const bannerType = getStatusBannerType();
  const bannerMessage = statusBannerMessage();

  return (
    <div className="min-h-screen bg-[var(--green-pale)] overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pb-8 pt-2 w-full min-w-0">
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            variant={stopEstimating ? "primary" : "danger"}
            onClick={stopEstimating ? startMeasurement : stopMeasurement}
          >
            {stopEstimating ? t("buttons.start") : t("buttons.stop")}
          </Button>
        </div>

        <AsyncBoundary
          suspenseFallback={
            <section className="bg-white rounded-[16px] overflow-hidden shadow-[0_2px_16px_rgba(74,124,89,0.13)] w-full max-w-[600px] min-w-0 mx-auto">
              <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-b-[1.5px] border-[var(--green-border)]">
                <div className="flex items-center gap-[7px] min-w-0">
                  <span className="text-[15px] flex-shrink-0">📷</span>
                  <span className="text-[13px] font-bold text-[var(--green)]">{t("cameraTitle")}</span>
                </div>
                <span className="inline-flex items-center gap-[5px] rounded-[20px] px-2.5 py-1.5 text-[11px] font-bold bg-[#f0f4f2] border border-[var(--green-border)] text-[var(--text-muted)]">
                  {t("async.suspense")}
                </span>
              </div>
              <div
                className="relative w-full min-w-0 overflow-hidden bg-gradient-to-br from-[#ddf0e4] via-[#edf8f1] to-[#cde8d5]"
                style={{ aspectRatio: "4/3" }}
              >
                <LoadingSkeleton variant="camera" />
              </div>
            </section>
          }
        >
          <EstimatePanel
            bannerType={bannerType}
            bannerMessage={bannerMessage}
            canvasSlotId={MEASUREMENT_CANVAS_SLOT_ID}
            showMeasurementStartedToast={showMeasurementStartedToast}
            countdownRemain={countdownRemain}
            measurementStarted={measurementStarted}
            stopEstimating={stopEstimating}
            isFirstFrameDrawn={isFirstFrameDrawn}
            guideColor={guideColor}
          />
        </AsyncBoundary>
        {error && <ErrorBanner error={error} />}
      </div>
    </div>
  );
}
