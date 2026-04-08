"use client";

import { useMeasurement } from "@/controllers/MeasurementController";
import { MiniWarningPip } from "@/app/[locale]/(protected)/estimate/components/MiniWarningPip";
import { useMeasurementStore } from "@/app/store/useMeasurementStore";
import { usePiPStore } from "@/app/store/usePipStore";

export function GlobalPipRenderer() {
  const pipWindow = usePiPStore((state) => state.pipWindow);
  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const { measurementStarted, getStatusBannerType } = useMeasurement();

  if (!pipWindow) return null;

  if (stopEstimating) return null;

  const isTurtle = getStatusBannerType() === "warning";

  return (
    <MiniWarningPip
      isTurtle={isTurtle}
      pipWindow={pipWindow}
      measurementStarted={measurementStarted}
    />
  );
}
