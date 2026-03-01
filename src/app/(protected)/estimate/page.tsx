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
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,
    getStatusBannerType,
    statusBannerMessage,
    isFirstFrameDrawn,
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
            {stopEstimating ? "측정 시작하기" : "오늘의 측정 중단하기"}
          </Button>
        </div>

        <AsyncBoundary
          suspenseFallback={
            <section className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_30px_rgba(45,95,46,0.1)] w-full max-w-[600px] min-w-0 mx-auto">
              <div className="w-full px-8 py-4 text-center text-[1.1rem] font-semibold rounded-t-[20px] bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white">
                측정을 시작해주세요!
              </div>
              <div className="relative w-full min-w-0 rounded-none overflow-hidden bg-[#2C3E50]" style={{ aspectRatio: "4/3" }}>
                <LoadingSkeleton/>
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
          />
        </AsyncBoundary>
        {error && <ErrorBanner error={error} />}
      </div>
    </div>
  );
}
