"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTodayHourly } from "@/lib/hourlyOps";
import { getTodayCount, storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { useTurtleNeckMeasurement } from "@/hooks/useTurtleNeckMeasurement";
import { createISO } from "@/utils/createISO";
import { postDailySummaryAction } from "../../actions/postDailySummaryAction";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";
import ErrorBanner from "@/components/atoms/ErrorBanner";
import AsyncBoundary from "@/components/common/AsyncBoundary";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export default function Estimate() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string;
  const [_dailySumState, dailySumAction] = useActionState(postDailySummaryAction, null);
  const [stopEstimating, setStopEstimating] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const {
    videoRef,
    canvasRef,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,
    getStatusBannerType,
    statusBannerMessage,
    isTurtle,
    angle,
  } = useTurtleNeckMeasurement({ userId, stopEstimating, isInitial });

  // 페이지에서 떠날 때 자동 중단 처리
  useEffect(() => {
    return () => {
      if (!stopEstimating) {
        handleStopEstimating(true);
      }
    };
  }, [stopEstimating]);

  // "오늘의 측정 중단하기" 버튼: IndexedDB -> DailyPostureSummary POST
  const handleStopEstimating = async (forced?: boolean) => {
    setIsInitial(false);
    if (isProcessing) return;
    // forced: 비정상적인 측정 종료 여부
    try {
      setIsProcessing(true);
      if (!stopEstimating) {
        await storeMeasurementAndAccumulate({
          userId,
          ts: Date.now(),
          angleDeg: angle,
          isTurtle,
          hasPose: true,
          sessionId: session?.user?.id,
          sampleGapS: 10,
        });
        // 측정 중 → 중단으로 변경: 요약 데이터 전송
        const rows = await getTodayHourly(userId);
        const dailySumWeighted = rows?.reduce((acc: number, r: any) => acc + (r?.sumWeighted ?? 0), 0) ?? 0;

        const dailyWeightSeconds = rows?.reduce((acc: number, r: any) => acc + (r?.weight ?? 0), 0) ?? 0;

        const count = await getTodayCount(userId);
        const dateISO = createISO();

        const postData = {
          userId,
          dateISO,
          sumWeighted: dailySumWeighted,
          weightSeconds: dailyWeightSeconds,
          count,
        };
        startTransition(() => {
          dailySumAction(postData);
        });

        if (forced) return;
      } else {
        // 중단 → 다시 측정 시작 (측정 로직은 훅에서 초기화됨)
        // 필요하다면 useTurtleNeckMeasurement에서 resetForNewMeasurement를 꺼내와서 여기서 호출해도 됨
        // resetForNewMeasurement();
      }
    } catch (err) {
      console.error("[handleStopEstimating] error:", err);
    } finally {
      if (!forced) {
        setStopEstimating((prev) => !prev);
      }
      setIsProcessing(false);
    }
  };

  const bannerType = getStatusBannerType();
  const bannerMessage = statusBannerMessage();
  return (
    <div className="min-h-screen bg-[#F8FBF8]">
      <div className="max-w-[1200px] mx-auto px-70 py-8">
        <div className="flex justify-center mb-8">
          <Button onClick={() => handleStopEstimating()}>
            {stopEstimating ? "측정 시작하기" : "오늘의 측정 중단하기"}
          </Button>
        </div>

        <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
          <EstimatePanel
            bannerType={bannerType}
            bannerMessage={bannerMessage}
            videoRef={videoRef}
            canvasRef={canvasRef}
            showMeasurementStartedToast={showMeasurementStartedToast}
            countdownRemain={countdownRemain}
            measurementStarted={measurementStarted}
          />
        </AsyncBoundary>
        {error && <ErrorBanner error={error} />}
      </div>
    </div>
  );
}
