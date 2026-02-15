"use client";
import { StatusBannerType } from "@/hooks/useTurtleNeckMeasurement";
import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

type EstimatePanelProps = {
  bannerType: StatusBannerType;
  bannerMessage: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  showMeasurementStartedToast: boolean;
  countdownRemain: number | null;
  measurementStarted: boolean;
};
export default function EstimatePanel({
  bannerType,
  bannerMessage,
  videoRef,
  canvasRef,
  showMeasurementStartedToast,
  countdownRemain,
  measurementStarted,
}: EstimatePanelProps) {
  // 로딩 상태 로직 추가 (비디오가 준비될 때까지 true)
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  useEffect(() => {
    // 비디오가 준비되었는지 0.1초마다 확인
    const checkVideoReady = () => {
      // readyState 2 이상이면 데이터가 충분히 로딩된 상태
      if (videoRef.current && videoRef.current.readyState >= 2) {
        setIsCameraLoading(false); // 로딩 끝
      }
    };

    const interval = setInterval(checkVideoReady, 100);
    return () => clearInterval(interval);
  }, [videoRef]);


  return (
    <section className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_30px_rgba(45,95,46,0.1)]">
      <div className="p-0">
        {/* 상태 배너 */}
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

        {/* 카메라 컨테이너 */}
        <div className="relative w-full m-0 rounded-none overflow-hidden bg-[#2C3E50]" style={{ aspectRatio: "4/3" }}>

          {/* 👇 3. 로딩 중이면 스켈레톤을 위에 덮어씌우기 (absolute) */}
          {isCameraLoading && (
             <div className="absolute inset-0 z-10 w-full h-full">
               <LoadingSkeleton />
             </div>
          )}

          {/* 비디오는 숨기고, 캔버스만 화면에 표시 */}
          <video ref={videoRef} className="absolute -left-[9999px]" />
          <canvas ref={canvasRef} className="w-full h-full block bg-[#2C3E50]" />

          {/* 측정 시작 토스트 */}
          {showMeasurementStartedToast && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(64,64,64,0.85)] px-7 py-4 text-center text-[20px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              거북목 측정을 시작합니다
            </div>
          )}

          {/* 3초 카운트다운 */}
          {countdownRemain !== null && !measurementStarted && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(0,0,0,0.6)] px-6 py-3 text-[32px] font-bold text-white">
              {countdownRemain}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
