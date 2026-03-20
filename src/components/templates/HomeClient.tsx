"use client";

import HomeTemplate from "@/components/templates/HomeTemplate";
import ErrorBanner from "@/components/atoms/ErrorBanner";

import { computeImprovementPercent } from "@/utils/computeImprovementPercent";
import LoadingSkeleton from "../molecules/LoadingSkeleton";
import useHomeDashBoard from "@/hooks/useHomeDashBoard";
import { useMemo } from "react";
import { getKpiConfigs } from "@/utils/getKpiConfigs";

type WeeklySummaryRow = {
  id: number;
  userId: string;
  avgAngle: number;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
  date: string | Date;
  goodDay: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type WeeklySummaryData = {
  mode: "weekly" | "dynamic";
  requestedDays: number;
  actualDataDays: number;
  weightedAvg: number | null;
  safeRows: WeeklySummaryRow[];
  goodDays: number;
};

type UserProfile = {
  id: string;
  name: string;
  image?: string;
};

type HomeClientProps = {
  weeklyData: WeeklySummaryData | null;
  user: UserProfile;
};

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
