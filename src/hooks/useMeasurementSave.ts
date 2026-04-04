"use client";

import { useCallback, startTransition } from "react";
import { getTodayHourly } from "@/lib/hourlyOps";
import {
  getTodayCount,
  storeMeasurementAndAccumulate,
} from "@/lib/postureLocal";
import { createISO } from "@/utils/createISO";
import { logger } from "@/lib/logger";
import { useMeasurementStore } from "@/app/store/useMeasurementStore";

const SESSION_STORAGE_MEASUREMENT_INTERRUPTED = "measurement_interrupted";

type UseMeasurementSaveProps = {
  userId: string;
  sessionId?: string;
  angle: number;
  isTurtle: boolean;
  dailySumAction: (payload: any) => void;
  resetForNewMeasurement: () => void;
};

export function useMeasurementSave({
  userId,
  sessionId,
  angle,
  isTurtle,
  dailySumAction,
  resetForNewMeasurement,
}: UseMeasurementSaveProps) {
  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const setStopEstimating = useMeasurementStore(
    (state) => state.setStopEstimating,
  );
  const isProcessing = useMeasurementStore((state) => state.isProcessing);
  const setIsProcessing = useMeasurementStore((state) => state.setIsProcessing);

  const handleStopMeasurement = useCallback(
    async (forced?: boolean) => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);

        if (!stopEstimating) {
          await storeMeasurementAndAccumulate({
            userId,
            ts: Date.now(),
            angleDeg: angle,
            isTurtle,
            hasPose: true,
            sessionId,
            sampleGapS: 10,
          });

          const rows = await getTodayHourly(userId);
          const dailySumWeighted =
            rows?.reduce(
              (acc: number, r: any) => acc + (r?.sumWeighted ?? 0),
              0,
            ) ?? 0;
          const dailyWeightSeconds =
            rows?.reduce((acc: number, r: any) => acc + (r?.weight ?? 0), 0) ??
            0;
          const count = await getTodayCount(userId);

          startTransition(() => {
            dailySumAction({
              userId,
              dateISO: createISO(),
              sumWeighted: dailySumWeighted,
              weightSeconds: dailyWeightSeconds,
              count,
            });
          });

          resetForNewMeasurement();
          if (forced) return;
        }
      } catch (err) {
        logger.error("[handleStopMeasurement] error:", err);
        resetForNewMeasurement();
      } finally {
        if (!forced) setStopEstimating(!stopEstimating);
        setIsProcessing(false);
        resetForNewMeasurement();

        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED);
        }
      }
    },
    [
      isProcessing,
      stopEstimating,
      userId,
      angle,
      isTurtle,
      sessionId,
      dailySumAction,
      resetForNewMeasurement,
      setIsProcessing,
      setStopEstimating,
    ],
  );

  return { handleStopMeasurement };
}
