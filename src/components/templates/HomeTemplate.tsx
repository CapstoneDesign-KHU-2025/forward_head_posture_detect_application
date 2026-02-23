import WelcomeHero from "@/components/organisms/home/WelcomeHero";
import StatCard from "@/components/molecules/StatCard";
import TodayStatusCard from "@/components/molecules/TodayStatusCard";
import TurtleEvolutionCard from "@/components/molecules/TurtleEvolutionCard";
import AverageTabsCard, { type HourlyStat } from "@/components/molecules/AverageTabsCard";
import { formatMeasuredTime } from "@/utils/formatMeasuredTime";
import GraphicModelPanel from "@/components/organisms/home/GraphicModelPanel";
import CalendarCard from "@/components/molecules/CalendarCard";
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
  /** 오늘 지금까지 평균 목 각도 (탭 카드용) */
  todayAvg?: number | null;
  /** 시간대별 평균 각도 리스트 (탭 카드용) */
  hourlyStats?: HourlyStat[];
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
  todayAvg = null,
  hourlyStats = [],
  isNewUser,
  goodDays = 0,
  className,
}: HomeTemplateProps) {
  const measureTimeKpi = kpis?.find(
    (kpi) => kpi.label === "측정 시간" || (typeof kpi.label === "string" && kpi.label.includes("측정 시간")),
  );
  const warningKpi = kpis?.find(
    (kpi) =>
      kpi.label === "오늘 거북목 경고 횟수" ||
      (typeof kpi.label === "string" && kpi.label.includes("경고 횟수")),
  );
  const measureTimeDisplay =
    measureTimeKpi && typeof measureTimeKpi.value === "number" && measureTimeKpi.value > 0
      ? formatMeasuredTime(measureTimeKpi.value)
      : "00:00";
  const isMeasuring = false; // TODO: 실시간 측정 중일 때 true 연동

  return (
    <main className={["bg-[#f4faf6] flex flex-col", className].filter(Boolean).join(" ")}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col min-h-0 px-7 py-4 pb-6 gap-[14px]">
          {/* 1행: 인사(2칸) + 캘린더(1칸) / 2행: 배너+평균 | 도전기 | 진화+스탯 (세로 높이 맞춤) */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_340px] gap-[14px] items-stretch min-h-0 flex-1">
            {/* 1행 왼쪽(2칸): 인사 */}
            <div className="md:col-span-2 flex-shrink-0">
              <WelcomeHero userName={user?.name ?? "사용자"} />
            </div>

            {/* 1행 오른쪽(1칸): 캘린더 — 인사와 같은 줄 */}
            <div className="h-[270px] flex-shrink-0 md:row-span-1">
              <CalendarCard className="h-full" />
            </div>

            {/* 2행 왼쪽: 오늘도 화이팅 + 시간별/누적 평균 */}
            <div className="flex flex-col gap-3 min-h-0">
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
                <div className="flex-1 min-h-0 flex flex-col">
                  <TodayStatusCard
                    warningCount={warningCount}
                    isNewUser={isNewUser}
                    className="h-full min-h-0"
                  />
                </div>
              </AsyncBoundary>
              <div className="flex-1 min-h-0 flex flex-col">
                <AverageTabsCard
                  hourlyStats={hourlyStats}
                  todayAvg={todayAvg}
                  className="h-full min-h-0 flex flex-col"
                />
              </div>
            </div>

            {/* 2행 가운데: 당신의 거북목 도전기 */}
            <div className="min-h-0 flex flex-col">
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
                className="h-full min-h-0 flex-1"
              />
            </div>

            {/* 2행 오른쪽: 진화(세로 늘어남) + 스탯(세로 고정) */}
            <div className="flex flex-col gap-3 min-h-0">
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
                <div className="flex-1 min-h-0 flex flex-col">
                  <TurtleEvolutionCard goodDays={goodDays} className="h-full min-h-0 flex-1 flex flex-col" />
                </div>
              </AsyncBoundary>
              <div className="flex gap-3 flex-shrink-0">
                <StatCard
                  label="측정 시간"
                  value={measureTimeDisplay}
                  unit={measureTimeKpi?.unit}
                  caption={isMeasuring ? "실시간 측정 중" : "측정 중 아님"}
                  isLive={isMeasuring}
                />
                <StatCard
                  label="경고 횟수"
                  value={
                    warningCount != null
                      ? String(warningCount)
                      : warningKpi != null && warningKpi.value != null
                        ? String(warningKpi.value)
                        : "-"
                  }
                  unit="회"
                  caption="오늘 기준"
                  showCaptionDot={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
