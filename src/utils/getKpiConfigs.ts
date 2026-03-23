export type KPIItem = {
  label: string;
  value: number | string;
  unit?: string;
  delta?: "up" | "down";
  deltaText?: string;
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  caption?: string;
};

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
