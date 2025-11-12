"use client";
// 메인 페이지 (서버 컴포넌트)
import HomeTemplate from "@/components/templates/HomeTemplate";

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
  return {
    user: { name: "허준" },
    kpis: [
      {
        label: "오늘 당신의 평균 목 각도는?",
        value: 3,
        unit: "°",
        delta: "up",
        deltaText: "+1°",
        deltaVariant: "success",
      },
      { label: "일일 거북목 경고!", value: 15, unit: "회", delta: "down", deltaText: "-3", deltaVariant: "danger" },
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
