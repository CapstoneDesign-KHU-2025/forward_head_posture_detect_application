"use client";
import WelcomeHero from "@/components/organisms/home/WelcomeHero";
import Posture3DCard from "@/components/organisms/home/Posture3DCard";
import StatCard from "@/components/molecules/StatCard";
import { Calendar, type DayStatus } from "@/components/molecules/Calendar";
import TodayStatusCard from "@/components/molecules/TodayStatusCard";
import TurtleEvolutionCard from "@/components/molecules/TurtleEvolutionCard";
import { formatMeasuredTime } from "@/utils/formatMeasuredTime";
import AsyncBoundary from "@/components/molecules/AsyncBoundary";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";
import { useTranslations } from "next-intl";

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
  // 다국어 훅 호출
  const t = useTranslations("HomeTemplate");
  const tBasic = useTranslations("Basic");

  // 측정 시간 KPI 찾기 (라벨 검색 시에도 다국어 키워드 대응)
  const measureTimeLabel = t("kpi.measureTime.label");
  const measureTimeKpi = kpis?.find(
    (kpi) =>
      kpi.label === "측정 시간" ||
      kpi.label === measureTimeLabel ||
      (typeof kpi.label === "string" && kpi.label.includes(measureTimeLabel)),
  );

  const todayWarningCount = warningCount ?? 0;
  const avgAngle = user?.avgAng ?? null;
  const idealAngle = 52;
  const deltaFromIdeal = avgAngle != null && Number.isFinite(avgAngle) ? avgAngle - idealAngle : null;

  return (
    <main className={["bg-[#F8FBF8] min-h-screen", className].filter(Boolean).join(" ")}>
      <div className="max-w-[1400px] mx-auto px-8 pb-8 pt-2">
        <WelcomeHero userName={user?.name ?? tBasic("user")} />

        {/* 본문 2열 레이아웃: 좌(KPI), 우(도전기) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* LEFT: 오늘의 거북목 섹션 */}
          <div className="flex flex-col gap-6">
            {/* 섹션 타이틀 */}
            <h2 className="text-[1.5rem] font-bold text-[#2D5F2E] mb-2">{t("sections.todayStatus")}</h2>

            <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
              {/* 상태 카드 - 메인 */}
              <TodayStatusCard warningCount={warningCount} isNewUser={isNewUser} />
            </AsyncBoundary>

            {/* 서브 정보 카드 */}
            <div className="flex gap-4">
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
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
                        subtitle={
                          isMeasuring ? t("kpi.measureTime.status.measuring") : t("kpi.measureTime.status.idle")
                        }
                      />
                    ) : (
                      <StatCard
                        label={t("kpi.measureTime.label")}
                        value={t("kpi.measureTime.defaultTime")}
                        showStatusDot
                        statusDotVariant={isMeasuring ? "measuring" : "idle"}
                        subtitle={
                          isMeasuring ? t("kpi.measureTime.status.measuring_long") : t("kpi.measureTime.status.idle")
                        }
                      />
                    )}
                  </div>

                  {/* 오늘 경고 / 누적 평균 카드 */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label={t("kpi.todayWarning.label")}
                      value={String(todayWarningCount)}
                      unit={t("kpi.todayWarning.unit")}
                      subtitle={t("kpi.todayWarning.subtitle")}
                    />
                    <StatCard
                      label={t("kpi.cumulativeAvg.label")}
                      value={avgAngle != null ? avgAngle.toFixed(1) : "-"}
                      unit={t("kpi.cumulativeAvg.unit")}
                      subtitle={
                        deltaFromIdeal != null ? (
                          <span className="text-[var(--warning-text)]">
                            {t("kpi.cumulativeAvg.idealCompare")} {deltaFromIdeal >= 0 ? "+" : ""}
                            {deltaFromIdeal.toFixed(1)}°
                          </span>
                        ) : undefined
                      }
                    />
                  </div>
                </div>
              </AsyncBoundary>
              <AsyncBoundary suspenseFallback={<LoadingSkeleton />}>
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
              title={challenge?.title ?? t("challenge.defaultTitle")}
              description={
                challenge?.description ?? (
                  <>
                    {t("challenge.defaultDescription")
                      .split("\n")
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          {i === 0 && <br />}
                        </span>
                      ))}
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
