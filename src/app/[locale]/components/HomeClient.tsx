"use client";

import HomeTemplate from "@/app/[locale]/components/HomeTemplate";
import ErrorBanner from "@/components/ErrorBanner";

import LoadingSkeleton from "../../../components/LoadingSkeleton";
import useHomeDashBoard from "@/hooks/useHomeDashBoard";
import { useMemo } from "react";
import { KPIItem, UserProfile, WeeklySummaryData } from "@/utils/types";

type HomeClientProps = {
  weeklyData: WeeklySummaryData | null;
  user: UserProfile;
};
function computeImprovementPercent(weeklyAvg: number | null, todayAvg: number | null) {
  if (weeklyAvg == null || todayAvg == null || weeklyAvg <= 0) {
    return null;
  }

  const diff = weeklyAvg - todayAvg;
  const rate = (diff / weeklyAvg) * 100;

  return rate;
}

export function getKpiConfigs(
  data: {
    todayAvg: number | null;
    weeklyAvg: number | null;
    todayCount: number | null;
    todayHour: number | null;
    improvementValue: number;
    improvementText: string;
    loading: boolean;
    isNewUser: boolean;
  },
  t: (key: string) => string,
): KPIItem[] {
  const { todayAvg, weeklyAvg, todayCount, todayHour, improvementValue, improvementText, loading, isNewUser } = data;

  if (loading) {
    return [{ label: t("loading"), value: "..." }];
  }
  if (isNewUser) {
    return [
      {
        label: t("HomeData.empty.label"),
        value: t("HomeData.empty.value"),
        unit: "",
        caption: t("HomeData.empty.caption"),
      },
    ];
  }

  const hasBothAvgs = todayAvg != null && weeklyAvg != null;

  return [
    {
      label: t("HomeData.kpi.avgAngle.label"),
      value: todayAvg != null ? todayAvg.toFixed(1) : "-",
      unit: "°",
      delta: "up",
      deltaText: hasBothAvgs ? `${(todayAvg - weeklyAvg).toFixed(1)}°` : "",
      deltaVariant: hasBothAvgs ? (todayAvg <= weeklyAvg ? "success" : "warning") : "neutral",
      caption: hasBothAvgs ? t("HomeData.kpi.avgAngle.caption") : undefined,
    },
    {
      label: t("HomeData.kpi.warningCount.label"),
      value: todayCount ?? "-",
      unit: t("HomeData.kpi.warningCount.unit"),
      delta: "down",
      deltaVariant: "danger",
      caption: t("HomeData.kpi.warningCount.caption"),
    },
    {
      label: t("HomeData.kpi.measurementTime.label"),
      value: todayHour != null && todayHour > 0 ? todayHour : t("HomeData.kpi.measurementTime.emptyValue"),
      unit: "",
    },
    {
      label: t("HomeData.kpi.improvement.label"),
      value: improvementValue.toFixed(2),
      unit: "%",
      caption: improvementText,
    },
  ];
}

export default function HomeClient({ weeklyData, user }: HomeClientProps) {
  const {
    error,
    loading,
    weeklyAvg,
    todayAvg,
    todayCount,
    todayHour,
    isCheckingRedirect,
    goodDays,
    dayStatusMap,
    isMeasuring,
    t,
    isNewUser,
  } = useHomeDashBoard({ weeklyData, user });

  if (error) {
    return <ErrorBanner error={error} />;
  }

  const improvement = computeImprovementPercent(weeklyAvg, todayAvg);

  const improvementText =
    improvement == null
      ? t("improvementText.lack_of_data")
      : improvement >= 0
        ? `${improvement.toFixed(1)}% ${t("improvementText.improve")}`
        : `${Math.abs(improvement).toFixed(1)}%  ${t("improvementText.worse")}`;

  const improvementValue = improvement == null ? 0 : Math.max(-100, Math.min(100, improvement));

  const kpis = useMemo(() => {
    return getKpiConfigs(
      {
        todayAvg,
        weeklyAvg,
        todayCount,
        todayHour,
        improvementValue,
        improvementText,
        loading,
        isNewUser,
      },
      t,
    );
  }, [todayAvg, weeklyAvg, todayCount, todayHour, improvementValue, improvementText, loading, t]);
  const warningCount =
    (todayCount === 0 && todayHour === 0) || todayCount === null || todayCount === undefined ? null : todayCount;
  if (isCheckingRedirect) {
    return <LoadingSkeleton variant="home" />;
  }
  return (
    <HomeTemplate
      user={{
        name: user.name,
        avgAng: todayAvg ?? null,
        avatarSrc: user.image,
      }}
      kpis={kpis}
      challenge={{
        title: loading ? t("HomeData.challenge.emptyTitle") : t("HomeData.challenge.title"),
        description: t("HomeData.challenge.description"),
      }}
      warningCount={warningCount}
      isNewUser={isNewUser}
      goodDays={goodDays}
      dayStatusMap={dayStatusMap}
      isMeasuring={isMeasuring}
    />
  );
}
