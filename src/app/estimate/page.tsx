"use client";

import { useState } from "react";
import { useTurtleNeckTracker } from "@/hooks/useTurtleNeckTracker";
import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import { getTodayHourly, computeTodaySoFarAverage, finalizeUpToNow } from "@/lib/hourlyOps";
import { useClearPostureDBOnLoad } from "@/hooks/useClearDBOnload";
import { Button } from "@/components/atoms/button/Button";
import { useAppStore } from "../store/app";

export default function Estimate() {
  const userId = "noah"; //임의 지정
  const sessionId = "session-noah"; //임의 지정
  useClearPostureDBOnLoad({ oncePerTab: true });
  const { videoRef, canvasRef, isTurtle, angle, error } = useTurtleNeckTracker({ autoStart: true });
  usePostureStorageManager(userId, angle, isTurtle, sessionId);

  const [hourlyList, setHourlyList] = useState<any[]>([]);
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [isHourlyVisible, setIsHourlyVisible] = useState(false);
  const [isTodayAvgVisible, setIsTodayAvgVisible] = useState(false);
  const [stopEstimating, setStopEstimating] = useState(false);
  const turtleNeckNumberInADay = useAppStore((s) => s.turtleNeckNumberInADay);

  const handleStopEstimating = async () => {
    try {
      if (!stopEstimating) {
        // stop 으로 전환되는 시점: 오늘 기록을 합산해 일일 요약 저장
        const rows = await getTodayHourly(userId);

        // IndexedDB "hourly"에 이미 누적되어 있는 필드 활용
        const dailySumWeighted = rows?.reduce((acc: number, r: any) => acc + (r?.sumWeighted ?? 0), 0) ?? 0;

        const dailyWeightSeconds = rows?.reduce((acc: number, r: any) => acc + (r?.weight ?? 0), 0) ?? 0;

        // 로컬 기준 YYYY-MM-DD
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const dateISO = `${yyyy}-${mm}-${dd}`;

        await fetch("/api/summaries/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            dateISO,
            sumWeighted: dailySumWeighted,
            weightSeconds: dailyWeightSeconds,
            count: turtleNeckNumberInADay,
          }),
        });
      }
    } catch (err) {
      console.error("[handleStopEstimating] error:", err);
    } finally {
      setStopEstimating((prev) => !prev);
    }
  };

  async function toggleHourly() {
    if (isHourlyVisible) {
      setIsHourlyVisible(false);
      return;
    }

    const rows = await getTodayHourly(userId);
    setHourlyList(rows);
    setIsHourlyVisible(true);
  }

  async function toggleAvg() {
    if (isTodayAvgVisible) {
      setIsTodayAvgVisible(false);
      return;
    }
    const rows = await computeTodaySoFarAverage(userId);
    setTodayAvg(rows);
    await finalizeUpToNow(userId, true);
    setIsTodayAvgVisible(true);
  }

  return (
    <div className="relative flex min-h-screen items-center bg-black/5 flex-col gap-6 p-6 pt-20">
      <Button onClick={handleStopEstimating}>{stopEstimating ? "측정 시작하기" : "오늘의 측정 중단하기"}</Button>
      <video ref={videoRef} className="absolute -left-[9999px]" />
      <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-lg" />

      {isTurtle && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/80 text-white px-5 py-2.5 rounded-xl font-bold text-lg shadow-md">
          거북목 자세입니다! ({angle.toFixed(1)}°)
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-md text-xs">⚠️ {error}</div>
      )}

      <div className="absolute right-4 top-4 space-y-2">
        <Button onClick={toggleHourly} variant="secondary">
          {isHourlyVisible ? "⏱️ 시간별 평균 숨기기" : "⏱️ 시간별 평균 보기"}
        </Button>

        <Button onClick={toggleAvg} variant="secondary">
          {isTodayAvgVisible ? "📊 지금까지 평균 숨기기" : "📊 지금까지 평균 계산 "}
        </Button>

        {todayAvg != null && isTodayAvgVisible && (
          <div className="mt-2 text-sm bg-white/90 rounded px-3 py-2 shadow">
            오늘 지금까지 평균: <b>{todayAvg.toFixed(2)}°</b>
          </div>
        )}

        {isHourlyVisible && hourlyList.length > 0 && (
          <div className="mt-2 max-h-[40vh] overflow-auto bg-white/90 rounded px-3 py-2 shadow text-xs">
            {hourlyList.map((r) => (
              <div key={r.userId + "-" + r.hourStartTs} className="py-1 border-b last:border-b-0">
                <div>
                  <b>
                    {new Date(r.hourStartTs).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </b>{" "}
                  ~{" "}
                  {new Date(r.hourStartTs + 3600000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  count: {r.count}, weight: {r.weight.toFixed(0)}s
                </div>
                <div>
                  avg:{" "}
                  <b>
                    {r.finalized === 1 && r.avgAngle != null
                      ? r.avgAngle.toFixed(2)
                      : (r.sumWeighted / Math.max(1, r.weight)).toFixed(2)}
                    °
                  </b>{" "}
                  {r.finalized === 1 ? "(확정)" : "(진행 중)"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
