"use client";

import { useEffect, useRef } from "react";
import { storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { finalizeUpToNow } from "@/lib/hourlyOps";
import { PostureMeasurement } from "@/utils/types";

export function usePostureStorageManager(
  userId: string | undefined,
  currentAngle: number,
  isTurtle: boolean,
  sessionId: string | undefined,
  measuring: boolean,
) {
  const stateRef = useRef({ currentAngle, isTurtle, measuring });

  useEffect(() => {
    stateRef.current = { currentAngle, isTurtle, measuring };
  }, [currentAngle, isTurtle, measuring]);

  useEffect(() => {
    if (!userId || !sessionId) return;
    const SAMPLE_GAP_S = 10;

    let isSaving = false;

    const interval = setInterval(async () => {
      if (!stateRef.current.measuring || isSaving) return;

      isSaving = true;

      try {
        const sample: PostureMeasurement = {
          userId,
          ts: Date.now(),
          angleDeg: stateRef.current.currentAngle,
          isTurtle: stateRef.current.isTurtle,
          hasPose: true,
          sessionId,
          sampleGapS: SAMPLE_GAP_S,
        };

        await storeMeasurementAndAccumulate(sample);
      } finally {
        isSaving = false;
      }
    }, SAMPLE_GAP_S * 1000);

    return () => clearInterval(interval);
  }, [userId, sessionId]);

  useEffect(() => {
    if (!userId) return;
    let isFinalizing = false;
    const runFinalize = async () => {
      if (isFinalizing) return;
      isFinalizing = true;
      try {
        await finalizeUpToNow(userId, true);
      } finally {
        isFinalizing = false;
      }
    };

    const hourlyTimer = setInterval(runFinalize, 60 * 60 * 1000);
    void runFinalize();

    return () => clearInterval(hourlyTimer);
  }, [userId]);
}
