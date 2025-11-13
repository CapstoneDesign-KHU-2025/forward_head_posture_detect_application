"use client";

import { useEffect, useState } from "react";
import HomeTemplate from "@/components/templates/HomeTemplate";
import { useAppStore } from "./store/app";
import { getTodayHourly, computeTodaySoFarAverage } from "@/lib/hourlyOps";

type HomeData = {
  user: { name: string; avatarSrc?: string } | null;
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
  const userId = "noah"; // TODO: 나중에 실제 로그인 유저 ID로 교체 (예: session.user.id)
  const turtleNeckNumberInADay = useAppStore((s) => s.turtleNeckNumberInADay);

  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [weeklyAvg, setWeeklyAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 처음 렌더링될 때 유저 데이터/통계 가져오기
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) 오늘 지금까지의 시간대별 데이터를 IndexedDB에서 읽어서 평균 계산
        const todayAverage = await computeTodaySoFarAverage(userId);
        if (!cancelled) {
          setTodayAvg(todayAverage);
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
          console.error("Error loading home data:", e);
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
  }, [userId]);

  // 🔹 HomeTemplate에 넣어줄 데이터 구성
  const homeData: HomeData = {
    user: { name: userId },
    kpis: [
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
        value: turtleNeckNumberInADay,
        unit: "회",
        delta: "down",
        deltaText: "",
        deltaVariant: "danger",
        caption: "경고 횟수가 줄어들수록 좋아요!",
      },
      {
        label: "측정 시간",
        value: todayAvg != null && weeklyAvg != null ? "오늘 열심히 측정 중 🔍" : "—",
        unit: "",
      },
      {
        label: "개선 정도",
        value: weeklyAvg != null && todayAvg != null ? 10 : 0,
        unit: "%",
        caption: "파이팅이야! 💪",
      },
    ],
    challenge: {
      title: "당신의 거북목 도전기",
      description: "3D 모델링으로 추후 삽입 예정",
      progress: 30,
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
