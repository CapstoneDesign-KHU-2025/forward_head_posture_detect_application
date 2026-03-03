"use client";

import { useEffect, useState, useMemo } from "react";
import HomeTemplate from "@/components/templates/HomeTemplate";
import ErrorBanner from "@/components/atoms/ErrorBanner";
import { useMeasurement } from "@/providers/MeasurementProvider";

import { apiRequest } from "@/lib/api/client";
import { computeTodaySoFarAverage } from "@/lib/hourlyOps";
import { computeDayStatusMap } from "@/utils/computeDayStatusMap";
import { getTodayCount, getTodayMeasuredSeconds } from "@/lib/postureLocal";
import { computeImprovementPercent } from "@/utils/computeImprovementPercent";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "../molecules/LoadingSkeleton";

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

type HomeData = {
  user: { name: string; avgAng: number; avatarSrc?: string };
  kpis: Array<{
    label: string;
    value: number | string;
    unit?: string;
    delta?: "up" | "down";
    deltaText?: string;
    deltaVariant?: "neutral" | "success" | "warning" | "danger";
    caption?: string;
  }>;
  challenge: {
    title: string;
    description: string;
    progress: number;
    ctaText: string;
  };
};

export default function HomeClient({ weeklyData, user }: HomeClientProps) {
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

  if (error) {
    return <ErrorBanner error={error} />;
  }

  const isEmptyState = loading;
  const improvement = computeImprovementPercent(weeklyAvg, todayAvg);

  const improvementText =
    improvement == null
      ? t("improvementText.lack_of_data")
      : improvement >= 0
        ? `${improvement.toFixed(1)}% ${t("improvementText.improve")}`
        : `${Math.abs(improvement).toFixed(1)}%  ${t("improvementText.worse")}`;

  const improvementValue = improvement == null ? 0 : Math.max(-100, Math.min(100, improvement));

  const homeData: HomeData = {
    user: {
      name: user.name,
      avgAng: todayAvg ?? 52,
      avatarSrc: user.image,
    },
    kpis: isEmptyState
      ? [
          {
            label: t("HomeData.empty.label"),
            value: t("HomeData.empty.value"),
            unit: "",
            caption: t("HomeData.empty.caption"),
          },
        ]
      : [
          {
            label: t("HomeData.kpi.avgAngle.label"),
            value: todayAvg != null ? todayAvg.toFixed(1) : loading ? t("HomeData.kpi.avgAngle.loading") : "-",
            unit: "°",
            delta: "up",
            deltaText: weeklyAvg != null && todayAvg != null ? `${(todayAvg - weeklyAvg).toFixed(1)}°` : "",
            deltaVariant:
              weeklyAvg != null && todayAvg != null ? (todayAvg <= weeklyAvg ? "success" : "warning") : "neutral",
            caption: weeklyAvg != null && todayAvg != null ? t("HomeData.kpi.avgAngle.caption") : undefined,
          },
          {
            label: t("HomeData.kpi.warningCount.label"),
            value: todayCount != null ? todayCount : loading ? t("HomeData.kpi.avgAngle.loading") : "-",
            unit: t("HomeData.kpi.warningCount.unit"),
            delta: "down",
            deltaText: "",
            deltaVariant: "danger",
            caption: t("HomeData.kpi.warningCount.caption"),
          },
          {
            label: t("HomeData.kpi.measurementTime.label"),
            value: todayHour != null && todayHour > 0 ? todayHour : t("HomeData.kpi.measurementTime.emptyValue"),
            unit: "",
          },
          {
            label: t("HomeData.kpi.improvement.label"),
            value: improvementValue.toFixed(2),
            unit: "%",
            caption: improvementText,
          },
        ],
    challenge: {
      title: isEmptyState ? t("HomeData.challenge.emptyTitle") : t("HomeData.challenge.title"),

      description: t("HomeData.challenge.description"),
      progress: isEmptyState ? 0 : 30,
      ctaText: t("HomeData.challenge.cta"),
    },
  };

  const warningCount =
    (todayCount === 0 && todayHour === 0) || todayCount === null || todayCount === undefined ? null : todayCount;
  if (isCheckingRedirect) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--green-pale)]">
        <LoadingSkeleton />
      </div>
    );
  }
  return (
    <HomeTemplate
      user={homeData.user}
      kpis={homeData.kpis}
      challenge={homeData.challenge}
      warningCount={warningCount}
      isNewUser={isNewUser}
      goodDays={goodDays}
      dayStatusMap={dayStatusMap}
      isMeasuring={isMeasuring}
    />
  );
}
