"use client";

import { computeTodaySoFarAverage, finalizeUpToNow, getTodayHourly } from "@/lib/hourlyOps";
import { useState } from "react";

export default function useTodayStatus(userId: string) {
  const [hourlyList, setHourlyList] = useState<any[]>([]);
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [isHourlyVisible, setIsHourlyVisible] = useState(false);
  const [isTodayAvgVisible, setIsTodayAvgVisible] = useState(false);
  // 시간별 평균 토글
  async function toggleHourly() {
    if (isHourlyVisible) {
      setIsHourlyVisible(false);
      return;
    }
    // 다른 토글 비활성화
    setIsTodayAvgVisible(false);
    if (userId) {
      const rows = await getTodayHourly(userId);
      setHourlyList(rows);
      setIsHourlyVisible(true);
    }
  }

  //  오늘 지금까지 평균 토글
  async function toggleAvg() {
    if (isTodayAvgVisible) {
      setIsTodayAvgVisible(false);
      return;
    }
    // 다른 토글 비활성화
    setIsHourlyVisible(false);
    const avg = await computeTodaySoFarAverage(userId);

    setTodayAvg(avg);
    if (userId) await finalizeUpToNow(userId, true);
    setIsTodayAvgVisible(true);
  }
  return { toggleHourly, isHourlyVisible, toggleAvg, isTodayAvgVisible, hourlyList, todayAvg };
}
