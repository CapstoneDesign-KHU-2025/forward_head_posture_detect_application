"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import analyzeTurtleNeck from "@/utils/isTurtleNeck";
import turtleStabilizer from "@/utils/turtleStabilizer";
import { getSensitivity } from "@/utils/sensitivity";
import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import {
  getStatusBannerMessageCore,
  getStatusBannerTypeCore,
} from "@/utils/getStatusBanner";
import { checkGuidelinesAndDistance } from "@/utils/checkGuidelinesAndDistance";
import { useTranslations } from "next-intl";
import { incrementTurtleCount } from "@/lib/postureLocal";
import { useSoundContext } from "@/controllers/SoundController";
import type { GuideColor, Pose } from "@/utils/types";
import { useSoundStore } from "@/app/store/useSoundStore";
import { meanBy } from "es-toolkit";

const USE_WORKER = true;

function createPoseWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  try {
    return new Worker(
      new URL("../workers/poseDetection.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
  } catch {
    return null;
  }
}

type IntervalRef = React.RefObject<ReturnType<typeof setInterval> | null>;
type AudioGraph = { ctx: AudioContext; masterGain: GainNode };

function startBeep(lastBeepIntervalRef: IntervalRef, audio: AudioGraph | null) {
  if (!audio) return;
  if (lastBeepIntervalRef.current) return;

  const { ctx, masterGain } = audio;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const id = setInterval(() => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, 1000);

  lastBeepIntervalRef.current = id;
}

function stopBeep(lastBeepIntervalRef: IntervalRef) {
  if (lastBeepIntervalRef.current) {
    clearInterval(lastBeepIntervalRef.current);
    lastBeepIntervalRef.current = null;
  }
}

interface UseTurtleNeckMeasurementOptions {
  userId?: string;
  stopEstimating: boolean;
}

export function drawGuidelines(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  offsetY: number,
  allInside: boolean,
) {
  const guidelineColor = allInside
    ? "rgba(0, 255, 0, 0.6)"
    : "rgba(255, 0, 0, 0.6)";

  ctx.save();
  ctx.strokeStyle = guidelineColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // face
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 80 + offsetY, 90, 110, 0, 0, Math.PI * 2);
  ctx.stroke();

  // neck
  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY + 10 + offsetY);
  ctx.lineTo(centerX - 35, centerY + 40 + offsetY);
  ctx.moveTo(centerX + 40, centerY + 10 + offsetY);
  ctx.lineTo(centerX + 35, centerY + 40 + offsetY);
  ctx.stroke();

  // shoulder
  ctx.beginPath();
  ctx.moveTo(centerX - 35, centerY + 40 + offsetY);
  ctx.lineTo(centerX - 190, centerY + 60 + offsetY);
  ctx.moveTo(centerX + 35, centerY + 40 + offsetY);
  ctx.lineTo(centerX + 190, centerY + 60 + offsetY);
  ctx.stroke();

  // upper body
  ctx.beginPath();
  ctx.moveTo(centerX - 190, centerY + 60 + offsetY);
  ctx.bezierCurveTo(
    centerX - 200,
    centerY + 150 + offsetY,
    centerX - 215,
    centerY + 220 + offsetY,
    centerX - 225,
    centerY + 280 + offsetY,
  );

  ctx.moveTo(centerX + 190, centerY + 60 + offsetY);
  ctx.bezierCurveTo(
    centerX + 200,
    centerY + 150 + offsetY,
    centerX + 215,
    centerY + 220 + offsetY,
    centerX + 225,
    centerY + 280 + offsetY,
  );

  ctx.moveTo(centerX - 225, centerY + 280 + offsetY);
  ctx.lineTo(centerX + 225, centerY + 280 + offsetY);
  ctx.stroke();

  ctx.restore();
}

