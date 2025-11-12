"use client";

import HomeTemplate from "@/components/templates/HomeTemplate";
import { useAppStore } from "./store/app";
import { useState } from "react";
import { getTodayHourly } from "@/lib/hourlyOps";

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

// TODO: 실제 API/DB로 교체
async function getHomeData(): Promise<HomeData> {
  const turtleNeckNumberInADay = useAppStore((s) => s.turtleNeckNumberInADay);
  const [weeklySum, setWeeklySum] = useState(null);
  const [todaySum, setTodaySum] = useState(null);

  const userID = "noah"; //추후 변경
  try {
    const rows = await getTodayHourly(userID);
    setTodaySum(rows);
    const res = await fetch(`/api/summaries/daily?userId=${userID}&days=7`);
    const data = await res.json();
    setWeeklySum(data);
  } catch (e) {
    console.error("Error fetching daily summaries:", e);
  }
  return {
    user: { name: userID },
    kpis: [
      {
        label: "오늘 당신의 평균 목 각도는?",
        value: todaySum.weighted,
        unit: "°",
        delta: "up",
        deltaText: "+1°",
        deltaVariant: "success",
      },
      {
        label: "일일 거북목 경고!",
        value: turtleNeckNumberInADay,
        unit: "회",
        delta: "down",
        deltaText: "-3",
        deltaVariant: "danger",
      },
      { label: "측정 시간", value: 4, unit: "시간" },
      { label: "개선 정도", value: 10, unit: "%", caption: "파이팅이야!" },
    ],
    challenge: {
      title: "당신의 거북목 도전기",
      description: "3D 모델링으로 추후 삽입",
      progress: 30,
      ctaText: "도전 계속하기",
    },
  };
}

export default async function Page() {
  const { user, kpis, challenge } = await getHomeData();

  return <HomeTemplate user={user} kpis={kpis} challenge={challenge} />;
}
