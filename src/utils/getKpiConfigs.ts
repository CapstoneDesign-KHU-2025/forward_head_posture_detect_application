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
  },
  t: (key: string) => string,
): KPIItem[] {
  const { todayAvg, weeklyAvg, todayCount, todayHour, improvementValue, improvementText, loading } = data;

  if (loading && todayAvg === null) {
    return [
      {
        label: t("HomeData.empty.label"),
        value: t("HomeData.empty.value"),
        unit: "",
        caption: t("HomeData.empty.caption"),
      },
    ];
  }

  return [
    {
      label: t("HomeData.kpi.avgAngle.label"),
      value: todayAvg != null ? todayAvg.toFixed(1) : "-",
      unit: "°",
      delta: "up",
      deltaText: weeklyAvg != null && todayAvg != null ? `${(todayAvg - weeklyAvg).toFixed(1)}°` : "",
      deltaVariant: weeklyAvg != null && todayAvg != null ? (todayAvg <= weeklyAvg ? "success" : "warning") : "neutral",
      caption: weeklyAvg != null && todayAvg != null ? t("HomeData.kpi.avgAngle.caption") : undefined,
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
