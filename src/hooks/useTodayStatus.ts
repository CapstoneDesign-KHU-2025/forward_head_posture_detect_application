"use client";

import {
  computeTodaySoFarAverage,
  finalizeUpToNow,
  getTodayHourly,
  HourlyRow,
} from "@/lib/hourlyOps";
import { useState } from "react";

export default function useTodayStatus(userId: string) {
  const [hourlyList, setHourlyList] = useState<HourlyRow[]>([]);
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [isHourlyVisible, setIsHourlyVisible] = useState(false);
  const [isTodayAvgVisible, setIsTodayAvgVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleHourly() {
    if (isHourlyVisible) {
      setIsHourlyVisible(false);
      return;
    }
    setIsTodayAvgVisible(false);

    if (!userId || isLoading) return;
    try {
      setIsLoading(true);

      const rows = await getTodayHourly(userId);
      setHourlyList(rows);
      setIsHourlyVisible(true);
    } catch (error) {
      console.error("Failed to load hourly data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAvg() {
    if (isTodayAvgVisible) {
      setIsTodayAvgVisible(false);
      return;
    }

    setIsHourlyVisible(false);

    if (!userId || isLoading) return;
    try {
      setIsLoading(true);

      const avg = await computeTodaySoFarAverage(userId);
      setTodayAvg(avg);
      setIsTodayAvgVisible(true);

      void finalizeUpToNow(userId, true);
    } catch (error) {
      console.error("Failed to load today avg:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return {
    toggleHourly,
    isHourlyVisible,
    toggleAvg,
    isTodayAvgVisible,
    hourlyList,
    todayAvg,
  };
}
