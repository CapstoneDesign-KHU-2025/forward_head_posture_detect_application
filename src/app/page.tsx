"use client";

import { useEffect, useState } from "react";
import HomeTemplate from "@/components/templates/HomeTemplate";
import { useAppStore } from "./store/app";
import { computeTodaySoFarAverage } from "@/lib/hourlyOps";
import { useSession } from "next-auth/react";
import { getTodayCount, getTodayMeasuredSeconds } from "@/lib/postureLocal";
import { formatMeasuredTime } from "@/utils/formatMeasuredTime";
import { computeImprovementPercent } from "@/utils/computeImprovementPercent";
type HomeData = {
  user: { name: string; avgAng: number; avatarSrc?: string } | null;
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

type WeeklySummaryResponse = {
  mode: "weekly";
  days: number;
  weightedAvg: number | null;
  rows: Array<{
    date: string;
    avgAngle: number;
    weightSeconds: number;
  }>;
};

export default function Page() {
  const { data: session, status } = useSession();

  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [weeklyAvg, setWeeklyAvg] = useState<number | null>(null);
  const [todayHour, setTodayHour] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(0);
  const userId = (session?.user as any)?.id as string | undefined;

  useEffect(() => {
    let cancelled = false;
    if (status === "loading") return;

    if (!userId || status !== "authenticated") {
      setTodayAvg(null);
      setWeeklyAvg(null);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) 오늘 지금까지의 시간대별 데이터를 IndexedDB에서 읽어서 평균 계산
        const todayAverage = await computeTodaySoFarAverage(userId);
        const todayCount = await getTodayCount(userId);
        const todayHours = await getTodayMeasuredSeconds(userId);
        if (!cancelled) {
          setTodayAvg(todayAverage);
          setTodayCount(todayCount);
          setTodayHour(todayHours);
        }

        // 2) 서버에서 최근 7일 요약 가져오기
        const res = await fetch(`/api/summaries/daily?userId=${userId}&days=7`);
        if (!res.ok) {
          throw new Error(`Failed to fetch weekly summary: ${res.status}`);
        }
        const data: WeeklySummaryResponse = await res.json();

        if (!cancelled) {
          setWeeklyAvg(data.weightedAvg ?? null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? "알 수 없는 에러");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, status]);

  if (status === "loading") return <div> 로딩중 ...</div>;
  if (!session || !userId) return <div> 로그인이 필요해요 </div>;

  const isEmptyState = loading || error;

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
      name: session.user?.name || "사용자",
      avgAng: todayAvg ? todayAvg : 52,
      avatarSrc: session.user?.image || undefined,
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
            value:
              todayAvg != null
                ? todayAvg.toFixed(1) // 소수 1자리
                : loading
                ? "로딩 중..."
                : "-",
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
            value: todayHour ? formatMeasuredTime(todayHour) : "측정을 시작해보세요!",
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

  // 에러 표시(필요하면 따로 UI로 빼도 됨)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-red-700 shadow">
          <p className="font-semibold">홈 데이터를 불러오지 못했어요 😥</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return <HomeTemplate user={homeData.user} kpis={homeData.kpis} challenge={homeData.challenge} />;
}
