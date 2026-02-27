"use client";

import { StatusBannerType } from "@/hooks/useTurtleNeckMeasurement";
import { useEffect, useState } from "react";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";

type EstimatePanelProps = {
  bannerType: StatusBannerType;
  bannerMessage: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasSlotId: string;
  showMeasurementStartedToast: boolean;
  countdownRemain: number | null;
  measurementStarted: boolean;
  stopEstimating: boolean;
};

export default function EstimatePanel({
  bannerType,
  bannerMessage,
  videoRef,
  canvasSlotId,
  showMeasurementStartedToast,
  countdownRemain,
  measurementStarted,
  stopEstimating,
}: EstimatePanelProps) {
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  useEffect(() => {
    if (stopEstimating) {
      setIsCameraLoading(true);
      return;
    }
    const checkVideoReady = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        setIsCameraLoading(false);
      }
    };
    const interval = setInterval(checkVideoReady, 100);
    return () => clearInterval(interval);
  }, [videoRef, stopEstimating]);

  return (
    <section className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_30px_rgba(45,95,46,0.1)]">
      <div className="p-0">
        <div
          className={`w-full px-8 py-4 text-center text-[1.1rem] font-semibold transition-all duration-300 rounded-t-[20px] ${
            bannerType === "success"
              ? "bg-gradient-to-r from-[#4A9D4D] to-[#66BB6A] text-white"
              : bannerType === "warning"
                ? "bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white"
                : "bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white"
          }`}
        >
          {bannerMessage}
        </div>

        <div className="relative w-full m-0 rounded-none overflow-hidden bg-[#2C3E50]" style={{ aspectRatio: "4/3" }}>
          {stopEstimating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-[#aac8b2] text-sm font-medium">
                측정 시작하기 버튼을 눌러
                <br />
                카메라를 켜주세요
              </p>
            </div>
          ) : (
            <>
              {isCameraLoading && (
                <div className="absolute inset-0 z-10 w-full h-full">
                  <LoadingSkeleton />
                </div>
              )}

              <div id={canvasSlotId} className="absolute inset-0 w-full h-full" />

              {showMeasurementStartedToast && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(64,64,64,0.85)] px-7 py-4 text-center text-[20px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  거북목 측정을 시작합니다
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
      </div>
    </section>
  );
}
