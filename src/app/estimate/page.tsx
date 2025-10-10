"use client";

import { useEffect, useRef } from "react";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export default function PoseLocalOnly() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // (1) 카메라 준비
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
      if (cancelled) return;

      // (2) WASM 런타임: CDN 사용 (프로덕션에선 버전 고정 권장)
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

        const utils = new DrawingUtils(ctx);
        const poses = result.landmarks ?? [];
        const conns = PoseLandmarker.POSE_CONNECTIONS;

        for (const pose of poses) {
          utils.drawConnectors(pose as any, conns, { lineWidth: 2 });
          utils.drawLandmarks(pose as any, { radius: 3 });
          const now = Date.now();
          if (now - lastLogTimeRef.current >= 60 * 1000) {
            console.log("Pose landmarks:", pose);
            lastLogTimeRef.current = now;
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      // const loop = () => {
      //   const v = videoRef.current!;
      //   const c = canvasRef.current!;
      //   const lm = landmarkerRef.current;

      //   if (!lm || !v) {
      //     requestAnimationFrame(loop);
      //     return;
      //   }

      //   // 👇 여기서 비디오 프레임 크기를 가져와서 vw/vh 정의
      //   const vw = v.videoWidth;
      //   const vh = v.videoHeight;
      //   if (!vw || !vh) {
      //     requestAnimationFrame(loop);
      //     return;
      //   }

      //   // DPR 보정
      //   const dpr = window.devicePixelRatio || 1;
      //   if (c.width !== vw * dpr || c.height !== vh * dpr) {
      //     c.width = vw * dpr;
      //     c.height = vh * dpr;
      //     c.style.width = `${vw}px`;
      //     c.style.height = `${vh}px`;
      //   }

      //   const ctx = c.getContext("2d")!;
      //   ctx.save();
      //   ctx.scale(dpr, dpr); // 이후 모든 좌표는 CSS px 기준

      //   // 비디오 지우고 다시 그림
      //   ctx.clearRect(0, 0, vw, vh);

      //   // 좌우 반전해서 셀카뷰
      //   ctx.save();
      //   ctx.translate(vw, 0);
      //   ctx.scale(-1, 1);
      //   ctx.drawImage(v, 0, 0, vw, vh);
      //   ctx.restore();

      //   // 포즈 추론
      //   const result = lm.detectForVideo(v, performance.now());
      //   const poses = result.landmarks ?? [];

      //   // 🔎 디버그용 코너 포인트 찍기
      //   ctx.fillStyle = "lime";
      //   const corners = [
      //     { x: 0, y: 0 },
      //     { x: 1, y: 0 },
      //     { x: 0, y: 1 },
      //     { x: 1, y: 1 },
      //   ];
      //   for (const p of corners) {
      //     let x = p.x * vw;
      //     let y = p.y * vh;
      //     x = vw - x; // 반전
      //     ctx.beginPath();
      //     ctx.arc(x, y, 5, 0, Math.PI * 2);
      //     ctx.fill();
      //   }

      //   // 랜드마크 찍기
      //   ctx.fillStyle = "red";
      //   for (const pose of poses) {
      //     for (const kp of pose) {
      //       let x = kp.x * vw;
      //       let y = kp.y * vh;
      //       x = vw - x; // 비디오와 일치시키기 위해 좌우 반전

      //       ctx.beginPath();
      //       ctx.arc(x, y, 3, 0, Math.PI * 2);
      //       ctx.fill();
      //     }
      //   }

      //   ctx.restore(); // dpr 스케일 해제

      //   requestAnimationFrame(loop);
      // };

      loop();
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close?.();
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  return (
    <div>
      {/* display:none 대신 화면 밖으로 이동 → videoWidth/Height가 0 되는 문제 방지 */}
      <video ref={videoRef} style={{ position: "absolute", left: -9999 }} />
      <canvas ref={canvasRef} />
    </div>
  );
}
