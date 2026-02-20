import WelcomeHero from "@/components/organisms/home/WelcomeHero";
import StatCard from "@/components/molecules/StatCard";
import TodayStatusCard from "@/components/molecules/TodayStatusCard";
import TitleCard from "@/components/molecules/TitleCard";
import { formatMeasuredTime } from "@/utils/formatMeasuredTime";
import GraphicModelPanel from "@/components/organisms/home/GraphicModelPanel";
import AsyncBoundary from "../common/AsyncBoundary";
import LoadingSkeleton from "../common/LoadingSkeleton";

type KPIItem = {
  label: string;
  value: number | string;
  unit?: string;
  delta?: "up" | "down";
  deltaText?: string;
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  caption?: string;
};

type HomeTemplateProps = {
  user: { name: string; avgAng: number; avatarSrc?: string } | null;
  kpis: KPIItem[];
  challenge?: {
    title?: React.ReactNode;
    description?: React.ReactNode;
  };
  /** 오늘의 경고 횟수 (상태 카드용, null이면 데이터 없음) */
  warningCount?: number | null;
  /** 신규 사용자 여부 (true: 완전 신규, false: 기존 사용자) */
  isNewUser?: boolean;
  /** 누적 좋은 날 수 (칭호 카드용) */
  goodDays?: number;
  className?: string;
};

export default function HomeTemplate({
  user,
  kpis,
  challenge,
  warningCount = null,
  isNewUser,
  goodDays = 0,
  className,
}: HomeTemplateProps) {
  // 측정 시간 KPI 찾기
  const measureTimeKpi = kpis?.find(
    (kpi) => kpi.label === "측정 시간" || (typeof kpi.label === "string" && kpi.label.includes("측정 시간")),
  );

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
            <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
              {/* 상태 카드 - 메인 */}
              <TodayStatusCard warningCount={warningCount} isNewUser={isNewUser} />
            </AsyncBoundary>

            {/* 서브 정보 카드 */}
            <div className="flex gap-4">
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
                <div className="flex-[0.7]">
                  {/* 측정 시간 카드 */}
                  {measureTimeKpi && typeof measureTimeKpi.value === "number" && measureTimeKpi.value > 0 ? (
                    <StatCard
                      label={measureTimeKpi.label}
                      value={formatMeasuredTime(measureTimeKpi.value)}
                      unit={measureTimeKpi.unit}
                    />
                  ) : (
                    <StatCard label="측정 시간" value="측정을 시작해보세요!" />
                  )}
                </div>
              </AsyncBoundary>
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
                <div className="flex-[1.3]">
                  {/* 칭호 카드 */}
                  <TitleCard goodDays={goodDays} />
                </div>
              </AsyncBoundary>
            </div>
          </div>

          {/* RIGHT: 측정 섹션 */}
          <div>
            <GraphicModelPanel
              userAng={user?.avgAng}
              title={challenge?.title ?? "당신의 거북목 도전기"}
              description={
                challenge?.description ?? (
                  <>
                    측정을 시작하면 오늘의 평균 목 각도와
                    <br />
                    도전 현황이 여기에 표시됩니다.
                  </>
                )
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
