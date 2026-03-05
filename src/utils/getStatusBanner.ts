type GeneralTranslator = (key: any, values?: Record<string, any>) => string;

type GuideColor = "green" | "red" | "orange";
type StatusBannerType = "success" | "warning" | "info";

export function getStatusBannerTypeCore(
  stopEstimating: boolean,
  isTurtle: boolean,
  measurementStarted: boolean,
  guideColor: GuideColor,
  guideMessage: string | null,
): StatusBannerType {
  if (stopEstimating) return "info";
  if (isTurtle && measurementStarted) return "warning";
  if (guideColor === "green" && guideMessage) return "success";
  if (guideColor === "orange" && guideMessage) return "info";
  if (guideColor === "red" && guideMessage) return "info";
  return "success";
}

export function getStatusBannerMessageCore(
  t: GeneralTranslator,
  isInitial: boolean,
  stopEstimating: boolean,
  isTurtle: boolean,
  measurementStarted: boolean,
  guideMessage: string | null,
): string {
  if (isInitial) return t("isInitial");
  if (stopEstimating) return t("stopEstimating");
  if (isTurtle && measurementStarted) return t("badPosture");
  if (guideMessage) return guideMessage;
  return t("guideMessage");
}
