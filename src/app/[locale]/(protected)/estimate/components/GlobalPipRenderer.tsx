"use client";

import { useDocumentPiP } from "@/providers/PipProvider";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { MiniWarningPip } from "@/app/[locale]/(protected)/estimate/components/MiniWarningPip";

export function GlobalPipRenderer() {
  const { pipWindow } = useDocumentPiP();
  const { getStatusBannerType, stopEstimating, measurementStarted } = useMeasurement();

  if (!pipWindow) return null;

  if (stopEstimating) return null;

  const isTurtle = getStatusBannerType() === "warning";

  return <MiniWarningPip isTurtle={isTurtle} pipWindow={pipWindow} measurementStarted={measurementStarted} />;
}
