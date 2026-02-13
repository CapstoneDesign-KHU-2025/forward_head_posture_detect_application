"use client";

import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTodayHourly } from "@/lib/hourlyOps";
import { getTodayCount, storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { useTurtleNeckMeasurement } from "@/hooks/useTurtleNeckMeasurement";
import { formatTime } from "@/utils/formatTime";
import { createISO } from "@/utils/createISO";
import { postDailySummaryAction } from "../actions/postDailySummaryAction";
import useTodayStatus from "@/hooks/useTodayStatus";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";

export default function Estimate() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string;
  const [_dailySumState, dailySumAction] = useActionState(postDailySummaryAction, null);
  const [stopEstimating, setStopEstimating] = useState(true);

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
  } = useTurtleNeckMeasurement({ userId, stopEstimating });

  const { toggleHourly, isHourlyVisible, toggleAvg, isTodayAvgVisible, hourlyList, todayAvg } = useTodayStatus(userId);

  // 페이지에서 떠날 때 자동 중단 처리
  useEffect(() => {
    return () => {
      if (!stopEstimating) {
        handleStopEstimating(true);
      }
    };
  }, []);

  // "오늘의 측정 중단하기" 버튼: IndexedDB -> DailyPostureSummary POST
  const handleStopEstimating = async (forced?: boolean) => {
    // forced: 비정상적인 측정 종료 여부
    try {
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
        dailySumAction(postData);
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
    }
  };

  const formatTimeRange = (hourStartTs: number) => {
    const start = new Date(hourStartTs);
    const end = new Date(hourStartTs + 3600000);

    return `${formatTime(start)} ~ ${formatTime(end)}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FBF8]">
      <div className="max-w-[1200px] mx-auto px-70 py-8">
        <div className="flex justify-center mb-8">
          <Button>{stopEstimating ? "측정 시작하기" : "오늘의 측정 중단하기"}</Button>
        </div>

        <EstimatePanel
          bannerType={getStatusBannerType()}
          bannerMessage={statusBannerMessage()}
          videoRef={videoRef}
          canvasRef={canvasRef}
          showMeasurementStartedToast={showMeasurementStartedToast}
          countdownRemain={countdownRemain}
          measurementStarted={measurementStarted}
        />

        {/* 토글 버튼 (웹캠 박스 밖) */}
        <div className="flex justify-center gap-4 my-6">
          <button
            onClick={toggleHourly}
            className={`px-8 py-3 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 ${
              isHourlyVisible
                ? "bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white border-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-[#E8F5E9] bg-white text-[#4F4F4F] hover:border-[#7BC67E] hover:bg-[#F8FBF8] hover:text-[#2D5F2E]"
            }`}
          >
            {isHourlyVisible ? "⏱️ 시간별 평균 숨기기" : "⏱️ 시간별 평균 보기"}
          </button>
          <button
            onClick={toggleAvg}
            className={`px-8 py-3 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 ${
              isTodayAvgVisible
                ? "bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white border-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-[#E8F5E9] bg-white text-[#4F4F4F] hover:border-[#7BC67E] hover:bg-[#F8FBF8] hover:text-[#2D5F2E]"
            }`}
          >
            {isTodayAvgVisible ? "📊 지금까지 평균 숨기기" : "📊 지금까지 평균 계산"}
          </button>
        </div>

        {/* 통계 섹션 - 시간별 평균 */}
        {isHourlyVisible && hourlyList.length > 0 && (
          <div className="mt-6" style={{ animation: "slideDown 0.3s ease" }}>
            <div className="flex flex-col gap-4">
              {hourlyList.map((r) => (
                <div
                  key={r.userId + "-" + r.hourStartTs}
                  className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-l-4 border-[#4A9D4D]"
                >
                  <div className="text-[1.1rem] font-semibold text-[#2D5F2E] mb-2">
                    {formatTimeRange(r.hourStartTs)}
                  </div>
                  <div className="text-[0.9rem] text-[#4F4F4F] mb-1">
                    거북목 경고 횟수: {r.count}, 측정 시간: {r.weight.toFixed(0)}s
                  </div>
                  <div className="text-[1.5rem] font-bold text-[#2D5F2E]">
                    avg:{" "}
                    {r.finalized === 1 && r.avgAngle != null
                      ? r.avgAngle.toFixed(2)
                      : (r.sumWeighted / Math.max(1, r.weight)).toFixed(2)}
                    °{" "}
                    <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5F2E] rounded-md text-[0.85rem] font-semibold ml-2">
                      {r.finalized === 1 ? "확정" : "진행 중"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 통계 섹션 - 지금까지 평균 */}
        {isTodayAvgVisible && todayAvg != null && (
          <div className="mt-6" style={{ animation: "slideDown 0.3s ease" }}>
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(45,95,46,0.1)] text-center border-[3px] border-[#4A9D4D]">
              <div className="text-[1.1rem] text-[#4F4F4F] mb-4">오늘 지금까지 평균:</div>
              <div className="text-[3rem] font-bold text-[#2D5F2E]">{todayAvg.toFixed(2)}°</div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-6 p-6 bg-[#FFF9E6] rounded-xl border-l-4 border-[#F59E0B]">
            <p className="text-[#92400E] leading-relaxed">⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
