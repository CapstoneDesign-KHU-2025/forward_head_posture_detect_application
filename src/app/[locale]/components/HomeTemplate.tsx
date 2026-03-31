"use client";
import WelcomeHero from "@/app/[locale]/components/WelcomeHero";
import Posture3DCard from "@/app/[locale]/components/3DCard/Posture3DCard";
import StatCard from "@/app/[locale]/components/StatCard";
import { Calendar } from "@/app/[locale]/components/Calendar";
import { DayStatus } from "@/utils/types";
import TodayStatusCard from "@/app/[locale]/components/TodayStatusCard";
import TurtleEvolutionCard from "@/app/[locale]/components/TurtleEvolutionCard";
import AsyncBoundary from "@/components/AsyncBoundary";
import { useTranslations } from "next-intl";
import { KPIItem } from "@/utils/types";
import { formatMeasuredTime } from "./home.utils";

type HomeTemplateProps = {
  user: { name: string; avgAng?: number | null; avatarSrc?: string } | null;
  kpis: KPIItem[];
  challenge?: {
    title?: React.ReactNode;
    description?: React.ReactNode;
  };
  warningCount?: number | null;
  isNewUser?: boolean;
  goodDays?: number;
  dayStatusMap?: Record<string, DayStatus>;
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
  const t = useTranslations("HomeTemplate");

  const measureTimeLabel = t("kpi.measureTime.label");
  const measureTimeKpi = kpis?.find(
    (kpi) =>
      kpi.label == t("measurementTime") ||
      kpi.label === measureTimeLabel ||
      (typeof kpi.label === "string" && kpi.label.includes(measureTimeLabel)),
  );

  const avgAngle = user?.avgAng ?? null;
  const idealAngle = 52;
  const deltaFromIdeal = avgAngle != null && Number.isFinite(avgAngle) ? avgAngle - idealAngle : null;

  return (
    <main
      className={[
        "w-full bg-[var(--green-pale)]",
        "lg:flex lg:flex-col lg:flex-1 lg:min-h-0",
        "overflow-y-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "mx-auto w-full max-w-[1400px] gap-3.5 px-4 pb-[100px] pt-1.5 sm:px-7",
          "lg:flex lg:flex-row lg:flex-1 lg:min-h-0",
          "flex flex-col",
        ].join(" ")}
      >
        {/* left section */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr] gap-3.5 min-h-0">
          {/* hello card */}
          <div className="md:col-span-2">
            <WelcomeHero userName={user?.name ?? "사용자"} />
          </div>

          {/* banner + start cards */}
          <div className="min-w-0 flex h-full flex-col gap-3.5 min-h-0">
            <AsyncBoundary suspenseFallback={null}>
              <TodayStatusCard warningCount={warningCount} isNewUser={isNewUser} />
            </AsyncBoundary>
            <AsyncBoundary suspenseFallback={null}>
              <div className="flex flex-wrap gap-3.5 flex-shrink-0">
                <div className="flex-1 min-w-[140px]">
                  {measureTimeKpi && typeof measureTimeKpi.value === "number" && measureTimeKpi.value > 0 ? (
                    <StatCard
                      label={measureTimeKpi.label}
                      value={formatMeasuredTime(measureTimeKpi.value)}
                      unit={measureTimeKpi.unit}
                      showStatusDot
                      statusDotVariant={isMeasuring ? "measuring" : "idle"}
                      subtitle={
                        isMeasuring ? t("statCards.realTimeCard.realTime") : t("statCards.realTimeCard.notEstimating")
                      }
                    />
                  ) : (
                    <StatCard
                      label={t("statCards.realTimeCard.estimatingTime")}
                      value="-"
                      showStatusDot
                      statusDotVariant={isMeasuring ? "measuring" : "idle"}
                      subtitle={
                        isMeasuring ? t("statCards.realTimeCard.estimating") : t("statCards.realTimeCard.notEstimating")
                      }
                    />
                  )}
                </div>
                <div className="flex-1 min-w-[140px]">
                  <StatCard
                    label={t("statCards.warning.todayWarning")}
                    value={warningCount != null ? String(warningCount) : "-"}
                    unit={t("statCards.warning.time")}
                    subtitle={t("statCards.warning.todayBenchMark")}
                  />
                </div>
                <div className="flex-1 min-w-[140px] mb-7">
                  <StatCard
                    label={t("statCards.average.accumulatedAverage")}
                    value={avgAngle != null ? avgAngle.toFixed(1) : "-"}
                    unit="°"
                    subtitle={
                      deltaFromIdeal != null ? (
                        <span className="text-[var(--warning-text)]">
                          {t("statCards.average.differenceIdeal")} {deltaFromIdeal >= 0 ? "+" : ""}
                          {deltaFromIdeal.toFixed(1)}°
                        </span>
                      ) : (
                        <span className="text-[var(--warning-text)]">
                          {t("statCards.average.differenceIdealDefault")}
                        </span>
                      )
                    }
                  />
                </div>
              </div>
            </AsyncBoundary>
          </div>

          <div className="min-w-0 flex flex-1 h-full">
            <Posture3DCard
              className="flex-1 w-full"
              userAng={user?.avgAng ?? undefined}
              title={challenge?.title ?? t("posture3DCard.yourChallenge")}
              description={
                challenge?.description ?? (
                  <>
                    {t("posture3DCard.description.1")}
                    <br />
                    {t("posture3DCard.description.2")}
                  </>
                )
              }
            />
          </div>
        </div>

        {/* right section */}
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-3.5 min-h-0">
          <AsyncBoundary suspenseFallback={null}>
            <Calendar dayStatusMap={dayStatusMap} />
          </AsyncBoundary>

          <AsyncBoundary suspenseFallback={null}>
            <TurtleEvolutionCard goodDays={goodDays} />
          </AsyncBoundary>
        </div>
      </div>
    </main>
  );
}
