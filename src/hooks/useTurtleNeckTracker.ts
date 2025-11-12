"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import analyzeTurtleNeck from "@/utils/isTurtleNeck";
import turtleStabilizer from "@/utils/turtleStabilizer";

export type UseTurtleNeckTrackerOptions = {
  autoStart?: boolean;
  wasmBaseUrl?: string;
  modelAssetPath?: string;
  logIntervalMs?: number;
  sendIntervalMs?: number;
  distanceThreshold?: { tooCloseRatio: number; tooFarRatio: number };
  enableBeep?: boolean;
  onResult?: (data: {
    angleDeg: number;
    isTurtle: boolean;
    avgAngle: number;
    landmarks: { x: number; y: number; z: number }[];
    insideGuide: boolean;
    distanceRatio?: number;
    distanceMessage?: string;
    distanceColor?: string;
  }) => void;
  onSend?: (payload: {
    angleDeg: number;
    isTurtle: boolean;
    landmarks: { x: number; y: number; z: number }[];
  }) => Promise<void> | void;
};

export function useTurtleNeckTracker(opts: UseTurtleNeckTrackerOptions = {}) {
  const {
    autoStart = true,
    wasmBaseUrl = process.env.WASM_BASEURL || "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    modelAssetPath = process.env.MODEL_ASSET_PATH ||
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
    logIntervalMs = 200,
    sendIntervalMs = 2000,
    distanceThreshold = { tooCloseRatio: 1.05, tooFarRatio: 0.7 },
    enableBeep = true,
    onResult,
    onSend,
  } = opts;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);
  const lastSendTimeRef = useRef<number>(0);
  const lastStateRef = useRef<boolean | null>(null);
  const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isTurtleNumber, setIsTurtleNumber] = useState(0);
  const [isTurtle, setIsTurtle] = useState(false);
  const [angle, setAngle] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {}, [isTurtle]);
  const startBeep = useCallback(() => {
    if (!enableBeep) return;
    if (beepIntervalRef.current) return;
    beepIntervalRef.current = setInterval(() => {
      const audioCtx = new AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
      setTimeout(() => audioCtx.close(), 300);
    }, 1000);
  }, [enableBeep]);

  const stopBeep = useCallback(() => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  }, []);

  const drawGuides = (ctx: CanvasRenderingContext2D, w: number, h: number, ok: boolean) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const offsetY = 30;
    const guidelineColor = ok ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 0, 0, 0.6)";
    ctx.save();
    ctx.strokeStyle = guidelineColor;
    ctx.lineWidth = 3;

    // 얼굴 타원
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 80 + offsetY, 90, 110, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 목
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY + 10 + offsetY);
    ctx.lineTo(centerX - 35, centerY + 40 + offsetY);
    ctx.moveTo(centerX + 40, centerY + 10 + offsetY);
    ctx.lineTo(centerX + 35, centerY + 40 + offsetY);
    ctx.stroke();

    // 어깨
    ctx.beginPath();
    ctx.moveTo(centerX - 35, centerY + 40 + offsetY);
    ctx.lineTo(centerX - 190, centerY + 60 + offsetY);
    ctx.moveTo(centerX + 35, centerY + 40 + offsetY);
    ctx.lineTo(centerX + 190, centerY + 60 + offsetY);
    ctx.stroke();

    // 상체 윤곽 + 하단
    ctx.beginPath();
    ctx.moveTo(centerX - 190, centerY + 60 + offsetY);
    ctx.bezierCurveTo(
      centerX - 200,
      centerY + 150 + offsetY,
      centerX - 215,
      centerY + 220 + offsetY,
      centerX - 225,
      centerY + 280 + offsetY
    );
    ctx.moveTo(centerX + 190, centerY + 60 + offsetY);
    ctx.bezierCurveTo(
      centerX + 200,
      centerY + 150 + offsetY,
      centerX + 215,
      centerY + 220 + offsetY,
      centerX + 225,
      centerY + 280 + offsetY
    );
    ctx.moveTo(centerX - 225, centerY + 280 + offsetY);
    ctx.lineTo(centerX + 225, centerY + 280 + offsetY);
    ctx.stroke();
    ctx.restore();
  };

  const start = useCallback(async () => {
    try {
      setError(null);

      const video = videoRef.current!;
      video.muted = true;
      video.playsInline = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
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

      const vision = await FilesetResolver.forVisionTasks(wasmBaseUrl);
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const loop = () => {
        const v = videoRef.current!;
        const c = canvasRef.current!;
        const lm = landmarkerRef.current;

        if (!lm || v.videoWidth === 0 || v.videoHeight === 0) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
        }

        const result = lm.detectForVideo(v, performance.now());
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(v, 0, 0, c.width, c.height);

        const centerX = c.width / 2;
        const centerY = c.height / 2;
        const offsetY = 30;

        const poses = result.landmarks ?? [];

        const isInsideFaceGuideline = (x: number, y: number) => {
          const px = x * c.width,
            py = y * c.height;
          const faceCenterX = centerX;
          const faceCenterY = centerY - 80 + offsetY;
          const rx = 90,
            ry = 110;
          const dx = (px - faceCenterX) / rx;
          const dy = (py - faceCenterY) / ry;
          return dx * dx + dy * dy <= 1;
        };
        const isInsideUpperBodyGuideline = (x: number, y: number) => {
          const px = x * c.width,
            py = y * c.height;
          const left = centerX - 225,
            right = centerX + 225;
          const top = centerY + 60 + offsetY;
          const bottom = centerY + 280 + offsetY;
          return px >= left && px <= right && py >= top && py <= bottom;
        };

        let faceInside = true,
          shoulderInside = true,
          isDistanceOk = true;
        let distanceRatio = 1;
        let distanceMessage = "",
          distanceColor = "";
        const { tooCloseRatio, tooFarRatio } = distanceThreshold;

        if (poses.length > 0) {
          const pose = poses[0];
          const faceLandmarks = pose.slice(0, 11);
          if (faceLandmarks.length > 0) {
            faceInside = faceLandmarks.every((p: any) => isInsideFaceGuideline(p.x, p.y));
          }
          const shoulderLandmarks = pose.slice(11, 13);
          if (shoulderLandmarks.length > 0) {
            shoulderInside = shoulderLandmarks.every((p: any) => isInsideUpperBodyGuideline(p.x, p.y));
          }

          const lm11 = pose[11];
          const lm12 = pose[12];
          if (lm11 && lm12) {
            const shoulderWidth = Math.hypot((lm12.x - lm11.x) * c.width, (lm12.y - lm11.y) * c.height);
            const referenceShoulderWidth = 380;
            distanceRatio = shoulderWidth / referenceShoulderWidth;
            isDistanceOk = distanceRatio >= tooFarRatio && distanceRatio <= tooCloseRatio;

            if (distanceRatio >= tooCloseRatio) {
              distanceMessage = "너무 가깝습니다. 뒤로 물러나세요.";
              distanceColor = "rgba(255, 0, 0, 0.9)";
            } else if (distanceRatio <= tooFarRatio) {
              distanceMessage = "너무 멉니다. 앞으로 이동하세요.";
              distanceColor = "rgba(255, 165, 0, 0.9)";
            } else {
              distanceMessage = "적절한 거리입니다.";
              distanceColor = "rgba(0, 255, 0, 0.9)";
            }
          }
        }

        const allInside = faceInside && shoulderInside && isDistanceOk;

        // 가이드라인 드로잉 (UI 동일)
        drawGuides(ctx, c.width, c.height, allInside);

        // 거리 안내 텍스트 (UI 동일)
        if (distanceMessage) {
          ctx.save();
          ctx.font = "bold 24px Arial";
          ctx.fillStyle = distanceColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(distanceMessage, centerX, 20);
          ctx.restore();
        }

        const now = Date.now();
        if (poses.length > 0 && now - lastLogTimeRef.current >= logIntervalMs) {
          const pose = poses[0];
          const lm7 = pose[7],
            lm8 = pose[8],
            lm11 = pose[11],
            lm12 = pose[12];

          const turtleData = analyzeTurtleNeck({
            earLeft: { x: lm7.x, y: lm7.y, z: lm7.z },
            earRight: { x: lm8.x, y: lm8.y, z: lm8.z },
            shoulderLeft: { x: lm11.x, y: lm11.y, z: lm11.z },
            shoulderRight: { x: lm12.x, y: lm12.y, z: lm12.z },
          });

          const stab = turtleStabilizer(turtleData.angleDeg);

          let turtleNow = lastStateRef.current ?? false;
          let avgAngle = 0;

          if (stab !== null) {
            avgAngle = stab.avgAngle;
            turtleNow = stab.isTurtle;
            setAngle(avgAngle);
          }

          if (turtleNow !== lastStateRef.current) {
            setIsTurtle(turtleNow);
            lastStateRef.current = turtleNow;
            if (turtleNow) {
              startBeep();
              setIsTurtleNumber((prev) => prev + 1);
              sessionStorage.setItem("turtleNeckCount", String(isTurtleNumber + 1));
            } else stopBeep();
          }

          onResult?.({
            angleDeg: turtleData.angleDeg ?? 0,
            isTurtle: turtleData.isTurtle,
            avgAngle,
            landmarks: pose.slice(1, 13).map((p: any) => ({ x: p.x, y: p.y, z: p.z })),
            insideGuide: allInside,
            distanceRatio,
            distanceMessage,
            distanceColor,
          });

          if (onSend && now - lastSendTimeRef.current >= sendIntervalMs) {
            onSend({
              angleDeg: turtleData.angleDeg ?? 0,
              isTurtle: turtleData.isTurtle,
              landmarks: pose.slice(1, 13).map((p: any) => ({ x: p.x, y: p.y, z: p.z })),
            });
            lastSendTimeRef.current = now;
          }

          lastLogTimeRef.current = now;
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      loop();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [
    wasmBaseUrl,
    modelAssetPath,
    distanceThreshold,
    logIntervalMs,
    onResult,
    onSend,
    sendIntervalMs,
    startBeep,
    stopBeep,
  ]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stopBeep();
    landmarkerRef.current?.close?.();
    landmarkerRef.current = null;
    const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
    tracks.forEach((t) => t.stop());
  }, [stopBeep]);

  useEffect(() => {
    if (autoStart) start();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return {
    videoRef,
    canvasRef,
    isTurtle,
    angle,
    error,
    start,
    stop,
    isTurtleNumber,
  };
}
