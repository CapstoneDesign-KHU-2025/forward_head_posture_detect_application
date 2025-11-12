"use client";

import { useState } from "react";
import { useTurtleNeckTracker } from "@/hooks/useTurtleNeckTracker";
import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import { getTodayHourly, computeTodaySoFarAverage, finalizeUpToNow } from "@/lib/hourlyOps";
import { useClearPostureDBOnLoad } from "@/hooks/useClearDBOnload";

export default function Estimate() {
  const userId = "noah";
  const sessionId = "session-noah";
  useClearPostureDBOnLoad({ oncePerTab: true });
  const { videoRef, canvasRef, isTurtle, angle, error } = useTurtleNeckTracker({ autoStart: true });
  usePostureStorageManager(userId, angle, isTurtle, sessionId);

  const [hourlyList, setHourlyList] = useState<any[]>([]);
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [isHourlyVisible, setIsHourlyVisible] = useState(false);
  const [isTodayAvgVisible, setIsTodayAvgVisible] = useState(false);

  
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
    <div className="relative flex min-h-screen items-center bg-black/5">
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
        <button onClick={toggleHourly} className="px-3 py-2 rounded bg-white/90 shadow hover:bg-white transition">
          {isHourlyVisible ? "⏱️ 시간별 평균 숨기기" : "⏱️ 시간별 평균 보기"}
        </button>

        <button onClick={toggleAvg} className="px-3 py-2 rounded bg-white/90 shadow hover:bg-white transition">
          {isTodayAvgVisible ? "📊 지금까지 평균 숨기기" : "📊 지금까지 평균 계산 "}
        </button>

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
