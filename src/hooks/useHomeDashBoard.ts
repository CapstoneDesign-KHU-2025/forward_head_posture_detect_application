"use client";
import { apiRequest } from "@/lib/api/client";
import { computeTodaySoFarAverage } from "@/lib/hourlyOps";
import { getTodayCount, getTodayMeasuredSeconds } from "@/lib/postureLocal";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserProfile, WeeklySummaryData } from "@/utils/types";
import { DayStatus } from "@/utils/types";

const MIN_MEASURE_SECONDS = 300;
const GOOD_DAY_MAX_WARNINGS = 10;
const BAD_DAY_MIN_WARNINGS = 16;

type DailyRow = {
  date: string | Date;
  weightSeconds: number;
  count: number;
};

function toDateKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeDayStatusMap(rows: DailyRow[]): Record<string, DayStatus> {
  const map: Record<string, DayStatus> = {};

  for (const row of rows) {
    const weightSeconds = Number(row.weightSeconds ?? 0);
    const count = Number(row.count ?? 0);

    if (weightSeconds < MIN_MEASURE_SECONDS) continue;

    const key = toDateKey(row.date);
    if (count <= GOOD_DAY_MAX_WARNINGS) {
      map[key] = "good";
    } else if (count >= BAD_DAY_MIN_WARNINGS) {
      map[key] = "bad";
    }
  }

  return map;
}

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
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const hasEverMeasured = localStorage.getItem("hasEverMeasured");
    setIsNewUser(!hasEverMeasured);
  }, []);
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
    if ((todayCount != null && todayCount > 0) || (todayHour !== null && todayHour > 0)) {
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
    isNewUser,
  };
}
