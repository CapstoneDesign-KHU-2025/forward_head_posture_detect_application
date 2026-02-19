"use client";

import { useEffect, useState } from "react";
import HomeTemplate from "@/components/templates/HomeTemplate";
import ErrorBanner from "@/components/atoms/ErrorBanner";

import { computeTodaySoFarAverage } from "@/lib/hourlyOps";
import { getTodayCount, getTodayMeasuredSeconds } from "@/lib/postureLocal";
import { computeImprovementPercent } from "@/utils/computeImprovementPercent";

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
  mode: "weekly";
  days: number;
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
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [todayHour, setTodayHour] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weeklyAvg = weeklyData?.weightedAvg ?? null;
  const goodDays = weeklyData?.goodDays ?? 0;

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
          setError(e.message ?? "알 수 없는 에러가 발생했습니다.");
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
      ? "데이터 부족"
      : improvement >= 0
        ? `${improvement.toFixed(1)}% 개선`
        : `${Math.abs(improvement).toFixed(1)}% 악화`;

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
            label: "아직 측정 기록이 없어요",
            value: "첫 측정을 시작해보세요!",
            unit: "",
            caption: "웹캠 측정을 시작하면 오늘의 평균 목 각도가 여기 보여져요.",
          },
        ]
      : [
          {
            label: "오늘 당신의 평균 목 각도는?",
            value: todayAvg != null ? todayAvg.toFixed(1) : loading ? "로딩 중..." : "-",
            unit: "°",
            delta: "up",
            deltaText: weeklyAvg != null && todayAvg != null ? `${(todayAvg - weeklyAvg).toFixed(1)}°` : "",
            deltaVariant:
              weeklyAvg != null && todayAvg != null ? (todayAvg <= weeklyAvg ? "success" : "warning") : "neutral",
            caption: weeklyAvg != null && todayAvg != null ? "최근 7일과 비교한 변화량" : undefined,
          },
          {
            label: "오늘 거북목 경고 횟수",
            value: todayCount != null ? todayCount : loading ? "로딩 중..." : "-",
            unit: "회",
            delta: "down",
            deltaText: "",
            deltaVariant: "danger",
            caption: "경고 횟수가 줄어들수록 좋아요!",
          },
          {
            label: "측정 시간",
            value: todayHour != null && todayHour > 0 ? todayHour : "측정을 시작해보세요!",
            unit: "",
          },
          {
            label: "개선 정도",
            value: improvementValue.toFixed(2),
            unit: "%",
            caption: improvementText,
          },
        ],
    challenge: {
      title: isEmptyState ? "첫 거북목 측정을 시작해볼까요 ?" : "당신의 거북목 도전기",
      description: "측정을 시작하면 오늘의 평균 목 각도와 도전 현황이 여기에 표시됩니다.",
      progress: isEmptyState ? 0 : 30,
      ctaText: "도전 계속하기",
    },
  };

  const warningCount =
    (todayCount === 0 && todayHour === 0) || todayCount === null || todayCount === undefined ? null : todayCount;

  return (
    <HomeTemplate
      user={homeData.user}
      kpis={homeData.kpis}
      challenge={homeData.challenge}
      warningCount={warningCount}
      isNewUser={isNewUser}
      goodDays={goodDays}
    />
  );
}