export function useTurtleNeckMeasurement({
  userId,
  stopEstimating,
}: UseTurtleNeckMeasurementOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useTranslations("Measurement");
  const t_banner = useTranslations("getStatusBanner");
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const lastStateRef = useRef<boolean | null>(null);
  const lastBeepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const poseBufferRef = useRef<any[]>([]);
  const lastBufferTimeRef = useRef<number>(performance.now());
  const visibilityChangeHandlerRef = useRef<(() => void) | null>(null);
  const isMuted = useSoundStore((state) => state.isMuted);
  const { getAudio } = useSoundContext();
  const countdownStartRef = useRef<number | null>(null);
  const measuringRef = useRef<boolean>(false);
  const lastGuideMessageRef = useRef<string | null>(null);
  const lastGuideColorRef = useRef<GuideColor>("red");
  const firstFrameDrawnRef = useRef(false);
  if (!userId) {
    useEffect(() => {
      if (!userId) return;
    }, [userId, stopEstimating]);
  }

  const [isTurtle, setIsTurtle] = useState(false);
  const [angle, setAngle] = useState(0);
  const [guideMessage, setGuideMessage] = useState<string | null>(null);
  const [guideColor, setGuideColor] = useState<GuideColor>("red");
  const [countdownRemain, setCountdownRemain] = useState<number | null>(null);
  const [measurementStarted, setMeasurementStarted] = useState<boolean>(false);
  const [showMeasurementStartedToast, setShowMeasurementStartedToast] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstFrameDrawn, setIsFirstFrameDrawn] = useState(false);

  const baselineAngleRef = useRef<number | null>(null);
  const targetBaseline = 55;
  const baselineBufferRef = useRef<any[]>([]);

  const sessionIdRef = useRef<string | null>(null);
  if (!sessionIdRef.current) {
    sessionIdRef.current = `measure-${userId ?? "guest"}-${Date.now()}`;
  }
  const sessionId = sessionIdRef.current;
  useEffect(() => {
    if (isMuted) {
      stopBeep(lastBeepIntervalRef);
    }
  }, [isMuted]);

  usePostureStorageManager(
    userId,
    angle,
    isTurtle,
    sessionId,
    measuringRef.current,
  );
  function processPoseBufferAndUpdateState(options: {
    poseBufferRef: React.RefObject<any[]>;
    lastBufferTimeRef: React.RefObject<number>;
    measuringRef: React.RefObject<boolean>;
    lastStateRef: React.RefObject<boolean | null>;
    lastBeepIntervalRef: React.RefObject<NodeJS.Timeout | null>;
    setAngle: (angle: number) => void;
    setIsTurtle: (val: boolean) => void;
    userId: string | undefined;
  }) {
    const {
      poseBufferRef,
      lastBufferTimeRef,
      measuringRef,
      lastStateRef,
      lastBeepIntervalRef,
      setAngle,
      setIsTurtle,
      userId,
    } = options;

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

    const avg = (
      key: "earLeft" | "earRight" | "shoulderLeft" | "shoulderRight",
    ) => {
      return {
        x: meanBy(buf, (item) => item[key].x),
        y: meanBy(buf, (item) => item[key].y),
        z: meanBy(buf, (item) => item[key].z),
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

      turtleNow = result.isTurtle;
      setAngle(avgAngle);
    }

    if (turtleNow !== lastStateRef.current) {
      setIsTurtle(turtleNow);
      lastStateRef.current = turtleNow;

      if (turtleNow) {
        startBeep(lastBeepIntervalRef, getAudio());
        incrementTurtleCount(userId);
      } else {
        stopBeep(lastBeepIntervalRef);
      }
    }
  }

  useEffect(() => {
    if (!showMeasurementStartedToast) return;
    const timer = setTimeout(() => setShowMeasurementStartedToast(false), 1500);
    return () => clearTimeout(timer);
  }, [showMeasurementStartedToast]);

  // Mediapipe initialization + main loop (Worker or Main thread)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (stopEstimating) return;
        const worker = USE_WORKER ? createPoseWorker() : null;
        workerRef.current = worker;
        let useWorkerMode = false;
        let pendingCapture = false;

        if (worker) {
          worker.postMessage({ type: "init" });
          worker.onmessage = async (e: MessageEvent) => {
            if (cancelled) return;
            const msg = e.data;

            if (msg?.type === "initDone") {
              if (!msg.payload?.error) useWorkerMode = true;
            } else if (msg?.type === "requestFrame") {
              const v = videoRef.current;
              if (!v || v.videoWidth === 0 || pendingCapture) return;
              pendingCapture = true;

              if (!firstFrameDrawnRef.current) {
                firstFrameDrawnRef.current = true;
                setIsFirstFrameDrawn(true);
              }

              try {
                const bitmap = await createImageBitmap(v);
                worker.postMessage(
                  {
                    type: "frame",
                    payload: { bitmap, timestamp: performance.now() },
                  },
                  [bitmap],
                );
              } catch {
                pendingCapture = false;
              }
            } else if (msg?.type === "result" && msg?.payload?.landmarks) {
              pendingCapture = false;
              const v2 = videoRef.current;
              const c2 = canvasRef.current;
              if (!v2 || !c2 || cancelled) return;

              const ctx2 = c2.getContext("2d");
              if (ctx2) drawVideoToCanvas(v2, c2, ctx2);

              const poses = msg.payload.landmarks as Pose[];
              processPoseResult(poses, performance.now(), v2, c2, ctx2);
            }
          };
        }
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

        const drawVideoToCanvas = (
          v: HTMLVideoElement,
          c: HTMLCanvasElement,
          ctx: CanvasRenderingContext2D,
        ) => {
          if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
            c.width = v.videoWidth;
            c.height = v.videoHeight;
          }
          ctx.clearRect(0, 0, c.width, c.height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(v, -c.width, 0, c.width, c.height);
          ctx.restore();
        };

        const processPoseResult = (
          poses: Pose[],
          nowPerformance: number,
          _v: HTMLVideoElement,
          c: HTMLCanvasElement,
          ctx: CanvasRenderingContext2D | null,
        ) => {
          if (stopEstimating) {
            measuringRef.current = false;
            countdownStartRef.current = null;
            lastGuideMessageRef.current = null;
            setGuideMessage(null);
            setCountdownRemain(null);
            setMeasurementStarted(false);
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

          const { isDistanceOk, distanceRatio, allInside } =
            checkGuidelinesAndDistance(
              poses as Pose[],
              c,
              centerX,
              centerY,
              offsetY,
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

          //const allInside = faceInside && shoulderInside && isDistanceOk;
          let nextGuideMessage: string | null = null;
          let nextGuideColor: GuideColor = lastGuideColorRef.current ?? "red";
          let nextCountdownRemain: number | null = null;

          // before estimating: guide + countdown
          if (!measuringRef.current) {
            nextGuideMessage = t("Guide.initial");
            nextGuideColor = "red";

            if (!isDistanceOk) {
              if (distanceRatio >= tooCloseThreshold) {
                nextGuideMessage = t("Guide.tooClose");
                nextGuideColor = "orange";
              } else if (distanceRatio <= tooFarThreshold) {
                nextGuideMessage = t("Guide.tooFar");
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

              // store baseline
              if (elapsed >= 2800 && elapsed < 3000) {
                if (poses.length > 0) {
                  const p = poses[0];
                  baselineBufferRef.current.push({
                    earLeft: { x: p[7].x, y: p[7].y, z: p[7].z },
                    earRight: { x: p[8].x, y: p[8].y, z: p[8].z },
                    shoulderLeft: { x: p[11].x, y: p[11].y, z: p[11].z },
                    shoulderRight: { x: p[12].x, y: p[12].y, z: p[12].z },
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

                // calculate baseline
                const buf = baselineBufferRef.current;
                if (buf.length > 0) {
                  const avg = (
                    key:
                      | "earLeft"
                      | "earRight"
                      | "shoulderLeft"
                      | "shoulderRight",
                  ) => ({
                    x: buf.reduce((s, a) => s + a[key].x, 0) / buf.length,
                    y: buf.reduce((s, a) => s + a[key].y, 0) / buf.length,
                    z: buf.reduce((s, a) => s + a[key].z, 0) / buf.length,
                  });

                  const lm7 = avg("earLeft");
                  const lm8 = avg("earRight");
                  const lm11 = avg("shoulderLeft");
                  const lm12 = avg("shoulderRight");

                  const t = analyzeTurtleNeck({
                    earLeft: lm7,
                    earRight: lm8,
                    shoulderLeft: lm11,
                    shoulderRight: lm12,
                    sensitivity: getSensitivity(),
                  });

                  baselineAngleRef.current = t.angleDeg;

                  baselineBufferRef.current = [];
                }
              } else {
                nextGuideMessage = `${t("Guide.good")} ${nextCountdownRemain}${t("Guide.keepPose")}`;
                nextGuideColor = "green";
              }
            } else {
              countdownStartRef.current = null;
            }
          }

          // update guide message / color
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
          if (!measuringRef.current) {
            if (ctx) {
              drawGuidelines(ctx, centerX, centerY, offsetY, allInside);
            } else if (workerRef.current) {
              workerRef.current.postMessage({
                type: "drawGuide",
                payload: { centerX, centerY, offsetY, allInside },
              });
            }
          }

          // after start : posture / beep
          for (const _ of poses) {
            processPoseBufferAndUpdateState({
              poseBufferRef,
              lastBufferTimeRef,
              measuringRef,
              lastStateRef,
              lastBeepIntervalRef,
              setAngle,
              setIsTurtle,
              userId,
            });
          }
        };

        const runLoop = (
          v: HTMLVideoElement,
          c: HTMLCanvasElement,
          lm: PoseLandmarker,
          ctx: CanvasRenderingContext2D,
        ) => {
          if (!v || !c || v.videoWidth === 0 || v.videoHeight === 0) return;
          drawVideoToCanvas(v, c, ctx);
          if (!firstFrameDrawnRef.current) {
            firstFrameDrawnRef.current = true;
            setIsFirstFrameDrawn(true);
          }
          const nowPerformance = performance.now();
          const result = lm.detectForVideo(v, nowPerformance);
          const poses = (result?.landmarks ?? []) as Pose[];
          processPoseResult(poses, nowPerformance, v, c, ctx);
        };

        if (!useWorkerMode) {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm",
          );
          landmarkerRef.current = await PoseLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.5,
              minPosePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5,
            },
          );
          if (cancelled) return;

          const getFPS = () => (document.hidden ? 5 : 10);
          const getInterval = () => 1000 / getFPS();

          const loop = () => {
            const v = videoRef.current;
            const c = canvasRef.current;
            const lm = landmarkerRef.current;
            if (!lm || !v || !c) return;
            runLoop(v, c, lm, c.getContext("2d")!);
          };

          const handleVisibilityChange = () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = setInterval(loop, getInterval());
            }
          };
          visibilityChangeHandlerRef.current = handleVisibilityChange;
          document.addEventListener("visibilitychange", handleVisibilityChange);
          intervalRef.current = setInterval(loop, getInterval());
        }
      } catch (e: any) {
        setError(e?.message ?? t("Error.cameraInit"));
      }
    })();

    return () => {
      cancelled = true;

      if (visibilityChangeHandlerRef.current) {
        document.removeEventListener(
          "visibilitychange",
          visibilityChangeHandlerRef.current,
        );
        visibilityChangeHandlerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeout(() => {
        const w = workerRef.current;
        if (w) {
          w.postMessage({ type: "stop" });
          w.terminate();
          workerRef.current = null;
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

        const tracks =
          (videoRef.current?.srcObject as MediaStream | null)?.getTracks() ||
          [];
        tracks.forEach((t) => t.stop());
      }, 50);
    };
  }, [stopEstimating, userId]);

  useEffect(() => {
    if (stopEstimating) {
      firstFrameDrawnRef.current = false;
      setIsFirstFrameDrawn(false);
    }
  }, [stopEstimating]);

  const resetForNewMeasurement = () => {
    measuringRef.current = false;
    countdownStartRef.current = null;
    lastGuideMessageRef.current = null;
    setGuideMessage(t("Guide.initial"));
    setGuideColor("red");
    setMeasurementStarted(false);
    setCountdownRemain(null);
    setIsTurtle(false);
  };

  const bannerType = getStatusBannerTypeCore(
    stopEstimating,
    isTurtle,
    measurementStarted,
    guideColor,
    guideMessage,
  );

  const bannerMessage = getStatusBannerMessageCore(
    t_banner,
    stopEstimating,
    isTurtle,
    measurementStarted,
    guideMessage,
  );

  return {
    videoRef,
    canvasRef,

    isTurtle,
    angle,
    guideMessage,
    guideColor,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,

    getStatusBannerType: () => bannerType,
    statusBannerMessage: () => bannerMessage,
    isFirstFrameDrawn,

    resetForNewMeasurement,
  };
}
