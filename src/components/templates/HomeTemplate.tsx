import WelcomeHero from "@/components/organisms/home/WelcomeHero";
import Posture3DCard from "@/components/organisms/home/Posture3DCard";
import StatCard from "@/components/molecules/StatCard";
import { Calendar, type DayStatus } from "@/components/molecules/Calendar";
import TodayStatusCard from "@/components/molecules/TodayStatusCard";
import TurtleEvolutionCard from "@/components/molecules/TurtleEvolutionCard";
import { formatMeasuredTime } from "@/utils/formatMeasuredTime";
import AsyncBoundary from "@/components/molecules/AsyncBoundary";

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
  /** 캘린더 날짜별 상태 (YYYY-MM-DD -> good | bad) */
  dayStatusMap?: Record<string, DayStatus>;
  /** 실시간 측정 중 여부 (측정 시간 카드 상태 점 표시용) */
  isMeasuring?: boolean;
  className?: string;
};

export default function HomeTemplate({
  user,
  kpis,
  challenge,
  warningCount = null,
  isNewUser,
  goodDays = 0,
  dayStatusMap = {},
  isMeasuring = false,
  className,
}: HomeTemplateProps) {
  // 측정 시간 KPI 찾기
  const measureTimeKpi = kpis?.find(
    (kpi) => kpi.label === "측정 시간" || (typeof kpi.label === "string" && kpi.label.includes("측정 시간")),
  );

  const todayWarningCount = warningCount ?? 0;
  const avgAngle = user?.avgAng ?? null;
  const idealAngle = 52;
  const deltaFromIdeal =
    avgAngle != null && Number.isFinite(avgAngle) ? avgAngle - idealAngle : null;

  return (
    <main
      className={[
        "w-full bg-[var(--green-pale)]",
        // lg 기준 큰 화면: 화면 꽉 채우고 스크롤 없음
        "lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden",
        // lg 미만 작은 화면: 자연스럽게 스크롤
        "overflow-y-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "mx-auto w-full max-w-[1400px] gap-3.5 px-4 pb-[100px] pt-1.5 sm:px-7",
          // lg 기준 큰 화면: flex로 꽉 채움
          "lg:flex lg:flex-row lg:flex-1 lg:min-h-0",
          // lg 미만 작은 화면: 블록으로 쌓임
          "flex flex-col",
        ].join(" ")}
      >
        {/* 좌측: 인사말 + 배너/스탯 + 도전기 (히어로 너비 = 배너+도전기 반반) */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr] gap-3.5 min-h-0">
          {/* 인사말 카드: 배너+도전기 전체 너비 */}
          <div className="md:col-span-2">
            <WelcomeHero userName={user?.name ?? "사용자"} />
          </div>

          {/* 배너 컬럼: 오늘도 화이팅 + StatCards */}
          <div className="min-w-0 flex h-full flex-col gap-3.5 min-h-0">
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
                <TodayStatusCard warningCount={warningCount} isNewUser={isNewUser} />
              </AsyncBoundary>
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
                <div className="flex flex-wrap gap-3.5 flex-shrink-0">
                  <div className="flex-1 min-w-[140px]">
                  {measureTimeKpi && typeof measureTimeKpi.value === "number" && measureTimeKpi.value > 0 ? (
                    <StatCard
                      label={measureTimeKpi.label}
                      value={formatMeasuredTime(measureTimeKpi.value)}
                      unit={measureTimeKpi.unit}
                      showStatusDot
                      statusDotVariant={isMeasuring ? "measuring" : "idle"}
                      subtitle={isMeasuring ? "실시간 측정" : "측정 중 아님"}
                    />
                  ) : (
                    <StatCard
                      label="측정 시간"
                      value="00:00"
                      showStatusDot
                      statusDotVariant={isMeasuring ? "measuring" : "idle"}
                      subtitle={isMeasuring ? "실시간 측정 중" : "측정 중 아님"}
                    />
                  )}
                  </div>
                  <div className="flex-1 min-w-[140px]">
                  <StatCard
                    label="오늘 경고"
                    value={String(todayWarningCount)}
                    unit="회"
                    subtitle="오늘 기준"
                  />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                  <StatCard
                    label="누적 평균"
                    value={avgAngle != null ? avgAngle.toFixed(1) : "-"}
                    unit="°"
                    subtitle={
                      deltaFromIdeal != null ? (
                        <span className="text-[var(--warning-text)]">
                          ideal 대비 {deltaFromIdeal >= 0 ? "+" : ""}
                          {deltaFromIdeal.toFixed(1)}°
                        </span>
                      ) : undefined
                    }
                  />
                  </div>
                </div>
              </AsyncBoundary>
          </div>

          {/* 도전기 컬럼 */}
          <div className="min-w-0 flex flex-1 min-h-0 h-full overflow-hidden">
            <Posture3DCard
                className="flex-1 w-full"
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

        {/* 우측 패널: 캘린더 + 진화 카드 */}
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-3.5 min-h-0">
          <Calendar dayStatusMap={dayStatusMap} />
          <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
            <TurtleEvolutionCard goodDays={goodDays} />
          </AsyncBoundary>
        </div>
      </div>
    </main>
  );
}
