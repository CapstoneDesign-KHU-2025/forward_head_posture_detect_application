"use client";

import { useEffect, useRef } from "react";
import { storeMeasurementAndAccumulate, PostureMeasurement } from "@/lib/postureLocal";
import { finalizeUpToNow } from "@/lib/hourlyOps";

/**
 * posture 측정 자동 저장 및 hourly 정리 담당 훅
 * @param userId      - 사용자 ID
 * @param currentAngle - 실시간 측정된 각도
 * @param isTurtle     - 현재 거북목 여부
 * @param sessionId    - 세션 식별자
 * @param measuring    - 현재 측정 중인지 여부
 */
export function usePostureStorageManager(
  userId: string | undefined,
  currentAngle: number,
  isTurtle: boolean,
  sessionId: string | undefined,
  measuring: boolean
) {
  // 🔹 자주 바뀌는 값은 ref에 보관
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

  // 🔹 10초 간격으로 샘플 저장 (interval은 userId/sessionId에만 의존)
  useEffect(() => {
    console.log("[usePostureStorageManager] effect(setInterval)", {
      userId,
      sessionId,
    });

    if (!userId || !sessionId) return;
    const SAMPLE_GAP_S = 10;

    const interval = setInterval(async () => {
      if (!measuringRef.current) return; // measuring은 ref에서 읽기

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

      console.log("[storeMeasurement] saving", {
        userId,
        sample,
      });

      await storeMeasurementAndAccumulate(sample);
    }, SAMPLE_GAP_S * 1000);

    return () => clearInterval(interval);
    // ❗ 여기서 currentAngle, isTurtle, measuring을 dependency에 넣지 않음
  }, [userId, sessionId]);

  // 🔹 1시간마다 hourly finalize 실행
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
