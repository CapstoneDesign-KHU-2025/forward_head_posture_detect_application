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
  const angleRef = useRef(currentAngle);
  const turtleRef = useRef(isTurtle);
  const measuringRef = useRef(measuring);

  useEffect(() => {
    angleRef.current = currentAngle;
  }, [currentAngle]);

  useEffect(() => {
    turtleRef.current = isTurtle;
  }, [isTurtle]);

  useEffect(() => {
    measuringRef.current = measuring;
  }, [measuring]);

  useEffect(() => {
    if (!userId || !sessionId) return;
    const SAMPLE_GAP_S = 10;

    const interval = setInterval(async () => {
      if (!measuringRef.current) return;

      const now = Date.now();
      const sample: PostureMeasurement = {
        userId,
        ts: now,
        angleDeg: angleRef.current,
        isTurtle: turtleRef.current,
        hasPose: true,
        sessionId,
        sampleGapS: SAMPLE_GAP_S,
      };

      await storeMeasurementAndAccumulate(sample);
    }, SAMPLE_GAP_S * 1000);

    return () => clearInterval(interval);
  }, [userId, sessionId]);

  useEffect(() => {
    if (!userId) return;

    const hourlyTimer = setInterval(
      async () => {
        await finalizeUpToNow(userId, true);
      },
      60 * 60 * 1000,
    );

    finalizeUpToNow(userId, true);

    return () => clearInterval(hourlyTimer);
  }, [userId]);
}
