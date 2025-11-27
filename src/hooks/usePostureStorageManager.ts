"use client";

import { RefObject, useEffect } from "react";
import { storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { finalizeUpToNow } from "@/lib/hourlyOps";
import { PostureMeasurement } from "@/lib/postureLocal";

/**
 * posture 측정 자동 저장 및 hourly 정리 담당 훅
 * @param userId - 사용자 ID
 * @param currentAngle - 실시간 측정된 각도
 * @param isTurtle - 현재 거북목 여부
 * @param sessionId - 세션 식별자
 */
export function usePostureStorageManager(
  userId: string | undefined,
  currentAngle: number,
  isTurtle: boolean,
  sessionId: string | undefined,
  measuring: boolean
) {
  useEffect(() => {
    if (!userId || !sessionId) return;
    console.log("useposture");
    const SAMPLE_GAP_S = 5;

    const interval = setInterval(async () => {
      if (!measuring) return;

      const now = Date.now();
      const sample: PostureMeasurement = {
        userId,
        ts: now,
        angleDeg: currentAngle,
        isTurtle,
        hasPose: true,
        sessionId,
        sampleGapS: SAMPLE_GAP_S,
      };
      await storeMeasurementAndAccumulate(sample);
    }, SAMPLE_GAP_S * 1000);

    return () => clearInterval(interval);
  }, [userId, currentAngle, isTurtle, sessionId, measuring]);

  // 1시간마다 hourly finalize 실행
  useEffect(() => {
    if (!userId) return;

    const hourlyTimer = setInterval(async () => {
      await finalizeUpToNow(userId, true);
    }, 60 * 60 * 1000);

    // 앱 시작 시 한 번 실행
    finalizeUpToNow(userId, true);

    return () => clearInterval(hourlyTimer);
  }, [userId]);
}
