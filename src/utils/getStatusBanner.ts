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
  isInitial: boolean,
  stopEstimating: boolean,
  isTurtle: boolean,
  measurementStarted: boolean,
  guideMessage: string | null,
): string {
  if (isInitial) return "측정을 시작해주세요!";
  if (stopEstimating) return "측정이 중단되었습니다";
  if (isTurtle && measurementStarted) return "거북목 자세입니다!";
  if (guideMessage) return guideMessage;
  return "바른 자세입니다!";
}
