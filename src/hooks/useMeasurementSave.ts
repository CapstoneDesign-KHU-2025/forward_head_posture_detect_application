"use client";

import { useCallback, startTransition, useActionState } from "react";
import { getTodayHourly } from "@/lib/hourlyOps";
import {
  getTodayCount,
  storeMeasurementAndAccumulate,
} from "@/lib/postureLocal";
import { clearMeasurementInterruptedInSession } from "@/lib/measurementSession";
import { createISO } from "@/utils/createISO";
import { logger } from "@/lib/logger";
import { useMeasurementStore } from "@/app/store/useMeasurementStore";
import { postDailySummaryAction } from "@/app/actions/summaryActions";

type HourlyRowLike = { sumWeighted: number; weight: number };

function aggregateHourlyTotals(rows: HourlyRowLike[]) {
  let sumWeighted = 0;
  let weightSeconds = 0;
  for (const r of rows) {
    sumWeighted += r.sumWeighted;
    weightSeconds += r.weight;
  }
  return { sumWeighted, weightSeconds };
}

type DailySummaryAction = (formData: {
  dateISO: string;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
}) => void;

type LocalSampleParams = {
  userId: string;
  sessionId: string | undefined;
  angle: number;
  isTurtle: boolean;
};

async function persistPostureSampleToLocal({
  userId,
  sessionId,
  angle,
  isTurtle,
}: LocalSampleParams) {
  await storeMeasurementAndAccumulate({
    userId,
    ts: Date.now(),
    angleDeg: angle,
    isTurtle,
    hasPose: true,
    sessionId,
    sampleGapS: 10,
  });
}

async function postDailySummaryFromLocalHourly(
  userId: string,
  dailySumAction: DailySummaryAction,
) {
  const rows = await getTodayHourly(userId);
  const { sumWeighted, weightSeconds } = aggregateHourlyTotals(rows);
  const count = await getTodayCount(userId);

  startTransition(() => {
    dailySumAction({
      dateISO: createISO(),
      sumWeighted,
      weightSeconds,
      count,
    });
  });
}

async function persistSampleAndEnqueueDailySummary(
  sample: LocalSampleParams,
  dailySumAction: DailySummaryAction,
) {
  await persistPostureSampleToLocal(sample);
  await postDailySummaryFromLocalHourly(sample.userId, dailySumAction);
}

type FinalizeStopParams = {
  forced: boolean | undefined;
  stopEstimating: boolean;
  setStopEstimating: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  resetForNewMeasurement: () => void;
};

function applyStopEstimatingToggle(
  forced: boolean | undefined,
  stopEstimating: boolean,
  setStopEstimating: (value: boolean) => void,
) {
  if (!forced) setStopEstimating(!stopEstimating);
}

function clearProcessingFlag(setIsProcessing: (value: boolean) => void) {
  setIsProcessing(false);
}

function finalizeMeasurementStop({
  forced,
  stopEstimating,
  setStopEstimating,
  setIsProcessing,
  resetForNewMeasurement,
}: FinalizeStopParams) {
  applyStopEstimatingToggle(forced, stopEstimating, setStopEstimating);
  clearProcessingFlag(setIsProcessing);
  resetForNewMeasurement();
  clearMeasurementInterruptedInSession();
}

type UseMeasurementSaveProps = {
  userId: string;
  sessionId?: string;
  angle: number;
  isTurtle: boolean;
  resetForNewMeasurement: () => void;
};

export function useMeasurementSave({
  userId,
  sessionId,
  angle,
  isTurtle,
  resetForNewMeasurement,
}: UseMeasurementSaveProps) {
  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const setStopEstimating = useMeasurementStore(
    (state) => state.setStopEstimating,
  );
  const isProcessing = useMeasurementStore((state) => state.isProcessing);
  const setIsProcessing = useMeasurementStore((state) => state.setIsProcessing);
  const [_dailySumState, dailySumAction] = useActionState(
    postDailySummaryAction,
    null,
  );

  const handleStopMeasurement = useCallback(
    async (forced?: boolean) => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);

        if (!stopEstimating) {
          await persistSampleAndEnqueueDailySummary(
            { userId, sessionId, angle, isTurtle },
            dailySumAction,
          );
          if (forced) return;
        }
      } catch (err) {
        logger.error("[handleStopMeasurement] error:", err);
      } finally {
        finalizeMeasurementStop({
          forced,
          stopEstimating,
          setStopEstimating,
          setIsProcessing,
          resetForNewMeasurement,
        });
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
