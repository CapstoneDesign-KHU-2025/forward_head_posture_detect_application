"use client";

import { computeTodaySoFarAverage, finalizeUpToNow, getTodayHourly } from "@/lib/hourlyOps";
import { useState } from "react";

export default function useTodayStatus(userId: string) {
  const [hourlyList, setHourlyList] = useState<any[]>([]);
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [isHourlyVisible, setIsHourlyVisible] = useState(false);
  const [isTodayAvgVisible, setIsTodayAvgVisible] = useState(false);

  async function toggleHourly() {
    if (isHourlyVisible) {
      setIsHourlyVisible(false);
      return;
    }
    setIsTodayAvgVisible(false);
    if (userId) {
      const rows = await getTodayHourly(userId);
      setHourlyList(rows);
      setIsHourlyVisible(true);
    }
  }

  async function toggleAvg() {
    if (isTodayAvgVisible) {
      setIsTodayAvgVisible(false);
      return;
    }

    setIsHourlyVisible(false);
    const avg = await computeTodaySoFarAverage(userId);

    setTodayAvg(avg);
    if (userId) await finalizeUpToNow(userId, true);
    setIsTodayAvgVisible(true);
  }
  return { toggleHourly, isHourlyVisible, toggleAvg, isTodayAvgVisible, hourlyList, todayAvg };
}
