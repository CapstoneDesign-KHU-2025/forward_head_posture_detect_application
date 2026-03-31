"use client";

import HomeTemplate from "@/app/[locale]/components/HomeTemplate";
import ErrorBanner from "@/components/ErrorBanner";

import LoadingSkeleton from "../../../components/LoadingSkeleton";
import useHomeDashBoard from "@/hooks/useHomeDashBoard";
import { useMemo } from "react";
import { UserProfile, WeeklySummaryData } from "@/utils/types";
import { getKpiConfigs } from "./home.utils";

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
