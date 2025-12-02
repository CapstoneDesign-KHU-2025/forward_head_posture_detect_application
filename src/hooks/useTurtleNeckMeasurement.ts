"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import analyzeTurtleNeck from "@/utils/isTurtleNeck";
import turtleStabilizer from "@/utils/turtleStabilizer";
import { getSensitivity } from "@/utils/sensitivity";
import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import { getStatusBannerMessageCore, getStatusBannerTypeCore } from "@/utils/getStatusBanner";
import { checkGuidelinesAndDistance, Pose } from "@/utils/checkGuidelinesAndDistance";
import { drawGuidelines } from "@/utils/drawGuidelines";
import { startBeep, stopBeep } from "@/utils/manageBeep";
type GuideColor = "green" | "red" | "orange";
type StatusBannerType = "success" | "warning" | "info";

interface UseTurtleNeckMeasurementOptions {
  userId?: string;
  stopEstimating: boolean;
}

export function useTurtleNeckMeasurement({ userId, stopEstimating }: UseTurtleNeckMeasurementOptions) {
  // === DOM refs (외부에서 써야 해서 반환 예정) ===
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // === 내부 제어용 refs (훅 안에 숨김) ===
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const lastStateRef = useRef<boolean | null>(null);
  const lastBeepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const poseBufferRef = useRef<any[]>([]);
  const lastBufferTimeRef = useRef<number>(performance.now());
  const visibilityChangeHandlerRef = useRef<(() => void) | null>(null);

  const countdownStartRef = useRef<number | null>(null);
  const measuringRef = useRef<boolean>(false);
  const lastGuideMessageRef = useRef<string | null>(null);
  const lastGuideColorRef = useRef<GuideColor>("red");

  // === 상태값들 (UI + 측정) ===
  const [isTurtle, setIsTurtle] = useState(false);
  const [angle, setAngle] = useState(0);
  const [guideMessage, setGuideMessage] = useState<string | null>(null);
  const [guideColor, setGuideColor] = useState<GuideColor>("red");
  const [countdownRemain, setCountdownRemain] = useState<number | null>(null);
  const [measurementStarted, setMeasurementStarted] = useState<boolean>(false);
  const [showMeasurementStartedToast, setShowMeasurementStartedToast] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 각도 베이스라인용 상태
  const baselineAngleRef = useRef<number | null>(null);
  const targetBaseline = 55; // 가이드라인 시점의 정상 각도를 55로 설정 -> 이후 베이스라인(기준점)이 됨
  const baselineBufferRef = useRef<any[]>([]);

  // 세션 ID (측정 세션 식별용)
  const sessionIdRef = useRef<string | null>(null);
  if (!sessionIdRef.current) {
    sessionIdRef.current = `measure-${userId ?? "guest"}-${Date.now()}`;
  }
  const sessionId = sessionIdRef.current;

  // === IndexedDB 저장 훅 (각도/거북목 상태를 10초 단위로 저장) ===
  usePostureStorageManager(userId, angle, isTurtle, sessionId, measuringRef.current);
  function processPoseBufferAndUpdateState(options: {
    poseBufferRef: React.RefObject<any[]>;
    lastBufferTimeRef: React.RefObject<number>;
    measuringRef: React.RefObject<boolean>;
    lastStateRef: React.RefObject<boolean | null>;
    lastBeepIntervalRef: React.RefObject<NodeJS.Timeout | null>;
    setAngle: (angle: number) => void;
    setIsTurtle: (val: boolean) => void;
  }) {
    const { poseBufferRef, lastBufferTimeRef, measuringRef, lastStateRef, lastBeepIntervalRef, setAngle, setIsTurtle } =
      options;

    const now = performance.now();
    if (!measuringRef.current) {
      lastBufferTimeRef.current = now;
      poseBufferRef.current = [];
      return;
    }

    if (now - lastBufferTimeRef.current < 200) {
      return;
    }

    lastBufferTimeRef.current = now;

    const buf = poseBufferRef.current;
    if (buf.length === 0) return;
    poseBufferRef.current = [];

    const avg = (key: "earLeft" | "earRight" | "shoulderLeft" | "shoulderRight") => {
      return {
        x: buf.reduce((a, b) => a + b[key].x, 0) / buf.length,
        y: buf.reduce((a, b) => a + b[key].y, 0) / buf.length,
        z: buf.reduce((a, b) => a + b[key].z, 0) / buf.length,
      };
    };

    const lm7 = avg("earLeft");
    const lm8 = avg("earRight");
    const lm11 = avg("shoulderLeft");
    const lm12 = avg("shoulderRight");

    const sensitivity = getSensitivity();

    const turtleData = analyzeTurtleNeck({
      earLeft: lm7,
      earRight: lm8,
      shoulderLeft: lm11,
      shoulderRight: lm12,
      sensitivity,
    });

    let corrected = turtleData.angleDeg;
    if (baselineAngleRef.current) {
      corrected = (corrected / baselineAngleRef.current) * targetBaseline;
    }

    const result = turtleStabilizer(corrected, sensitivity);

    let turtleNow = lastStateRef.current ?? false;
    let avgAngle = 0;

    if (result !== null) {
      avgAngle = result.avgAngle;
      console.log("Avg", avgAngle);
      turtleNow = result.isTurtle;
      setAngle(avgAngle);
    }

    if (turtleNow !== lastStateRef.current) {
      setIsTurtle(turtleNow);
      lastStateRef.current = turtleNow;

      if (turtleNow) {
        startBeep(lastBeepIntervalRef);
      } else {
        stopBeep(lastBeepIntervalRef);
      }
    }
  }

  // === "거북목 측정을 시작합니다" 토스트 자동 숨김 ===
  useEffect(() => {
    if (!showMeasurementStartedToast) return;
    const timer = setTimeout(() => setShowMeasurementStartedToast(false), 1500);
    return () => clearTimeout(timer);
  }, [showMeasurementStartedToast]);

  // === Mediapipe 초기화 + 메인 루프 ===
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.playsInline = true;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;

        await new Promise<void>((res) => {
          const onReady = () => {
            video.removeEventListener("loadedmetadata", onReady);
            video.removeEventListener("canplay", onReady);
            res();
          };
          video.addEventListener("loadedmetadata", onReady, { once: true });
          video.addEventListener("canplay", onReady, { once: true });
        });

        await video.play();
        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (cancelled) return;

        // 페이지 visibility에 따라 프레임 레이트 조절
        const getFPS = () => (document.hidden ? 10 : 30); // 백그라운드: 10fps, 포그라운드: 30fps
        const getInterval = () => 1000 / getFPS();

        const loop = async () => {
          const v = videoRef.current;
          const c = canvasRef.current;
          const lm = landmarkerRef.current;

          if (!lm || !v || !c || v.videoWidth === 0 || v.videoHeight === 0) {
            return;
          }

          // 캔버스 크기 동기화
          if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
            c.width = v.videoWidth;
            c.height = v.videoHeight;
          }

          const nowPerformance = performance.now();
          const result = lm.detectForVideo(v, nowPerformance);
          const ctx = c.getContext("2d")!;

          ctx.clearRect(0, 0, c.width, c.height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(v, -c.width, 0, c.width, c.height);
          ctx.restore();

          const poses = result.landmarks ?? [];

          // stopEstimating 이면 측정 상태 초기화
          if (stopEstimating) {
            measuringRef.current = false;
            countdownStartRef.current = null;
            lastGuideMessageRef.current = null;
            setGuideMessage(null);
            setCountdownRemain(null);
            setIsTurtle(false);
            lastStateRef.current = null;
            setAngle(0);

            if (lastBeepIntervalRef.current) {
              clearInterval(lastBeepIntervalRef.current);
              lastBeepIntervalRef.current = null;
            }

            return;
          }

          const centerX = c.width / 2;
          const centerY = c.height / 2;
          const offsetY = 30;

          const { isDistanceOk, distanceRatio, allInside } = checkGuidelinesAndDistance(
            poses as Pose[],
            c,
            centerX,
            centerY,
            offsetY
          );

          const tooCloseThreshold = 1.05;
          const tooFarThreshold = 0.7;

          if (poses.length > 0) {
            const pose = poses[0];
            poseBufferRef.current.push({
              earLeft: { x: pose[7].x, y: pose[7].y, z: pose[7].z },
              earRight: { x: pose[8].x, y: pose[8].y, z: pose[8].z },
              shoulderLeft: { x: pose[11].x, y: pose[11].y, z: pose[11].z },
              shoulderRight: { x: pose[12].x, y: pose[12].y, z: pose[12].z },
            });
          }

          //onst allInside = faceInside && shoulderInside && isDistanceOk;
          let nextGuideMessage: string | null = null;
          let nextGuideColor: GuideColor = lastGuideColorRef.current ?? "red";
          let nextCountdownRemain: number | null = null;

          // --- 측정 시작 전: 가이드 + 카운트다운 ---
          if (!measuringRef.current) {
            nextGuideMessage = "가이드라인 안으로 들어오세요";
            nextGuideColor = "red";

            if (!isDistanceOk) {
              if (distanceRatio >= tooCloseThreshold) {
                nextGuideMessage = "너무 가까워요";
                nextGuideColor = "orange";
              } else if (distanceRatio <= tooFarThreshold) {
                nextGuideMessage = "너무 멀어요";
                nextGuideColor = "orange";
              }
              countdownStartRef.current = null;
            } else if (allInside) {
              if (!countdownStartRef.current) {
                countdownStartRef.current = nowPerformance;
                baselineBufferRef.current = [];
              }

              const elapsed = nowPerformance - countdownStartRef.current;
              const remain = Math.max(0, 3000 - elapsed);
              nextCountdownRemain = Math.ceil(remain / 1000);

              // 베이스라인 좌표 저장(0.2초간)
              if (elapsed >= 2800 && elapsed < 3000) {
                if (poses.length > 0) {
                  const p = poses[0];
                  baselineBufferRef.current.push({
                    earLeft:  { x:p[7].x,  y:p[7].y,  z:p[7].z },
                    earRight: { x:p[8].x,  y:p[8].y,  z:p[8].z },
                    shoulderLeft: { x:p[11].x, y:p[11].y, z:p[11].z },
                    shoulderRight:{ x:p[12].x, y:p[12].y, z:p[12].z },
                  });
                }
              }

              if (elapsed >= 3000) {
                measuringRef.current = true;
                setMeasurementStarted(true);
                setShowMeasurementStartedToast(true);

                nextGuideMessage = null;
                nextGuideColor = "green";
                nextCountdownRemain = null;
                countdownStartRef.current = null;
                lastGuideMessageRef.current = null;
                setGuideMessage(null);

                // 베이스라인 계산
                const buf = baselineBufferRef.current;
                if (buf.length > 0) {
                  const avg = (key:"earLeft"|"earRight"|"shoulderLeft"|"shoulderRight") => ({
                    x: buf.reduce((s,a)=>s+a[key].x,0)/buf.length,
                    y: buf.reduce((s,a)=>s+a[key].y,0)/buf.length,
                    z: buf.reduce((s,a)=>s+a[key].z,0)/buf.length,
                  });

                  const lm7 = avg("earLeft");
                  const lm8 = avg("earRight");
                  const lm11 = avg("shoulderLeft");
                  const lm12 = avg("shoulderRight");

                  const t = analyzeTurtleNeck({
                    earLeft:lm7,
                    earRight:lm8,
                    shoulderLeft:lm11,
                    shoulderRight:lm12,
                    sensitivity:getSensitivity()
                  });

                  baselineAngleRef.current = t.angleDeg;
                  console.log("베이스라인 저장됨: ", baselineAngleRef.current);

                  baselineBufferRef.current = [];
                }
              } else {
                nextGuideMessage = `좋아요! ${nextCountdownRemain}초 유지하세요`;
                nextGuideColor = "green";
              }
            } else {
              countdownStartRef.current = null;
            }
          }

          // 가이드 메시지/색상 업데이트
          if (!measuringRef.current) {
            if (lastGuideMessageRef.current !== nextGuideMessage) {
              lastGuideMessageRef.current = nextGuideMessage;
              setGuideMessage(nextGuideMessage);
            }
            if (lastGuideColorRef.current !== nextGuideColor) {
              lastGuideColorRef.current = nextGuideColor;
              setGuideColor(nextGuideColor);
            }
            setCountdownRemain(nextCountdownRemain);
          } else {
            if (lastGuideMessageRef.current !== null) {
              lastGuideMessageRef.current = null;
              setGuideMessage(null);
            }
            setCountdownRemain(null);
          }

          // --- 미측정 상태: 가이드라인 그리기 ---
          if (!measuringRef.current) {
            drawGuidelines(ctx, centerX, centerY, offsetY, allInside);
          }

          // --- 측정 시작 후: 거북목 계산 + 경고음 ---
          for (const pose of poses) {
            processPoseBufferAndUpdateState({
              poseBufferRef,
              lastBufferTimeRef,
              measuringRef,
              lastStateRef,
              lastBeepIntervalRef,
              setAngle,
              setIsTurtle,
            });
          }
        };
        // visibility 변경 시 프레임 레이트 조절
        const handleVisibilityChange = () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(loop, getInterval());
          }
        };
        visibilityChangeHandlerRef.current = handleVisibilityChange;
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // 초기 루프 시작
        intervalRef.current = setInterval(loop, getInterval());
      } catch (e: any) {
        console.error("Camera / Mediapipe init error:", e);
        setError(e?.message ?? "카메라 초기화 중 오류가 발생했습니다.");
      }
    })();

    return () => {
      cancelled = true;
      if (visibilityChangeHandlerRef.current) {
        document.removeEventListener("visibilitychange", visibilityChangeHandlerRef.current);
        visibilityChangeHandlerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (lastBeepIntervalRef.current) {
        clearInterval(lastBeepIntervalRef.current);
        lastBeepIntervalRef.current = null;
      }

      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, [stopEstimating]);

  // === 외부에서 "다시 측정 시작"할 때 쓸 리셋 함수 ===
  const resetForNewMeasurement = () => {
    measuringRef.current = false;
    countdownStartRef.current = null;
    lastGuideMessageRef.current = null;
    setGuideMessage("가이드라인 안으로 들어오세요");
    setGuideColor("red");
    setMeasurementStarted(false);
    setCountdownRemain(null);
    setIsTurtle(false);
  };

  // === 상태 배너 계산 ===
  const bannerType = getStatusBannerTypeCore(stopEstimating, isTurtle, measurementStarted, guideColor, guideMessage);

  const bannerMessage = getStatusBannerMessageCore(stopEstimating, isTurtle, measurementStarted, guideMessage);

  return {
    // DOM refs
    videoRef,
    canvasRef,

    // 측정 상태
    isTurtle,
    angle,
    guideMessage,
    guideColor,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,

    // UI helper
    getStatusBannerType: () => bannerType,
    statusBannerMessage: () => bannerMessage,

    // 외부에서 사용할 메서드
    resetForNewMeasurement,
  };
}
