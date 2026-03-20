"use client";
import { apiRequest } from "@/lib/api/client";
import { computeTodaySoFarAverage } from "@/lib/hourlyOps";
import { getTodayCount, getTodayMeasuredSeconds } from "@/lib/postureLocal";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { computeDayStatusMap } from "@/utils/computeDayStatusMap";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";

type WeeklySummaryRow = {
  id: number;
  userId: string;
  avgAngle: number;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
  date: string | Date;
  goodDay: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};
export type WeeklySummaryData = {
  mode: "weekly" | "dynamic";
  requestedDays: number;
  actualDataDays: number;
  weightedAvg: number | null;
  safeRows: WeeklySummaryRow[];
  goodDays: number;
};

type UserProfile = {
  id: string;
  name: string;
  image?: string;
};
type HomeClientProps = {
  weeklyData: WeeklySummaryData | null;
  user: UserProfile;
};

export default function useHomeDashBoard({ weeklyData, user }: HomeClientProps) {
  const { stopEstimating, measurementStarted } = useMeasurement();
  const isMeasuring = !stopEstimating && measurementStarted;

  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [todayHour, setTodayHour] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const weeklyAvg = weeklyData?.weightedAvg ?? null;
  const goodDays = weeklyData?.goodDays ?? 0;

  const [calendarRows, setCalendarRows] = useState<WeeklySummaryRow[]>([]);
  const t = useTranslations("HomeClient");
  const router = useRouter();
  useEffect(() => {
    const hasCharacter = localStorage.getItem("selectedCharacter")?.trim();
    if (!hasCharacter) {
      router.replace("/character");
      return;
    } else {
      setIsCheckingRedirect(false);
    }
    let cancelled = false;

    apiRequest<{ safeRows: WeeklySummaryRow[] }>({ requestPath: "/summaries/daily?days=90" })
      .then((result) => {
        if (!cancelled && result.ok && result.data?.safeRows) setCalendarRows(result.data.safeRows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  const dayStatusMap = useMemo(() => computeDayStatusMap(calendarRows), [calendarRows]);

  const [isNewUser, setIsNewUser] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("hasEverMeasured");
  });

  useEffect(() => {
    let cancelled = false;

    async function loadLocalData() {
      try {
        setLoading(true);
        setError(null);

        const avg = await computeTodaySoFarAverage(user.id);
        const count = await getTodayCount(user.id);
        const hours = await getTodayMeasuredSeconds(user.id);

        if (!cancelled) {
          setTodayAvg(avg);
          setTodayCount(count);
          setTodayHour(hours);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLocalData();

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (
      (typeof window !== "undefined" && todayCount !== null && todayCount > 0) ||
      (todayHour !== null && todayHour > 0)
    ) {
      localStorage.setItem("hasEverMeasured", "true");
      setIsNewUser(false);
    }
  }, [todayCount, todayHour]);

  return {
    error,
    loading,
    weeklyAvg,
    todayAvg,
    todayCount,
    todayHour,
    isCheckingRedirect,
    goodDays,
    dayStatusMap,
    isMeasuring,
    t,
  };
}
