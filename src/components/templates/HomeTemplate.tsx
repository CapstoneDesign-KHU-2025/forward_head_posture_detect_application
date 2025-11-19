import * as React from "react";
import WelcomeHero from "@/components/organisms/home/WelcomeHero";
import StatCard from "@/components/molecules/StatCard";
import ChallengePanel from "@/components/organisms/home/ChallengePanel";

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

export default function HomeTemplate({ user, kpis, challenge, className }: HomeTemplateProps) {
  return (
    <main className={["bg-[#F8FBF8] min-h-screen", className].filter(Boolean).join(" ")}>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <WelcomeHero userName={user?.name ?? "사용자"} />

        {/* 본문 2열 레이아웃: 좌(KPI), 우(도전기) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* LEFT: 오늘의 거북목 섹션 */}
          <div className="flex flex-col gap-6">
            {/* 섹션 타이틀 */}
            <h2 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-2">오늘의 거북목</h2>

            {kpis && kpis.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {kpis.slice(0, 4).map((it, idx) => (
                  <StatCard key={idx} {...it} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white p-6 text-center border-l-4 border-[#7BC67E] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <p className="text-sm text-[#4F4F4F]">아직 지표가 없어요. 먼저 측정을 시작해볼까요?</p>
              </div>
            )}
          </div>

          {/* RIGHT: 측정 섹션 */}
          <div>
            <ChallengePanel
              title={challenge?.title ?? "당신의 거북목 도전기"}
              description={challenge?.description ?? "측정을 시작하면 오늘의 평균 목 각도와 도전! 현황이 여기에 표시됩니다."}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
