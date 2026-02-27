"use client";

import { useMeasurement } from "@/providers/MeasurementProvider";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";
import ErrorBanner from "@/components/atoms/ErrorBanner";
import AsyncBoundary from "@/components/molecules/AsyncBoundary";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";
import { MEASUREMENT_CANVAS_SLOT_ID } from "@/providers/MeasurementProvider";

export default function Estimate() {
  const {
    stopEstimating,
    startMeasurement,
    stopMeasurement,
    videoRef,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,
    getStatusBannerType,
    statusBannerMessage,
  } = useMeasurement();

  const bannerType = getStatusBannerType();
  const bannerMessage = statusBannerMessage();

  return (
    <div className="min-h-screen bg-[#F8FBF8] overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full min-w-0">
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            variant={stopEstimating ? "primary" : "danger"}
            onClick={stopEstimating ? startMeasurement : stopMeasurement}
          >
            {stopEstimating ? "측정 시작하기" : "오늘의 측정 중단하기"}
          </Button>
        </div>

        <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
          <EstimatePanel
            bannerType={bannerType}
            bannerMessage={bannerMessage}
            videoRef={videoRef}
            canvasSlotId={MEASUREMENT_CANVAS_SLOT_ID}
            showMeasurementStartedToast={showMeasurementStartedToast}
            countdownRemain={countdownRemain}
            measurementStarted={measurementStarted}
            stopEstimating={stopEstimating}
          />
        </AsyncBoundary>
        {error && <ErrorBanner error={error} />}
      </div>
    </div>
  );
}
