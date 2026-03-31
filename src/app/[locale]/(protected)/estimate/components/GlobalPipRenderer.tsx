"use client";

import { useDocumentPiP } from "@/controllers/PipProvider";
import { useMeasurement } from "@/controllers/MeasurementController";
import { MiniWarningPip } from "@/app/[locale]/(protected)/estimate/components/MiniWarningPip";
import { useMeasurementStore } from "@/app/store/useMeasurementStore";

export function GlobalPipRenderer() {
  const { pipWindow } = useDocumentPiP();
  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const measurementStarted = useMeasurementStore((state) => state.measurementStarted);
  const { getStatusBannerType } = useMeasurement();

  if (!pipWindow) return null;

  if (stopEstimating) return null;

  const isTurtle = getStatusBannerType() === "warning";

  return <MiniWarningPip isTurtle={isTurtle} pipWindow={pipWindow} measurementStarted={measurementStarted} />;
}
