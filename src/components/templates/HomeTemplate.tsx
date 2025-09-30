// src/components/template/HomeTemplate.tsx
import * as React from "react";
import Link from "next/link";
import WelcomeHero from "@/components/organisms/home/WelcomeHero";
import StatCard from "@/components/molecules/StatCard";
import ChallengePanel from "@/components/organisms/home/ChallengePanel";
import { Button } from "@/components/atoms/button/Button";

type KPIItem = {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  delta?: "up" | "down";
  deltaText?: React.ReactNode;
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  deltaPosition?: "start" | "end";
  caption?: React.ReactNode;
};

type HomeTemplateProps = {
  user: { name: string; avatarSrc?: string } | null;
  kpis: KPIItem[];
  challenge?: {
    title?: React.ReactNode;
    description?: React.ReactNode;
  };
  className?: string;
};

export default function HomeTemplate({
  user,
  kpis,
  challenge,
  className,
}: HomeTemplateProps) {
  return (
    <main className={["space-y-10 py-8", className].filter(Boolean).join(" ")}>
      {/* 상단 히어로 (중앙 정렬) */}
      <WelcomeHero
        userName={user?.name ?? "사용자"}
      />

      {/* 본문 2열 레이아웃: 좌(KPI), 우(도전기) */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: 오늘의 거북목 섹션 */}
          <div className="space-y-4">
            {/* 섹션 타이틀 + 액션 버튼 2개 */}
            <div className="flex flex-col items-start text-left">
              <h2 className="text-2xl font-bold tracking-tight">오늘의 거북목</h2>
              <div className="flex items-center gap-5 mt-4">
                <Link href="/goals">
                  <Button variant="secondary">목표 설정하기</Button>
                </Link>
                <Link href="/metrics">
                  <Button>더 자세한 지표 보기</Button>
                </Link>
              </div>
            </div>

            {/* KPI 카드 2 x 2 */}
            {kpis && kpis.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 mt-12">
                {kpis.slice(0, 4).map((it, idx) => (
                  <StatCard key={idx} {...it} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-black/10 bg-white p-6 text-center">
                <p className="text-sm text-black/60">
                  아직 지표가 없어요. 먼저 측정을 시작해볼까요?
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: 도전기 카드 */}
          <div>
            <ChallengePanel
              title={challenge?.title ?? "당신의 거북목 도전기"}
              description={challenge?.description ?? "3D 모델링으로 추후 삽입"}
            />
          </div>
        </div>
      </section>
    </main>
  );
}