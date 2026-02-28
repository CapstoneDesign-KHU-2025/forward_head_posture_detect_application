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
    <main className={["bg-[#F8FBF8] min-h-screen", className].filter(Boolean).join(" ")}>
      <div className="max-w-[1400px] mx-auto px-8 pb-8 pt-2">
        <WelcomeHero userName={user?.name ?? "사용자"} />

        {/* 본문 2열 레이아웃: 좌(KPI), 우(도전기) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* LEFT: 오늘의 거북목 섹션 */}
          <div className="flex flex-col gap-6">
            {/* 섹션 타이틀 */}
            <h2 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-2">오늘의 거북목</h2>
            <AsyncBoundary suspenseFallback={null}>
              {/* 상태 카드 - 메인 */}
              <TodayStatusCard warningCount={warningCount} isNewUser={isNewUser} />
            </AsyncBoundary>

            {/* 서브 정보 카드 */}
            <div className="flex gap-4">
              <AsyncBoundary suspenseFallback={null}>
                <div className="flex-[0.7] flex flex-col gap-3">
                  <div>
                    {/* 측정 시간 카드 */}
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

                  {/* 오늘 경고 / 누적 평균 카드 */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label="오늘 경고"
                      value={String(todayWarningCount)}
                      unit="회"
                      subtitle="오늘 기준"
                    />
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
              <AsyncBoundary suspenseFallback={null}>
                <div className="flex-[1.3]">
                  {/* 칭호 카드 */}
                  <TurtleEvolutionCard goodDays={goodDays} />
                </div>
              </AsyncBoundary>
            </div>
          </div>

          {/* RIGHT: 측정 섹션 */}
          <div className="flex flex-col gap-6">
            <Posture3DCard
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
            <Calendar dayStatusMap={dayStatusMap} />
          </div>
        </div>
      </div>
    </main>
  );
}
